import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const stockfishExe = './stockfish';

function getEngineAnalysis(fen, depth = 15) {
  return new Promise((resolve, reject) => {
    console.log('[DEBUG] Starting getEngineAnalysis...');
    
    const engine = spawn(stockfishExe);
    console.log('[DEBUG] Stockfish process spawned.');

    let bestmove = '';
    let analysisData = { score: null, mate: null };
    let stdoutBuffer = '';

    engine.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      // console.log(`[DEBUG] Stockfish STDOUT: ${data.toString()}`); // Ise on karne se bahut logs aayenge
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('bestmove')) {
          console.log(`[DEBUG] Best move found: ${line}`);
          bestmove = line.split(' ')[1];
          engine.stdin.end();
          resolve({ bestmove, analysis: analysisData });
        } else if (line.startsWith('info depth')) {
          const parts = line.split(' ');
          const scoreIndex = parts.indexOf('score');
          const mateIndex = parts.indexOf('mate');
          if (scoreIndex > -1) {
            analysisData.score = parseInt(parts[scoreIndex + 2], 10);
            if (fen.split(' ')[1] === 'b') analysisData.score = -analysisData.score;
          } else if (mateIndex > -1) {
            analysisData.mate = parseInt(parts[mateIndex + 1], 10);
            if (fen.split(' ')[1] === 'b') analysisData.mate = -analysisData.mate;
          }
        }
      }
    });
    
    engine.on('error', (err) => {
      console.error("[DEBUG] FATAL: Failed to start Stockfish process.", err);
      reject(new Error("Failed to start Stockfish process."));
    });

    engine.on('close', (code) => {
      console.log(`[DEBUG] Stockfish process closed with code: ${code}`);
      if (!bestmove) {
        console.error("[DEBUG] FATAL: Engine exited before finding a move.");
        reject(new Error(`Engine exited with code ${code} before finding a move.`));
      }
    });

    console.log('[DEBUG] Sending commands to Stockfish...');
    engine.stdin.write('uci\n');
    engine.stdin.write('isready\n');
    engine.stdin.write(`position fen ${fen}\n');
    engine.stdin.write(`go depth ${depth}\n');
    console.log('[DEBUG] All commands sent.');
  });
}

app.post('/analyze-position', async (req, res) => {
    console.log("Received a request to /analyze-position");
    const { fen, depth } = req.body;
    if (!fen) {
        console.error("Request failed: FEN is missing.");
        return res.status(400).json({ error: 'FEN is required' });
    }
    
    console.log(`Analyzing FEN: ${fen}`);

    try {
        const result = await getEngineAnalysis(fen, depth || 15);
        console.log(`Analysis successful. Best move: ${result.bestmove}`);
        res.json(result);
    } catch (error) {
        console.error("[DEBUG] Analysis function threw an error:", error.message);
        res.status(500).json({ error: 'Failed to get analysis from engine.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using engine: ${stockfishExe}`);
});
