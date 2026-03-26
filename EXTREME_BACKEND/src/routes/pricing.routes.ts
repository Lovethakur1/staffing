import { Router } from 'express';
import { getPricingConfig, updatePricingConfig } from '../controllers/pricing.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// Allow ADMIN, SUB_ADMIN, and MANAGER to view the pricing config
router.get('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getPricingConfig);
// Allow only ADMIN to update it
router.put('/', authorize('ADMIN'), updatePricingConfig);

export default router;
