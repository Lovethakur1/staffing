import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listUnavailability,
  createUnavailability,
  deleteUnavailability,
} from '../controllers/unavailability.controller';

const router = Router();
router.use(authenticate);

router.get('/', listUnavailability);
router.post('/', createUnavailability);
router.delete('/:id', deleteUnavailability);

export default router;
