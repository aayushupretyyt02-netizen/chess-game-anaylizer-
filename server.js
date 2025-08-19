import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();

// --- START OF CORS FIX ---
// CORS ko aache se configure karein taaki browser se error na aaye
app.use(cors({
  origin: '*', // Kisi bhi website se request allow karo
  methods: ['GET', 'POST'], // In methods ko allow karo
}));
// --- END OF CORS FIX ---

app.use(express.json());

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
      stdoutBuffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('bestmove')) {
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
      console.error("Failed to start Stockfish:", err);
      reject(new Error("Failed to start Stockfish."));
    });

    engine.on('close', (code) => {
      if (!bestmove) {
        console.error(`Engine exited early with code ${code}`);
        reject(new Error(`Engine exited with code ${code}.`));
      }
    });

    engine.stdin.write('uci\n');
    engine.stdin.write('isready\n');
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write(`go depth ${depth}\n`);
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
        console.error("Analysis Error:", error.message);
        res.status(500).json({ error: 'Failed to get analysis from engine.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using engine: ${stockfishExe}`);
});
