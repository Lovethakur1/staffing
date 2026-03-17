"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = exports.calculateHours = exports.generateInvoiceNumber = exports.asyncHandler = void 0;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Generate a human-readable invoice number like INV-20260223-0001
 */
const generateInvoiceNumber = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `INV-${date}-${rand}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
/**
 * Calculate hours between two Date objects.
 */
const calculateHours = (start, end) => {
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals
};
exports.calculateHours = calculateHours;
/**
 * Paginate query params helper.
 */
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const take = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * take;
    return { skip, take, page };
};
exports.parsePagination = parsePagination;
