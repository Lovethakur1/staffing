import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../theme';

type TabKey = 'personal' | 'professional' | 'performance' | 'reviews';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  role: string;
  staffProfile?: {
    id: string;
    skills: string[];
    hourlyRate: number;
    rating: number;
    totalEvents: number;
    availabilityStatus: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    certifications?: any[];
  };
}

interface Review {
  id: string;
  rating: number;
  feedback: string;
  createdAt: string;
  reviewer?: { name: string };
  event?: { title: string };
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');

  const fetchData = useCallback(async () => {
    try {
      const [meRes, dashRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/staff/me/dashboard'),
      ]);
      setProfile(meRes.data.user || meRes.data);
      setDashStats(dashRes.data.stats || null);

      const staffId = (meRes.data.user || meRes.data)?.staffProfile?.id;
      if (staffId) {
        try {
          const revRes = await api.get(`/reviews/staff/${staffId}`);
          setReviews(Array.isArray(revRes.data) ? revRes.data : revRes.data.reviews || []);
        } catch { setReviews([]); }
      }
    } catch (e: any) {
      console.error('Profile fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  /* ── rating helpers ── */
  const avgRating = profile?.staffProfile?.rating ?? 0;
  const ratingDist = computeRatingDist(reviews);

  /* ── tabs ── */
  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'personal', label: 'Personal', icon: 'person-outline' },
    { key: 'professional', label: 'Professional', icon: 'briefcase-outline' },
    { key: 'performance', label: 'Performance', icon: 'stats-chart-outline' },
    { key: 'reviews', label: 'Reviews', icon: 'star-outline' },
  ];

  if (loading && !profile) {
    return (
      <View style={[s.center, { paddingTop: insets.top + 80 }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const sp = profile?.staffProfile;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Avatar + name */}
      <View style={s.avatarSection}>
        {profile?.avatar ? (
          <Image source={{ uri: profile.avatar }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, s.avatarPlaceholder]}>
            <Text style={s.avatarText}>
              {(profile?.name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={s.profileName}>{profile?.name || 'Staff Member'}</Text>
        <Text style={s.profileRole}>{profile?.role || 'STAFF'}</Text>
        {sp && (
          <View style={s.quickStats}>
            <QuickStat icon="star" value={sp.rating?.toFixed(1) || '0.0'} label="Rating" color={Colors.warning} />
            <QuickStat icon="calendar" value={String(sp.totalEvents || 0)} label="Events" color={Colors.info} />
            <QuickStat icon="cash" value={`$${sp.hourlyRate || 0}/hr`} label="Rate" color={Colors.success} />
          </View>
        )}
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, activeTab === t.key && s.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons
              name={t.icon as any}
              size={16}
              color={activeTab === t.key ? Colors.primary : Colors.textMuted}
            />
            <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {activeTab === 'personal' && renderPersonal(profile)}
        {activeTab === 'professional' && renderProfessional(sp, dashStats)}
        {activeTab === 'performance' && renderPerformance(dashStats, sp)}
        {activeTab === 'reviews' && renderReviews(reviews, avgRating, ratingDist)}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ════════  TAB RENDERERS  ════════ */

function renderPersonal(p: ProfileData | null) {
  if (!p) return null;
  const sp = p.staffProfile;
  const fields = [
    { icon: 'mail-outline', label: 'Email', value: p.email },
    { icon: 'call-outline', label: 'Phone', value: p.phone || 'Not set' },
    { icon: 'calendar-outline', label: 'Date of Birth', value: p.dob ? new Date(p.dob).toLocaleDateString() : 'Not set' },
    { icon: 'male-female-outline', label: 'Gender', value: p.gender || 'Not set' },
    { icon: 'document-text-outline', label: 'Bio', value: p.bio || 'No bio added' },
  ];
  const addressParts = [p.address, p.city, p.state, p.zipCode, p.country].filter(Boolean);
  const addressStr = addressParts.length > 0 ? addressParts.join(', ') : 'Not set';

  return (
    <View>
      <SectionTitle title="Personal Information" />
      {fields.map((f, i) => (
        <InfoRow key={i} icon={f.icon} label={f.label} value={f.value || ''} />
      ))}
      <InfoRow icon="location-outline" label="Address" value={addressStr} />

      <SectionTitle title="Emergency Contact" />
      <InfoRow icon="person-outline" label="Name" value={sp?.emergencyContactName || 'Not set'} />
      <InfoRow icon="call-outline" label="Phone" value={sp?.emergencyContactPhone || 'Not set'} />
    </View>
  );
}

function renderProfessional(sp: any, stats: any) {
  const skills: string[] = sp?.skills || [];
  const certs: any[] = sp?.certifications || [];

  return (
    <View>
      <SectionTitle title="Skills" />
      {skills.length === 0 ? (
        <Text style={s.emptyText}>No skills listed</Text>
      ) : (
        <View style={s.chipRow}>
          {skills.map((sk: string, i: number) => (
            <View key={i} style={s.chip}>
              <Text style={s.chipText}>{sk}</Text>
            </View>
          ))}
        </View>
      )}

      <SectionTitle title="Certifications" />
      {certs.length === 0 ? (
        <Text style={s.emptyText}>No certifications on file</Text>
      ) : (
        certs.map((c: any, i: number) => (
          <View key={i} style={s.card}>
            <Ionicons name="ribbon-outline" size={20} color={Colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={s.cardTitle}>{c.name || c.title || 'Certificate'}</Text>
              {c.expiryDate && (
                <Text style={s.cardSub}>Expires: {new Date(c.expiryDate).toLocaleDateString()}</Text>
              )}
            </View>
          </View>
        ))
      )}

      <SectionTitle title="Quick Stats" />
      <View style={s.statsGrid}>
        <StatBox label="Total Events" value={String(sp?.totalEvents || stats?.totalEvents || 0)} icon="calendar" color={Colors.info} />
        <StatBox label="Hourly Rate" value={`$${sp?.hourlyRate || 0}`} icon="cash" color={Colors.success} />
        <StatBox label="Completed" value={String(stats?.completedShifts || 0)} icon="checkmark-circle" color={Colors.statusCompleted} />
        <StatBox label="Availability" value={sp?.availabilityStatus || 'N/A'} icon="time" color={Colors.warning} />
      </View>
    </View>
  );
}

function renderPerformance(stats: any, sp: any) {
  const metrics = [
    { label: 'Overall Rating', value: sp?.rating?.toFixed(1) || '0.0', icon: 'star', color: Colors.warning },
    { label: 'Total Earnings', value: `$${stats?.totalEarnings?.toLocaleString() || '0'}`, icon: 'wallet', color: Colors.success },
    { label: 'This Month', value: `$${stats?.thisMonthEarnings?.toLocaleString() || '0'}`, icon: 'trending-up', color: Colors.info },
    { label: 'Completed Shifts', value: String(stats?.completedShifts || 0), icon: 'checkmark-done', color: Colors.statusCompleted },
    { label: "Today's Shifts", value: String(stats?.todaysShifts || 0), icon: 'today', color: Colors.primary },
    { label: 'Upcoming', value: String(stats?.upcomingShifts || 0), icon: 'calendar', color: Colors.statusConfirmed },
  ];

  return (
    <View>
      <SectionTitle title="Performance Metrics" />
      <View style={s.statsGrid}>
        {metrics.map((m, i) => (
          <StatBox key={i} label={m.label} value={m.value} icon={m.icon} color={m.color} />
        ))}
      </View>
    </View>
  );
}

function renderReviews(reviews: Review[], avgRating: number, dist: number[]) {
  return (
    <View>
      {/* Rating summary */}
      <View style={s.ratingCard}>
        <Text style={s.ratingBig}>{avgRating.toFixed(1)}</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <Ionicons
              key={n}
              name={n <= Math.round(avgRating) ? 'star' : 'star-outline'}
              size={18}
              color={Colors.warning}
            />
          ))}
        </View>
        <Text style={s.ratingCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Distribution */}
      <SectionTitle title="Rating Distribution" />
      {[5, 4, 3, 2, 1].map(star => {
        const count = dist[star - 1];
        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return (
          <View key={star} style={s.distRow}>
            <Text style={s.distLabel}>{star}★</Text>
            <View style={s.distBarBg}>
              <View style={[s.distBarFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.distCount}>{count}</Text>
          </View>
        );
      })}

      {/* Review list */}
      <SectionTitle title="Recent Reviews" />
      {reviews.length === 0 ? (
        <Text style={s.emptyText}>No reviews yet</Text>
      ) : (
        reviews.slice(0, 20).map((r) => (
          <View key={r.id} style={s.reviewCard}>
            <View style={s.reviewHeader}>
              <View style={s.starsRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Ionicons
                    key={n}
                    name={n <= r.rating ? 'star' : 'star-outline'}
                    size={14}
                    color={Colors.warning}
                  />
                ))}
              </View>
              <Text style={s.reviewDate}>
                {new Date(r.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {r.event?.title && (
              <Text style={s.reviewEvent}>{r.event.title}</Text>
            )}
            <Text style={s.reviewFeedback}>{r.feedback || 'No comments'}</Text>
            {r.reviewer?.name && (
              <Text style={s.reviewAuthor}>— {r.reviewer.name}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

/* ════════  HELPER COMPONENTS  ════════ */

function QuickStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={s.quickStatItem}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={[s.quickStatValue, { color }]}>{value}</Text>
      <Text style={s.quickStatLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={s.statBox}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={[s.statBoxValue, { color }]}>{value}</Text>
      <Text style={s.statBoxLabel}>{label}</Text>
    </View>
  );
}

function computeRatingDist(reviews: Review[]): number[] {
  const dist = [0, 0, 0, 0, 0]; // index 0 = 1-star, 4 = 5-star
  reviews.forEach(r => {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    dist[idx]++;
  });
  return dist;
}

/* ════════  STYLES  ════════ */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },

  avatarSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: Colors.white },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.white },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 10 },
  profileRole: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },

  quickStats: { flexDirection: 'row', marginTop: 16, gap: 24 },
  quickStatItem: { alignItems: 'center' },
  quickStatValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  quickStatLabel: { fontSize: 11, color: Colors.textMuted },

  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 10, flexDirection: 'row',
    justifyContent: 'center', gap: 4,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: 16 },

  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: Colors.textPrimary,
    marginTop: 20, marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  infoLabel: { fontSize: 11, color: Colors.textMuted },
  infoValue: { fontSize: 14, color: Colors.textPrimary, marginTop: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.primaryDark + '15', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  statBox: {
    width: '47%' as any, backgroundColor: Colors.white, borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  statBoxValue: { fontSize: 18, fontWeight: '700', marginTop: 6 },
  statBoxLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },

  emptyText: { fontSize: 14, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 8 },

  ratingCard: {
    alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12,
    padding: 20, marginTop: 16, borderWidth: 1, borderColor: Colors.border,
  },
  ratingBig: { fontSize: 42, fontWeight: '700', color: Colors.primary },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  ratingCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },

  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  distLabel: { width: 30, fontSize: 13, color: Colors.textSecondary },
  distBarBg: {
    flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4,
    marginHorizontal: 8, overflow: 'hidden',
  },
  distBarFill: { height: 8, backgroundColor: Colors.warning, borderRadius: 4 },
  distCount: { width: 24, fontSize: 12, color: Colors.textMuted, textAlign: 'right' },

  reviewCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewDate: { fontSize: 11, color: Colors.textMuted },
  reviewEvent: { fontSize: 12, color: Colors.info, fontWeight: '600', marginTop: 6 },
  reviewFeedback: { fontSize: 13, color: Colors.textPrimary, marginTop: 6, lineHeight: 19 },
  reviewAuthor: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
});
