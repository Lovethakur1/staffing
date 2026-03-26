import express from 'express';
import { submitTicket, getUserTickets, getAllTickets, resolveTicket, getOrCreateSupportChat } from '../controllers/support.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = express.Router();

router.use(authenticate);

// All authenticated users can submit and view their own tickets
router.post('/', submitTicket);
router.get('/my', getUserTickets);
router.post('/:id/chat', getOrCreateSupportChat);

// Only admins and sub-admins can view all tickets and resolve them
router.get('/all', authorize('ADMIN', 'SUB_ADMIN'), getAllTickets);
router.put('/:id/resolve', authorize('ADMIN', 'SUB_ADMIN'), resolveTicket);

export default router;
