import api from './api';

export interface DbStats {
  dbSize: string;
  tableCount: number;
  totalRows: number;
  cacheHitRate: number;
  connections: { active: number; idle: number; total: number; max: number };
  avgQueryMs: number;
  lastBackupAt: string | null;
}

export interface DbTable {
  name: string;
  rowCount: number;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  lastVacuum: string | null;
  lastAnalyze: string | null;
  status: 'healthy' | 'warning';
}

export interface DbPerformance {
  cacheHitRate: number;
  transactions: { committed: number; rolledBack: number };
  tuples: { inserted: number; updated: number; deleted: number };
  slowQueries: { query: string; calls: string; mean_exec_time: string; total_exec_time: string }[];
  storage: { db_size: string; index_size: string; table_size: string };
}

export interface BackupLog {
  id: string;
  type: string;
  status: string;
  sizeBytes: number | null;
  filePath: string | null;
  errorMsg: string | null;
  initiatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export const databaseService = {
  getStats: async (): Promise<DbStats> => {
    const res = await api.get('/database/stats');
    return res.data;
  },
  getTables: async (): Promise<DbTable[]> => {
    const res = await api.get('/database/tables');
    return res.data;
  },
  getPerformance: async (): Promise<DbPerformance> => {
    const res = await api.get('/database/performance');
    return res.data;
  },
  getBackups: async (): Promise<BackupLog[]> => {
    const res = await api.get('/database/backups');
    return res.data;
  },
  createBackup: async (type: 'FULL' | 'INCREMENTAL'): Promise<BackupLog> => {
    const res = await api.post('/database/backups', { type });
    return res.data.backup;
  },
  optimizeTable: async (name: string): Promise<void> => {
    await api.post(`/database/tables/${name}/optimize`);
  },
};
