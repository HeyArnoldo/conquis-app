// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

import areasRouter from './src/routes/areas.js';

// Config para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables de entorno
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Rutas de tu API
app.use('/api/areas', areasRouter);

// Servir archivos estáticos desde ./files
app.use('/files', express.static(path.join(__dirname, 'files')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
