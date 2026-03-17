"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("../controllers/staff.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Staff Dashboard (must be before /:id to avoid conflict)
router.get('/me/dashboard', staff_controller_1.getStaffDashboard);
router.get('/me/payroll', staff_controller_1.getMyPayroll);
// Staff Profiles
router.get('/', staff_controller_1.listStaff);
router.get('/:id', staff_controller_1.getStaffProfile);
router.put('/:id', staff_controller_1.updateStaffProfile);
// Applications
router.get('/hr/applications', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), staff_controller_1.listApplications);
router.post('/hr/applications', staff_controller_1.createApplication);
router.put('/hr/applications/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), staff_controller_1.updateApplication);
// Certifications
router.get('/:staffId/certifications', staff_controller_1.listCertifications);
router.post('/certifications', staff_controller_1.createCertification);
router.put('/certifications/:id/verify', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN'), staff_controller_1.verifyCertification);
// Interviews
router.get('/hr/interviews', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), staff_controller_1.listInterviews);
router.post('/hr/interviews', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), staff_controller_1.createInterview);
router.put('/hr/interviews/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), staff_controller_1.updateInterview);
// Documents
router.get('/:userId/documents', staff_controller_1.listDocuments);
router.post('/documents', staff_controller_1.createDocument);
router.put('/documents/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), staff_controller_1.updateDocument);
exports.default = router;
