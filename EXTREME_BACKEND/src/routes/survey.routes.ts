import { Router } from 'express';
import { listSurveys, createSurvey, updateSurvey, getSurvey } from '../controllers/survey.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listSurveys);
router.post('/', authorize('ADMIN', 'SUB_ADMIN'), createSurvey);
router.get('/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getSurvey);
router.put('/:id', authorize('ADMIN', 'SUB_ADMIN'), updateSurvey);

export default router;
