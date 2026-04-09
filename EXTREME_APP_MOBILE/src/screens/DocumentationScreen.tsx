import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getMyDocuments, getCertifications, getTrainingCourses, getStaffAnalytics, getMobileContent, MobileContentItem } from '../services/extraScreens.service';

type DocTab = 'guides' | 'videos' | 'policies';

interface DocItem {
  id: string;
  title: string;
  description: string;
  category: string;
  kind?: string;
  pages?: number;
  duration?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tag: string;
  url?: string;
}

const GUIDES: DocItem[] = [
  { id: 'g1', title: 'Getting Started Guide', description: 'Everything you need to know to get started as a staff member', category: 'Onboarding', pages: 12, icon: 'rocket-outline', color: '#3B82F6', tag: 'Essential' },
  { id: 'g2', title: 'Shift Management', description: 'How to view, accept, and manage your scheduled shifts', category: 'Shifts', pages: 8, icon: 'calendar-outline', color: '#10B981', tag: 'Popular' },
  { id: 'g3', title: 'Payroll & Timesheets', description: 'Complete guide to submitting hours and understanding your payslip', category: 'Finance', pages: 15, icon: 'cash-outline', color: '#F59E0B', tag: 'Finance' },
  { id: 'g4', title: 'Health & Safety at Events', description: 'Safety standards and emergency procedures for on-site staff', category: 'Safety', pages: 22, icon: 'shield-outline', color: '#EF4444', tag: 'Required' },
  { id: 'g5', title: 'Customer Service Standards', description: 'Delivering outstanding experiences at client events', category: 'Conduct', pages: 10, icon: 'people-outline', color: '#8B5CF6', tag: 'Training' },
  { id: 'g6', title: 'App User Guide', description: 'Step-by-step instructions for all mobile app features', category: 'Technology', pages: 18, icon: 'phone-portrait-outline', color: '#06B6D4', tag: 'App' },
];

const VIDEOS: DocItem[] = [
  { id: 'v1', title: 'App Walkthrough', description: 'Full tour of the Extreme Staffing mobile app features', category: 'App', duration: '8 min', icon: 'phone-portrait-outline', color: '#3B82F6', tag: 'Beginner' },
  { id: 'v2', title: 'Clock In & Out Tutorial', description: 'How to correctly clock in and log your shift hours', category: 'Shifts', duration: '5 min', icon: 'time-outline', color: '#10B981', tag: 'Quick' },
  { id: 'v3', title: 'Submitting Timesheets', description: 'Step-by-step timesheet submission and approval process', category: 'Finance', duration: '6 min', icon: 'document-outline', color: '#F59E0B', tag: 'Finance' },
  { id: 'v4', title: 'Safety Briefing', description: 'On-site safety protocols and emergency procedures', category: 'Safety', duration: '12 min', icon: 'shield-outline', color: '#EF4444', tag: 'Required' },
];

const POLICIES: DocItem[] = [
  { id: 'p1', title: 'Code of Conduct', description: 'Standards of professional conduct expected from all staff', category: 'HR', pages: 6, icon: 'document-text-outline', color: Colors.primary, tag: 'Required' },
  { id: 'p2', title: 'Privacy Policy', description: 'How we collect, use, and protect your personal data', category: 'Legal', pages: 9, icon: 'lock-closed-outline', color: '#6B7280', tag: 'Legal' },
  { id: 'p3', title: 'Attendance Policy', description: 'Rules and expectations around attendance and punctuality', category: 'HR', pages: 4, icon: 'checkmark-circle-outline', color: '#10B981', tag: 'HR' },
  { id: 'p4', title: 'Uniform & Dress Code', description: 'Grooming and attire standards for on-site staff', category: 'Conduct', pages: 3, icon: 'shirt-outline', color: '#8B5CF6', tag: 'Conduct' },
];

const DOC_DATA: Record<DocTab, DocItem[]> = { guides: GUIDES, videos: VIDEOS, policies: POLICIES };

export default function DocumentationScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<DocTab>('guides');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [managedDocs, setManagedDocs] = useState<DocItem[]>([]);
  const [summary, setSummary] = useState({
    alerts: 0,
    requiredReads: 0,
    trainingCourses: 0,
    documentsPending: 0,
    averageRating: 0,
  });

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [documents, certifications, trainingCourses, analytics] = await Promise.all([
        user?.id ? getMyDocuments(user.id) : Promise.resolve([]),
        user?.id ? getCertifications(user.id) : Promise.resolve([]),
        getTrainingCourses(),
        getStaffAnalytics(),
      ]);
      const contentItems = await getMobileContent('DOCUMENTATION');
      setManagedDocs(contentItems.map((item: MobileContentItem) => ({
        id: item.id,
        title: item.title,
        description: item.description || item.body || '',
        category: item.category || 'General',
        kind: item.kind,
        pages: item.pages,
        duration: item.durationMinutes ? `${item.durationMinutes} min` : undefined,
        icon: (item.icon as keyof typeof Ionicons.glyphMap) || 'book-outline',
        color: item.color || Colors.primary,
        tag: item.required ? 'Required' : item.kind,
        url: item.url,
      })));

      const certAlerts = certifications.filter((cert) => cert.status === 'expired' || cert.status === 'expiring-soon').length;
      const documentAlerts = documents.filter((document) => document.status === 'pending' || document.status === 'rejected').length;
      const requiredReads = trainingCourses.filter((course) => course.required).length + (contentItems.length > 0
        ? contentItems.filter((item: MobileContentItem) => item.required).length
        : POLICIES.filter((item) => item.tag === 'Required').length);

      setSummary({
        alerts: certAlerts + documentAlerts,
        requiredReads,
        trainingCourses: trainingCourses.length,
        documentsPending: documents.filter((document) => document.status === 'pending').length,
        averageRating: analytics?.avgRating ?? 0,
      });
    } catch {
      setSummary({ alerts: 0, requiredReads: 0, trainingCourses: 0, documentsPending: 0, averageRating: 0 });
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const managedData: Record<DocTab, DocItem[]> = {
    guides: managedDocs.filter((item) => item.kind !== 'VIDEO' && item.kind !== 'POLICY'),
    videos: managedDocs.filter((item) => item.kind === 'VIDEO'),
    policies: managedDocs.filter((item) => item.kind === 'POLICY'),
  };

  const sourceData = managedDocs.length > 0 ? managedData : DOC_DATA;

  const items = sourceData[tab].filter(d =>
    search.trim() === '' ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <ScreenLayout activeTab="Documentation">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Documentation">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <Text style={st.pageTitle}>Documentation</Text>
        <Text style={st.pageSubtitle}>Guides, tutorials and company policies</Text>

        <View style={st.heroCard}>
          <View style={st.heroIcon}><Ionicons name="book-outline" size={20} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={st.heroTitle}>Personalized Knowledge Hub</Text>
            <Text style={st.heroSubtitle}>
              {summary.alerts > 0
                ? `${summary.alerts} item${summary.alerts === 1 ? '' : 's'} need attention across docs and certifications.`
                : 'Everything looks up to date. Keep reviewing required guides and policies.'}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={st.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search documentation..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Library', value: sourceData.guides.length + sourceData.videos.length + sourceData.policies.length, icon: 'book-outline', color: '#3B82F6' },
            { label: 'Required', value: summary.requiredReads, icon: 'shield-checkmark-outline', color: '#10B981' },
            { label: 'Training', value: summary.trainingCourses, icon: 'school-outline', color: '#8B5CF6' },
            { label: 'Alerts', value: summary.alerts, icon: 'warning-outline', color: summary.alerts > 0 ? '#EF4444' : Colors.primary },
          ].map(s => (
            <View key={s.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={st.statValue}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={st.contextRow}>
          <View style={st.contextChip}>
            <Ionicons name="time-outline" size={12} color={Colors.primary} />
            <Text style={st.contextChipText}>{summary.documentsPending} pending documents</Text>
          </View>
          <View style={st.contextChip}>
            <Ionicons name="star-outline" size={12} color={Colors.primary} />
            <Text style={st.contextChipText}>{summary.averageRating > 0 ? `${summary.averageRating.toFixed(1)} avg rating` : 'No rating yet'}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={st.tabsRow}>
          {([['guides','User Guides'],['videos','Videos'],['policies','Policies']] as [DocTab,string][]).map(([key,label]) => (
            <TouchableOpacity key={key} style={[st.tabBtn, tab===key && st.tabBtnActive]} onPress={() => { setTab(key); setSearch(''); }}>
              <Text style={[st.tabText, tab===key && st.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        {items.length === 0 ? (
          <View style={st.emptyBox}>
            <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            <Text style={st.emptyText}>No results for "{search}"</Text>
          </View>
        ) : (
          items.map(doc => (
            <TouchableOpacity key={doc.id} style={st.card} activeOpacity={0.8} onPress={() => doc.url && Linking.openURL(doc.url)}>
              <View style={st.cardTop}>
                <View style={[st.docIcon, { backgroundColor: doc.color + '18' }]}>
                  <Ionicons name={doc.icon} size={22} color={doc.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={st.cardTitleRow}>
                    <Text style={st.cardTitle} numberOfLines={1}>{doc.title}</Text>
                    <View style={[st.tag, { backgroundColor: doc.color + '15' }]}>
                      <Text style={[st.tagText, { color: doc.color }]}>{doc.tag}</Text>
                    </View>
                  </View>
                  <Text style={st.cardDesc} numberOfLines={2}>{doc.description}</Text>
                  <View style={st.cardMeta}>
                    <View style={st.metaChip}>
                      <Ionicons name="folder-outline" size={11} color={Colors.textMuted} />
                      <Text style={st.metaChipText}>{doc.category}</Text>
                    </View>
                    {doc.pages && (
                      <View style={st.metaChip}>
                        <Ionicons name="document-outline" size={11} color={Colors.textMuted} />
                        <Text style={st.metaChipText}>{doc.pages} pages</Text>
                      </View>
                    )}
                    {doc.duration && (
                      <View style={st.metaChip}>
                        <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                        <Text style={st.metaChipText}>{doc.duration}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={st.cardFooter}>
                <Text style={[st.readGuideBtn, { color: doc.color }]}>
                  {tab === 'videos' ? 'Watch Video' : 'Read Guide'} →
                </Text>
              </View>
            </TouchableOpacity>
          ))
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

  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primary, borderRadius: 14, padding: 16, marginBottom: 14 },
  heroIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 2, lineHeight: 17 },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  contextRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  contextChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 6 },
  contextChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },

  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  docIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: '700' },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  metaChipText: { fontSize: 10, color: Colors.textMuted },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 10 },
  readGuideBtn: { fontSize: 13, fontWeight: '700' },
});
