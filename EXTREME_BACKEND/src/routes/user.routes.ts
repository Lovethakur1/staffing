import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listUsers);
router.post('/', authorize('ADMIN', 'SUB_ADMIN'), createUser);
router.get('/:id', getUser);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
