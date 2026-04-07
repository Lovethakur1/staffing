import { useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  Bell,
  Check,
  Trash2,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Settings,
  ExternalLink
} from "lucide-react";
import { useNotifications, Notification } from "../contexts/NotificationsContext";
import { useNavigation } from "../contexts/NavigationContext";

interface NotificationsProps {
  userRole: string;
  userId: string;
}

function getTargetPage(notification: Notification, userRole: string): { page: string; params?: Record<string, any> } | null {
  const type = notification.type?.toLowerCase();
  const data = notification.data || {};
  switch (type) {
    case 'shift':
    case 'event':
    case 'schedule':
      if (data.eventId) {
        return { page: userRole === 'admin' ? 'admin-event-detail' : 'shifts-schedule', params: { eventId: data.eventId } };
      }
      return { page: 'shifts-schedule' };
    case 'payment':
      return { page: userRole === 'admin' ? 'financial-hub' : 'payroll' };
    case 'review':
    case 'feedback':
      return { page: userRole === 'admin' ? 'client-feedback' : 'performance' };
    case 'message':
    case 'msg':
      return { page: 'messages', params: data.conversationId ? { conversationId: data.conversationId } : undefined };
    case 'support':
    case 'ticket':
      return { page: 'help-support' };
    case 'timesheet':
      return { page: 'timesheets' };
    case 'training':
      return { page: 'training' };
    case 'compliance':
      return { page: 'certifications' };
    default:
      return null;
  }
}

export function Notifications({ userRole }: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { setCurrentPage } = useNavigation();

  const { 
    notifications: allNotifications, 
    unreadCount, 
    actionRequiredCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification
  } = useNotifications();

  // Apply filters
  const filteredNotifications = allNotifications.filter(notification => {
    if (filter === 'unread') return notification.unread;
    if (filter === 'read') return !notification.unread;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shift':
      case 'schedule':
        return Calendar;
      case 'payment':
        return DollarSign;
      case 'review':
        return Star;
      case 'reminder':
        return Clock;
      case 'training':
        return Users;
      case 'profile':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'shift':
        return 'bg-primary text-primary-foreground';
      case 'payment':
        return 'bg-green-500 text-white';
      case 'review':
        return 'bg-blue-500 text-white';
      case 'reminder':
        return 'bg-orange-500 text-white';
      case 'schedule':
        return 'bg-purple-500 text-white';
      case 'training':
        return 'bg-indigo-500 text-white';
      case 'profile':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-destructive text-destructive-foreground text-xs">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white text-xs">Medium</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-b bg-background">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">All Notifications</h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-0.5 sm:mt-1">
              Complete history of your notifications and updates
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filteredNotifications.length} total
            </Badge>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-8 hidden sm:flex">
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark All Read
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-3 sm:p-4 lg:p-6 flex-1 overflow-hidden flex flex-col">
          {/* Tabs - Mobile optimized */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full grid grid-cols-3 flex-shrink-0">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">All ({allNotifications.length})</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Unread ({unreadCount})</span>
                <span className="sm:hidden">Unread</span>
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Read ({allNotifications.length - unreadCount})</span>
                <span className="sm:hidden">Read</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-hidden mt-3 sm:mt-4">
              <ScrollArea className="h-full">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                      No notifications yet
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      You'll see your notifications here when they arrive
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 pr-4">
                    {filteredNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div 
                          key={notification.id} 
                          className={`group p-3 sm:p-4 border rounded-lg transition-all duration-200 hover:shadow-md border-l-4 cursor-pointer ${
                            notification.unread 
                              ? 'bg-accent/30 border-l-primary border-primary/20 hover:border-primary/30' 
                              : 'bg-background border-l-transparent hover:border-l-muted-foreground/20'
                          }`}
                          onClick={() => {
                            if (notification.unread) markAsRead(notification.id);
                            const target = getTargetPage(notification, userRole);
                            if (target) setCurrentPage(target.page, target.params);
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${getNotificationColor(notification.type)}`}>
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{notification.title}</h3>
                                    {notification.unread && (
                                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="px-1.5 py-0.5 rounded bg-muted">
                                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                    </span>
                                    <span>•</span>
                                    <span>{notification.time}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  {notification.priority !== 'low' && getPriorityBadge(notification.priority)}
                                  {notification.actionRequired && (
                                    <Badge className="bg-destructive text-destructive-foreground text-xs">
                                      <span className="hidden sm:inline">Action Required</span>
                                      <span className="sm:hidden">Action</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                {notification.actionRequired && (
                                  <Button size="sm" variant="default" className="text-xs h-7" onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.unread) markAsRead(notification.id);
                                    const target = getTargetPage(notification, userRole);
                                    if (target) setCurrentPage(target.page, target.params);
                                  }}>
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Take Action</span>
                                    <span className="sm:hidden">Action</span>
                                  </Button>
                                )}
                                
                                <div className="flex items-center gap-1 ml-auto">
                                  {notification.unread && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-xs h-7"
                                    >
                                      <Check className="w-3 h-3 sm:mr-1" />
                                      <span className="hidden sm:inline">Mark Read</span>
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-xs text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="flex-1 overflow-hidden mt-3 sm:mt-4">
              <ScrollArea className="h-full">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">All caught up!</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">No unread notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 pr-4">
                    {filteredNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div 
                          key={notification.id} 
                          className="group p-3 sm:p-4 border rounded-lg transition-all duration-200 hover:shadow-md border-l-4 bg-accent/30 border-l-primary border-primary/20 hover:border-primary/30 cursor-pointer"
                          onClick={() => {
                            markAsRead(notification.id);
                            const target = getTargetPage(notification, userRole);
                            if (target) setCurrentPage(target.page, target.params);
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${getNotificationColor(notification.type)}`}>
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{notification.title}</h3>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="px-1.5 py-0.5 rounded bg-muted">
                                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                    </span>
                                    <span>•</span>
                                    <span>{notification.time}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  {notification.priority !== 'low' && getPriorityBadge(notification.priority)}
                                  {notification.actionRequired && (
                                    <Badge className="bg-destructive text-destructive-foreground text-xs">
                                      <span className="hidden sm:inline">Action Required</span>
                                      <span className="sm:hidden">Action</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                {notification.actionRequired && (
                                  <Button size="sm" variant="default" className="text-xs h-7" onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                    const target = getTargetPage(notification, userRole);
                                    if (target) setCurrentPage(target.page, target.params);
                                  }}>
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Take Action</span>
                                    <span className="sm:hidden">Action</span>
                                  </Button>
                                )}
                                
                                <div className="flex items-center gap-1 ml-auto">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs h-7"
                                  >
                                    <Check className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Mark Read</span>
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-xs text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="flex-1 overflow-hidden mt-3 sm:mt-4">
              <ScrollArea className="h-full">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No read notifications</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Your read notifications will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 pr-4">
                    {filteredNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div 
                          key={notification.id} 
                          className="group p-3 sm:p-4 border rounded-lg transition-all duration-200 hover:shadow-sm border-l-4 bg-background border-l-transparent hover:border-l-muted-foreground/20 opacity-80 hover:opacity-100 cursor-pointer"
                          onClick={() => {
                            const target = getTargetPage(notification, userRole);
                            if (target) setCurrentPage(target.page, target.params);
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${getNotificationColor(notification.type)} opacity-75`}>
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-muted-foreground text-sm sm:text-base truncate mb-1">{notification.title}</h3>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="px-1.5 py-0.5 rounded bg-muted/50">
                                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                    </span>
                                    <span>•</span>
                                    <span>{notification.time}</span>
                                  </div>
                                </div>
                                {notification.actionRequired && (
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-end">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all h-7 w-7 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
