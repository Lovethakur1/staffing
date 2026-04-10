import { Router } from 'express';
import { listPublicJobs, getPublicJob, submitPublicApplication } from '../controllers/public.controller';

const router = Router();

// No authentication middleware — these are public endpoints
router.get('/jobs', listPublicJobs);
router.get('/jobs/:id', getPublicJob);
router.post('/jobs/:id/apply', submitPublicApplication);

export default router;
