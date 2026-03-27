import { Router } from 'express';
import {
  listShifts, getShift, createShift, updateShift, deleteShift,
  updateShiftStatus, toggleTravel,
  startTravel, arriveAtVenue, clockIn, clockOut,
  startBreak, endBreak,
  startTravelHome, endTravelHome, updateLocation,
  requestDeviceChange, approveDeviceChange, getDeviceInfo,
} from '../controllers/shift.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// CRUD
router.get('/', listShifts);

// Device management (MUST be before /:id routes)
router.get('/device/info', authorize('STAFF'), getDeviceInfo);
router.post('/device/request-change', authorize('STAFF'), requestDeviceChange);
router.post('/device/approve-change/:staffProfileId', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), approveDeviceChange);

router.get('/:id', getShift);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), createShift);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), updateShift);
router.put('/:id/status', authorize('STAFF'), updateShiftStatus);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), deleteShift);

// Admin: toggle travel permission per shift
router.put('/:id/toggle-travel', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), toggleTravel);

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
