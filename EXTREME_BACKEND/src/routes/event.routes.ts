import { Router } from 'express';
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  listIncidents, getIncident, createIncident, updateIncident, geocodeEvent, geocodeAllEvents,
  getEventStaffLocations, getGeofence, updateGeofence,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', listEvents);

// Incidents (must be before /:id to avoid conflict)
router.get('/incidents', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'STAFF'), listIncidents);
router.get('/incidents/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'STAFF'), getIncident);
router.put('/incidents/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateIncident);

router.get('/:id', getEvent);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER', 'CLIENT'), createEvent);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER', 'CLIENT'), updateEvent);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), deleteEvent);

// Geofence
router.get('/:id/geofence', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getGeofence);
router.put('/:id/geofence', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateGeofence);

// Staff live locations
router.get('/:id/staff-locations', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getEventStaffLocations);

// Geocoding
router.post('/:id/geocode', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), geocodeEvent);
router.post('/geocode-all', authorize('ADMIN', 'SUB_ADMIN'), geocodeAllEvents);

// Create incident for specific event
router.post('/:eventId/incidents', createIncident);

export default router;
