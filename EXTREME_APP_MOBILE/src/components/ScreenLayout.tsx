import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from './AppHeader';
import { DrawerMenu } from './DrawerMenu';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, MainTabParamList } from '../types';
import api from '../config/api';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;
type TabName = keyof MainTabParamList;

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

  const handleNavigateTab = useCallback(
    (tab: TabName) => {
      // Navigate to the Main screen and specify the nested tab
      (navigation as any).navigate('Main', { screen: tab });
    },
    [navigation]
  );

  return (
    <View style={styles.root}>
      <AppHeader
        userName={user?.name}
        notificationCount={notificationCount > 0 ? notificationCount : globalUnread}
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
