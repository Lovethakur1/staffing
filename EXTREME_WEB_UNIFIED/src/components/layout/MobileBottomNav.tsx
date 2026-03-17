import { Home, Calendar, MessageSquare, User, Users, Clock } from "lucide-react";
import { cn } from "../ui/utils";

interface MobileBottomNavProps {
  role: string;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileBottomNav({ role, currentPage, onNavigate }: MobileBottomNavProps) {
  if (role !== 'staff' && role !== 'manager') return null;

  const staffItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'shifts', label: 'Shifts', icon: Calendar },
    { id: 'messages', label: 'Inbox', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const managerItems = [
    { id: 'manager', label: 'Home', icon: Home },
    { id: 'shifts-schedule', label: 'Schedule', icon: Clock },
    { id: 'staff', label: 'Team', icon: Users },
    { id: 'messages', label: 'Inbox', icon: MessageSquare },
  ];

  const items = role === 'staff' ? staffItems : managerItems;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
