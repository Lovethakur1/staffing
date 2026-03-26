import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Shift, RootStackParamList } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PENDING:         { label: 'Pending',     color: Colors.statusPending,    bg: Colors.warningLight,  icon: 'time-outline' },
  CONFIRMED:       { label: 'Confirmed',   color: Colors.statusConfirmed,  bg: Colors.infoLight,     icon: 'checkmark-circle-outline' },
  YET_TO_START:    { label: 'Yet to Start',color: Colors.textSecondary,    bg: '#F1F5F9',            icon: 'hourglass-outline' },
  TRAVEL_TO_VENUE: { label: 'Traveling',   color: Colors.statusTravel,     bg: '#F3E8FF',            icon: 'car-outline' },
  ARRIVED:         { label: 'Arrived',     color: Colors.statusArrived,    bg: '#ECFEFF',            icon: 'location-outline' },
  IN_PROGRESS:     { label: 'Working',     color: Colors.statusInProgress, bg: Colors.successLight,  icon: 'play-circle-outline' },
  BREAK:           { label: 'On Break',    color: Colors.statusBreak,      bg: '#FFF7ED',            icon: 'cafe-outline' },
  COMPLETED:       { label: 'Completed',   color: Colors.statusCompleted,  bg: '#EEF2FF',            icon: 'checkmark-done-circle-outline' },
  TRAVEL_HOME:     { label: 'Going Home',  color: Colors.statusTravel,     bg: '#F3E8FF',            icon: 'home-outline' },
  REJECTED:        { label: 'Rejected',    color: Colors.danger,           bg: Colors.dangerLight,   icon: 'close-circle-outline' },
};

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShifts = useCallback(async () => {
    try {
      const res = await api.get('/shifts', { params: { status: undefined } });
      const data: Shift[] = res.data?.data || [];
      // Sort: active shifts first, then by date
      data.sort((a, b) => {
        const activeStatuses = ['TRAVEL_TO_VENUE', 'ARRIVED', 'IN_PROGRESS', 'BREAK', 'TRAVEL_HOME'];
        const aActive = activeStatuses.includes(a.status) ? 0 : 1;
        const bActive = activeStatuses.includes(b.status) ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setShifts(data);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchShifts();
    }, [fetchShifts])
  );

  const todayShifts = shifts.filter(s => {
    const shiftDate = new Date(s.date).toDateString();
    return shiftDate === new Date().toDateString();
  });

  const upcomingShifts = shifts.filter(s => {
    const shiftDate = new Date(s.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return shiftDate > today && !['COMPLETED', 'REJECTED'].includes(s.status);
  });

  const activeShift = shifts.find(s =>
    ['TRAVEL_TO_VENUE', 'ARRIVED', 'IN_PROGRESS', 'BREAK', 'TRAVEL_HOME'].includes(s.status)
  );

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function renderActiveShiftBanner() {
    if (!activeShift) return null;
    const cfg = STATUS_CONFIG[activeShift.status] || STATUS_CONFIG.PENDING;

    return (
      <TouchableOpacity
        style={styles.activeBanner}
        onPress={() => nav.navigate('ShiftWorkflow', { shiftId: activeShift.id })}
      >
        <View style={styles.activeBannerPulse} />
        <View style={styles.activeBannerContent}>
          <View style={styles.activeBannerTop}>
            <Ionicons name={cfg.icon} size={20} color={Colors.white} />
            <Text style={styles.activeBannerStatus}>{cfg.label}</Text>
          </View>
          <Text style={styles.activeBannerTitle}>
            {activeShift.event?.title || 'Active Shift'}
          </Text>
          <Text style={styles.activeBannerTime}>
            {activeShift.startTime} – {activeShift.endTime} • {activeShift.event?.venue || activeShift.event?.location}
          </Text>
          <View style={styles.activeBannerAction}>
            <Text style={styles.activeBannerActionText}>Tap to continue →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderShiftCard({ item }: { item: Shift }) {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;

    return (
      <TouchableOpacity
        style={styles.shiftCard}
        onPress={() => nav.navigate('ShiftWorkflow', { shiftId: item.id })}
      >
        <View style={styles.shiftCardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {item.travelEnabled && (
            <View style={styles.travelBadge}>
              <Ionicons name="car" size={12} color={Colors.statusTravel} />
            </View>
          )}
        </View>

        <Text style={styles.shiftTitle}>{item.event?.title || 'Shift'}</Text>

        <View style={styles.shiftMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.startTime} – {item.endTime}</Text>
          </View>
        </View>

        {item.event?.venue && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{item.event.venue}</Text>
          </View>
        )}

        {item.role && (
          <View style={[styles.roleBadge]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.name || 'Staff'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {renderActiveShiftBanner()}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.infoLight }]}>
                <Text style={[styles.statNumber, { color: Colors.info }]}>{todayShifts.length}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>{upcomingShifts.length}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
                <Text style={[styles.statNumber, { color: Colors.success }]}>
                  {shifts.filter(s => s.status === 'COMPLETED').length}
                </Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
            </View>

            {/* Today's Shifts */}
            {todayShifts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Shifts</Text>
                {todayShifts.map(s => (
                  <View key={s.id}>{renderShiftCard({ item: s })}</View>
                ))}
              </View>
            )}

            {/* Upcoming */}
            {upcomingShifts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
                {upcomingShifts.map(s => (
                  <View key={s.id}>{renderShiftCard({ item: s })}</View>
                ))}
              </View>
            )}

            {shifts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Shifts Yet</Text>
                <Text style={styles.emptySubtitle}>Your assigned shifts will appear here</Text>
              </View>
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchShifts(); }}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textSecondary },
  userName: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  logoutBtn: { padding: Spacing.sm },
  // Active Banner
  activeBanner: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  activeBannerPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.success,
  },
  activeBannerContent: { padding: Spacing.lg },
  activeBannerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  activeBannerStatus: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  activeBannerTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.xs },
  activeBannerTime: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.md },
  activeBannerAction: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  activeBannerActionText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.md },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: { fontSize: FontSize.xxxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  // Section
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  // Shift Card
  shiftCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shiftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase' },
  travelBadge: {
    backgroundColor: '#F3E8FF',
    borderRadius: BorderRadius.full,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  shiftMeta: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  roleText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  // Empty
  emptyState: { alignItems: 'center', marginTop: Spacing.xxl * 2, padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.md },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
});
