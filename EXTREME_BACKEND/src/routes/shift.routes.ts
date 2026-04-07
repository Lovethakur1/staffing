import { Router } from 'express';
import {
  listShifts, getMyShifts, getShift, createShift, updateShift, deleteShift,
  updateShiftStatus, toggleTravel,
  startTravel, arriveAtVenue, clockIn, clockOut,
  startBreak, endBreak,
  startTravelHome, endTravelHome, updateLocation,
  requestDeviceChange, approveDeviceChange, getDeviceInfo, getPendingDeviceChanges,
} from '../controllers/shift.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// CRUD
router.get('/', listShifts);
router.get('/my', getMyShifts); // Get logged-in user's own shifts

// Device management (MUST be before /:id routes)
router.get('/device/info', authorize('STAFF', 'MANAGER'), getDeviceInfo);
router.get('/device/pending', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getPendingDeviceChanges);
router.post('/device/request-change', authorize('STAFF', 'MANAGER'), requestDeviceChange);
router.post('/device/approve-change/:staffProfileId', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), approveDeviceChange);

router.get('/:id', getShift);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), createShift);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), updateShift);
router.put('/:id/status', authorize('STAFF', 'MANAGER'), updateShiftStatus);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), deleteShift);

// Admin: toggle travel permission per shift
router.put('/:id/toggle-travel', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), toggleTravel);

// Uber-like travel flow (Staff & Manager actions)
router.post('/:id/start-travel', authorize('STAFF', 'MANAGER'), startTravel);
router.post('/:id/arrive', authorize('STAFF', 'MANAGER'), arriveAtVenue);
router.post('/:id/clock-in', authorize('STAFF', 'MANAGER'), clockIn);
router.post('/:id/break-in', authorize('STAFF', 'MANAGER'), startBreak);
router.post('/:id/break-out', authorize('STAFF', 'MANAGER'), endBreak);
router.post('/:id/clock-out', authorize('STAFF', 'MANAGER'), clockOut);
router.post('/:id/travel-home', authorize('STAFF', 'MANAGER'), startTravelHome);
router.post('/:id/end-travel', authorize('STAFF', 'MANAGER'), endTravelHome);
router.post('/:id/update-location', authorize('STAFF', 'MANAGER'), updateLocation);

export default router;
