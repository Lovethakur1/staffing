import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getTimesheets, getPayrollRuns, Timesheet, PayrollRun } from '../services/extraScreens.service';

type Tab = 'submissions' | 'batches' | 'summary';

export default function PayrollScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('submissions');
  const [pending, setPending] = useState<Timesheet[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [all, runData] = await Promise.all([getTimesheets(), getPayrollRuns()]);
      setPending(all.filter(t => t.status === 'submitted' || t.status === 'draft'));
      setRuns(runData);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const totalPendingPay = pending.reduce((s, t) => s + t.grossPay, 0);
  const totalPendingHours = pending.reduce((s, t) => s + t.totalHours, 0);

  const RUN_STATUS: Record<string, { bg: string; text: string }> = {
    completed: { bg: '#D1FAE5', text: '#065F46' },
    processed: { bg: '#D1FAE5', text: '#065F46' },
    pending:   { bg: '#FEF3C7', text: '#92400E' },
    draft:     { bg: '#F1F5F9', text: '#475569' },
  };

  if (loading) {
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <Text style={st.pageTitle}>Payroll</Text>
        <Text style={st.pageSubtitle}>Review submissions and payment history</Text>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Pending', value: pending.length, icon: 'time-outline', color: '#F59E0B' },
            { label: 'Hours', value: `${totalPendingHours.toFixed(1)}h`, icon: 'hourglass-outline', color: '#3B82F6', small: true },
            { label: 'Est. Pay', value: `$${totalPendingPay.toLocaleString()}`, icon: 'cash-outline', color: '#10B981', small: true },
            { label: 'Runs', value: runs.length, icon: 'server-outline', color: Colors.primary },
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

        {/* Tabs */}
        <View style={st.tabsRow}>
          {([['submissions','Submissions'],['batches','Batches'],['summary','Summary']] as [Tab,string][]).map(([key,label]) => (
            <TouchableOpacity key={key} style={[st.tabBtn, tab===key && st.tabBtnActive]} onPress={() => setTab(key)}>
              <Text style={[st.tabBtnText, tab===key && st.tabBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending submissions */}
        {tab === 'submissions' && (
          pending.length === 0 ? (
            <View style={st.emptyBox}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
              <Text style={st.emptyText}>All caught up!</Text>
              <Text style={st.emptySubtext}>No pending payroll submissions</Text>
            </View>
          ) : pending.map(ts => (
            <View key={ts.id} style={st.card}>
              <View style={st.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={st.cardTitle} numberOfLines={1}>{ts.eventName || 'Shift'}</Text>
                  <Text style={st.cardSub}>{ts.weekEnding || '—'}</Text>
                </View>
                <View style={[st.badge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[st.badgeText, { color: '#92400E' }]}>Pending</Text>
                </View>
              </View>
              <View style={st.cardMeta}>
                <Text style={st.metaItem}><Text style={st.metaLabel}>Hours: </Text>{ts.totalHours}h</Text>
                <Text style={st.metaItem}><Text style={st.metaLabel}>Est. Pay: </Text>
                  <Text style={{ color: '#10B981', fontWeight: '700' }}>${ts.grossPay.toFixed(2)}</Text>
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Payroll batches */}
        {tab === 'batches' && (
          runs.length === 0 ? (
            <View style={st.emptyBox}>
              <Ionicons name="server-outline" size={48} color={Colors.textMuted} />
              <Text style={st.emptyText}>No payroll runs yet</Text>
            </View>
          ) : runs.map(r => {
            const sc = RUN_STATUS[r.status] || { bg: '#F1F5F9', text: '#475569' };
            return (
              <View key={r.id} style={st.card}>
                <View style={st.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle}>Payroll Run</Text>
                    <Text style={st.cardSub}>{r.period}</Text>
                  </View>
                  <View style={[st.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[st.badgeText, { color: sc.text }]}>{r.status}</Text>
                  </View>
                </View>
                <View style={st.cardMeta}>
                  <Text style={st.metaItem}><Text style={st.metaLabel}>Staff: </Text>{r.staffCount}</Text>
                  <Text style={st.metaItem}><Text style={st.metaLabel}>Total: </Text>
                    <Text style={{ color: Colors.primary, fontWeight: '700' }}>${r.totalAmount.toLocaleString()}</Text>
                  </Text>
                  <Text style={st.metaItem}><Text style={st.metaLabel}>By: </Text>{r.processedBy}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Summary */}
        {tab === 'summary' && (
          <View style={st.summaryCard}>
            <Text style={st.summaryTitle}>Payment Summary</Text>
            {[
              { label: 'Total Pending Submissions', value: pending.length },
              { label: 'Pending Hours', value: `${totalPendingHours.toFixed(1)}h` },
              { label: 'Estimated Pending Pay', value: `$${totalPendingPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
              { label: 'Payroll Runs', value: runs.length },
              { label: 'Completed Runs', value: runs.filter(r => r.status === 'completed' || r.status === 'processed').length },
            ].map(row => (
              <View key={row.label} style={st.summaryRow}>
                <Text style={st.summaryLabel}>{row.label}</Text>
                <Text style={st.summaryValue}>{row.value}</Text>
              </View>
            ))}
          </View>
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

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabBtnTextActive: { color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { fontSize: 13, color: Colors.textSecondary },
  metaLabel: { fontWeight: '600', color: Colors.textPrimary },

  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
