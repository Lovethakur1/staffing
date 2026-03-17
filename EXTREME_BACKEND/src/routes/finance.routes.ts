import { Router } from 'express';
import {
  listTimesheets, getTimesheet, updateTimesheet,
  listPayrollRuns, getPayrollRun, createPayrollRun, updatePayrollRun,
} from '../controllers/timesheet.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Timesheets
router.get('/timesheets', listTimesheets);
router.get('/timesheets/:id', getTimesheet);
router.put('/timesheets/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateTimesheet);

// Payroll
router.get('/payroll', authorize('ADMIN', 'SUB_ADMIN'), listPayrollRuns);
router.get('/payroll/:id', authorize('ADMIN', 'SUB_ADMIN'), getPayrollRun);
router.post('/payroll', authorize('ADMIN', 'SUB_ADMIN'), createPayrollRun);
router.put('/payroll/:id', authorize('ADMIN', 'SUB_ADMIN'), updatePayrollRun);

export default router;
