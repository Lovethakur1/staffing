import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getMyDocuments, StaffDocument } from '../services/extraScreens.service';
import { useAuth } from '../context/AuthContext';

type DocTab = 'all' | 'required' | 'pending' | 'expiring';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  approved: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle-outline' },
  pending:  { bg: '#DBEAFE', text: '#1E40AF', icon: 'time-outline' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline' },
  expired:  { bg: '#FEF3C7', text: '#92400E', icon: 'warning-outline' },
};

const DOC_TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  id: 'card-outline',
  passport: 'globe-outline',
  certificate: 'ribbon-outline',
  contract: 'document-text-outline',
  license: 'shield-outline',
  other: 'document-outline',
};

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<StaffDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<DocTab>('all');

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      if (user?.id) setDocs(await getMyDocuments(user.id));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const required = docs.filter(d => d.required);
  const approved = docs.filter(d => d.status === 'approved');
  const completion = required.length > 0
    ? Math.round((approved.filter(d => d.required).length / required.length) * 100) : 0;

  const displayed = tab === 'all' ? docs
    : tab === 'required' ? docs.filter(d => d.required)
    : tab === 'pending' ? docs.filter(d => d.status === 'pending')
    : docs.filter(d => d.status === 'expired' || (
        d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ));

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
        <Text style={st.pageTitle}>Documents</Text>
        <Text style={st.pageSubtitle}>Manage your uploaded documents</Text>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Total', value: docs.length, icon: 'folder-outline', color: '#3B82F6' },
            { label: 'Completion', value: `${completion}%`, icon: 'trophy-outline', color: '#10B981', small: true },
            { label: 'Pending', value: docs.filter(d => d.status === 'pending').length, icon: 'time-outline', color: '#F59E0B' },
            { label: 'Expiring', value: docs.filter(d => d.status === 'expired').length, icon: 'warning-outline', color: '#EF4444' },
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

        {/* Compliance bar */}
        <View style={st.complianceCard}>
          <View style={st.complianceHeader}>
            <Text style={st.complianceTitle}>Document Completion</Text>
            <Text style={[st.compliancePct, { color: completion >= 80 ? '#10B981' : completion >= 50 ? '#F59E0B' : '#EF4444' }]}>{completion}%</Text>
          </View>
          <View style={st.progressBg}>
            <View style={[st.progressFill, { width: `${completion}%`, backgroundColor: completion >= 80 ? '#10B981' : completion >= 50 ? '#F59E0B' : '#EF4444' }]} />
          </View>
          <Text style={st.complianceSub}>{approved.filter(d => d.required).length} of {required.length} required documents submitted</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ paddingRight: 16 }}>
          {([['all','All'],['required','Required'],['pending','Pending'],['expiring','Expiring']] as [DocTab,string][]).map(([key,label]) => (
            <TouchableOpacity key={key} style={[st.tabChip, tab===key && st.tabChipActive]} onPress={() => setTab(key)}>
              <Text style={[st.tabText, tab===key && st.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upload button */}
        <TouchableOpacity style={st.uploadBtn} onPress={() => Alert.alert('Upload Document', 'Document upload available in the full app.')}>
          <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          <Text style={st.uploadBtnText}>Upload Document</Text>
        </TouchableOpacity>

        {/* List */}
        {displayed.length === 0 ? (
          <View style={st.emptyBox}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No documents found</Text>
          </View>
        ) : (
          displayed.map(doc => {
            const sc = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
            const docIcon = DOC_TYPE_ICON[doc.type?.toLowerCase()] || 'document-outline';
            return (
              <View key={doc.id} style={st.card}>
                <View style={st.cardTop}>
                  <View style={[st.docIconBox, { backgroundColor: Colors.primary + '12' }]}>
                    <Ionicons name={docIcon} size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle} numberOfLines={1}>{doc.name}</Text>
                    {doc.description ? <Text style={st.cardDesc} numberOfLines={1}>{doc.description}</Text> : null}
                    {doc.required && (
                      <View style={st.requiredChip}>
                        <Text style={st.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <View style={[st.badge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={11} color={sc.text} />
                    <Text style={[st.badgeText, { color: sc.text }]}>{doc.status}</Text>
                  </View>
                </View>
                {doc.status === 'rejected' && doc.rejectionReason && (
                  <View style={st.rejectionBanner}>
                    <Ionicons name="information-circle-outline" size={14} color="#991B1B" />
                    <Text style={st.rejectionText}>{doc.rejectionReason}</Text>
                  </View>
                )}
                <View style={st.cardFooter}>
                  {doc.uploadDate ? <Text style={st.metaText}>Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-GB')}</Text> : null}
                  {doc.expiryDate ? <Text style={[st.metaText, { color: '#F59E0B' }]}>Expires {new Date(doc.expiryDate).toLocaleDateString('en-GB')}</Text> : null}
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

  complianceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  complianceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complianceTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  compliancePct: { fontSize: 18, fontWeight: '800' },
  progressBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 8, borderRadius: 4 },
  complianceSub: { fontSize: 12, color: Colors.textMuted },

  tabChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  tabChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, marginBottom: 14 },
  uploadBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  docIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  requiredChip: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  requiredText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' as const },
  rejectionBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderRadius: 6, padding: 8, marginBottom: 8 },
  rejectionText: { fontSize: 12, color: '#991B1B', flex: 1 },
  cardFooter: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 12, color: Colors.textMuted },
});
