import { useState } from "react";
import { 
  Users, Shield, Search, UserCog, Save, X, Check, Edit2, 
  Lock, Unlock, Eye, EyeOff, Calendar, DollarSign, FileText,
  BarChart3, MessageSquare, Settings, ClipboardCheck, Building2,
  Clock, TrendingUp, Package, Award, Database, Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner@2.0.3";

interface PageProps {
  userRole: string;
  userId: string;
}

type UserRole = 'staff' | 'manager' | 'subadmin' | 'scheduler' | 'admin';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
}

interface RolePermissions {
  [key: string]: string[]; // role -> permission IDs
}

export function RolesPermissions({ userRole, userId }: PageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | ''>('');

  // Mock users data with various roles
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: 'user-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@xtreme.com',
      role: 'admin',
      department: 'Operations',
      joinDate: '2024-01-15',
      lastActive: '2025-12-21 09:30',
      status: 'active'
    },
    {
      id: 'user-2',
      name: 'Michael Chen',
      email: 'michael.chen@xtreme.com',
      role: 'manager',
      department: 'Events',
      joinDate: '2024-02-20',
      lastActive: '2025-12-21 08:45',
      status: 'active'
    },
    {
      id: 'user-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@xtreme.com',
      role: 'subadmin',
      department: 'Finance',
      joinDate: '2024-03-10',
      lastActive: '2025-12-20 16:20',
      status: 'active'
    },
    {
      id: 'user-4',
      name: 'David Thompson',
      email: 'david.thompson@xtreme.com',
      role: 'scheduler',
      department: 'Operations',
      joinDate: '2024-04-05',
      lastActive: '2025-12-21 07:15',
      status: 'active'
    },
    {
      id: 'user-5',
      name: 'Rachel Wilson',
      email: 'rachel.wilson@xtreme.com',
      role: 'staff',
      department: 'Service',
      joinDate: '2024-03-15',
      lastActive: '2025-12-20 18:30',
      status: 'active'
    },
    {
      id: 'user-6',
      name: 'Daniel Moore',
      email: 'daniel.moore@xtreme.com',
      role: 'staff',
      department: 'Service',
      joinDate: '2024-01-30',
      lastActive: '2025-12-21 06:00',
      status: 'active'
    },
    {
      id: 'user-7',
      name: 'Hannah Taylor',
      email: 'hannah.taylor@xtreme.com',
      role: 'manager',
      department: 'Guest Services',
      joinDate: '2024-02-10',
      lastActive: '2025-12-21 09:00',
      status: 'active'
    },
    {
      id: 'user-8',
      name: 'Christopher Anderson',
      email: 'christopher.anderson@xtreme.com',
      role: 'scheduler',
      department: 'Operations',
      joinDate: '2024-04-01',
      lastActive: '2025-12-21 08:00',
      status: 'active'
    },
    {
      id: 'user-9',
      name: 'Amanda Clark',
      email: 'amanda.clark@xtreme.com',
      role: 'staff',
      department: 'Service',
      joinDate: '2024-01-12',
      lastActive: '2025-12-20 22:00',
      status: 'active'
    },
    {
      id: 'user-10',
      name: 'Kevin Rodriguez',
      email: 'kevin.rodriguez@xtreme.com',
      role: 'subadmin',
      department: 'HR',
      joinDate: '2024-02-25',
      lastActive: '2025-12-21 09:15',
      status: 'active'
    },
    {
      id: 'user-11',
      name: 'Sarah Lewis',
      email: 'sarah.lewis@xtreme.com',
      role: 'staff',
      department: 'Service',
      joinDate: '2024-03-20',
      lastActive: '2025-12-20 20:00',
      status: 'active'
    },
    {
      id: 'user-12',
      name: 'Matthew Walker',
      email: 'matthew.walker@xtreme.com',
      role: 'manager',
      department: 'Events',
      joinDate: '2024-01-18',
      lastActive: '2025-12-21 08:30',
      status: 'active'
    },
  ]);

  // All available permissions
  const allPermissions: Permission[] = [
    // Event Management
    { id: 'event_view', name: 'View Events', description: 'View all events in the system', category: 'Event Management', icon: Calendar },
    { id: 'event_create', name: 'Create Events', description: 'Create new events', category: 'Event Management', icon: Calendar },
    { id: 'event_edit', name: 'Edit Events', description: 'Modify existing events', category: 'Event Management', icon: Calendar },
    { id: 'event_delete', name: 'Delete Events', description: 'Remove events from system', category: 'Event Management', icon: Calendar },
    { id: 'event_assign_staff', name: 'Assign Staff to Events', description: 'Assign and remove staff from events', category: 'Event Management', icon: UserCog },
    
    // Staff Management
    { id: 'staff_view_basic', name: 'View Staff (Basic)', description: 'View staff availability, skills, ratings, experience', category: 'Staff Management', icon: Users },
    { id: 'staff_view_personal', name: 'View Personal Info', description: 'View sensitive personal identification details', category: 'Staff Management', icon: Eye },
    { id: 'staff_view_pay', name: 'View Pay Rates', description: 'View staff pay rates and salary information', category: 'Staff Management', icon: DollarSign },
    { id: 'staff_view_disciplinary', name: 'View Disciplinary Records', description: 'View staff disciplinary notes and history', category: 'Staff Management', icon: FileText },
    { id: 'staff_create', name: 'Add Staff', description: 'Add new staff members', category: 'Staff Management', icon: Users },
    { id: 'staff_edit', name: 'Edit Staff', description: 'Modify staff information', category: 'Staff Management', icon: Users },
    { id: 'staff_delete', name: 'Remove Staff', description: 'Remove staff from system', category: 'Staff Management', icon: Users },
    { id: 'staff_performance', name: 'View Performance', description: 'View staff performance metrics', category: 'Staff Management', icon: TrendingUp },
    
    // Client Management
    { id: 'client_view_basic', name: 'View Clients (Basic)', description: 'View client company names and event details', category: 'Client Management', icon: Building2 },
    { id: 'client_view_full', name: 'View Clients (Full)', description: 'View all client information including financial', category: 'Client Management', icon: Building2 },
    { id: 'client_create', name: 'Add Clients', description: 'Add new clients', category: 'Client Management', icon: Building2 },
    { id: 'client_edit', name: 'Edit Clients', description: 'Modify client information', category: 'Client Management', icon: Building2 },
    { id: 'client_delete', name: 'Remove Clients', description: 'Remove clients from system', category: 'Client Management', icon: Building2 },
    
    // Financial Management
    { id: 'finance_view', name: 'View Financial Data', description: 'View all financial information', category: 'Financial Management', icon: DollarSign },
    { id: 'finance_payroll', name: 'Manage Payroll', description: 'Process and manage payroll', category: 'Financial Management', icon: DollarSign },
    { id: 'finance_invoicing', name: 'Manage Invoicing', description: 'Create and manage invoices', category: 'Financial Management', icon: FileText },
    { id: 'finance_reports', name: 'Financial Reports', description: 'Generate financial reports', category: 'Financial Management', icon: BarChart3 },
    { id: 'finance_event_costs', name: 'View Event Costs', description: 'View event budgets, costs, and profit margins', category: 'Financial Management', icon: DollarSign },
    { id: 'finance_payments', name: 'View Client Payments', description: 'View client payment history and status', category: 'Financial Management', icon: DollarSign },
    
    // Scheduling
    { id: 'schedule_view', name: 'View Schedules', description: 'View all schedules', category: 'Scheduling', icon: Clock },
    { id: 'schedule_create', name: 'Create Schedules', description: 'Create new schedules', category: 'Scheduling', icon: Clock },
    { id: 'schedule_edit', name: 'Edit Schedules', description: 'Modify existing schedules', category: 'Scheduling', icon: Clock },
    { id: 'schedule_approve', name: 'Approve Time-off', description: 'Approve staff time-off requests', category: 'Scheduling', icon: Check },
    
    // Timesheets & Attendance
    { id: 'timesheet_view', name: 'View Timesheets', description: 'View all timesheets', category: 'Timesheets & Attendance', icon: ClipboardCheck },
    { id: 'timesheet_edit', name: 'Edit Timesheets', description: 'Modify timesheet entries', category: 'Timesheets & Attendance', icon: ClipboardCheck },
    { id: 'timesheet_approve', name: 'Approve Timesheets', description: 'Approve timesheet submissions', category: 'Timesheets & Attendance', icon: Check },
    { id: 'attendance_track', name: 'Track Attendance', description: 'Monitor staff attendance', category: 'Timesheets & Attendance', icon: ClipboardCheck },
    
    // Communication
    { id: 'comm_view', name: 'View Messages', description: 'View all messages', category: 'Communication', icon: MessageSquare },
    { id: 'comm_send', name: 'Send Messages', description: 'Send messages to staff/clients', category: 'Communication', icon: MessageSquare },
    { id: 'comm_broadcast', name: 'Broadcast Messages', description: 'Send mass communications', category: 'Communication', icon: MessageSquare },
    
    // Reports & Analytics
    { id: 'report_view', name: 'View Reports', description: 'View all reports', category: 'Reports & Analytics', icon: BarChart3 },
    { id: 'report_generate', name: 'Generate Reports', description: 'Create custom reports', category: 'Reports & Analytics', icon: BarChart3 },
    { id: 'analytics_view', name: 'View Analytics', description: 'Access analytics dashboard', category: 'Reports & Analytics', icon: TrendingUp },
    
    // System Administration
    { id: 'system_settings', name: 'System Settings', description: 'Modify system settings', category: 'System Administration', icon: Settings },
    { id: 'system_roles', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'System Administration', icon: Shield },
    { id: 'system_permissions', name: 'Manage Permissions', description: 'Configure role permissions', category: 'System Administration', icon: Lock },
    { id: 'system_integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'System Administration', icon: Zap },
    { id: 'system_database', name: 'Database Access', description: 'Access system database', category: 'System Administration', icon: Database },
    
    // Training & Certifications
    { id: 'training_view', name: 'View Training', description: 'View training materials', category: 'Training & Certifications', icon: Award },
    { id: 'training_manage', name: 'Manage Training', description: 'Create and manage training programs', category: 'Training & Certifications', icon: Award },
    { id: 'cert_manage', name: 'Manage Certifications', description: 'Track and manage certifications', category: 'Training & Certifications', icon: Award },
    
    // Inventory & Equipment
    { id: 'inventory_view', name: 'View Inventory', description: 'View equipment inventory', category: 'Inventory & Equipment', icon: Package },
    { id: 'inventory_manage', name: 'Manage Inventory', description: 'Add and manage equipment', category: 'Inventory & Equipment', icon: Package },
  ];

  // Default permissions for each role
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
    admin: allPermissions.map(p => p.id), // Admin has all permissions
    subadmin: [
      'event_view', 'event_create', 'event_edit', 'event_assign_staff',
      'staff_view_basic', 'staff_view_personal', 'staff_view_pay', 'staff_view_disciplinary',
      'staff_create', 'staff_edit', 'staff_performance',
      'client_view_basic', 'client_view_full', 'client_create', 'client_edit',
      'finance_view', 'finance_payroll', 'finance_invoicing', 'finance_reports', 'finance_event_costs', 'finance_payments',
      'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_approve',
      'timesheet_view', 'timesheet_edit', 'timesheet_approve', 'attendance_track',
      'comm_view', 'comm_send', 'comm_broadcast',
      'report_view', 'report_generate', 'analytics_view',
      'training_view', 'training_manage', 'cert_manage',
      'inventory_view', 'inventory_manage'
    ],
    manager: [
      'event_view', 'event_create', 'event_edit', 'event_assign_staff',
      'staff_view_basic', 'staff_view_personal', 'staff_view_pay', 'staff_performance',
      'client_view_basic', 'client_view_full',
      'finance_event_costs', 'finance_payments',
      'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_approve',
      'timesheet_view', 'timesheet_approve', 'attendance_track',
      'comm_view', 'comm_send',
      'report_view', 'analytics_view',
      'training_view', 'cert_manage',
      'inventory_view'
    ],
    scheduler: [
      // Event Management - can view and assign staff
      'event_view', 'event_assign_staff',
      // Staff Management - only basic info (availability, skills, ratings, experience)
      'staff_view_basic', 'staff_performance',
      // Client Management - only basic info (company name, event details)
      'client_view_basic',
      // Scheduling - full scheduling capabilities
      'schedule_view', 'schedule_create', 'schedule_edit',
      // Timesheets - view only (to check availability)
      'timesheet_view',
      // Communication
      'comm_view', 'comm_send',
      // Reports - basic reports only
      'report_view'
    ],
    staff: [
      'event_view',
      'schedule_view',
      'timesheet_view',
      'comm_view', 'comm_send',
      'training_view'
    ]
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role counts
  const roleCounts = {
    admin: users.filter(u => u.role === 'admin').length,
    subadmin: users.filter(u => u.role === 'subadmin').length,
    manager: users.filter(u => u.role === 'manager').length,
    scheduler: users.filter(u => u.role === 'scheduler').length,
    staff: users.filter(u => u.role === 'staff').length,
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-[#5E1916] text-white hover:bg-[#5E1916]/90';
      case 'subadmin':
        return 'bg-purple-600 text-white';
      case 'manager':
        return 'bg-blue-600 text-white';
      case 'scheduler':
        return 'bg-green-600 text-white';
      case 'staff':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'subadmin':
        return 'Sub Admin';
      case 'manager':
        return 'Manager';
      case 'scheduler':
        return 'Scheduler';
      case 'staff':
        return 'Staff Member';
      default:
        return role;
    }
  };

  const handleEditRole = (user: SystemUser) => {
    setSelectedUser(user);
    setEditingRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (selectedUser && editingRole) {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, role: editingRole as UserRole }
          : u
      ));
      toast.success(`Role updated to ${getRoleDisplayName(editingRole as UserRole)} for ${selectedUser.name}`);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setEditingRole('');
    }
  };

  const togglePermission = (role: UserRole, permissionId: string) => {
    const currentPerms = rolePermissions[role] || [];
    const hasPermission = currentPerms.includes(permissionId);
    
    setRolePermissions(prev => {
      const currentPerms = prev[role] || [];
      
      return {
        ...prev,
        [role]: hasPermission 
          ? currentPerms.filter(p => p !== permissionId)
          : [...currentPerms, permissionId]
      };
    });
    
    toast.success(`Permission ${hasPermission ? 'removed from' : 'added to'} ${getRoleDisplayName(role)}`);
  };

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as { [key: string]: Permission[] });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage user roles and configure permissions for each role type
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl">{roleCounts.admin}</p>
              </div>
              <div className={`p-3 rounded-lg ${getRoleBadgeColor('admin')}`}>
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sub Admins</p>
                <p className="text-2xl">{roleCounts.subadmin}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-600 text-white">
                <UserCog className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl">{roleCounts.manager}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-600 text-white">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schedulers</p>
                <p className="text-2xl">{roleCounts.scheduler}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-600 text-white">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff Members</p>
                <p className="text-2xl">{roleCounts.staff}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-600 text-white">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Roles Assignment
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions Configuration
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Roles</CardTitle>
                  <CardDescription>
                    Assign roles to users and manage their access levels
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-[#5E1916] text-white">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.lastActive}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRole(user)}
                            className="gap-2"
                          >
                            <Edit2 className="w-3 h-3" />
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Configuration</CardTitle>
              <CardDescription>
                Configure which features each role can access. Toggle permissions on/off for each role type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selector */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Label className="text-sm font-medium">Configure permissions for:</Label>
                <div className="flex gap-2">
                  {(['admin', 'subadmin', 'manager', 'scheduler', 'staff'] as UserRole[]).map((role) => (
                    <Badge
                      key={role}
                      className={`${getRoleBadgeColor(role)} cursor-default`}
                    >
                      {getRoleDisplayName(role)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Permissions Grid by Category */}
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg flex items-center gap-2">
                      {permissions[0].icon && (() => {
                        const Icon = permissions[0].icon;
                        return <Icon className="w-5 h-5 text-[#5E1916]" />;
                      })()}
                      {category}
                    </h3>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">Permission</TableHead>
                            <TableHead className="text-center">Admin</TableHead>
                            <TableHead className="text-center">Sub Admin</TableHead>
                            <TableHead className="text-center">Manager</TableHead>
                            <TableHead className="text-center">Scheduler</TableHead>
                            <TableHead className="text-center">Staff</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {permissions.map((permission) => (
                            <TableRow key={permission.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {permission.description}
                                  </div>
                                </div>
                              </TableCell>
                              {(['admin', 'subadmin', 'manager', 'scheduler', 'staff'] as UserRole[]).map((role) => (
                                <TableCell key={role} className="text-center">
                                  <div className="flex justify-center">
                                    <Switch
                                      checked={rolePermissions[role]?.includes(permission.id) || false}
                                      onCheckedChange={() => togglePermission(role, permission.id)}
                                      disabled={role === 'admin'} // Admin always has all permissions
                                      className="data-[state=checked]:bg-[#5E1916]"
                                    />
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Banner */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Permission Management Guidelines
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• <strong>Admin</strong> role has all permissions enabled by default and cannot be modified</li>
                      <li>• Changes to permissions apply immediately to all users with that role</li>
                      <li>• Be cautious when modifying financial and system administration permissions</li>
                      <li>• Staff members should only have access to features necessary for their job functions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Scheduler Financial Restriction Notice */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      🔒 Scheduler Financial Data Restrictions
                    </p>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      <li>• <strong>Schedulers</strong> cannot view staff pay rates or hourly wages</li>
                      <li>• <strong>Schedulers</strong> cannot view event budgets, costs, or profit margins</li>
                      <li>• <strong>Schedulers</strong> cannot access client payment history or financial reports</li>
                      <li>• Admins can toggle these permissions above if needed for specific scheduler roles</li>
                      <li>• All financial data is hidden in scheduler panel views by default</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Assign a new role to {selectedUser?.name}. This will change their access permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div>
                <Badge className={selectedUser ? getRoleBadgeColor(selectedUser.role) : ''}>
                  {selectedUser ? getRoleDisplayName(selectedUser.role) : ''}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={editingRole} onValueChange={(value) => setEditingRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="subadmin">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4" />
                      Sub Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Manager
                    </div>
                  </SelectItem>
                  <SelectItem value="scheduler">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Scheduler
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Staff Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingRole && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Permissions for {getRoleDisplayName(editingRole as UserRole)}:</p>
                <p className="text-sm text-muted-foreground">
                  {rolePermissions[editingRole]?.length || 0} permissions enabled
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                setEditingRole('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={!editingRole || editingRole === selectedUser?.role}
              className="bg-[#5E1916] hover:bg-[#5E1916]/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}