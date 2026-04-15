import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MyShiftsScreen from './src/screens/MyShiftsScreen';
import InboxScreen from './src/screens/InboxScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ShiftWorkflowScreen from './src/screens/ShiftWorkflowScreen';
import LiveMapScreen from './src/screens/LiveMapScreen';
import ChatScreen from './src/screens/ChatScreen';
import NewChatScreen from './src/screens/NewChatScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
// Drawer screens
import TimesheetsScreen from './src/screens/TimesheetsScreen';
import PayrollScreen from './src/screens/PayrollScreen';
import TrainingPortalScreen from './src/screens/TrainingPortalScreen';
import CertificationsScreen from './src/screens/CertificationsScreen';
import PerformanceScreen from './src/screens/PerformanceScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import DocumentationScreen from './src/screens/DocumentationScreen';
import EquipmentScreen from './src/screens/EquipmentScreen';
// Manager screens
import {
  ManagerDashboardScreen,
  ManagerEventsScreen,
  ManagerEventDetailScreen,
  ManagerStaffScreen,
  ManagerReportsScreen,
  ManagerTimesheetsScreen,
  ManagerIncidentsScreen,
} from './src/screens/manager';
import { RootStackParamList, MainTabParamList, ManagerTabParamList } from './src/types';
import { Colors } from './src/theme';
import { CustomTabBar, ManagerTabBar } from './src/components';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MyShifts" component={MyShiftsScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function ManagerMainTabs() {
  return (
    <ManagerTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ManagerTabBar {...props} />}
    >
      <ManagerTab.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
      <ManagerTab.Screen name="ManagerMyShifts" component={MyShiftsScreen} />
      <ManagerTab.Screen name="ManagerInbox" component={InboxScreen} />
      <ManagerTab.Screen name="ManagerProfile" component={ProfileScreen} />
    </ManagerTab.Navigator>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const isManager = user?.role === 'MANAGER';

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          {/* Show appropriate tabs based on role */}
          {isManager ? (
            <Stack.Screen name="ManagerMain" component={ManagerMainTabs} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
          <Stack.Screen
            name="ShiftWorkflow"
            component={ShiftWorkflowScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="LiveMap"
            component={LiveMapScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="ChatDetail"
            component={ChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="NewChat"
            component={NewChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          {/* ── Drawer Screens (Shared) ─────────────────────────────── */}
          <Stack.Screen
            name="Timesheets"
            component={TimesheetsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Payroll"
            component={PayrollScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="TrainingPortal"
            component={TrainingPortalScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Certifications"
            component={CertificationsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Performance"
            component={PerformanceScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Documents"
            component={DocumentsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="HelpSupport"
            component={HelpSupportScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Documentation"
            component={DocumentationScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Equipment"
            component={EquipmentScreen}
            options={{ animation: 'slide_from_right' }}
          />
          {/* ── Manager-Only Screens ─────────────────────────────── */}
          <Stack.Screen
            name="ManagerEvents"
            component={ManagerEventsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ManagerEventDetail"
            component={ManagerEventDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ManagerStaff"
            component={ManagerStaffScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ManagerReports"
            component={ManagerReportsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ManagerTimesheets"
            component={ManagerTimesheetsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ManagerIncidents"
            component={ManagerIncidentsScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
