import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { Colors } from '../theme';
import { ScreenLayout } from '../components';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  unread: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsScreen() {
  const nav = useNavigation<Nav>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.data || res.data || [];
      setNotifications(data);
      setUnreadCount(res.data?.unreadCount || data.filter((n: Notification) => n.unread).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [fetchNotifications])
  );

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive', onPress: async () => {
            try {
              await api.delete('/notifications/all');
              setNotifications([]);
              setUnreadCount(0);
            } catch (err) {
              console.error('Failed to clear notifications:', err);
            }
          },
        },
      ]
    );
  };

  function getIconForType(type: string): keyof typeof Ionicons.glyphMap {
    switch (type?.toLowerCase()) {
      case 'msg':
      case 'message': return 'chatbubble-outline';
      case 'shift': 
      case 'event': return 'calendar-outline';
      case 'payment': return 'cash-outline';
      case 'review': return 'star-outline';
      default: return 'notifications-outline';
    }
  }

  function getIconColorForType(type: string): string {
    switch (type?.toLowerCase()) {
      case 'msg':
      case 'message': return Colors.info;
      case 'shift': 
      case 'event': return Colors.primary;
      case 'payment': return Colors.success;
      case 'review': return Colors.warning;
      default: return Colors.textSecondary;
    }
  }

  function navigateToNotification(notif: Notification) {
    if (notif.unread) markAsRead(notif.id);
    const type = notif.type?.toLowerCase();
    const data = notif.data || {};
    switch (type) {
      case 'shift':
      case 'event':
      case 'schedule':
        if (data.shiftId) { nav.navigate('ShiftWorkflow', { shiftId: data.shiftId }); return; }
        nav.navigate('Main', { screen: 'MyShifts' } as any);
        return;
      case 'payment':
        nav.navigate('Payroll');
        return;
      case 'timesheet':
        nav.navigate('Timesheets');
        return;
      case 'review':
      case 'feedback':
        nav.navigate('Performance');
        return;
      case 'message':
      case 'msg':
        if (data.conversationId && data.senderName) {
          nav.navigate('ChatDetail', { conversationId: data.conversationId, conversationName: data.senderName });
          return;
        }
        nav.navigate('Main', { screen: 'Inbox' } as any);
        return;
      case 'support':
      case 'ticket':
        nav.navigate('HelpSupport');
        return;
      case 'training':
        nav.navigate('TrainingPortal');
        return;
      case 'compliance':
        nav.navigate('Certifications');
        return;
      default:
        nav.navigate('Main', { screen: 'Dashboard' } as any);
    }
  }

  function getTimeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  if (loading && notifications.length === 0) {
    return (
      <ScreenLayout activeTab="Dashboard">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Dashboard">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} colors={[Colors.primary]} />}
      >
        <View style={st.headerRow}>
          <View>
            <Text style={st.pageTitle}>Notifications</Text>
            <Text style={st.pageSubtitle}>{unreadCount} unread alerts</Text>
          </View>
          <View style={st.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={st.markAllBtn}>
                <Text style={st.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearAllNotifications} style={st.clearAllBtn}>
                <Ionicons name="trash-outline" size={14} color={Colors.error || '#EF4444'} />
                <Text style={st.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {notifications.length === 0 ? (
          <View style={st.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>You have no notifications yet</Text>
          </View>
        ) : (
          notifications.map(notif => (
            <TouchableOpacity
              key={notif.id}
              style={[st.notifCard, notif.unread && st.notifCardUnread]}
              onPress={() => navigateToNotification(notif)}
            >
              <View style={[st.iconWrap, { backgroundColor: getIconColorForType(notif.type) + '15' }]}>
                <Ionicons name={getIconForType(notif.type)} size={20} color={getIconColorForType(notif.type)} />
              </View>
              <View style={st.content}>
                <View style={st.topRow}>
                  <Text style={[st.title, notif.unread && { fontWeight: '700', color: Colors.textPrimary }]} numberOfLines={1}>{notif.title}</Text>
                  <Text style={st.time}>{getTimeAgo(notif.createdAt)}</Text>
                </View>
                <Text style={st.message} numberOfLines={2}>{notif.message}</Text>
              </View>
              {notif.unread && <View style={st.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  markAllBtn: { backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  markAllText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  clearAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  clearAllText: { fontSize: 11, fontWeight: '600', color: '#EF4444' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  notifCardUnread: { backgroundColor: '#F8FAFC', borderColor: Colors.primary + '30' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  content: { flex: 1, marginRight: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: Colors.textMuted },
  message: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, alignSelf: 'center' },
});
