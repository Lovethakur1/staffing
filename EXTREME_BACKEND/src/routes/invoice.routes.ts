import { Router } from 'express';
import {
  listInvoices, getInvoice, createInvoice, updateInvoice,
  addLineItem, removeLineItem,
} from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', listInvoices);
router.get('/:id', getInvoice);
router.post('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), createInvoice);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER', 'CLIENT'), updateInvoice);

// Line items
router.post('/:id/line-items', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), addLineItem);
router.delete('/:id/line-items/:itemId', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), removeLineItem);

export default router;
