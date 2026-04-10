import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { AppLayout } from "./components/layout/AppLayout";
import { PageRouter } from "./components/PageRouter";
import { NavigationProvider, useNavigation } from "./contexts/NavigationContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { UnreadMessagesProvider } from "./contexts/UnreadMessagesContext";
import { AlertsProvider } from "./contexts/AlertsContext";
import type { User } from "./data/mockData";
import { Toaster } from "./components/ui/sonner";
import { useIsMobile } from "./hooks/use-mobile";
import { DesktopOnlyRestriction } from "./components/mobile/DesktopOnlyRestriction";
import { SplashScreen } from "./components/mobile/SplashScreen";
import { PublicCareers } from "./pages/PublicCareers";
import api from "./services/api";

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
      <UnreadMessagesProvider>
      <NotificationsProvider>
        <AlertsProvider>
          <AppStateProvider setCurrentPage={setCurrentPage} userRole={currentUser.role}>
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
      </UnreadMessagesProvider>
    </>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(true);
  const [hash, setHash] = useState(window.location.hash);

  // Listen for hash changes (public routes)
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const mappedUser = {
            ...res.data,
            role: res.data.role.toLowerCase()
          };
          setCurrentUser(mappedUser);
        } catch (error) {
          console.error("Auto-login failed:", error);
          localStorage.removeItem('token');
        }
      }
      setIsAuthLoading(false);
    };
    initAuth();
  }, []);

  if (isMobile && showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('nav_currentPage');
    sessionStorage.removeItem('nav_pageParams');
    setCurrentUser(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sangria border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public careers page — accessible without login
  if (hash === '#/careers') {
    return <PublicCareers />;
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <NavigationProvider>
      <AppContent currentUser={currentUser} onLogout={handleLogout} />
    </NavigationProvider>
  );
}
