import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getTimesheets, Timesheet } from '../services/extraScreens.service';

type StatusFilter = 'all' | 'submitted' | 'approved' | 'paid' | 'draft' | 'rejected';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  approved: { bg: '#D1FAE5', text: '#065F46' },
  paid:     { bg: '#EDE9FE', text: '#5B21B6' },
  submitted:{ bg: '#DBEAFE', text: '#1E40AF' },
  draft:    { bg: '#F1F5F9', text: '#475569' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function TimesheetsScreen() {
  const [sheets, setSheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { setSheets(await getTimesheets()); } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = filter === 'all' ? sheets : sheets.filter(s => s.status === filter);

  const stats = {
    total: sheets.length,
    approved: sheets.filter(s => s.status === 'approved').length,
    pending: sheets.filter(s => s.status === 'submitted').length,
    earnings: sheets.filter(s => ['paid','approved'].includes(s.status))
      .reduce((sum, s) => sum + s.grossPay, 0),
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'paid', label: 'Paid' },
    { key: 'rejected', label: 'Rejected' },
  ];

  if (loading) {
    return (
      <ScreenLayout activeTab="Timesheets">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Timesheets">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        {/* Page header */}
        <Text style={st.pageTitle}>Timesheets</Text>
        <Text style={st.pageSubtitle}>Track your hours and earnings</Text>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Total', value: stats.total, icon: 'document-text-outline', color: '#3B82F6' },
            { label: 'Approved', value: stats.approved, icon: 'checkmark-circle-outline', color: '#10B981' },
            { label: 'Pending', value: stats.pending, icon: 'time-outline', color: '#F59E0B' },
            { label: 'Earnings', value: `$${stats.earnings.toLocaleString()}`, icon: 'cash-outline', color: Colors.primary, small: true },
          ].map(s => (
            <View key={s.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[st.statValue, s.small && { fontSize: 15 }]}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={{ paddingRight: 16 }}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[st.filterChip, filter === f.key && st.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[st.filterChipText, filter === f.key && st.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={st.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No timesheets found</Text>
            <Text style={st.emptySubtext}>Your submitted timesheets will appear here</Text>
          </View>
        ) : (
          filtered.map(ts => {
            const sc = STATUS_COLORS[ts.status] || STATUS_COLORS.draft;
            return (
              <View key={ts.id} style={st.card}>
                <View style={st.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle} numberOfLines={1}>{ts.eventName || 'Shift'}</Text>
                    <Text style={st.cardSub}>
                      {ts.weekEnding ? new Date(ts.weekEnding).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </Text>
                  </View>
                  <View style={[st.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[st.badgeText, { color: sc.text }]}>{ts.status.charAt(0).toUpperCase() + ts.status.slice(1)}</Text>
                  </View>
                </View>
                <View style={st.cardDivider} />
                <View style={st.cardRow}>
                  <View style={st.cardStat}>
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text style={st.cardStatText}>{ts.totalHours}h total</Text>
                  </View>
                  <View style={st.cardStat}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                    <Text style={st.cardStatText}>{ts.regularHours}h regular</Text>
                  </View>
                  <View style={st.cardStat}>
                    <Ionicons name="cash-outline" size={14} color={Colors.textMuted} />
                    <Text style={[st.cardStatText, { color: '#10B981', fontWeight: '700' }]}>
                      ${ts.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 14 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  filterRow: { marginBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontSize: 12, color: Colors.textSecondary },
});
