import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  getDatabaseStats,
  getDatabaseTables,
  getDatabasePerformance,
  getBackups,
  createBackup,
  optimizeTable,
} from '../controllers/database.controller';

const router = Router();
const adminOnly = [authenticate, authorize('ADMIN', 'SUB_ADMIN')];

router.get('/stats',              ...adminOnly, getDatabaseStats);
router.get('/tables',             ...adminOnly, getDatabaseTables);
router.get('/performance',        ...adminOnly, getDatabasePerformance);
router.get('/backups',            ...adminOnly, getBackups);
router.post('/backups',           ...adminOnly, createBackup);
router.post('/tables/:name/optimize', ...adminOnly, optimizeTable);

export default router;
