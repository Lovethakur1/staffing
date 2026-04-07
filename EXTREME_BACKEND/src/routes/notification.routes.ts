import { Router } from 'express';
import {
  listNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', listNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/all', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;
