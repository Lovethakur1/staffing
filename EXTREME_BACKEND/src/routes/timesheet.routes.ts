import { Router } from 'express';
import {
  listTimesheets, getTimesheet, updateTimesheet,
} from '../controllers/timesheet.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Timesheets - direct route (also available under /finance/timesheets)
router.get('/', listTimesheets);
router.get('/:id', getTimesheet);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateTimesheet);

export default router;
