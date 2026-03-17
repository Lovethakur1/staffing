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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
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
  CreditCard,
  MessageSquare,
  Shield,
  TrendingUp,
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
  Mail,
  Phone,
  Radio,
  TimerIcon,
  CheckCircle2,
  FolderOpen,
  Megaphone,
  Zap,
  Headphones,
  Globe,
  Target,
  Award,
  Workflow,
  Database,
  Bell,
  Banknote,
  Receipt,
  FileSpreadsheet,
  ClipboardCheck,
  ThumbsUp,
  Wallet,
  GitMerge,
  BookOpen as BookOpenIcon,
  CalculatorIcon,
  Package,
  GraduationCap,
  ClipboardCheckIcon,
  MessageCircle,
  ArrowRightLeft,
} from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
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
  const [searchQuery, setSearchQuery] = useState("");

  const getNavigationItems = () => {
    // Only client portal navigation
    return [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        id: "dashboard",
        tooltip: "View your overview dashboard with key metrics and ongoing events",
      },
      {
        title: "Book New Event",
        icon: Calendar,
        id: "book-event",
        tooltip: "Create a new event booking with live pricing calculator",
      },
      {
        title: "My Bookings",
        icon: FileText,
        id: "bookings",
        tooltip: "View and manage all your event bookings",
      },
      {
        title: "Upcoming Events",
        icon: Clock,
        id: "upcoming-events",
        tooltip: "See all confirmed upcoming events and their details",
      },
      {
        title: "Staff Directory",
        icon: Users,
        id: "staff",
        tooltip: "Browse available staff and view their profiles",
      },
      {
        title: "Invoices & Billing",
        icon: CreditCard,
        id: "invoicing",
        tooltip: "Manage invoices, payments, and billing history",
      },
      {
        title: "Analytics",
        icon: BarChart3,
        id: "analytics",
        tooltip: "View detailed analytics and reports for your events",
      },
      {
        title: "Favorites",
        icon: Star,
        id: "favorites",
        tooltip: "Quick access to your favorite staff members",
      },
      {
        title: "Rate & Feedback",
        icon: ThumbsUp,
        id: "client-feedback",
        badge: "3",
        tooltip: "Rate events and provide feedback on staff performance",
      },
    ];
  };

  // Remove hiring and system items - client portal only
  const getHiringItems = () => {
    return [];
  };

  const getSystemItems = () => {
    return [];
  };



  const navigationItems = getNavigationItems();
  const hiringItems = getHiringItems();
  const systemItems = getSystemItems();

  return (
    <Sidebar className="border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <XtremeLogo size="md" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-primary">Extreme</div>
            <p className="text-xs text-muted-foreground">Staffing</p>
          </div>
        </div>
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
                  Client
                </Badge>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-sm"
                    onClick={() => setCurrentPage('profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Manage your account profile and personal information</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-sm"
                    onClick={() => setCurrentPage('preferences')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Customize your app settings and preferences</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sign out of your account securely</p>
                </TooltipContent>
              </Tooltip>
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



          <Separator />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <SidebarMenuButton
                        asChild
                        isActive={currentPage === item.id}
                        className={`group relative rounded-lg transition-all duration-200 ${
                          currentPage === item.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-accent text-foreground"
                        }`}
                        onClick={() => setCurrentPage(item.id)}
                      >
                        <button className="flex items-center gap-3 w-full p-2.5">
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant={currentPage === item.id ? "secondary" : "default"}
                              className="ml-auto text-xs px-1.5 py-0.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {hiringItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Hiring & Recruitment
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {hiringItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPage === item.id}
                    className={`group relative rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent text-foreground"
                    }`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <button className="flex items-center gap-3 w-full p-2.5">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={currentPage === item.id ? "secondary" : "default"}
                          className="ml-auto text-xs px-1.5 py-0.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {systemItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              System Administration
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPage === item.id}
                    className={`group relative rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent text-foreground"
                    }`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <button className="flex items-center gap-3 w-full p-2.5">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={currentPage === item.id ? "secondary" : "default"}
                          className="ml-auto text-xs px-1.5 py-0.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}



        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Resources
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="group rounded-lg transition-all duration-200 p-2.5">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Help Center</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Access help articles and FAQs</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="group rounded-lg transition-all duration-200 p-2.5">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Documentation</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Browse complete platform documentation</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="group rounded-lg transition-all duration-200 p-2.5">
                    <Headphones className="w-4 h-4" />
                    <span className="text-sm">Support</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Contact support for assistance - 24/7 available</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {/* Footer is kept for potential future use but content removed */}
      </SidebarFooter>
    </Sidebar>
  );
}