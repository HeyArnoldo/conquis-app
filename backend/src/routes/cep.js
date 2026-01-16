// src/routes/cep.js
import { Router } from 'express';
import {
  getCepManifest,
  getCepCategoryBySlug,
  getCepSpecialtyBySlug
} from '../controllers/cepController.js';

const router = Router();

router.get('/', getCepManifest);
router.get('/:categorySlug', getCepCategoryBySlug);
router.get('/:categorySlug/:specialtySlug', getCepSpecialtyBySlug);

export default router;
