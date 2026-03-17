"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Dashboard endpoints (Admin only)
router.get('/stats', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), dashboard_controller_1.getDashboardStats);
router.get('/live-metrics', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), dashboard_controller_1.getLiveMetrics);
router.get('/upcoming-critical', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), dashboard_controller_1.getUpcomingCriticalEvents);
router.get('/top-performers', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), dashboard_controller_1.getTopPerformers);
router.get('/pending-actions', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), dashboard_controller_1.getPendingActions);
router.get('/live-operations', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), dashboard_controller_1.getLiveOperations);
router.get('/event-requests', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'SCHEDULER'), dashboard_controller_1.getEventRequests);
exports.default = router;
