"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const socket_service_1 = require("./services/socket.service");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.io
(0, socket_service_1.initializeSocket)(httpServer);
// ─── Global Middleware ───────────────────────────────────────────────────────
app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.resolve(env_1.env.UPLOAD_DIR)));
// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'Extreme Staffing Unified API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', routes_1.default);
// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});
// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Start Server ────────────────────────────────────────────────────────────
httpServer.listen(env_1.env.PORT, () => {
    console.log(`\n🚀 Extreme Staffing API running on port ${env_1.env.PORT}`);
    console.log(`   Environment: ${env_1.env.NODE_ENV}`);
    console.log(`   Health: http://localhost:${env_1.env.PORT}/health`);
    console.log(`   API:    http://localhost:${env_1.env.PORT}/api\n`);
});
exports.default = app;
