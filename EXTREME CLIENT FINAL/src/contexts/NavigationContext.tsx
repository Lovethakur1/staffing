import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  currentPage: string;
  setCurrentPage: (page: string, params?: Record<string, any>) => void;
  breadcrumbs: Array<{ label: string; path: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  pageParams: Record<string, any>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageState] = useState('dashboard');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([
    { label: 'Dashboard', path: 'dashboard' }
  ]);

  const setCurrentPage = (page: string, params?: Record<string, any>) => {
    setCurrentPageState(page);
    setPageParams(params || {});
  };

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      breadcrumbs,
      setBreadcrumbs,
      pageParams
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}