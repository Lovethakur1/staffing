import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listUnavailability,
  listAllUnavailability,
  createUnavailability,
  deleteUnavailability,
} from '../controllers/unavailability.controller';

const router = Router();
router.use(authenticate);

router.get('/', listUnavailability);
router.get('/all', listAllUnavailability);
router.post('/', createUnavailability);
router.delete('/:id', deleteUnavailability);

export default router;
