import { useState } from "react";
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
  Database as DatabaseIcon,
  Search,
  Download,
  Upload,
  RefreshCw,
  Server,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface DatabaseProps {
  userRole: string;
  userId: string;
}

export function Database({ userRole }: DatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const databaseTables = [
    { name: "users", records: 1247, size: "45.2 MB", lastUpdated: "2 minutes ago", status: "healthy" },
    { name: "events", records: 3892, size: "128.5 MB", lastUpdated: "5 minutes ago", status: "healthy" },
    { name: "staff", records: 856, size: "32.1 MB", lastUpdated: "10 minutes ago", status: "healthy" },
    { name: "clients", records: 342, size: "18.7 MB", lastUpdated: "15 minutes ago", status: "healthy" },
    { name: "bookings", records: 4521, size: "156.3 MB", lastUpdated: "1 minute ago", status: "healthy" },
    { name: "timesheets", records: 12453, size: "287.9 MB", lastUpdated: "3 minutes ago", status: "healthy" },
    { name: "payroll", records: 8934, size: "215.6 MB", lastUpdated: "20 minutes ago", status: "healthy" },
    { name: "invoices", records: 2156, size: "78.4 MB", lastUpdated: "8 minutes ago", status: "healthy" },
    { name: "messages", records: 15782, size: "342.1 MB", lastUpdated: "Just now", status: "healthy" },
    { name: "documents", records: 6543, size: "1.2 GB", lastUpdated: "30 minutes ago", status: "warning" },
  ];

  const backups = [
    { id: "bk-001", type: "Full Backup", date: "2024-11-14 02:00 AM", size: "2.8 GB", status: "completed" },
    { id: "bk-002", type: "Incremental", date: "2024-11-13 02:00 AM", size: "156 MB", status: "completed" },
    { id: "bk-003", type: "Full Backup", date: "2024-11-12 02:00 AM", size: "2.7 GB", status: "completed" },
    { id: "bk-004", type: "Incremental", date: "2024-11-11 02:00 AM", size: "142 MB", status: "completed" },
    { id: "bk-005", type: "Full Backup", date: "2024-11-10 02:00 AM", size: "2.6 GB", status: "completed" },
  ];

  const stats = {
    totalSize: "3.2 GB",
    totalRecords: "56,726",
    tablesCount: databaseTables.length,
    lastBackup: "2 hours ago",
    uptime: "99.9%",
    avgResponseTime: "45ms"
  };

  const handleBackupNow = () => {
    toast.success("Database backup initiated successfully!");
  };

  const handleExportData = (tableName: string) => {
    toast.info(`Exporting data from ${tableName}...`);
  };

  const handleRestoreBackup = (backupId: string) => {
    toast.warning("Backup restoration requires admin confirmation");
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">Database Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your database infrastructure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackupNow}>
            <Download className="h-4 w-4 mr-2" />
            Backup Now
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Database Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.totalSize}</p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.totalRecords}</p>
              </div>
              <DatabaseIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.avgResponseTime}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
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
                <CardTitle>Database Tables</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databaseTables
                    .filter(table => table.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>{table.records.toLocaleString()}</TableCell>
                        <TableCell>{table.size}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{table.lastUpdated}</TableCell>
                        <TableCell>
                          {table.status === "healthy" ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Healthy
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Warning
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExportData(table.name)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Optimize
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backup History</CardTitle>
                  <CardDescription>Automatic backups run daily at 2:00 AM</CardDescription>
                </div>
                <Button onClick={handleBackupNow}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Backup ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{backup.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRestoreBackup(backup.id)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>Manage your backup settings and schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Automatic Backups</p>
                  <p className="text-sm text-muted-foreground">Daily at 2:00 AM UTC</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Backup Retention</p>
                  <p className="text-sm text-muted-foreground">Keep backups for 30 days</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Backup Encryption</p>
                  <p className="text-sm text-muted-foreground">AES-256 encryption enabled</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Query Time</span>
                    <span className="font-medium">45ms</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: "30%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Slow Queries (&gt;500ms)</span>
                    <span className="font-medium text-yellow-600">12</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-600" style={{ width: "5%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium text-green-600">94.5%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: "94.5%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Database Size</span>
                    <span className="font-medium">3.2 GB / 10 GB</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: "32%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Index Size</span>
                    <span className="font-medium">485 MB</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: "15%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Free Space</span>
                    <span className="font-medium text-green-600">6.8 GB</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: "68%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connection Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-[#5E1916]">45</p>
                  <p className="text-sm text-muted-foreground mt-1">Active Connections</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-[#5E1916]">100</p>
                  <p className="text-sm text-muted-foreground mt-1">Max Connections</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-[#5E1916]">12</p>
                  <p className="text-sm text-muted-foreground mt-1">Idle Connections</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-[#5E1916]">0</p>
                  <p className="text-sm text-muted-foreground mt-1">Failed Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}