import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, MainTabParamList, ManagerTabParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);
const logoImg = require('../../assets/logo.png');

type TabName = keyof MainTabParamList | keyof ManagerTabParamList;
type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

interface DrawerMenuProps {
  isOpen: boolean;
  activeTab: TabName | string;
  onNavigate: (tab: any) => void;
  onClose: () => void;
  navigation: RootNavProp;
}

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tab?: TabName;
  screen?: keyof RootStackParamList;
  onPress?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function DrawerMenu({ isOpen, activeTab, onNavigate, onClose, navigation }: DrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  
  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleNav = (tab: TabName) => {
    onNavigate(tab);
    onClose();
  };

  const handleScreenNav = (screen: keyof RootStackParamList) => {
    onClose();
    // Small delay so drawer closes smoothly before screen push
    setTimeout(() => {
      navigation.navigate(screen as any);
    }, 150);
  };

  // Staff navigation sections
  const staffNavSections: NavSection[] = [
    {
      title: 'MAIN NAVIGATION',
      items: [
        { label: 'Home', icon: 'home-outline', tab: 'Dashboard' },
        { label: 'My Shifts', icon: 'calendar-outline', tab: 'MyShifts' },
        { label: 'Inbox', icon: 'chatbubble-outline', tab: 'Inbox' },
        { label: 'Profile', icon: 'person-outline', tab: 'Profile' },
      ],
    },
    {
      title: 'TIME & PAY',
      items: [
        { label: 'Timesheets', icon: 'document-text-outline', screen: 'Timesheets' },
        { label: 'Payroll', icon: 'cash-outline', screen: 'Payroll' },
      ],
    },
    {
      title: 'TRAINING & DEVELOPMENT',
      items: [
        { label: 'Training Portal', icon: 'school-outline', screen: 'TrainingPortal' },
        { label: 'My Certifications', icon: 'ribbon-outline', screen: 'Certifications' },
      ],
    },
    {
      title: 'PERFORMANCE & DOCS',
      items: [
        { label: 'Performance', icon: 'stats-chart-outline', screen: 'Performance' },
        { label: 'Documents', icon: 'folder-outline', screen: 'Documents' },
      ],
    },
    {
      title: 'SUPPORT & RESOURCES',
      items: [
        { label: 'Analytics', icon: 'bar-chart-outline', screen: 'Analytics' },
        { label: 'Resources', icon: 'library-outline', screen: 'Resources' },
        { label: 'Help & Support', icon: 'headset-outline', screen: 'HelpSupport' },
        { label: 'Documentation', icon: 'book-outline', screen: 'Documentation' },
      ],
    },
  ];

  // Manager navigation sections
  const managerNavSections: NavSection[] = [
    {
      title: 'MAIN NAVIGATION',
      items: [
        { label: 'Home', icon: 'home-outline', tab: 'ManagerDashboard' },
        { label: 'My Shifts', icon: 'calendar-outline', tab: 'ManagerMyShifts' },
        { label: 'Inbox', icon: 'chatbubble-outline', tab: 'ManagerInbox' },
        { label: 'Profile', icon: 'person-outline', tab: 'ManagerProfile' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Events', icon: 'calendar-outline', screen: 'ManagerEvents' },
        { label: 'Staff', icon: 'people-outline', screen: 'ManagerStaff' },
        { label: 'Timesheets', icon: 'document-text-outline', screen: 'ManagerTimesheets' },
        { label: 'Incidents', icon: 'warning-outline', screen: 'ManagerIncidents' },
      ],
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { label: 'Reports', icon: 'bar-chart-outline', screen: 'ManagerReports' },
        { label: 'Analytics', icon: 'stats-chart-outline', screen: 'Analytics' },
      ],
    },
    {
      title: 'MY TIME & PAY',
      items: [
        { label: 'My Timesheets', icon: 'document-text-outline', screen: 'Timesheets' },
        { label: 'My Payroll', icon: 'cash-outline', screen: 'Payroll' },
      ],
    },
    {
      title: 'TRAINING & DEVELOPMENT',
      items: [
        { label: 'Training Portal', icon: 'school-outline', screen: 'TrainingPortal' },
        { label: 'My Certifications', icon: 'ribbon-outline', screen: 'Certifications' },
      ],
    },
    {
      title: 'PERFORMANCE & DOCS',
      items: [
        { label: 'Performance', icon: 'trending-up-outline', screen: 'Performance' },
        { label: 'Documents', icon: 'folder-outline', screen: 'Documents' },
      ],
    },
    {
      title: 'SUPPORT & RESOURCES',
      items: [
        { label: 'Resources', icon: 'library-outline', screen: 'Resources' },
        { label: 'Help & Support', icon: 'headset-outline', screen: 'HelpSupport' },
        { label: 'Documentation', icon: 'book-outline', screen: 'Documentation' },
      ],
    },
  ];

  const navSections = isManager ? managerNavSections : staffNavSections;

  const roleName = (user?.role || 'STAFF').charAt(0) + (user?.role || 'STAFF').slice(1).toLowerCase();
  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Dark overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 16, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Header: Logo + close */}
        <View style={styles.drawerHeader}>
          <Image source={logoImg} style={styles.drawerLogo} resizeMode="contain" />
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* User info card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Staff Member'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleName}</Text>
          </View>
        </View>

        {/* Navigation sections */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {navSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => {
                const isActive = item.tab === activeTab || item.screen === activeTab;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.navItem,
                      isActive && styles.navItemActive,
                    ]}
                    onPress={() => {
                      if (item.tab) handleNav(item.tab);
                      else if (item.screen) handleScreenNav(item.screen);
                      else item.onPress?.();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={isActive ? Colors.primary : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.navLabel,
                        isActive && styles.navLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerLogo: {
    width: 140,
    height: 42,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 14,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollArea: {
    flex: 1,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: Colors.primary + '12',
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
  },
});
