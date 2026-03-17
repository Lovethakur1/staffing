"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', event_controller_1.listEvents);
router.get('/:id', event_controller_1.getEvent);
router.post('/', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER', 'CLIENT'), event_controller_1.createEvent);
router.put('/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), event_controller_1.updateEvent);
router.delete('/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), event_controller_1.deleteEvent);
// Incidents
router.post('/:eventId/incidents', event_controller_1.createIncident);
router.put('/incidents/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), event_controller_1.updateIncident);
exports.default = router;
