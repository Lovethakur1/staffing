import { Router } from 'express';
import { getRolePermissions, updateRolePermissions, getRoleSummary } from '../controllers/role.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/permissions', authorize('ADMIN', 'SUB_ADMIN'), getRolePermissions);
router.put('/permissions/:role', authorize('ADMIN'), updateRolePermissions);
router.get('/users-summary', authorize('ADMIN', 'SUB_ADMIN'), getRoleSummary);

export default router;
