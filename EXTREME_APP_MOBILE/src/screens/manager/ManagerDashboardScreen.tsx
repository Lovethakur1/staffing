import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';
import { ScreenLayout } from '../../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface EventSummary {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: string;
  staffAssigned: number;
  staffCheckedIn: number;
  staffRequired: number;
}

interface DashboardStats {
  eventsToday: number;
  totalStaffAssigned: number;
  checkInRate: number;
  activeEvents: number;
  upcomingEvents: number;
  pendingActions: number;
}

export default function ManagerDashboardScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const [stats, setStats] = useState<DashboardStats>({
    eventsToday: 0,
    totalStaffAssigned: 0,
    checkInRate: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    pendingActions: 0,
  });
  const [todayEvents, setTodayEvents] = useState<EventSummary[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventSummary | null>(null);
  const [myShift, setMyShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      // Fetch events
      const eventsRes = await api.get('/events');
      const allEvents = Array.isArray(eventsRes.data) ? eventsRes.data : 
        (eventsRes.data?.data || eventsRes.data?.events || []);

      const today = new Date().toISOString().split('T')[0];
      
      // Filter and map events
      const mapped: EventSummary[] = allEvents.map((e: any) => ({
        id: e.id,
        title: e.title || e.eventName || 'Event',
        client: e.client?.user?.name || 'Client',
        date: e.date || '',
        startTime: e.startTime || '09:00',
        endTime: e.endTime || '17:00',
        venue: e.venue || e.location || '',
        status: e.status || 'PENDING',
        staffAssigned: e.shifts?.length || 0,
        staffCheckedIn: e.shifts?.filter((s: any) => s.clockIn).length || 0,
        staffRequired: e.staffRequired || 0,
      }));

      const eventsToday = mapped.filter(e => e.date === today);
      const activeEvts = eventsToday.filter(e => 
        e.status === 'CONFIRMED' || e.status === 'IN_PROGRESS'
      );
      const upcomingEvts = mapped.filter(e => 
        new Date(e.date) > new Date(today) && 
        (e.status === 'CONFIRMED' || e.status === 'PENDING')
      );

      setTodayEvents(eventsToday);
      setActiveEvent(activeEvts[0] || null);

      const totalAssigned = eventsToday.reduce((sum, e) => sum + e.staffAssigned, 0);
      const totalCheckedIn = eventsToday.reduce((sum, e) => sum + e.staffCheckedIn, 0);

      setStats({
        eventsToday: eventsToday.length,
        totalStaffAssigned: totalAssigned,
        checkInRate: totalAssigned > 0 ? Math.round((totalCheckedIn / totalAssigned) * 100) : 0,
        activeEvents: activeEvts.length,
        upcomingEvents: upcomingEvts.length,
        pendingActions: 0,
      });

      // Fetch manager's own shifts
      try {
        const shiftsRes = await api.get('/shifts/my');
        const myShifts = Array.isArray(shiftsRes.data) ? shiftsRes.data : 
          (shiftsRes.data?.data || []);
        const todayShift = myShifts.find((s: any) => {
          const shiftDate = new Date(s.date).toISOString().split('T')[0];
          return shiftDate === today && 
            ['CONFIRMED', 'YET_TO_START', 'TRAVEL_TO_VENUE', 'ARRIVED', 'IN_PROGRESS', 'BREAK', 'ONGOING'].includes(s.status);
        });
        setMyShift(todayShift || null);
      } catch (e) {
        // Manager may not have shifts assigned
        setMyShift(null);
      }

    } catch (err) {
      console.error('Failed to fetch manager dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDashboard();
    }, [fetchDashboard])
  );

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout activeTab="ManagerDashboard" notificationCount={stats.pendingActions}>
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchDashboard(); }} 
            colors={[Colors.primary]} 
          />
        }
      >
        <Text style={st.welcomeText}>Welcome, {user?.name || 'Manager'}!</Text>
        <Text style={st.dateText}>{dateStr}</Text>

        {/* My Shift Status */}
        {myShift && (
          <TouchableOpacity 
            style={st.myShiftCard}
            onPress={() => nav.navigate('ShiftWorkflow', { shiftId: myShift.id })}
          >
            <View style={st.myShiftHeader}>
              <View style={st.myShiftIcon}>
                <Ionicons name="time" size={24} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.myShiftTitle}>My Active Shift</Text>
                <Text style={st.myShiftStatus}>
                  {myShift.status?.replace(/_/g, ' ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.white} />
            </View>
            <Text style={st.myShiftEvent}>{myShift.event?.title || 'Event'}</Text>
            <Text style={st.myShiftTime}>
              {myShift.startTime} - {myShift.endTime}
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={st.statsGrid}>
          <StatCard 
            icon="calendar" 
            label="Events Today" 
            value={String(stats.eventsToday)} 
            sub={stats.activeEvents > 0 ? `${stats.activeEvents} active` : 'None active'}
            color={Colors.primary}
          />
          <StatCard 
            icon="people" 
            label="Staff Assigned" 
            value={String(stats.totalStaffAssigned)} 
            sub="Today"
            color={Colors.success}
          />
          <StatCard 
            icon="checkmark-circle" 
            label="Check-in Rate" 
            value={`${stats.checkInRate}%`} 
            sub="Current"
            color={stats.checkInRate >= 80 ? Colors.success : Colors.warning}
          />
          <StatCard 
            icon="calendar-outline" 
            label="Upcoming" 
            value={String(stats.upcomingEvents)} 
            sub="Events"
            color={Colors.info}
          />
        </View>

        {/* Active Event Alert */}
        {activeEvent && (
          <TouchableOpacity 
            style={st.activeEventCard}
            onPress={() => nav.navigate('ManagerEventDetail', { eventId: activeEvent.id })}
          >
            <View style={st.liveIndicator}>
              <View style={st.liveDot} />
              <Text style={st.liveText}>LIVE</Text>
            </View>
            <Text style={st.activeEventTitle}>{activeEvent.title}</Text>
            <View style={st.activeEventInfo}>
              <View style={st.activeEventRow}>
                <Ionicons name="location-outline" size={16} color={Colors.white} />
                <Text style={st.activeEventText}>{activeEvent.venue}</Text>
              </View>
              <View style={st.activeEventRow}>
                <Ionicons name="time-outline" size={16} color={Colors.white} />
                <Text style={st.activeEventText}>
                  {activeEvent.startTime} - {activeEvent.endTime}
                </Text>
              </View>
              <View style={st.activeEventRow}>
                <Ionicons name="people-outline" size={16} color={Colors.white} />
                <Text style={st.activeEventText}>
                  {activeEvent.staffCheckedIn}/{activeEvent.staffAssigned} Staff Checked In
                </Text>
              </View>
            </View>
            <View style={st.progressBar}>
              <View 
                style={[
                  st.progressFill, 
                  { width: `${activeEvent.staffAssigned > 0 
                    ? (activeEvent.staffCheckedIn / activeEvent.staffAssigned) * 100 
                    : 0}%` 
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={st.sectionTitle}>Quick Actions</Text>
        <View style={st.actionsGrid}>
          <ActionButton 
            icon="calendar" 
            label="Events" 
            onPress={() => nav.navigate('ManagerEvents')} 
          />
          <ActionButton 
            icon="people" 
            label="Staff" 
            onPress={() => nav.navigate('ManagerStaff')} 
          />
          <ActionButton 
            icon="document-text" 
            label="Timesheets" 
            onPress={() => nav.navigate('ManagerTimesheets')} 
          />
          <ActionButton 
            icon="bar-chart" 
            label="Reports" 
            onPress={() => nav.navigate('ManagerReports')} 
          />
        </View>

        {/* Today's Events */}
        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>Today's Events</Text>
          <TouchableOpacity onPress={() => nav.navigate('ManagerEvents')}>
            <Text style={st.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {todayEvents.length === 0 ? (
          <View style={st.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No events scheduled for today</Text>
          </View>
        ) : (
          todayEvents.map(event => (
            <TouchableOpacity 
              key={event.id}
              style={st.eventCard}
              onPress={() => nav.navigate('ManagerEventDetail', { eventId: event.id })}
            >
              <View style={st.eventHeader}>
                <Text style={st.eventTitle}>{event.title}</Text>
                <StatusBadge status={event.status} />
              </View>
              <View style={st.eventRow}>
                <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
                <Text style={st.eventSubtext}>{event.client}</Text>
              </View>
              <View style={st.eventRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={st.eventSubtext}>{event.venue}</Text>
              </View>
              <View style={st.eventFooter}>
                <View style={st.eventRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={st.eventSubtext}>{event.startTime} - {event.endTime}</Text>
                </View>
                <View style={st.staffCount}>
                  <Ionicons name="people" size={14} color={Colors.primary} />
                  <Text style={st.staffCountText}>
                    {event.staffCheckedIn}/{event.staffAssigned}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <View style={st.statCard}>
      <View style={[st.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={st.statValue}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
      <Text style={st.statSub}>{sub}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={st.actionBtn} onPress={onPress}>
      <View style={st.actionIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      <Text style={st.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bg = Colors.info;
  let text = status;

  switch (status) {
    case 'CONFIRMED':
      bg = Colors.info;
      text = 'Confirmed';
      break;
    case 'IN_PROGRESS':
      bg = Colors.success;
      text = 'In Progress';
      break;
    case 'COMPLETED':
      bg = Colors.textMuted;
      text = 'Completed';
      break;
    case 'CANCELLED':
      bg = Colors.danger;
      text = 'Cancelled';
      break;
    case 'PENDING':
      bg = Colors.warning;
      text = 'Pending';
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
  scroll: { padding: 16, paddingBottom: 32 },
  welcomeText: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  dateText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  
  // My Shift Card
  myShiftCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  myShiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  myShiftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  myShiftTitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  myShiftStatus: { fontSize: 16, fontWeight: '600', color: Colors.white },
  myShiftEvent: { fontSize: 18, fontWeight: '700', color: Colors.white, marginTop: 8 },
  myShiftTime: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statSub: { fontSize: 11, color: Colors.textMuted },

  // Active Event Card
  activeEventCard: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  activeEventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  activeEventInfo: { gap: 6 },
  activeEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeEventText: { fontSize: 14, color: Colors.white },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    width: '23%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Event Card
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventSubtext: { fontSize: 13, color: Colors.textSecondary },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  staffCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  staffCountText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.white },

  // Empty State
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
});
