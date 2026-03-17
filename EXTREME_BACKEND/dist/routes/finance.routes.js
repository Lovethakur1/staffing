"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timesheet_controller_1 = require("../controllers/timesheet.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Timesheets
router.get('/timesheets', timesheet_controller_1.listTimesheets);
router.get('/timesheets/:id', timesheet_controller_1.getTimesheet);
router.put('/timesheets/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), timesheet_controller_1.updateTimesheet);
// Payroll
router.get('/payroll', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN'), timesheet_controller_1.listPayrollRuns);
router.get('/payroll/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN'), timesheet_controller_1.getPayrollRun);
router.post('/payroll', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN'), timesheet_controller_1.createPayrollRun);
router.put('/payroll/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN'), timesheet_controller_1.updatePayrollRun);
exports.default = router;
