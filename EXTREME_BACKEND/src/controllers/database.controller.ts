import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

/** GET /api/database/stats — aggregate database overview */
export const getDatabaseStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Total DB size
    const dbSizeRaw = await prisma.$queryRaw<[{ db_size: string }]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size
    `;

    // Total tables count and total live rows across all user tables
    const tableAgg = await prisma.$queryRaw<[{ table_count: string; total_rows: string }]>`
      SELECT
        COUNT(*)::text                       AS table_count,
        COALESCE(SUM(n_live_tup), 0)::text   AS total_rows
      FROM pg_stat_user_tables
    `;

    // Cache hit rate from pg_stat_database
    const cacheRaw = await prisma.$queryRaw<[{ hit_rate: string }]>`
      SELECT ROUND(
        (100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0))::numeric, 2
      )::text AS hit_rate
      FROM pg_stat_database
      WHERE datname = current_database()
    `;

    // Active connections
    const connRaw = await prisma.$queryRaw<[{ active: string; idle: string; total: string; max_conn: string }]>`
      SELECT
        COUNT(*) FILTER (WHERE state = 'active')  ::text AS active,
        COUNT(*) FILTER (WHERE state = 'idle')    ::text AS idle,
        COUNT(*)                                  ::text AS total,
        (SELECT setting FROM pg_settings WHERE name = 'max_connections')::text AS max_conn
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    // Average query time (blk_read_time/blk_write_time per transaction)
    const avgTimeRaw = await prisma.$queryRaw<[{ avg_ms: string }]>`
      SELECT ROUND(
        (CASE WHEN SUM(xact_commit + xact_rollback) = 0 THEN 0
              ELSE SUM(blk_read_time + blk_write_time) / NULLIF(SUM(xact_commit + xact_rollback), 0)
         END)::numeric, 2
      )::text AS avg_ms
      FROM pg_stat_database
      WHERE datname = current_database()
    `;

    // Last backup from BackupLog
    const lastBackup = await prisma.backupLog.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    res.json({
      dbSize: dbSizeRaw[0]?.db_size ?? 'N/A',
      tableCount: parseInt(tableAgg[0]?.table_count ?? '0', 10),
      totalRows: parseInt(tableAgg[0]?.total_rows ?? '0', 10),
      cacheHitRate: parseFloat(cacheRaw[0]?.hit_rate ?? '0'),
      connections: {
        active: parseInt(connRaw[0]?.active ?? '0', 10),
        idle: parseInt(connRaw[0]?.idle ?? '0', 10),
        total: parseInt(connRaw[0]?.total ?? '0', 10),
        max: parseInt(connRaw[0]?.max_conn ?? '100', 10),
      },
      avgQueryMs: parseFloat(avgTimeRaw[0]?.avg_ms ?? '0'),
      lastBackupAt: lastBackup?.createdAt ?? null,
    });
  } catch (error) {
    console.error('getDatabaseStats error:', error);
    res.status(500).json({ error: 'Failed to fetch database stats' });
  }
};

/** GET /api/database/tables — list user tables with size and row count */
export const getDatabaseTables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tables = await prisma.$queryRaw<{
      table_name: string;
      row_count: string;
      table_size: string;
      index_size: string;
      total_size: string;
      last_vacuum: Date | null;
      last_analyze: Date | null;
    }[]>`
      SELECT
        t.relname                                        AS table_name,
        s.n_live_tup::text                               AS row_count,
        pg_size_pretty(pg_table_size(t.oid))             AS table_size,
        pg_size_pretty(pg_indexes_size(t.oid))           AS index_size,
        pg_size_pretty(pg_total_relation_size(t.oid))    AS total_size,
        s.last_vacuum,
        s.last_analyze
      FROM pg_class t
      JOIN pg_stat_user_tables s ON s.relname = t.relname
      WHERE t.relkind = 'r'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY pg_total_relation_size(t.oid) DESC
    `;

    const result = tables.map(t => ({
      name: t.table_name,
      rowCount: parseInt(t.row_count, 10),
      tableSize: t.table_size,
      indexSize: t.index_size,
      totalSize: t.total_size,
      lastVacuum: t.last_vacuum ?? null,
      lastAnalyze: t.last_analyze ?? null,
      status: 'healthy' as const, // could be enhanced with bloat detection
    }));

    res.json(result);
  } catch (error) {
    console.error('getDatabaseTables error:', error);
    res.status(500).json({ error: 'Failed to fetch table list' });
  }
};

/** GET /api/database/performance — query and connection performance metrics */
export const getDatabasePerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [dbStats, slowQueriesRaw, storageRaw] = await Promise.all([
      prisma.$queryRaw<{
        blks_hit: string;
        blks_read: string;
        xact_commit: string;
        xact_rollback: string;
        blk_read_time: string;
        blk_write_time: string;
        tup_inserted: string;
        tup_updated: string;
        tup_deleted: string;
      }[]>`
        SELECT
          SUM(blks_hit)::text        AS blks_hit,
          SUM(blks_read)::text       AS blks_read,
          SUM(xact_commit)::text     AS xact_commit,
          SUM(xact_rollback)::text   AS xact_rollback,
          SUM(blk_read_time)::text   AS blk_read_time,
          SUM(blk_write_time)::text  AS blk_write_time,
          SUM(tup_inserted)::text    AS tup_inserted,
          SUM(tup_updated)::text     AS tup_updated,
          SUM(tup_deleted)::text     AS tup_deleted
        FROM pg_stat_database
        WHERE datname = current_database()
      `,

      // Slow queries from pg_stat_statements if available (safe fallback to empty)
      prisma.$queryRaw<{ query: string; calls: string; mean_exec_time: string; total_exec_time: string }[]>`
        SELECT
          LEFT(query, 100)                      AS query,
          calls::text,
          ROUND(mean_exec_time::numeric, 2)::text AS mean_exec_time,
          ROUND(total_exec_time::numeric, 2)::text AS total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `.catch(() => []),

      // Storage breakdown
      prisma.$queryRaw<{ db_size: string; index_size: string; table_size: string }[]>`
        SELECT
          pg_size_pretty(pg_database_size(current_database()))                    AS db_size,
          pg_size_pretty(
            (SELECT SUM(pg_indexes_size(c.oid)) FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public' AND c.relkind = 'r')
          )                                                                       AS index_size,
          pg_size_pretty(
            (SELECT SUM(pg_table_size(c.oid)) FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public' AND c.relkind = 'r')
          )                                                                       AS table_size
      `,
    ]);

    const s = dbStats[0] ?? {};
    const blksHit = parseInt(s.blks_hit ?? '0', 10);
    const blksRead = parseInt(s.blks_read ?? '0', 10);
    const cacheHitRate = blksHit + blksRead > 0
      ? Math.round((blksHit / (blksHit + blksRead)) * 10000) / 100
      : 100;

    res.json({
      cacheHitRate,
      transactions: {
        committed: parseInt(s.xact_commit ?? '0', 10),
        rolledBack: parseInt(s.xact_rollback ?? '0', 10),
      },
      tuples: {
        inserted: parseInt(s.tup_inserted ?? '0', 10),
        updated: parseInt(s.tup_updated ?? '0', 10),
        deleted: parseInt(s.tup_deleted ?? '0', 10),
      },
      slowQueries: slowQueriesRaw,
      storage: storageRaw[0] ?? { db_size: 'N/A', index_size: 'N/A', table_size: 'N/A' },
    });
  } catch (error) {
    console.error('getDatabasePerformance error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

/** GET /api/database/backups — list backup history */
export const getBackups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const backups = await prisma.backupLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(backups);
  } catch (error) {
    console.error('getBackups error:', error);
    res.status(500).json({ error: 'Failed to fetch backup history' });
  }
};

/** POST /api/database/backups — initiate a new backup */
export const createBackup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type = 'FULL' } = req.body;
    const userId = req.user?.userId ?? 'SYSTEM';

    // Create an IN_PROGRESS record first
    const backup = await prisma.backupLog.create({
      data: {
        type: type === 'INCREMENTAL' ? 'INCREMENTAL' : 'FULL',
        status: 'IN_PROGRESS',
        initiatedBy: userId,
      },
    });

    // Simulate async completion (in production this would trigger pg_dump)
    setImmediate(async () => {
      try {
        // Get current DB size as proxy for backup size
        const sizeRaw = await prisma.$queryRaw<[{ size_bytes: string }]>`
          SELECT pg_database_size(current_database())::text AS size_bytes
        `;
        const sizeBytes = type === 'FULL'
          ? BigInt(sizeRaw[0]?.size_bytes ?? '0')
          : BigInt(sizeRaw[0]?.size_bytes ?? '0') / BigInt(10); // ~10% for incremental

        await prisma.backupLog.update({
          where: { id: backup.id },
          data: { status: 'COMPLETED', sizeBytes, updatedAt: new Date() },
        });
      } catch {
        await prisma.backupLog.update({
          where: { id: backup.id },
          data: { status: 'FAILED', errorMsg: 'Backup process failed', updatedAt: new Date() },
        }).catch(() => {});
      }
    });

    res.json({ success: true, backup });
  } catch (error) {
    console.error('createBackup error:', error);
    res.status(500).json({ error: 'Failed to initiate backup' });
  }
};

/** POST /api/database/tables/:name/optimize — run VACUUM ANALYZE on a table */
export const optimizeTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    // Validate table name is alphanumeric/underscore to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      res.status(400).json({ error: 'Invalid table name' });
      return;
    }
    // VACUUM ANALYZE cannot run in a transaction block, use $executeRawUnsafe
    await prisma.$executeRawUnsafe(`VACUUM ANALYZE "${name}"`);
    res.json({ success: true, message: `VACUUM ANALYZE completed on ${name}` });
  } catch (error) {
    console.error('optimizeTable error:', error);
    res.status(500).json({ error: 'Failed to optimize table' });
  }
};
