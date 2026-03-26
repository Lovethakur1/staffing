import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  listIntegrations,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationConfig,
  syncIntegration,
} from '../controllers/integration.controller';

const router = Router();

// All routes require authentication; connect/disconnect/config require admin
router.get('/', authenticate, authorize('ADMIN', 'SUB_ADMIN'), listIntegrations);
router.post('/:key/connect', authenticate, authorize('ADMIN', 'SUB_ADMIN'), connectIntegration);
router.post('/:key/disconnect', authenticate, authorize('ADMIN', 'SUB_ADMIN'), disconnectIntegration);
router.put('/:key/config', authenticate, authorize('ADMIN', 'SUB_ADMIN'), updateIntegrationConfig);
router.post('/:key/sync', authenticate, authorize('ADMIN', 'SUB_ADMIN'), syncIntegration);

export default router;
