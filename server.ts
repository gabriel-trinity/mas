import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import soraHandler from './api/sora.ts';
import exchangeRatesHandler from './api/exchange-rates.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Routes
app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/sora', (req, res) => soraHandler(req, res));
app.all('/api/sora-rates', (req, res) => soraHandler(req, res));
app.all('/api/exchange-rates', (req, res) => exchangeRatesHandler(req, res));

// In development, mount Vite dev server middlewares
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // In production, serve built static assets from dist
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MAS SORA Engine] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[Endpoints] /api/health, /api/sora, /api/exchange-rates`);
  if (!process.env.MAS_KEY_ID) {
    console.log(`[MAS Key Warning] MAS_KEY_ID is not configured. Serving baseline dataset. Set MAS_KEY_ID to pull live data.`);
  }
});
