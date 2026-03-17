"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
/**
 * Global error handler middleware.
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('[ERROR]', err);
    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
        return;
    }
    // Multer other errors
    if (err.name === 'MulterError') {
        res.status(400).json({ error: err.message });
        return;
    }
    // Prisma known request error
    if (err.code && err.code.startsWith('P')) {
        res.status(400).json({ error: 'Database operation failed.', code: err.code });
        return;
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
