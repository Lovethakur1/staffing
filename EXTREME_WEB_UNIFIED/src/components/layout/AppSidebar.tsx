import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarGroup,
} from "../ui/sidebar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  Clock,
  Star,
  MessageSquare,
  Shield,
  Download,
  HelpCircle,
  BookOpen,
  Plus,
  UserPlus,
  Briefcase,
  ClipboardList,
  UserCheck,
  Search,
  AlertTriangle,
  User,
  LogOut,
  Radio,
  CheckCircle2,
  FolderOpen,
  Zap,
  Headphones,
  Target,
  Award,
  Workflow,
  Database,
  Wallet,
  FileSpreadsheet,
  ClipboardCheck,
  Package,
  GraduationCap,
  ArrowRightLeft,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  Phone,
  UserCog,
  ThumbsUp,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import { useAlerts } from "../../contexts/AlertsContext";
import { useUnreadMessages } from "../../contexts/UnreadMessagesContext";
import { XtremeLogo } from "../XtremeLogo";

interface AppSidebarProps {
  currentUser: {
    name: string;
    email: string;
    role: string;
    id: string;
  };
  onLogout: () => void;
}

export function AppSidebar({ currentUser, onLogout }: AppSidebarProps) {
  const { currentPage, setCurrentPage } = useNavigation();
  const alertsContext = useAlerts();
  const { unreadCount: unreadMsgCount } = useUnreadMessages();
  const [searchQuery, setSearchQuery] = useState("");
  const msgBadge = unreadMsgCount > 0 ? String(unreadMsgCount) : undefined;

  // Only use alerts for admin role
  const alertsUnreadCount = currentUser.role === 'admin' ? alertsContext.unreadCount : 0;
  const criticalCount = currentUser.role === 'admin' ? alertsContext.criticalCount : 0;

  // ==================== ADMIN NAVIGATION ====================
  const getAdminSections = () => [
    {
      label: "Operations",
      items: [
        { title: "Command Center", icon: LayoutDashboard, id: "dashboard" },
        // { title: "Live Operations", icon: Radio, id: "live-ops", badge: "LIVE" },
        { title: "Event Requests Queue", icon: FileText, id: "event-requests-queue", badge: "5" },
      ]
    },
    {
      label: "Event Management",
      items: [
        { title: "Event Management", icon: Calendar, id: "events" },
        { title: "Pricing Configuration", icon: DollarSign, id: "pricing-configuration" },
        { title: "Scheduling & Dispatch", icon: Workflow, id: "scheduling" },
      ]
    },
    {
      label: "People",
      items: [
        { title: "Workforce", icon: Users, id: "staff" },
        { title: "Client Directory", icon: Building2, id: "clients" },
        { title: "Attendance Tracking", icon: CheckCircle2, id: "attendance" },
      ]
    },
    {
      label: "HR & Recruitment",
      items: [
        { title: "Hiring Pipeline", icon: Target, id: "hiring" },
        { title: "Applications", icon: ClipboardList, id: "applications", badge: "8" },
        { title: "Job Postings", icon: Briefcase, id: "careers" },
        { title: "Interviews", icon: UserPlus, id: "interviews" },
        { title: "Onboarding", icon: UserCheck, id: "onboarding", badge: "3" },
      ]
    },
    {
      label: "Financial Management",
      items: [
        { title: "Financial Hub", icon: DollarSign, id: "financial-hub" },
        { title: "Staff Payroll", icon: Wallet, id: "staff-payroll" },
        { title: "Financial Reports", icon: FileSpreadsheet, id: "financial-reports" },
        { title: "Payment Verification", icon: CheckCircle2, id: "verify-payment", badge: "3" },
      ]
    },
    {
      label: "Quality & Operations",
      items: [
        { title: "Quality Assurance", icon: ClipboardCheck, id: "quality-assurance" },
        { title: "Equipment Inventory", icon: Package, id: "equipment-inventory" },
        { title: "Incident Management", icon: AlertTriangle, id: "incident-management" },
      ]
    },
    {
      label: "Analytics & Reports",
      items: [
        { title: "Analytics & Reports", icon: BarChart3, id: "analytics" },
      ]
    },
    {
      label: "Communication",
      items: [
        { title: "Messages", icon: MessageSquare, id: "messages", badge: msgBadge },
      ]
    },
    {
      label: "System & Tools",
      items: [
        { title: "Integrations", icon: Zap, id: "integrations" },
        { title: "Database", icon: Database, id: "database" },
        { title: "Roles & Permissions", icon: UserCog, id: "roles-permissions" },
        { title: "Device Approvals", icon: Smartphone, id: "device-approvals" },
        { title: "System Settings", icon: Settings, id: "settings" },
        { title: "Security & Access", icon: Shield, id: "security" },
      ]
    },
    {
      label: "Support & Help",
      items: [
        { title: "Help & Support", icon: Headphones, id: "help-support" },
        { title: "Documentation", icon: BookOpen, id: "documentation" },
      ]
    }
  ];

  // ==================== SUB-ADMIN NAVIGATION ====================
  const getSubAdminSections = () => [
    {
      label: "Overview",
      items: [
        { title: "Sub Admin Dashboard", icon: LayoutDashboard, id: "sub-admin" },
        { title: "Event Management", icon: Calendar, id: "events" },
      ]
    },
    {
      label: "Staff & Workforce",
      items: [
        { title: "Staff Management", icon: Users, id: "staff" },
        { title: "Attendance", icon: CheckCircle2, id: "attendance" },
        { title: "Performance", icon: Star, id: "performance" },
      ]
    },
    {
      label: "Client Relations",
      items: [
        { title: "Clients", icon: Building2, id: "clients" },
        { title: "Client Feedback", icon: MessageSquare, id: "client-feedback" },
      ]
    },
    {
      label: "Operations",
      items: [
        { title: "Scheduling", icon: Clock, id: "shifts-schedule" },
        { title: "Timesheets", icon: ClipboardCheck, id: "timesheets" },
        { title: "Incident Management", icon: AlertTriangle, id: "incident-management" },
      ]
    },
    {
      label: "Training & Resources",
      items: [
        { title: "Training Portal", icon: GraduationCap, id: "training-portal" },
        { title: "Certifications", icon: Award, id: "certifications" },
        { title: "Equipment Inventory", icon: Package, id: "equipment-inventory" },
      ]
    },
    {
      label: "Communication & Reports",
      items: [
        { title: "Messages", icon: MessageSquare, id: "messages" },
        { title: "Reports & Analytics", icon: BarChart3, id: "reports" },
      ]
    },
    {
      label: "Support",
      items: [
        { title: "Help & Support", icon: Headphones, id: "help-support" },
        { title: "Documentation", icon: BookOpen, id: "documentation" },
      ]
    }
  ];

  // ==================== SCHEDULER NAVIGATION ====================
  const getSchedulerSections = () => [
    {
      label: "Overview",
      items: [
        { title: "Scheduler Dashboard", icon: LayoutDashboard, id: "scheduler" },
      ]
    },
    {
      label: "Event Management",
      items: [
        { title: "Create Event", icon: Plus, id: "event-requests-queue" },
        { title: "All Events", icon: Calendar, id: "events" },
        { title: "Upcoming Events", icon: TrendingUp, id: "upcoming-events" },
      ]
    },
    {
      label: "Staff Management",
      items: [
        { title: "Staff Directory", icon: Users, id: "staff" },
        { title: "Staff Availability", icon: CheckCircle2, id: "staff-availability" },
        { title: "Staff Skills & Ratings", icon: Star, id: "staff-skills" },
      ]
    },
    {
      label: "Scheduling",
      items: [
        { title: "Schedule Management", icon: Clock, id: "scheduling" },
        { title: "Attendance Tracking", icon: ClipboardCheck, id: "attendance" },
      ]
    },
    {
      label: "Communication",
      items: [
        { title: "Messages", icon: MessageSquare, id: "messages" },
      ]
    },
    {
      label: "Support",
      items: [
        { title: "Help & Support", icon: Headphones, id: "help-support" },
        { title: "Documentation", icon: BookOpen, id: "documentation" },
      ]
    }
  ];

  // ==================== MANAGER NAVIGATION ====================
  const getManagerSections = () => [
    {
      label: "Management",
      items: [
        { title: "Manager Dashboard", icon: LayoutDashboard, id: "manager" },
        { title: "Event Overview", icon: Calendar, id: "events" },
        { title: "Attendance Tracking", icon: CheckCircle2, id: "attendance" },
      ]
    },
    {
      label: "Performance & Quality",
      items: [
        { title: "Performance", icon: Star, id: "performance" },
        { title: "Incident Reports", icon: AlertTriangle, id: "incident-management" },
      ]
    },
    {
      label: "My Work",
      items: [
        { title: "My Shifts & Schedule", icon: CalendarDays, id: "shifts-schedule" },
        { title: "My Timesheets", icon: Clock, id: "timesheets" },
        { title: "My Payroll", icon: DollarSign, id: "payroll" },
      ]
    },
    {
      label: "Training & Development",
      items: [
        { title: "Training Portal", icon: GraduationCap, id: "training-portal" },
        { title: "My Certifications", icon: Award, id: "certifications" },
      ]
    },
    {
      label: "Communication",
      items: [
        { title: "Messages", icon: MessageSquare, id: "messages", badge: msgBadge },
      ]
    },
    {
      label: "Resources & Documents",
      items: [
        { title: "Documents", icon: FileText, id: "documents" },
        { title: "Resources", icon: BookOpen, id: "resources" },
      ]
    },
    {
      label: "Support & Help",
      items: [
        { title: "Help & Support", icon: Headphones, id: "help-support" },
        { title: "Documentation", icon: BookOpen, id: "documentation" },
      ]
    }
  ];

  // ==================== STAFF NAVIGATION ====================
  const getStaffSections = () => [
    {
      label: "My Work",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
        { title: "My Events", icon: CalendarDays, id: "my-events" },
        { title: "Shifts & Schedule", icon: Calendar, id: "shifts" },
      ]
    },
    {
      label: "Time & Pay",
      items: [
        { title: "Timesheets", icon: FileText, id: "timesheets" },
        { title: "Payroll", icon: DollarSign, id: "payroll" },
      ]
    },
    {
      label: "Training & Development",
      items: [
        { title: "Training Portal", icon: GraduationCap, id: "training-portal" },
        { title: "My Certifications", icon: ClipboardCheck, id: "certifications" },
        // { title: "Job Openings", icon: Briefcase, id: "careers" },
      ]
    },
    {
      label: "Performance & Docs",
      items: [
        { title: "Performance", icon: Star, id: "performance" },
        { title: "Documents", icon: Shield, id: "documents" },
      ]
    },
    {
      label: "Communication",
      items: [
        { title: "Messages", icon: MessageSquare, id: "messages", badge: msgBadge },
      ]
    },
    {
      label: "Support & Resources",
      items: [
        { title: "Analytics", icon: BarChart3, id: "analytics" },
        { title: "Resources", icon: BookOpen, id: "resources" },
        { title: "Help & Support", icon: Headphones, id: "help-support" },
        { title: "Documentation", icon: BookOpen, id: "documentation" },
      ]
    }
  ];

  // ==================== CLIENT NAVIGATION ====================
  const getClientSections = () => [
    {
      label: "MAIN MENU",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
        { title: "Book New Event", icon: Calendar, id: "book-event" },
        { title: "My Bookings", icon: FileText, id: "bookings" },
        { title: "Upcoming Events", icon: Clock, id: "upcoming-events" },
        { title: "Staff Directory", icon: Users, id: "staff" },
        { title: "Invoices & Billing", icon: CreditCard, id: "billing" },
        { title: "Analytics", icon: BarChart3, id: "analytics" },
        { title: "Favorites", icon: Star, id: "favorites" },
        { title: "Messages", icon: MessageSquare, id: "messages", badge: msgBadge },
        { title: "Rate & Feedback", icon: ThumbsUp, id: "client-feedback", badge: "3" },
      ]
    },
    {
      label: "RESOURCES",
      items: [
        { title: "Help Center", icon: HelpCircle, id: "help-support" },
        { title: "Documentation", icon: BookOpen, id: "documentation" },
        { title: "Support", icon: Headphones, id: "support" },
      ]
    }
  ];

  const getSections = () => {
    switch (currentUser.role) {
      case "admin":
        return getAdminSections();
      case "sub-admin":
        return getSubAdminSections();
      case "scheduler":
        return getSchedulerSections();
      case "manager":
        return getManagerSections();
      case "staff":
        return getStaffSections();
      case "client":
        return getClientSections();
      default:
        return [];
    }
  };

  const sections = getSections();

  return (
    <Sidebar className="border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="h-[72px] border-b border-border px-4 flex items-center justify-center">
        <XtremeLogo size="sm" />
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Mobile-Only Sections */}
        <div className="lg:hidden space-y-4 mb-6">
          {/* User Profile Card */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </Badge>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => setCurrentPage('profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => setCurrentPage('preferences')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>

          {/* Mobile Alerts - Admin Only */}
          {currentUser.role === 'admin' && alertsUnreadCount > 0 && (
            <Button
              variant={criticalCount > 0 ? "destructive" : "outline"}
              className="w-full justify-between"
              size="sm"
              onClick={() => setCurrentPage('dashboard')}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                System Alerts
              </span>
              <Badge className={criticalCount > 0 ? "bg-white text-destructive" : ""}>
                {alertsUnreadCount}
              </Badge>
            </Button>
          )}

          <Separator />
        </div>

        {/* Main Navigation Sections */}
        {sections.map((section, idx) => (
          <SidebarGroup key={idx} className={idx > 0 ? "mt-6" : ""}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {section.items.map((item) => {
                const badge = (item as any).badge as string | undefined;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPage === item.id}
                      tooltip={item.title}
                      className={`group relative rounded-lg transition-all duration-200 ${currentPage === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent text-foreground"
                        }`}
                      onClick={() => setCurrentPage(item.id)}
                    >
                      <button className="flex items-center gap-3 w-full p-2.5">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        {badge && (
                          <Badge
                            variant={currentPage === item.id ? "secondary" : "default"}
                            className="ml-auto text-xs px-1.5 py-0.5"
                          >
                            {badge}
                          </Badge>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* Quick Actions - Admin & Sub-Admin */}
        {(currentUser.role === 'admin' || currentUser.role === 'sub-admin') && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {currentUser.role === 'admin' && (
                <SidebarMenuItem>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setCurrentPage('event-requests-queue')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentPage('staff', { showAddDialog: true })}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {/* Footer is kept for potential future use but content removed */}
      </SidebarFooter>
    </Sidebar>
  );
}
