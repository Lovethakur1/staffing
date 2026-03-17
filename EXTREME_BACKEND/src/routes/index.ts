import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import staffRoutes from './staff.routes';
import clientRoutes from './client.routes';
import eventRoutes from './event.routes';
import shiftRoutes from './shift.routes';
import financeRoutes from './finance.routes';
import invoiceRoutes from './invoice.routes';
import uploadRoutes from './upload.routes';
import chatRoutes from './chat.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/staff', staffRoutes);
router.use('/clients', clientRoutes);
router.use('/events', eventRoutes);
router.use('/shifts', shiftRoutes);
router.use('/finance', financeRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
