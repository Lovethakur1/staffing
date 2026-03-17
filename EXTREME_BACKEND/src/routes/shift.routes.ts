import { Router } from 'express';
import {
  listShifts, getShift, createShift, updateShift, deleteShift,
  updateShiftStatus,
  startTravel, arriveAtVenue, clockIn, clockOut,
  startBreak, endBreak,
  startTravelHome, endTravelHome, updateLocation,
} from '../controllers/shift.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// CRUD
router.get('/', listShifts);
router.get('/:id', getShift);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), createShift);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), updateShift);
router.put('/:id/status', authorize('STAFF'), updateShiftStatus);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), deleteShift);

// Uber-like travel flow (Staff actions)
router.post('/:id/start-travel', authorize('STAFF'), startTravel);
router.post('/:id/arrive', authorize('STAFF'), arriveAtVenue);
router.post('/:id/clock-in', authorize('STAFF'), clockIn);
router.post('/:id/break-in', authorize('STAFF'), startBreak);
router.post('/:id/break-out', authorize('STAFF'), endBreak);
router.post('/:id/clock-out', authorize('STAFF'), clockOut);
router.post('/:id/travel-home', authorize('STAFF'), startTravelHome);
router.post('/:id/end-travel', authorize('STAFF'), endTravelHome);
router.post('/:id/update-location', authorize('STAFF'), updateLocation);

export default router;
