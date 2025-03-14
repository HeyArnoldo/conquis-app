// src/routes/areas.js
import { Router } from 'express';
import {
  getAllAreas,
  getAreaBySlug,
  getSpecialtyBySlug,
  getAllSpecialtiesPaginated
} from '../controllers/areasController.js';

const router = Router();

// NUEVA RUTA: Obtiene TODAS las especialidades (sin importar el área) con paginación
// Endpoint: GET /api/areas/specialties?limit=&page=
router.get('/specialties', getAllSpecialtiesPaginated);

// Rutas existentes:
router.get('/', getAllAreas);
router.get('/:areaSlug', getAreaBySlug);
router.get('/:areaSlug/:specialtySlug', getSpecialtyBySlug);

export default router;
