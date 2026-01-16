// src/routes/areas.js
import { Router } from 'express';
import {
  getAllAreas,
  getAreaBySlug,
  getSpecialtyBySlug,
  getAllSpecialtiesPaginated
} from '../controllers/areasController.js';

const router = Router();

// GET /api/areas/specialties?limit=&page=&search=
router.get('/specialties', getAllSpecialtiesPaginated);

// Rutas existentes:
router.get('/', getAllAreas);
router.get('/:areaSlug', getAreaBySlug);
router.get('/:areaSlug/:specialtySlug', getSpecialtyBySlug);

export default router;
