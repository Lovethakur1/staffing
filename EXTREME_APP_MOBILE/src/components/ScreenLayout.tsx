import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from './AppHeader';
import { DrawerMenu } from './DrawerMenu';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { RootStackParamList, MainTabParamList, ManagerTabParamList } from '../types';
import api from '../config/api';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;
type TabName = keyof MainTabParamList | keyof ManagerTabParamList;

interface ScreenLayoutProps {
  children: React.ReactNode;
  activeTab: TabName | string | any;
  notificationCount?: number;
}

/**
 * Wraps any screen with the shared AppHeader + DrawerMenu.
 * Uses RootStackNavigationProp so it can navigate to both tab screens
 * and the new drawer stack screens (Timesheets, Payroll, etc.).
 */
export function ScreenLayout({ children, activeTab, notificationCount = 0 }: ScreenLayoutProps) {
  const { user } = useAuth();
  const { unreadNotifCount } = useSocket();
  const navigation = useNavigation<RootNavProp>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [globalUnread, setGlobalUnread] = useState(0);

  // Auto-fetch global notification count when screen mounts/focuses
  useFocusEffect(
    useCallback(() => {
      let active = true;
      api.get('/notifications?unread=true&take=1')
        .then(res => {
          if (active && res.data?.unreadCount !== undefined) {
            setGlobalUnread(res.data.unreadCount);
          }
        })
        .catch(() => {});
      return () => { active = false; };
    }, [])
  );

  // Combine: API-fetched count + socket real-time count
  const totalUnread = notificationCount > 0 ? notificationCount : Math.max(globalUnread, unreadNotifCount);

  // Check if user is a manager
  const isManager = user?.role === 'MANAGER';

  const handleNavigateTab = useCallback(
    (tab: TabName) => {
      // Navigate to the appropriate tab navigator based on role
      if (isManager) {
        (navigation as any).navigate('ManagerMain', { screen: tab });
      } else {
        (navigation as any).navigate('Main', { screen: tab });
      }
    },
    [navigation, isManager]
  );

  return (
    <View style={styles.root}>
      <AppHeader
        userName={user?.name}
        notificationCount={totalUnread}
        onMenuPress={() => setDrawerOpen(true)}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />
      <View style={styles.body}>{children}</View>
      <DrawerMenu
        isOpen={drawerOpen}
        activeTab={activeTab}
        onNavigate={handleNavigateTab}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1 },
});
