import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationHistoryItem {
  page: string;
  params: Record<string, any>;
}

interface NavigationContextType {
  currentPage: string;
  setCurrentPage: (page: string, params?: Record<string, any>) => void;
  breadcrumbs: Array<{ label: string; path: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  pageParams: Record<string, any>;
  setPageParams: (params: Record<string, any>) => void;
  goBack: () => void;
  navigationHistory: NavigationHistoryItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageState] = useState('dashboard');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([
    { label: 'Dashboard', path: 'dashboard' }
  ]);

  const setCurrentPage = (page: string, params?: Record<string, any>) => {
    // Add current page to history before navigating
    setNavigationHistory(prev => [...prev, { page: currentPage, params: pageParams }]);
    setCurrentPageState(page);
    setPageParams(params || {});
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setCurrentPageState(previous.page);
      setPageParams(previous.params);
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      breadcrumbs,
      setBreadcrumbs,
      pageParams,
      setPageParams,
      goBack,
      navigationHistory
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