import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Admin Analytics
router.get('/admin', authorize('ADMIN', 'SUB_ADMIN'), getAdminAnalytics);

export default router;
