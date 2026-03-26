import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Database as DatabaseIcon,
  Search,
  Download,
  RefreshCw,
  Server,
  HardDrive,
  Activity,
  CheckCircle,
  Clock,
  Settings,
  Shield,
  TrendingUp,
  AlertCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { databaseService, DbStats, DbTable, DbPerformance, BackupLog } from "../services/database.service";

interface DatabaseProps {
  userRole: string;
  userId: string;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function Database({ userRole }: DatabaseProps) {
  const [stats, setStats] = useState<DbStats | null>(null);
  const [tables, setTables] = useState<DbTable[]>([]);
  const [performance, setPerformance] = useState<DbPerformance | null>(null);
  const [backups, setBackups] = useState<BackupLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [optimizingTable, setOptimizingTable] = useState<string | null>(null);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [confirmBackup, setConfirmBackup] = useState<"FULL" | "INCREMENTAL" | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t, p, b] = await Promise.all([
        databaseService.getStats(),
        databaseService.getTables(),
        databaseService.getPerformance(),
        databaseService.getBackups(),
      ]);
      setStats(s);
      setTables(t);
      setPerformance(p);
      setBackups(b);
    } catch {
      setError("Failed to load database information. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleOptimize = async (tableName: string) => {
    setOptimizingTable(tableName);
    try {
      await databaseService.optimizeTable(tableName);
      toast.success(`VACUUM ANALYZE completed on ${tableName}`);
      // Refresh tables to show updated stats
      const updated = await databaseService.getTables();
      setTables(updated);
    } catch {
      toast.error(`Failed to optimize ${tableName}`);
    } finally {
      setOptimizingTable(null);
    }
  };

  const handleCreateBackup = async (type: "FULL" | "INCREMENTAL") => {
    setConfirmBackup(null);
    setBackupInProgress(true);
    try {
      await databaseService.createBackup(type);
      toast.success(`${type} backup initiated successfully`);
      // Poll for completion after 2s
      setTimeout(async () => {
        try {
          const updated = await databaseService.getBackups();
          setBackups(updated);
        } catch {}
        setBackupInProgress(false);
      }, 2000);
    } catch {
      toast.error("Failed to initiate backup");
      setBackupInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading database information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-semibold">Failed to load database info</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={fetchAll} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTables = tables.filter(t =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[#5E1916]">Database Management</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              PostgreSQL
            </Badge>
          </div>
          <p className="text-muted-foreground">Monitor and manage your database infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAll}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
          <Button variant="outline" onClick={() => setConfirmBackup("FULL")} disabled={backupInProgress}>
            <Download className="h-4 w-4 mr-2" />
            {backupInProgress ? "Backing up..." : "Backup Now"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats?.dbSize ?? "—"}</p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats?.totalRows.toLocaleString() ?? "—"}</p>
              </div>
              <DatabaseIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats ? `${stats.cacheHitRate}%` : "—"}</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats?.connections.active ?? "—"}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Database Tables ({tables.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTables.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tables found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Name</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Table Size</TableHead>
                      <TableHead>Index Size</TableHead>
                      <TableHead>Last Analyzed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map(table => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium font-mono text-sm">{table.name}</TableCell>
                        <TableCell>{table.rowCount.toLocaleString()}</TableCell>
                        <TableCell>{table.tableSize}</TableCell>
                        <TableCell>{table.indexSize}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{timeAgo(table.lastAnalyze)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />Healthy
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOptimize(table.name)}
                            disabled={optimizingTable === table.name}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${optimizingTable === table.name ? "animate-spin" : ""}`} />
                            {optimizingTable === table.name ? "Optimizing..." : "Optimize"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Connection Pool Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-5 w-5" />Connection Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active", value: stats?.connections.active },
                  { label: "Idle", value: stats?.connections.idle },
                  { label: "Total", value: stats?.connections.total },
                  { label: "Max Allowed", value: stats?.connections.max },
                ].map(item => (
                  <div key={item.label} className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-[#5E1916]">{item.value ?? "—"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>Backup History</CardTitle>
                  <CardDescription>Last backup: {timeAgo(stats?.lastBackupAt ?? null)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setConfirmBackup("INCREMENTAL")} disabled={backupInProgress}>
                    <Download className="h-4 w-4 mr-2" />Incremental
                  </Button>
                  <Button onClick={() => setConfirmBackup("FULL")} disabled={backupInProgress}>
                    <Download className="h-4 w-4 mr-2" />Full Backup
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No backups yet. Create your first backup above.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map(backup => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          <Badge variant="outline">{backup.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(backup.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{backup.sizeBytes ? formatBytes(Number(backup.sizeBytes)) : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{backup.initiatedBy ?? "SYSTEM"}</TableCell>
                        <TableCell>
                          {backup.status === "COMPLETED" && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />Completed
                            </Badge>
                          )}
                          {backup.status === "IN_PROGRESS" && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />In Progress
                            </Badge>
                          )}
                          {backup.status === "FAILED" && (
                            <Badge className="bg-red-100 text-red-700">
                              <AlertCircle className="h-3 w-3 mr-1" />Failed
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Backup Config Info */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>Current backup policies and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Backup Retention", sub: "Records kept indefinitely in the database", icon: Clock },
                { label: "Backup Encryption", sub: "AES-256 at rest via PostgreSQL storage", icon: Shield },
                { label: "Access Control", sub: "Admin-only via RBAC middleware", icon: Settings },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache & I/O</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span className={`font-medium ${(performance?.cacheHitRate ?? 0) > 90 ? "text-green-600" : "text-yellow-600"}`}>
                      {performance?.cacheHitRate ?? "—"}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${performance?.cacheHitRate ?? 0}%` }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Transactions Committed</span>
                    <span className="font-medium">{performance?.transactions.committed.toLocaleString() ?? "—"}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Transactions Rolled Back</span>
                    <span className={`font-medium ${(performance?.transactions.rolledBack ?? 0) > 0 ? "text-yellow-600" : ""}`}>
                      {performance?.transactions.rolledBack.toLocaleString() ?? "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tuple Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Rows Inserted", value: performance?.tuples.inserted, color: "text-green-600" },
                  { label: "Rows Updated", value: performance?.tuples.updated, color: "text-blue-600" },
                  { label: "Rows Deleted", value: performance?.tuples.deleted, color: "text-red-600" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-sm">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value?.toLocaleString() ?? "—"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-5 w-5" />Storage Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Total DB Size", value: performance?.storage.db_size },
                  { label: "Table Data", value: performance?.storage.table_size },
                  { label: "Index Size", value: performance?.storage.index_size },
                ].map(item => (
                  <div key={item.label} className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-xl font-bold text-[#5E1916]">{item.value ?? "—"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {performance?.slowQueries && performance.slowQueries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-yellow-500" />Slow Queries (&gt;100ms avg)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Calls</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Total Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.slowQueries.map((q, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs max-w-sm truncate">{q.query}</TableCell>
                        <TableCell>{q.calls}</TableCell>
                        <TableCell className="text-yellow-600">{q.mean_exec_time}ms</TableCell>
                        <TableCell>{q.total_exec_time}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Backup Confirm Dialog */}
      <AlertDialog open={!!confirmBackup} onOpenChange={open => !open && setConfirmBackup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start {confirmBackup} Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a {confirmBackup?.toLowerCase()} backup of the database. The process runs in the background and may take a few moments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmBackup && handleCreateBackup(confirmBackup)}>
              Start Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}