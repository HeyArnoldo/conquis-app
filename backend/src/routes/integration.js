import { Router } from 'express';
import {
  getPendingSuggestions,
  getLinks,
  upsertLink
} from '../controllers/integrationController.js';

const router = Router();

router.get('/pending', getPendingSuggestions);
router.get('/links', getLinks);
router.post('/links', upsertLink);

export default router;
