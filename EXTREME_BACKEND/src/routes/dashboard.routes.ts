import { Router } from 'express';
import {
  getDashboardStats,
  getLiveMetrics,
  getUpcomingCriticalEvents,
  getTopPerformers,
  getPendingActions,
  getLiveOperations,
  getEventRequests,
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Dashboard endpoints (Admin only)
router.get('/stats', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getDashboardStats);
router.get('/live-metrics', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getLiveMetrics);
router.get('/upcoming-critical', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getUpcomingCriticalEvents);
router.get('/top-performers', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getTopPerformers);
router.get('/pending-actions', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getPendingActions);
router.get('/live-operations', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getLiveOperations);
router.get('/event-requests', authorize('ADMIN', 'SUB_ADMIN', 'SCHEDULER'), getEventRequests);

export default router;
