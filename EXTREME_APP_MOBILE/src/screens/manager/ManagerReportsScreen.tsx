import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';
import { ScreenLayout } from '../../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface DashboardStats {
  totalRevenue: number;
  eventsCompleted: number;
  eventsUpcoming: number;
  staffUtilization: number;
  onTimePerformance: number;
  clientSatisfaction: number;
}

interface TopPerformer {
  id: string;
  name: string;
  rating: number;
  totalEvents: number;
}

export default function ManagerReportsScreen() {
  const nav = useNavigation<Nav>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const fetchReports = useCallback(async () => {
    try {
      const [statsRes, performersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/top-performers'),
      ]);

      setStats(statsRes.data);
      
      const perf = Array.isArray(performersRes.data) 
        ? performersRes.data 
        : (performersRes.data?.data || []);
      
      setPerformers(perf.slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.user?.name || p.name || 'Staff',
        rating: p.rating || 0,
        totalEvents: p.totalEvents || 0,
      })));
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReports();
    }, [fetchReports])
  );

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout activeTab="ManagerReports">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchReports(); }}
            colors={[Colors.primary]}
          />
        }
      >
        <Text style={st.title}>Reports & Analytics</Text>

        {/* Period Selector */}
        <View style={st.periodTabs}>
          {(['today', 'week', 'month'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[st.periodTab, period === p && st.periodTabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[st.periodText, period === p && st.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={st.metricsGrid}>
          <MetricCard
            icon="cash"
            label="Revenue"
            value={`£${stats?.totalRevenue?.toLocaleString() || 0}`}
            color={Colors.success}
          />
          <MetricCard
            icon="checkmark-circle"
            label="Completed"
            value={String(stats?.eventsCompleted || 0)}
            sub="events"
            color={Colors.primary}
          />
          <MetricCard
            icon="calendar"
            label="Upcoming"
            value={String(stats?.eventsUpcoming || 0)}
            sub="events"
            color={Colors.info}
          />
          <MetricCard
            icon="people"
            label="Utilization"
            value={`${stats?.staffUtilization || 0}%`}
            color={Colors.warning}
          />
        </View>

        {/* Performance Metrics */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Performance Metrics</Text>
          
          <View style={st.performanceRow}>
            <View style={st.performanceInfo}>
              <Text style={st.performanceLabel}>On-Time Performance</Text>
              <Text style={st.performanceValue}>{stats?.onTimePerformance || 0}%</Text>
            </View>
            <View style={st.progressBar}>
              <View 
                style={[
                  st.progressFill, 
                  { 
                    width: `${stats?.onTimePerformance || 0}%`,
                    backgroundColor: (stats?.onTimePerformance || 0) >= 90 
                      ? Colors.success 
                      : Colors.warning 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={st.performanceRow}>
            <View style={st.performanceInfo}>
              <Text style={st.performanceLabel}>Client Satisfaction</Text>
              <Text style={st.performanceValue}>{stats?.clientSatisfaction || 0}%</Text>
            </View>
            <View style={st.progressBar}>
              <View 
                style={[
                  st.progressFill, 
                  { 
                    width: `${stats?.clientSatisfaction || 0}%`,
                    backgroundColor: (stats?.clientSatisfaction || 0) >= 90 
                      ? Colors.success 
                      : Colors.warning 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={st.performanceRow}>
            <View style={st.performanceInfo}>
              <Text style={st.performanceLabel}>Staff Utilization</Text>
              <Text style={st.performanceValue}>{stats?.staffUtilization || 0}%</Text>
            </View>
            <View style={st.progressBar}>
              <View 
                style={[
                  st.progressFill, 
                  { 
                    width: `${stats?.staffUtilization || 0}%`,
                    backgroundColor: Colors.primary 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <Text style={st.cardTitle}>Top Performers</Text>
            <TouchableOpacity onPress={() => nav.navigate('ManagerStaff')}>
              <Text style={st.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {performers.length === 0 ? (
            <Text style={st.emptyText}>No performer data available</Text>
          ) : (
            performers.map((performer, index) => (
              <View key={performer.id} style={st.performerRow}>
                <View style={st.rankBadge}>
                  <Text style={st.rankText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.performerName}>{performer.name}</Text>
                  <Text style={st.performerEvents}>{performer.totalEvents} events</Text>
                </View>
                <View style={st.ratingBox}>
                  <Ionicons name="star" size={14} color={Colors.warning} />
                  <Text style={st.ratingText}>{performer.rating.toFixed(1)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Links */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Quick Reports</Text>
          
          <TouchableOpacity style={st.linkRow} onPress={() => nav.navigate('ManagerTimesheets')}>
            <View style={[st.linkIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.linkTitle}>Timesheets</Text>
              <Text style={st.linkSubtitle}>Review and approve timesheets</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={st.linkRow} onPress={() => nav.navigate('ManagerIncidents')}>
            <View style={[st.linkIcon, { backgroundColor: Colors.danger + '20' }]}>
              <Ionicons name="warning" size={20} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.linkTitle}>Incidents</Text>
              <Text style={st.linkSubtitle}>View and manage incidents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={st.linkRow} onPress={() => nav.navigate('ManagerEvents')}>
            <View style={[st.linkIcon, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="calendar" size={20} color={Colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.linkTitle}>Events History</Text>
              <Text style={st.linkSubtitle}>View completed events</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

function MetricCard({ icon, label, value, sub, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <View style={st.metricCard}>
      <View style={[st.metricIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={st.metricValue}>{value}</Text>
      {sub && <Text style={st.metricSub}>{sub}</Text>}
      <Text style={st.metricLabel}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },

  // Period Tabs
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.white,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  metricSub: { fontSize: 11, color: Colors.textMuted },
  metricLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '500' },

  // Performance Row
  performanceRow: {
    marginBottom: 16,
  },
  performanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  performanceLabel: { fontSize: 13, color: Colors.textSecondary },
  performanceValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Performers
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  performerName: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  performerEvents: { fontSize: 12, color: Colors.textSecondary },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  // Links
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkTitle: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  linkSubtitle: { fontSize: 12, color: Colors.textSecondary },

  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
