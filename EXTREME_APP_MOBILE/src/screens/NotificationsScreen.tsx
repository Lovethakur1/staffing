import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { Colors } from '../theme';
import { ScreenLayout } from '../components';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  unread: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
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
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={st.markAllBtn}>
              <Text style={st.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
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
              onPress={() => notif.unread && markAsRead(notif.id)}
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
  markAllBtn: { backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  markAllText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
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
