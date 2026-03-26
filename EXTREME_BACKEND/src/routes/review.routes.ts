import { Router } from 'express';
import { createReview, getStaffReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// Get reviews for a staff member (publicly readable by everyone authenticated)
router.get('/staff/:staffId', authenticate, getStaffReviews);

// Submit a review (Client, Admin, Sub-Admin, Manager)
router.post('/', authenticate, authorize('CLIENT', 'ADMIN', 'SUB_ADMIN', 'MANAGER'), createReview);

export default router;
