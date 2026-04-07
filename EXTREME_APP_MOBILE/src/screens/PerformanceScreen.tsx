import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getMyReviews, getTimesheets, getStaffAnalytics, StaffReview, StaffAnalyticsSummary } from '../services/extraScreens.service';
import { useAuth } from '../context/AuthContext';

type PerfTab = 'overview' | 'reviews' | 'goals' | 'skills';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={14} color="#F59E0B" />
      ))}
    </View>
  );
}

function BarChart({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>{value.toFixed(1)}{max === 100 ? '%' : '/5'}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 8, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

export default function PerformanceScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [totalShifts, setTotalShifts] = useState(0);
  const [analytics, setAnalytics] = useState<StaffAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<PerfTab>('overview');

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [revData, shiftData, analyticsData] = await Promise.all([
        user?.id ? getMyReviews(user.id) : Promise.resolve([]),
        getTimesheets(),
        getStaffAnalytics(),
      ]);
      setReviews(revData);
      setTotalShifts(analyticsData?.totalShifts ?? shiftData.length);
      setAnalytics(analyticsData);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const overallRating = analytics?.avgRating ?? avgRating;

  const punctualityPct = analytics?.punctualityRate ?? 0;
  const certPct = analytics && analytics.certTotal > 0
    ? Math.round((analytics.certValid / analytics.certTotal) * 100) : 0;

  const goals = [
    { label: 'Complete 50 events this year', progress: Math.min(totalShifts / 50 * 100, 100), current: totalShifts, target: 50 },
    { label: 'Maintain 4.5+ average rating', progress: Math.min(avgRating / 5 * 100, 100), current: avgRating.toFixed(1), target: '4.5' },
    { label: 'On-time arrivals this month', progress: punctualityPct, current: `${punctualityPct}%`, target: '100%' },
    { label: 'Valid certifications', progress: certPct, current: `${analytics?.certValid ?? 0}/${analytics?.certTotal ?? 0}`, target: '100%' },
  ];

  const SKILL_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6'];
  const staffSkills = analytics?.skills ?? [];

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
        <Text style={st.pageTitle}>Performance</Text>
        <Text style={st.pageSubtitle}>Your performance metrics and reviews</Text>

        {/* Hero stats */}
        <View style={st.heroRow}>
          <View style={st.heroCard}>
            <Text style={st.heroLabel}>Overall Rating</Text>
            <Text style={st.heroValue}>{overallRating > 0 ? overallRating.toFixed(1) : '—'}</Text>
            <StarRating rating={Math.round(overallRating)} />
          </View>
          <View style={st.heroCard}>
            <Text style={st.heroLabel}>Total Shifts</Text>
            <Text style={st.heroValue}>{totalShifts}</Text>
            <Text style={st.heroSub}>completed</Text>
          </View>
          <View style={st.heroCard}>
            <Text style={st.heroLabel}>Reviews</Text>
            <Text style={st.heroValue}>{reviews.length}</Text>
            <Text style={st.heroSub}>from clients</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ paddingRight: 16 }}>
          {(['overview','reviews','goals','skills'] as PerfTab[]).map(t => (
            <TouchableOpacity key={t} style={[st.tabChip, tab===t && st.tabChipActive]} onPress={() => setTab(t)}>
              <Text style={[st.tabText, tab===t && st.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overview */}
        {tab === 'overview' && (
          <View>
            <View style={st.card}>
              <Text style={st.cardSectionTitle}>Performance Breakdown</Text>
              {overallRating > 0 && <BarChart label="Overall Rating" value={overallRating} max={5} color="#F59E0B" />}
              {avgRating > 0 && <BarChart label="Client Satisfaction" value={avgRating} max={5} color="#3B82F6" />}
              {analytics && analytics.punctualityRate > 0 && <BarChart label="Punctuality" value={analytics.punctualityRate} max={100} color="#10B981" />}
              {analytics && analytics.completionRate > 0 && <BarChart label="Completion Rate" value={analytics.completionRate} max={100} color="#8B5CF6" />}
              {overallRating === 0 && avgRating === 0 && !analytics && (
                <Text style={{ color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
                  Complete more shifts to see detailed metrics
                </Text>
              )}
            </View>
            <View style={[st.card, { marginTop: 10 }]}>
              <Text style={st.cardSectionTitle}>Recent Activity</Text>
              <View style={st.activityRow}><Ionicons name="checkmark-circle-outline" size={18} color="#10B981" /><Text style={st.activityText}>{totalShifts} shifts completed</Text></View>
              <View style={st.activityRow}><Ionicons name="chatbubble-outline" size={18} color="#3B82F6" /><Text style={st.activityText}>{reviews.length} client reviews received</Text></View>
              <View style={st.activityRow}><Ionicons name="star-outline" size={18} color="#F59E0B" /><Text style={st.activityText}>Average rating: {overallRating > 0 ? overallRating.toFixed(1) : 'N/A'}</Text></View>
            </View>
          </View>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          reviews.length === 0 ? (
            <View style={st.emptyBox}>
              <Ionicons name="chatbubble-outline" size={48} color={Colors.textMuted} />
              <Text style={st.emptyText}>No reviews yet</Text>
              <Text style={st.emptySubtext}>Client reviews will appear here after completed shifts</Text>
            </View>
          ) : (
            reviews.map(r => (
              <View key={r.id} style={st.reviewCard}>
                <View style={st.reviewTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.reviewClient}>{r.clientName || 'Client'}</Text>
                    <Text style={st.reviewEvent}>{r.eventName}</Text>
                  </View>
                  <StarRating rating={r.rating} />
                </View>
                {r.review ? <Text style={st.reviewText}>"{r.review}"</Text> : null}
                <Text style={st.reviewDate}>{r.date ? new Date(r.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : ''}</Text>
              </View>
            ))
          )
        )}

        {/* Goals */}
        {tab === 'goals' && (
          <View style={st.card}>
            <Text style={st.cardSectionTitle}>Goals & Achievements</Text>
            {goals.map(g => (
              <View key={g.label} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: Colors.textPrimary, flex: 1, marginRight: 8 }}>{g.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>{g.current}/{g.target}</Text>
                </View>
                <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ width: `${g.progress}%`, height: 8, backgroundColor: g.progress >= 100 ? '#10B981' : Colors.primary, borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {tab === 'skills' && (
          <View style={st.card}>
            <Text style={st.cardSectionTitle}>Your Skills</Text>
            {staffSkills.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {staffSkills.map((skill, i) => (
                  <View key={skill} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: (SKILL_COLORS[i % SKILL_COLORS.length]) + '15', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: (SKILL_COLORS[i % SKILL_COLORS.length]) + '30' }}>
                    <Ionicons name="checkmark-circle" size={16} color={SKILL_COLORS[i % SKILL_COLORS.length]} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginLeft: 6 }}>{skill}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
                No skills recorded yet. Contact your manager to update your profile.
              </Text>
            )}
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

  heroRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  heroCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  heroLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 4 },
  heroValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  heroSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  tabChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  tabChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardSectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },

  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityText: { fontSize: 13, color: Colors.textSecondary },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center', paddingHorizontal: 24 },

  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  reviewClient: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  reviewEvent: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  reviewText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 18, marginBottom: 6 },
  reviewDate: { fontSize: 11, color: Colors.textMuted },
});
