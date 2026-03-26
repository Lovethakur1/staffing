import { Router } from 'express';
import {
  getProfile, updateProfile, changePassword,
  getPreferences, updatePreferences,
  getCompanySettings, updateCompanySettings,
  getLoginActivity, logoutAllDevices,
} from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/company', authorize('ADMIN', 'SUB_ADMIN'), getCompanySettings);
router.put('/company', authorize('ADMIN'), updateCompanySettings);
router.get('/activity', getLoginActivity);
router.post('/logout-all', logoutAllDevices);

export default router;
