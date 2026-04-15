import { Router } from 'express';
import {
  listItems, getItem, createItem, updateItem, deleteItem,
  listAssignments, createAssignment, updateAssignment,
} from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Assignments (must be before /:id to avoid conflict)
router.get('/assignments', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'STAFF'), listAssignments);
router.post('/assignments', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), createAssignment);
router.put('/assignments/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateAssignment);

// Equipment items
router.get('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listItems);
router.get('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getItem);
router.post('/', authorize('ADMIN', 'SUB_ADMIN'), createItem);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN'), updateItem);
router.delete('/:id', authorize('ADMIN', 'SUB_ADMIN'), deleteItem);

export default router;
