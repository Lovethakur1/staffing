"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', invoice_controller_1.listInvoices);
router.get('/:id', invoice_controller_1.getInvoice);
router.post('/', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), invoice_controller_1.createInvoice);
router.put('/:id', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), invoice_controller_1.updateInvoice);
// Line items
router.post('/:id/line-items', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), invoice_controller_1.addLineItem);
router.delete('/:id/line-items/:itemId', (0, rbac_1.authorize)('ADMIN', 'SUB_ADMIN', 'MANAGER'), invoice_controller_1.removeLineItem);
exports.default = router;
