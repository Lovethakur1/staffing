import { Router } from 'express';
import {
  listStaff, getStaffProfile, updateStaffProfile,
  listApplications, createApplication, updateApplication,
  listCertifications, listAllCertifications, createCertification, verifyCertification,
  listInterviews, createInterview, updateInterview,
  listAllDocuments, listDocuments, createDocument, updateDocument,
  getStaffDashboard, getMyPayroll,
  listJobPostings, getJobPosting, createJobPosting, updateJobPosting, deleteJobPosting,
  listAssessments, getAssessment, createAssessment, updateAssessment
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
router.post('/hr/applications', authorize('STAFF'), createApplication);
router.put('/hr/applications/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateApplication);

// Certifications
router.get('/all-certifications', authorize('ADMIN', 'SUB_ADMIN'), listAllCertifications);
router.get('/:staffId/certifications', listCertifications);
router.post('/certifications', createCertification);
router.put('/certifications/:id/verify', authorize('ADMIN', 'SUB_ADMIN'), verifyCertification);

// Interviews
router.get('/hr/interviews', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listInterviews);
router.post('/hr/interviews', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), createInterview);
router.put('/hr/interviews/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateInterview);

// Documents
router.get('/hr/documents', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listAllDocuments);
router.get('/:userId/documents', listDocuments);
router.post('/documents', createDocument);
router.put('/documents/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateDocument);

// Job Postings
router.get('/hr/jobs', listJobPostings);
router.get('/hr/jobs/:id', getJobPosting);
router.post('/hr/jobs', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), createJobPosting);
router.put('/hr/jobs/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateJobPosting);
router.delete('/hr/jobs/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), deleteJobPosting);

// Assessments
router.get('/hr/assessments', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), listAssessments);
router.get('/hr/assessments/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), getAssessment);
router.post('/hr/assessments', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), createAssessment);
router.put('/hr/assessments/:id', authorize('ADMIN', 'SUB_ADMIN', 'MANAGER'), updateAssessment);

export default router;
