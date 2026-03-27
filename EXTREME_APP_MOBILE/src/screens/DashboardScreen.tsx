import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface DashboardData {
  profile: any;
  stats: {
    todaysShifts: number;
    upcomingShifts: number;
    pendingRequests: number;
    completedShifts: number;
    rating: number;
    totalEvents: number;
    totalEarnings: number;
    thisMonthEarnings: number;
  };
  shifts: {
    today: any[];
    upcoming: any[];
    pending: any[];
    recent: any[];
  };
  certifications: any[];
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'today'>('overview');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/staff/me/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
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

  const initials = (user?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading || !data) {
    return <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const { stats, shifts } = data;
  const activeShift = shifts.today.find((sh: any) =>
    ['TRAVEL_TO_VENUE', 'ARRIVED', 'IN_PROGRESS', 'BREAK', 'TRAVEL_HOME', 'CONFIRMED', 'YET_TO_START'].includes(sh.status)
  );
  const completedRecent = shifts.recent.filter((sh: any) => sh.status === 'COMPLETED');
  const totalHours = completedRecent.reduce((sum: number, sh: any) => sum + (sh.totalHours || 0), 0);

  return (
    <View style={st.container}>
      <View style={[st.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={st.menuBtn}>
          <Ionicons name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={st.logoBg}>
          <Text style={st.logoTextBig}>E</Text>
          <Text style={st.logoTextSmall}>XTREME{'\n'}STAFFING</Text>
        </View>
        <View style={st.headerRight}>
          <TouchableOpacity style={st.bellBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            <View style={st.notifBadge}><Text style={st.notifCount}>{stats.pendingRequests}</Text></View>
          </TouchableOpacity>
          <View style={st.avatarSmall}><Text style={st.avatarSmallText}>{initials}</Text></View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} colors={[Colors.primary]} />}
      >
        <Text style={st.welcomeText}>Welcome back, {user?.name || 'Staff'}!</Text>
        <Text style={st.dateText}>Here's your dashboard overview for {dateStr}</Text>

        <View style={st.statsSection}>
          <StatCard icon="calendar-outline" label="Today's Shifts" value={String(stats.todaysShifts)} sub={activeShift ? 'Active shift in progress' : 'No active shifts'} />
          <StatCard icon="star-outline" label="Rating" value={stats.rating?.toFixed(1) || '0.0'} sub={`From ${stats.totalEvents} reviews`} />
          <StatCard icon="time-outline" label="Pending Requests" value={String(stats.pendingRequests)} sub="Needs your response" />
        </View>

        <View style={st.tabBar}>
          {(['overview', 'pending', 'today'] as const).map(t => (
            <TouchableOpacity key={t} style={[st.tab, activeTab === t && st.tabActive]} onPress={() => setActiveTab(t)}>
              <Text style={[st.tabText, activeTab === t && st.tabTextActive]}>
                {t === 'overview' ? 'Overview' : t === 'pending' ? 'Pending Requests' : "Today's Shifts"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <>
            {/* Shift Status - only show Start Travel Flow if travelEnabled */}
            <View style={st.card}>
              <View style={st.cardHeader}>
                <Text style={st.cardLabel}>Shift Status</Text>
                <View style={st.statusPill}>
                  <Text style={st.statusPillText}>{activeShift?.status?.replace(/_/g, ' ') || 'Scheduled'}</Text>
                </View>
              </View>
              {activeShift ? (
                <TouchableOpacity
                  style={st.travelBtn}
                  onPress={() => nav.navigate('ShiftWorkflow', { shiftId: activeShift.id })}
                >
                  <Text style={st.travelBtnIcon}>{activeShift.travelEnabled ? '🔗' : '📋'}</Text>
                  <Text style={st.travelBtnText}>{activeShift.travelEnabled ? 'Start Travel Flow' : 'View Shift Details'}</Text>
                </TouchableOpacity>
              ) : shifts.today.length > 0 ? (
                <TouchableOpacity
                  style={st.travelBtn}
                  onPress={() => nav.navigate('ShiftWorkflow', { shiftId: shifts.today[0].id })}
                >
                  <Text style={st.travelBtnIcon}>{shifts.today[0].travelEnabled ? '🔗' : '📋'}</Text>
                  <Text style={st.travelBtnText}>{shifts.today[0].travelEnabled ? 'Start Travel Flow' : 'View Shift Details'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={st.noShiftText}>No shifts scheduled for today</Text>
              )}
            </View>

            {/* Performance */}
            <View style={st.card}>
              <View style={st.perfHeader}>
                <Ionicons name="trending-up" size={20} color={Colors.textPrimary} />
                <Text style={st.perfTitle}>Performance Overview</Text>
              </View>
              <Text style={st.perfSubtitle}>Your work performance and achievement metrics</Text>

              <View style={st.perfGrid}>
                <View style={st.perfItem}>
                  <Text style={st.perfNumber}>{Math.round(totalHours)}</Text>
                  <Text style={st.perfLabel}>Total Hours</Text>
                  <Text style={st.perfSub}>⏱ This month</Text>
                </View>
                <View style={st.perfItem}>
                  <Text style={[st.perfNumber, { color: Colors.success }]}>${Math.round(stats.thisMonthEarnings)}</Text>
                  <Text style={st.perfLabel}>Total Earnings</Text>
                  <Text style={st.perfSub}>💰 This month</Text>
                </View>
              </View>

              <View style={st.perfGrid}>
                <View style={st.perfItem}>
                  <Text style={[st.perfNumber, { color: Colors.success }]}>{stats.rating?.toFixed(1) || '0.0'}</Text>
                  <Text style={st.perfLabel}>Average Rating</Text>
                  <Text style={st.perfSub}>⭐ {stats.totalEvents} reviews</Text>
                </View>
                <View style={st.perfItem}>
                  <Text style={[st.perfNumber, { color: Colors.success }]}>
                    {stats.completedShifts > 0 ? Math.round((stats.completedShifts / Math.max(stats.completedShifts + stats.pendingRequests, 1)) * 100) : 0}%
                  </Text>
                  <Text style={st.perfLabel}>On-Time Rate</Text>
                  <Text style={st.perfSub}>⏰ Punctuality</Text>
                </View>
              </View>

              <View style={st.progressRow}>
                <Text style={st.progressLabel}>Client Satisfaction</Text>
                <Text style={st.progressValue}>{stats.rating > 0 ? Math.round((stats.rating / 5) * 100) : 0}%</Text>
              </View>
              <View style={st.progressTrack}>
                <View style={[st.progressFill, { width: `${stats.rating > 0 ? Math.round((stats.rating / 5) * 100) : 0}%`, backgroundColor: Colors.info }]} />
              </View>

              <View style={[st.progressRow, { marginTop: 12 }]}>
                <Text style={st.progressLabel}>Monthly Goal Progress</Text>
                <Text style={st.progressValue}>{Math.min(Math.round((stats.completedShifts / 20) * 100), 100)}%</Text>
              </View>
              <View style={st.progressTrack}>
                <View style={[st.progressFill, { width: `${Math.min(Math.round((stats.completedShifts / 20) * 100), 100)}%`, backgroundColor: Colors.primary }]} />
              </View>
            </View>

            {/* Recent Activity */}
            <View style={st.card}>
              <View style={st.perfHeader}>
                <Ionicons name="pulse" size={20} color={Colors.textPrimary} />
                <Text style={st.perfTitle}>Recent Activity</Text>
              </View>
              <Text style={st.perfSubtitle}>Your latest completed shifts</Text>

              {completedRecent.slice(0, 5).map((shift: any) => (
                <View key={shift.id} style={st.activityItem}>
                  <View style={st.activityDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.activityTitle}>{shift.event?.title || 'Shift'}</Text>
                    <Text style={st.activitySub}>{new Date(shift.date).toLocaleDateString('en-GB')} • {shift.event?.venue || ''}</Text>
                  </View>
                  <View style={st.activityRight}>
                    <Text style={st.activityPay}>${shift.totalPay?.toFixed(0) || '0'}</Text>
                  </View>
                </View>
              ))}
              {completedRecent.length === 0 && <Text style={st.emptyText}>No recent activity</Text>}
            </View>
          </>
        )}

        {activeTab === 'pending' && (
          <View style={st.card}>
            {shifts.pending.length === 0 ? (
              <Text style={st.emptyText}>No pending requests</Text>
            ) : (
              shifts.pending.map((shift: any) => (
                <TouchableOpacity key={shift.id} style={st.shiftItem} onPress={() => nav.navigate('ShiftWorkflow', { shiftId: shift.id })}>
                  <Text style={st.shiftItemTitle}>{shift.event?.title || 'Shift'}</Text>
                  <Text style={st.shiftItemSub}>{new Date(shift.date).toLocaleDateString()} • {shift.startTime} – {shift.endTime}</Text>
                  <Text style={st.shiftItemVenue}>{shift.event?.venue}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'today' && (
          <View style={st.card}>
            {shifts.today.length === 0 ? (
              <Text style={st.emptyText}>No shifts today</Text>
            ) : (
              shifts.today.map((shift: any) => (
                <TouchableOpacity key={shift.id} style={st.shiftItem} onPress={() => nav.navigate('ShiftWorkflow', { shiftId: shift.id })}>
                  <Text style={st.shiftItemTitle}>{shift.event?.title || 'Shift'}</Text>
                  <Text style={st.shiftItemSub}>{shift.startTime} – {shift.endTime}</Text>
                  <View style={st.shiftStatusRow}>
                    <View style={[st.shiftDot, { backgroundColor: Colors.statusInProgress }]} />
                    <Text style={st.shiftStatusLabel}>{shift.status.replace(/_/g, ' ')}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, sub }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; sub: string }) {
  return (
    <View style={st.statCard}>
      <View style={st.statIconRow}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
        <Text style={st.statLabel}>{label}</Text>
      </View>
      <Text style={st.statValue}>{value}</Text>
      <Text style={st.statSub}>{sub}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  menuBtn: { padding: 4 },
  logoBg: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  logoTextBig: { color: '#fff', fontSize: 18, fontWeight: '900' },
  logoTextSmall: { color: '#fff', fontSize: 7, fontWeight: '700', marginLeft: 2, lineHeight: 9 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: Colors.primary, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifCount: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  welcomeText: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  dateText: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 16 },
  statsSection: { gap: 10 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  statValue: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  statSub: { fontSize: 12, color: Colors.info, marginTop: 2 },
  tabBar: { backgroundColor: '#fff', borderRadius: 12, padding: 4, marginTop: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  tab: { paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textPrimary },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  statusPill: { backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'capitalize' },
  travelBtn: { flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  travelBtnIcon: { fontSize: 18 },
  travelBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  noShiftText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 12 },
  perfHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  perfTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  perfSubtitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 16 },
  perfGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  perfItem: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  perfNumber: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  perfLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  perfSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, marginTop: 4 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  progressValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  progressTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 12 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  activitySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  activityRight: { alignItems: 'flex-end' },
  activityPay: { fontSize: 14, fontWeight: '700', color: Colors.success },
  shiftItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  shiftItemTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  shiftItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  shiftItemVenue: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  shiftStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  shiftDot: { width: 6, height: 6, borderRadius: 3 },
  shiftStatusLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'capitalize' },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
