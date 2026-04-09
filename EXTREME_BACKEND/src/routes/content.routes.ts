import { Router } from 'express';
import {
  createContentItem,
  deleteContentItem,
  listContentAdmin,
  listPublishedContent,
  updateContentItem,
} from '../controllers/content.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/mobile', listPublishedContent);
router.get('/admin', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listContentAdmin);
router.post('/admin', authorize('ADMIN', 'SUB_ADMIN'), createContentItem);
router.put('/admin/:id', authorize('ADMIN', 'SUB_ADMIN'), updateContentItem);
router.delete('/admin/:id', authorize('ADMIN', 'SUB_ADMIN'), deleteContentItem);

export default router;