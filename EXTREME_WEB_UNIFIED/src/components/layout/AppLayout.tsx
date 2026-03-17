import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavigation } from "./TopNavigation";
import { SidebarProvider } from "../ui/sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useNavigation } from "../../contexts/NavigationContext";
import { useIsMobile } from "../../hooks/use-mobile";
import { DraggableShiftTimer } from "./DraggableShiftTimer";

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

// Pages that should fill 100% height with no padding (chat, etc.)
const FULL_HEIGHT_PAGES = ['messages'];

export function AppLayout({ children, currentUser, onLogout }: AppLayoutProps) {
  const { currentPage, setCurrentPage } = useNavigation();
  const isMobile = useIsMobile();
  const showBottomNav = isMobile && (currentUser.role === 'staff' || currentUser.role === 'manager');
  const isFullHeight = FULL_HEIGHT_PAGES.includes(currentPage);

  return (
    <SidebarProvider>
      <div className="h-screen overflow-hidden bg-background w-full">
        {/* Only show sidebar on desktop, or if it's the drawer on mobile */}
        <AppSidebar currentUser={currentUser} onLogout={onLogout} />

        <div className="flex flex-col flex-1 lg:pl-[280px] w-full min-w-0 h-full transition-all duration-300">
          <TopNavigation
            currentUser={currentUser}
            onLogout={onLogout}
          />
          <main className={`flex-1 overflow-hidden w-full min-h-0 ${showBottomNav ? 'pb-20' : ''}`}>
            {isFullHeight ? (
              // Full-height pages (chat): no padding, fill the area
              <div className="h-full w-full overflow-hidden">
                {children}
              </div>
            ) : (
              // Normal pages: padded scrollable content
              <div className="h-full overflow-auto">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-8 py-4 sm:py-6 md:py-8 min-w-0">
                  <div className="w-full min-w-0">
                    {children}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {showBottomNav && (
          <MobileBottomNav
            role={currentUser.role}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        )}

        {/* Draggable floating shift timer for staff */}
        <DraggableShiftTimer userRole={currentUser.role} />
      </div>
    </SidebarProvider>
  );
}

