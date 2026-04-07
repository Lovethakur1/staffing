import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getStaffAnalytics, getTimesheets, StaffAnalyticsSummary } from '../services/extraScreens.service';
import { useAuth } from '../context/AuthContext';

function MetricBar({ label, value, maxVal, color }: { label: string; value: number; maxVal: number; color: string }) {
  const pct = maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color }}>{value.toLocaleString()}</Text>
      </View>
      <View style={{ height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 10, backgroundColor: color, borderRadius: 5 }} />
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<StaffAnalyticsSummary | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [ana, sheets] = await Promise.all([
        getStaffAnalytics(),
        getTimesheets(),
      ]);
      setSummary(ana);
      // Build last 6 months earnings from timesheet data
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-GB', { month: 'short' }) };
      });
      const earningStatuses = ['approved', 'paid', 'pending', 'submitted', 'completed'];
      const earnings = months.map(m =>
        sheets.filter(t => {
          const d = new Date(t.weekEnding);
          return d.getFullYear() === m.year && d.getMonth() === m.month && earningStatuses.includes(t.status);
        }).reduce((s, t) => s + t.grossPay, 0)
      );
      setMonthlyEarnings(earnings);
    } catch {
      setSummary(null);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const maxEarning = Math.max(...monthlyEarnings, 1);

  const insights = [
    {
      icon: 'trending-up-outline' as const,
      title: 'Performance',
      body: summary
        ? `${summary.completionRate}% shift completion rate with ${summary.avgRating.toFixed(1)} avg rating`
        : 'Complete shifts to see performance data',
      color: '#10B981',
      bg: '#D1FAE5',
    },
    {
      icon: 'calendar-outline' as const,
      title: 'Opportunity',
      body: summary
        ? `${summary.totalShifts} shifts totaling ${summary.totalHours.toFixed(0)}h of work`
        : 'Track your shift history here',
      color: '#3B82F6',
      bg: '#DBEAFE',
    },
    {
      icon: 'bulb-outline' as const,
      title: 'Action Item',
      body: 'Keep your certifications up to date to unlock premium event assignments.',
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
  ];

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
        <Text style={st.pageTitle}>Analytics</Text>
        <Text style={st.pageSubtitle}>Your performance overview and insights</Text>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Shifts', value: summary?.totalShifts ?? 0, icon: 'calendar-outline', color: '#3B82F6' },
            { label: 'Hours', value: `${(summary?.totalHours ?? 0).toFixed(0)}h`, icon: 'time-outline', color: '#10B981', small: true },
            { label: 'Earnings', value: `$${(summary?.totalEarnings ?? 0).toLocaleString()}`, icon: 'cash-outline', color: Colors.primary, small: true },
            { label: 'Rating', value: `${(summary?.avgRating ?? 0).toFixed(1)}★`, icon: 'star-outline', color: '#F59E0B', small: true },
          ].map(s => (
            <View key={s.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[st.statValue, s.small && { fontSize: 14 }]}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Earnings trend */}
        <View style={st.card}>
          <Text style={st.cardSectionTitle}>Earnings — Last 6 Months</Text>
          {monthlyEarnings.every(e => e === 0) ? (
            <Text style={{ color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>No earnings data available yet</Text>
          ) : (
            <View style={st.barChart}>
              {monthlyEarnings.map((val, i) => {
                const now = new Date();
                const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
                const label = d.toLocaleDateString('en-GB', { month: 'short' });
                const barPct = maxEarning > 0 ? (val / maxEarning) * 100 : 0;
                return (
                  <View key={i} style={st.barCol}>
                    <Text style={st.barAmtLabel}>{val > 0 ? `$${Math.round(val)}` : ''}</Text>
                    <View style={st.barBg}>
                      <View style={[st.barFill, { height: `${barPct}%` }]} />
                    </View>
                    <Text style={st.barMonthLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Performance metrics */}
        <View style={[st.card, { marginTop: 12 }]}>
          <Text style={st.cardSectionTitle}>Key Metrics</Text>
          <MetricBar label="Shift Completion Rate" value={summary?.completionRate ?? 0} maxVal={100} color="#10B981" />
          <MetricBar label="Punctuality Rate" value={summary?.punctualityRate ?? 0} maxVal={100} color="#3B82F6" />
          <MetricBar label="Total Hours Worked" value={summary?.totalHours ?? 0} maxVal={500} color="#8B5CF6" />
          <MetricBar label="Client Satisfaction" value={summary ? summary.avgRating * 20 : 0} maxVal={100} color="#F59E0B" />
        </View>

        {/* Insights */}
        <Text style={[st.cardSectionTitle, { marginTop: 16, marginBottom: 10 }]}>Insights</Text>
        {insights.map(ins => (
          <View key={ins.title} style={[st.insightCard, { borderLeftColor: ins.color }]}>
            <View style={[st.insightIcon, { backgroundColor: ins.bg }]}>
              <Ionicons name={ins.icon} size={18} color={ins.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.insightTitle}>{ins.title}</Text>
              <Text style={st.insightBody}>{ins.body}</Text>
            </View>
          </View>
        ))}
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

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardSectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barAmtLabel: { fontSize: 9, color: Colors.textMuted, marginBottom: 2, textAlign: 'center' },
  barBg: { flex: 1, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  barMonthLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },

  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4 },
  insightIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  insightTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  insightBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
