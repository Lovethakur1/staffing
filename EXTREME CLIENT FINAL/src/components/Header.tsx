import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Bell, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { XtremeLogo } from "./XtremeLogo";

interface HeaderProps {
  currentUser: {
    name: string;
    role: string;
    email: string;
  };
  onLogout?: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'staff': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <header className="border-b border-border bg-card shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <XtremeLogo size="sm" />
            <div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(currentUser.role)}`}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Portal
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-[10px] flex items-center justify-center text-white">
              3
            </span>
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