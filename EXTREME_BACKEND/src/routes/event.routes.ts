import { Router } from 'express';
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  createIncident, updateIncident,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'CLIENT'), createEvent);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateEvent);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), deleteEvent);

// Incidents
router.post('/:eventId/incidents', createIncident);
router.put('/incidents/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateIncident);

export default router;
