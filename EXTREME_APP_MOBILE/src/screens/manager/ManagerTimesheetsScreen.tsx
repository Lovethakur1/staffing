import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';
import { ScreenLayout } from '../../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Timesheet {
  id: string;
  staffName: string;
  staffId: string;
  eventTitle: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  status: string;
  shiftId: string;
}

export default function ManagerTimesheetsScreen() {
  const nav = useNavigation<Nav>();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchTimesheets = useCallback(async () => {
    try {
      const res = await api.get('/timesheets');
      const all = Array.isArray(res.data) ? res.data : 
        (res.data?.data || res.data?.timesheets || []);

      const mapped: Timesheet[] = all.map((t: any) => ({
        id: t.id,
        staffName: t.shift?.staff?.user?.name || t.staff?.name || 'Staff',
        staffId: t.shift?.staffId || t.staffId,
        eventTitle: t.shift?.event?.title || t.event?.title || 'Event',
        date: t.date || t.shift?.date || '',
        clockIn: t.clockInTime || '',
        clockOut: t.clockOutTime,
        totalHours: t.totalHours || 0,
        status: t.status || 'PENDING',
        shiftId: t.shiftId,
      }));

      // Sort by date (newest first)
      mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTimesheets(mapped);
    } catch (err) {
      console.error('Failed to fetch timesheets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTimesheets();
    }, [fetchTimesheets])
  );

  const handleApprove = async (id: string) => {
    Alert.alert(
      'Approve Timesheet',
      'Are you sure you want to approve this timesheet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await api.put(`/timesheets/${id}`, { status: 'APPROVED' });
              await fetchTimesheets();
              Alert.alert('Success', 'Timesheet approved');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to approve');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (id: string) => {
    Alert.alert(
      'Reject Timesheet',
      'Are you sure you want to reject this timesheet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/timesheets/${id}`, { status: 'REJECTED' });
              await fetchTimesheets();
              Alert.alert('Success', 'Timesheet rejected');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to reject');
            }
          },
        },
      ]
    );
  };

  const filteredTimesheets = timesheets.filter(t => {
    if (filter === 'all') return true;
    return t.status.toLowerCase() === filter;
  });

  const pendingCount = timesheets.filter(t => t.status === 'PENDING').length;

  const renderTimesheet = ({ item }: { item: Timesheet }) => (
    <View style={st.card}>
      <View style={st.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={st.staffName}>{item.staffName}</Text>
          <Text style={st.eventTitle}>{item.eventTitle}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={st.detailsRow}>
        <View style={st.detail}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={st.detailText}>
            {new Date(item.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })}
          </Text>
        </View>
        <View style={st.detail}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={st.detailText}>
            {item.clockIn ? new Date(item.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
            {' - '}
            {item.clockOut ? new Date(item.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          </Text>
        </View>
      </View>

      <View style={st.hoursRow}>
        <View style={st.hoursBox}>
          <Ionicons name="hourglass-outline" size={16} color={Colors.primary} />
          <Text style={st.hoursText}>{item.totalHours.toFixed(1)} hours</Text>
        </View>
      </View>

      {item.status === 'PENDING' && (
        <View style={st.actions}>
          <TouchableOpacity 
            style={[st.actionBtn, st.rejectBtn]} 
            onPress={() => handleReject(item.id)}
          >
            <Ionicons name="close" size={18} color={Colors.danger} />
            <Text style={[st.actionText, { color: Colors.danger }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[st.actionBtn, st.approveBtn]} 
            onPress={() => handleApprove(item.id)}
          >
            <Ionicons name="checkmark" size={18} color={Colors.white} />
            <Text style={[st.actionText, { color: Colors.white }]}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading && timesheets.length === 0) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout activeTab="ManagerTimesheets">
      <View style={st.container}>
        {/* Header */}
        <View style={st.header}>
          <Text style={st.title}>Timesheets</Text>
          {pendingCount > 0 && (
            <View style={st.pendingBadge}>
              <Text style={st.pendingText}>{pendingCount} pending</Text>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={st.filterTabs}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[st.filterTab, filter === f && st.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[st.filterText, filter === f && st.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredTimesheets}
          keyExtractor={(item) => item.id}
          renderItem={renderTimesheet}
          contentContainerStyle={st.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchTimesheets(); }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={st.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
              <Text style={st.emptyTitle}>No Timesheets</Text>
              <Text style={st.emptyText}>
                {filter === 'all' ? 'No timesheets found' : `No ${filter} timesheets`}
              </Text>
            </View>
          }
        />
      </View>
    </ScreenLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bg = Colors.info;
  let text = status;

  switch (status) {
    case 'PENDING':
      bg = Colors.warning;
      text = 'Pending';
      break;
    case 'APPROVED':
      bg = Colors.success;
      text = 'Approved';
      break;
    case 'REJECTED':
      bg = Colors.danger;
      text = 'Rejected';
      break;
  }

  return (
    <View style={[st.badge, { backgroundColor: bg }]}>
      <Text style={st.badgeText}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  pendingBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  pendingText: { fontSize: 12, fontWeight: '600', color: Colors.white },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
  },

  // List
  list: {
    padding: 16,
    paddingTop: 8,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  staffName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  eventTitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // Details
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: { fontSize: 13, color: Colors.textSecondary },

  // Hours
  hoursRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  hoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursText: { fontSize: 16, fontWeight: '600', color: Colors.primary },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: Colors.danger + '15',
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  actionText: { fontSize: 14, fontWeight: '600' },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.white },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
});
