import { Router } from 'express';
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  createIncident, updateIncident, geocodeEvent, geocodeAllEvents,
  getEventStaffLocations,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER', 'CLIENT'), createEvent);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER', 'CLIENT'), updateEvent);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), deleteEvent);

// Staff live locations
router.get('/:id/staff-locations', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getEventStaffLocations);

// Geocoding
router.post('/:id/geocode', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), geocodeEvent);
router.post('/geocode-all', authorize('ADMIN', 'SUB_ADMIN'), geocodeAllEvents);

// Incidents
router.post('/:eventId/incidents', createIncident);
router.put('/incidents/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateIncident);

export default router;
