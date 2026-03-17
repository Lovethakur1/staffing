"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shift_controller_1 = require("../controllers/shift.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// CRUD
router.get('/', shift_controller_1.listShifts);
router.get('/:id', shift_controller_1.getShift);
router.post('/', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), shift_controller_1.createShift);
router.put('/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'), shift_controller_1.updateShift);
router.put('/:id/status', (0, rbac_1.authorize)('STAFF'), shift_controller_1.updateShiftStatus);
router.delete('/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), shift_controller_1.deleteShift);
// Uber-like travel flow (Staff actions)
router.post('/:id/start-travel', (0, rbac_1.authorize)('STAFF'), shift_controller_1.startTravel);
router.post('/:id/arrive', (0, rbac_1.authorize)('STAFF'), shift_controller_1.arriveAtVenue);
router.post('/:id/clock-in', (0, rbac_1.authorize)('STAFF'), shift_controller_1.clockIn);
router.post('/:id/break-in', (0, rbac_1.authorize)('STAFF'), shift_controller_1.startBreak);
router.post('/:id/break-out', (0, rbac_1.authorize)('STAFF'), shift_controller_1.endBreak);
router.post('/:id/clock-out', (0, rbac_1.authorize)('STAFF'), shift_controller_1.clockOut);
router.post('/:id/travel-home', (0, rbac_1.authorize)('STAFF'), shift_controller_1.startTravelHome);
router.post('/:id/end-travel', (0, rbac_1.authorize)('STAFF'), shift_controller_1.endTravelHome);
router.post('/:id/update-location', (0, rbac_1.authorize)('STAFF'), shift_controller_1.updateLocation);
exports.default = router;
