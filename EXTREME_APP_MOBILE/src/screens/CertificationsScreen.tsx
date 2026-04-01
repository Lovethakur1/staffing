import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getCertifications, Certification } from '../services/extraScreens.service';

type CertTab = 'all' | 'expiring' | 'pending';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  valid:                { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle-outline', label: 'Valid' },
  'expiring-soon':      { bg: '#FEF3C7', text: '#92400E', icon: 'time-outline', label: 'Expiring' },
  expired:              { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline', label: 'Expired' },
  'pending-verification': { bg: '#DBEAFE', text: '#1E40AF', icon: 'eye-outline', label: 'Pending' },
};

export default function CertificationsScreen() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<CertTab>('all');

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { setCerts(await getCertifications()); } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const stats = {
    total: certs.length,
    valid: certs.filter(c => c.status === 'valid').length,
    expiring: certs.filter(c => c.status === 'expiring-soon').length,
    expired: certs.filter(c => c.status === 'expired').length,
    pending: certs.filter(c => c.status === 'pending-verification').length,
    complianceRate: certs.length > 0
      ? Math.round((certs.filter(c => c.status === 'valid' || c.status === 'expiring-soon').length / certs.length) * 100)
      : 0,
  };

  const displayed = tab === 'all' ? certs
    : tab === 'expiring' ? certs.filter(c => c.status === 'expiring-soon' || c.status === 'expired')
    : certs.filter(c => c.status === 'pending-verification');

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
        <Text style={st.pageTitle}>My Certifications</Text>
        <Text style={st.pageSubtitle}>View and manage your certifications</Text>

        {/* Stats */}
        <View style={st.statsRowWrap}>
          {[
            { label: 'Total', value: stats.total, color: '#3B82F6', icon: 'shield-outline' },
            { label: 'Valid', value: stats.valid, color: '#10B981', icon: 'checkmark-circle-outline' },
            { label: 'Expiring', value: stats.expiring, color: '#F59E0B', icon: 'time-outline' },
            { label: 'Expired', value: stats.expired, color: '#EF4444', icon: 'close-circle-outline' },
            { label: 'Compliance', value: `${stats.complianceRate}%`, color: '#8B5CF6', icon: 'trophy-outline', small: true },
          ].map(s => (
            <View key={s.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={16} color={s.color} />
              </View>
              <Text style={[st.statValue, s.small && { fontSize: 14 }]}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Alert banner */}
        {(stats.expiring > 0 || stats.expired > 0) && (
          <View style={st.alertBanner}>
            <Ionicons name="warning-outline" size={18} color="#991B1B" />
            <View style={{ flex: 1 }}>
              <Text style={st.alertTitle}>Certification Alert</Text>
              <Text style={st.alertText}>
                {stats.expired > 0 && `${stats.expired} expired. `}
                {stats.expiring > 0 && `${stats.expiring} expiring within 60 days.`}
              </Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={st.tabsRow}>
          {([['all','All'],['expiring','Expiring'],['pending','Pending']] as [CertTab,string][]).map(([key,label]) => (
            <TouchableOpacity key={key} style={[st.tabBtn, tab===key && st.tabBtnActive]} onPress={() => setTab(key)}>
              <Text style={[st.tabText, tab===key && st.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {displayed.length === 0 ? (
          <View style={st.emptyBox}>
            <Ionicons name="shield-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No certifications found</Text>
          </View>
        ) : (
          displayed.map(cert => {
            const sc = STATUS_CONFIG[cert.status] || STATUS_CONFIG.valid;
            return (
              <View key={cert.id} style={st.card}>
                <View style={st.cardTop}>
                  <View style={[st.certIconBox, { backgroundColor: Colors.primary + '18' }]}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle}>{cert.certType || 'Certification'}</Text>
                    {cert.certNumber ? <Text style={st.certNum}>#{cert.certNumber}</Text> : null}
                  </View>
                  <View style={[st.badge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={11} color={sc.text} />
                    <Text style={[st.badgeText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                </View>
                <View style={st.datesRow}>
                  {cert.issueDate ? (
                    <View style={st.dateChip}>
                      <Text style={st.dateChipLabel}>Issued</Text>
                      <Text style={st.dateChipVal}>{new Date(cert.issueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</Text>
                    </View>
                  ) : null}
                  {cert.expiryDate ? (
                    <View style={[st.dateChip, cert.status === 'expired' && { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[st.dateChipLabel, cert.status === 'expired' && { color: '#991B1B' }]}>Expires</Text>
                      <Text style={[st.dateChipVal, cert.status === 'expired' && { color: '#991B1B' }]}>
                        {new Date(cert.expiryDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </Text>
                    </View>
                  ) : null}
                  {cert.status === 'expiring-soon' && (
                    <View style={[st.dateChip, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[st.dateChipVal, { color: '#92400E' }]}>{cert.daysUntilExpiry}d left</Text>
                    </View>
                  )}
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

  statsRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statCard: { width: '18%', minWidth: 58, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  alertBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA', padding: 12, marginBottom: 14 },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#991B1B' },
  alertText: { fontSize: 12, color: '#B91C1C', marginTop: 2 },

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  certIconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  certNum: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontFamily: 'monospace' as any },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  datesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dateChip: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dateChipLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' as const },
  dateChipVal: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600', marginTop: 1 },
});
