"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_controller_1 = require("../controllers/client.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Client profiles
router.get('/', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), client_controller_1.listClients);
router.get('/favorites', (0, rbac_1.authorize)('CLIENT'), client_controller_1.listFavoriteStaff);
router.post('/favorites', (0, rbac_1.authorize)('CLIENT'), client_controller_1.addFavoriteStaff);
router.delete('/favorites/:staffId', (0, rbac_1.authorize)('CLIENT'), client_controller_1.removeFavoriteStaff);
router.get('/:id', client_controller_1.getClient);
router.put('/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER', 'CLIENT'), client_controller_1.updateClient);
exports.default = router;
