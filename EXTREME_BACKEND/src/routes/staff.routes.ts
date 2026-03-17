import { Router } from 'express';
import {
  listStaff, getStaffProfile, updateStaffProfile,
  listApplications, createApplication, updateApplication,
  listCertifications, createCertification, verifyCertification,
  listInterviews, createInterview, updateInterview,
  listDocuments, createDocument, updateDocument,
  getStaffDashboard, getMyPayroll,
} from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(authenticate);

// Staff Dashboard (must be before /:id to avoid conflict)
router.get('/me/dashboard', getStaffDashboard);
router.get('/me/payroll', getMyPayroll);

// Staff Profiles
router.get('/', listStaff);
router.get('/:id', getStaffProfile);
router.put('/:id', updateStaffProfile);

// Applications
router.get('/hr/applications', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listApplications);
router.post('/hr/applications', createApplication);
router.put('/hr/applications/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateApplication);

// Certifications
router.get('/:staffId/certifications', listCertifications);
router.post('/certifications', createCertification);
router.put('/certifications/:id/verify', authorize('ADMIN', 'SUB_ADMIN'), verifyCertification);

// Interviews
router.get('/hr/interviews', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listInterviews);
router.post('/hr/interviews', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), createInterview);
router.put('/hr/interviews/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateInterview);

// Documents
router.get('/:userId/documents', listDocuments);
router.post('/documents', createDocument);
router.put('/documents/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateDocument);

export default router;
