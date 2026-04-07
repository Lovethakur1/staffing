import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Bell, Settings, LogOut, Clock, Coffee, Play, Pause, CircleStop } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { XtremeLogo } from "./XtremeLogo";
import { useAppState } from "../contexts/AppStateContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { Badge } from "./ui/badge";

interface HeaderProps {
  currentUser: {
    name: string;
    role: string;
    email: string;
  };
  onLogout?: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  const { 
    activeShift, 
    currentTimer, 
    currentShiftStatus, 
    startBreak, 
    endBreak, 
    checkOutShift 
  } = useAppState();
  const { unreadCount } = useNotifications();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'staff': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <header className="h-[72px] border-b border-border bg-card shadow-sm px-6 sticky top-0 z-10 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <XtremeLogo size="sm" />
            <div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(currentUser.role)}`}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Portal
              </div>
            </div>
          </div>

          {/* Shift Controls - Only visible for staff when active */}
          {currentUser.role === 'staff' && activeShift && (
            <div className="hidden md:flex items-center gap-3 ml-6 pl-6 border-l border-gray-200">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                currentShiftStatus === 'break' 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {currentShiftStatus === 'break' ? (
                  <Coffee className="h-4 w-4 animate-pulse" />
                ) : (
                  <Clock className="h-4 w-4 animate-pulse" />
                )}
                <span className="font-mono font-bold text-lg w-[88px]">
                  {currentTimer}
                </span>
              </div>

              {currentShiftStatus === 'break' ? (
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={endBreak}
                >
                  <Play className="h-4 w-4" />
                  Resume Work
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                  onClick={startBreak}
                >
                  <Coffee className="h-4 w-4" />
                  Break
                </Button>
              )}

              <Button 
                size="sm" 
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 gap-2"
                onClick={() => checkOutShift(activeShift.id, currentUser.email)}
              >
                <CircleStop className="h-4 w-4" />
                Check Out
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary rounded-full text-[10px] flex items-center justify-center text-white px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                <Avatar className="h-9 w-9 border-2 border-border">
                  <AvatarFallback className="bg-primary text-white font-medium">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
