import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavigation } from "./TopNavigation";
import { SidebarProvider } from "../ui/sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useNavigation } from "../../contexts/NavigationContext";
import { useIsMobile } from "../../hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  currentUser: {
    name: string;
    email: string;
    role: string;
    id: string;
  };
  onLogout: () => void;
}

export function AppLayout({ children, currentUser, onLogout }: AppLayoutProps) {
  const { currentPage, setCurrentPage } = useNavigation();
  const isMobile = useIsMobile();
  const showBottomNav = isMobile && (currentUser.role === 'staff' || currentUser.role === 'manager');

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        {/* Only show sidebar on desktop, or if it's the drawer on mobile */}
        <AppSidebar currentUser={currentUser} onLogout={onLogout} />
        
        <div className="flex flex-col flex-1 lg:pl-[280px] w-full min-w-0 transition-all duration-300">
          <TopNavigation 
            currentUser={currentUser}
            onLogout={onLogout}
          />
          <main className={`flex-1 overflow-auto w-full ${showBottomNav ? 'pb-20' : ''}`}>
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-8 py-4 sm:py-6 md:py-8 min-w-0">
              <div className="w-full min-w-0">
                {children}
              </div>
            </div>
          </main>
        </div>
        
        {showBottomNav && (
          <MobileBottomNav 
            role={currentUser.role} 
            currentPage={currentPage} 
            onNavigate={setCurrentPage} 
          />
        )}
      </div>
    </SidebarProvider>
  );
}