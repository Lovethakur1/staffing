import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { AppLayout } from "./components/layout/AppLayout";
import { PageRouter } from "./components/PageRouter";
import { NavigationProvider, useNavigation } from "./contexts/NavigationContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { AlertsProvider } from "./contexts/AlertsContext";
import { User } from "./data/mockData";
import { Toaster } from "./components/ui/sonner";
import { useIsMobile } from "./hooks/use-mobile";
import { DesktopOnlyRestriction } from "./components/mobile/DesktopOnlyRestriction";
import { SplashScreen } from "./components/mobile/SplashScreen";

function AppContent({ currentUser, onLogout }: { currentUser: User; onLogout: () => void }) {
  const { setCurrentPage } = useNavigation();
  const isMobile = useIsMobile();
  
  // Restricted roles on mobile
  const restrictedRoles = ['admin', 'sub-admin', 'scheduler'];
  const isRestricted = isMobile && restrictedRoles.includes(currentUser.role);

  if (isRestricted) {
    return <DesktopOnlyRestriction role={currentUser.role} onLogout={onLogout} />;
  }
  
  return (
    <>
      <NotificationsProvider>
        <AlertsProvider>
          <AppStateProvider setCurrentPage={setCurrentPage}>
            <AppLayout
              currentUser={{
                name: currentUser.name,
                role: currentUser.role,
                email: currentUser.email,
                id: currentUser.id,
              }}
              onLogout={onLogout}
            >
              <PageRouter 
                userRole={currentUser.role} 
                userId={currentUser.id} 
              />
            </AppLayout>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'bg-background text-foreground border-border',
                duration: 3000,
              }}
            />
          </AppStateProvider>
        </AlertsProvider>
      </NotificationsProvider>
    </>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(true);

  if (isMobile && showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <NavigationProvider>
      <AppContent currentUser={currentUser} onLogout={handleLogout} />
    </NavigationProvider>
  );
}