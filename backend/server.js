// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

import areasRouter from './src/routes/areas.js';
import cepRouter from './src/routes/cep.js';
import integrationRouter from './src/routes/integration.js';

// Config para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables de entorno
const nodeEnv = (process.env.NODE_ENV || '').toLowerCase();
const envCandidatesByEnv = {
  production: ['.env.production', '.env.prod', '.env'],
  development: ['.env.development', '.env'],
  test: ['.env.test', '.env'],
};
const envCandidates =
  envCandidatesByEnv[nodeEnv] ||
  ['.env.development', '.env', '.env.production', '.env.prod'];
for (const envFile of envCandidates) {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();
app.use(express.json());
app.use(cors());

// Rutas de tu API
app.use('/api/areas', areasRouter);
app.use('/api/cep', cepRouter);
app.use('/api/integration', integrationRouter);

// Servir archivos estaticos desde ./files
app.use('/files', express.static(path.join(__dirname, 'files')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
