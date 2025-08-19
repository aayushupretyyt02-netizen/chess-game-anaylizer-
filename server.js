import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// --- START OF IMPORTANT CODE ---

// Step 1: Check the operating system to decide which file to use
const isWindows = os.platform() === 'win32';
const stockfishExe = isWindows ? 'stockfish-windows-x86-64-avx2.exe' : './stockfish';

// Step 2: Check if that chosen file actually exists before starting
try {
    fs.statSync(stockfishExe);
} catch (e) {
    console.error(`\nFATAL ERROR: Stockfish executable not found!`);
    console.error(`The server is looking for a file named "${stockfishExe}" in this folder, but it wasn't found.`);
    console.error(`Please make sure the file is in the same folder as server.js.\n`);
    process.exit(1); // Exit the application if file is not found
}

// --- END OF IMPORTANT CODE ---


function getEngineAnalysis(fen, depth = 15) {
  return new Promise((resolve, reject) => {
    const engine = spawn(path.join(process.cwd(), stockfishExe));

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
          engine.stdin.write('quit\n');
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

    engine.on('error', (err) => reject(err));
    engine.on('close', (code) => {
      if (!bestmove) reject(new Error(`Engine exited with code ${code} before finding a move.`));
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
    if (!fen) return res.status(400).json({ error: 'FEN is required' });

    try {
        const result = await getEngineAnalysis(fen, depth || 15);
        res.json(result);
    } catch (error) {
        console.error("Stockfish process error:", error.message);
        res.status(500).json({ error: 'Failed to get analysis from engine process' });
    }
});

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
    console.log(`Using engine: ${stockfishExe}`);

});

