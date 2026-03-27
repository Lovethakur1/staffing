import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './services/socket.service';
import { startCronJobs } from './jobs/cron';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

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
app.use('/api', apiRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`\n🚀 Extreme Staffing API running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/health`);
  console.log(`   API:    http://localhost:${env.PORT}/api\n`);
  
  // Start background cron jobs
  startCronJobs();
});

export default app;
