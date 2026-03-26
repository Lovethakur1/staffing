import { Router } from 'express';
import {
  listConversations, getMessages, createConversation,
  addParticipant, removeParticipant, sendMessage, getUnreadCount,
  searchUsersForChat
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/unread-count', getUnreadCount);
router.get('/users/search', searchUsersForChat);
router.get('/conversations', listConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/participants', addParticipant);
router.delete('/conversations/:id/participants/:userId', removeParticipant);

export default router;
