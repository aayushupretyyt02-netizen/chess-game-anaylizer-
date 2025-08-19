import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

// The name of the Stockfish file as we saved it in the Dockerfile
const stockfishExe = './stockfish';

function getEngineAnalysis(fen, depth = 15) {
  return new Promise((resolve, reject) => {
    const engine = spawn(stockfishExe);

    let bestmove = '';
    let analysisData = { score: null, mate: null };
    let stdoutBuffer = '';

    engine.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop(); // Keep the last, possibly incomplete, line

      for (const line of lines) {
        if (line.startsWith('bestmove')) {
          bestmove = line.split(' ')[1];
          engine.stdin.end(); // Gracefully close the process
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
    
    // Handle errors properly
    engine.on('error', (err) => {
      console.error("Failed to start Stockfish process:", err);
      reject(new Error("Failed to start Stockfish process."));
    });

    engine.on('close', (code) => {
      if (!bestmove) {
        console.error(`Engine exited early with code ${code}`);
        reject(new Error(`Engine exited with code ${code} before finding a move.`));
      }
    });

    // Send commands to the engine
    engine.stdin.write('uci\n');
    engine.stdin.write('isready\n');
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write(`go depth ${depth}\n`);
  });
}

app.post('/analyze-position', async (req, res) => {
    const { fen, depth } = req.body;
    if (!fen) {
        return res.status(400).json({ error: 'FEN is required' });
    }

    try {
        const result = await getEngineAnalysis(fen, depth || 15);
        res.json(result);
    } catch (error) {
        // Send a proper error message to the client instead of crashing the server
        console.error("Stockfish process error:", error.message);
        res.status(500).json({ error: 'Failed to get analysis from the engine.' });
    }
});

// Use the PORT provided by Render, or 3000 for local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using engine: ${stockfishExe}`);
});
