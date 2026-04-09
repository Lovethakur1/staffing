import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getMyDocuments, getCertifications, getMyTickets, getStaffAnalytics, getTrainingCourses, getMobileContent, MobileContentItem } from '../services/extraScreens.service';

interface ResourceItem {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: string;
  url?: string;
}

interface ResourceSection {
  title: string;
  subtitle: string;
  iconSection: keyof typeof Ionicons.glyphMap;
  sectionColor: string;
  items: ResourceItem[];
}

const SECTIONS: ResourceSection[] = [
  {
    title: 'Training Materials',
    subtitle: 'Guides and handbooks for staff',
    iconSection: 'book-outline',
    sectionColor: '#3B82F6',
    items: [
      { title: 'Staff Handbook 2025', description: 'Complete staff policies and procedures guide', icon: 'document-text-outline', color: '#3B82F6', action: 'Download PDF' },
      { title: 'Event Management Guide', description: 'Best practices for managing events', icon: 'calendar-outline', color: '#3B82F6', action: 'Read Guide' },
      { title: 'Health & Safety Manual', description: 'Workplace safety procedures and protocols', icon: 'shield-outline', color: '#3B82F6', action: 'Download PDF' },
      { title: 'Customer Service Excellence', description: 'Tips for outstanding client interactions', icon: 'people-outline', color: '#3B82F6', action: 'Read Guide' },
    ],
  },
  {
    title: 'Video Tutorials',
    subtitle: 'Watch and learn at your own pace',
    iconSection: 'play-circle-outline',
    sectionColor: '#10B981',
    items: [
      { title: 'App Walkthrough', description: 'How to use the Extreme Staffing mobile app', icon: 'phone-portrait-outline', color: '#10B981', action: 'Watch Now' },
      { title: 'Clock In / Clock Out', description: 'Step-by-step shift check-in tutorial', icon: 'time-outline', color: '#10B981', action: 'Watch Now' },
      { title: 'Submitting Timesheets', description: 'How to submit your weekly hours', icon: 'document-outline', color: '#10B981', action: 'Watch Now' },
    ],
  },
  {
    title: 'Quick Links',
    subtitle: 'Useful external resources',
    iconSection: 'link-outline',
    sectionColor: '#8B5CF6',
    items: [
      { title: 'Payroll Portal', description: 'Access your payslips and payment history', icon: 'cash-outline', color: '#8B5CF6', action: 'Open Link' },
      { title: 'HR Self-Service', description: 'Update personal details and view contracts', icon: 'person-outline', color: '#8B5CF6', action: 'Open Link' },
      { title: 'Shift Scheduling', description: 'View and apply for available shifts', icon: 'calendar-outline', color: '#8B5CF6', action: 'Open Link' },
      { title: 'Emergency Contacts', description: 'Important numbers for on-site incidents', icon: 'call-outline', color: Colors.primary, action: 'View' },
    ],
  },
];

export default function ResourcesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [managedItems, setManagedItems] = useState<MobileContentItem[]>([]);
  const [overview, setOverview] = useState({
    documentsPending: 0,
    certificationsAttention: 0,
    trainingActive: 0,
    trainingCompleted: 0,
    openTickets: 0,
    completedShifts: 0,
    averageRating: 0,
  });

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [documents, certifications, tickets, analytics, trainingCourses] = await Promise.all([
        user?.id ? getMyDocuments(user.id) : Promise.resolve([]),
        user?.id ? getCertifications(user.id) : Promise.resolve([]),
        getMyTickets(),
        getStaffAnalytics(),
        getTrainingCourses(),
      ]);
      const contentItems = await getMobileContent('RESOURCE');
      setManagedItems(contentItems);

      setOverview({
        documentsPending: documents.filter((document) => document.status === 'pending' || document.status === 'rejected').length,
        certificationsAttention: certifications.filter((certification) => certification.status === 'expired' || certification.status === 'expiring-soon' || certification.status === 'pending-verification').length,
        trainingActive: trainingCourses.filter((course) => course.status === 'in-progress').length,
        trainingCompleted: trainingCourses.filter((course) => course.status === 'completed').length,
        openTickets: tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length,
        completedShifts: analytics?.totalShifts ?? 0,
        averageRating: analytics?.avgRating ?? 0,
      });
    } catch {
      setOverview({
        documentsPending: 0,
        certificationsAttention: 0,
        trainingActive: 0,
        trainingCompleted: 0,
        openTickets: 0,
        completedShifts: 0,
        averageRating: 0,
      });
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, [user?.id]));

  const backendSections: ResourceSection[] = Object.entries(
    managedItems.reduce<Record<string, MobileContentItem[]>>((acc, item) => {
      const key = item.category || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {})
  ).map(([category, entries], index) => ({
    title: category,
    subtitle: `${entries.length} published item${entries.length === 1 ? '' : 's'}`,
    iconSection: index % 3 === 0 ? 'book-outline' : index % 3 === 1 ? 'play-circle-outline' : 'link-outline',
    sectionColor: entries[0]?.color || ['#3B82F6', '#10B981', '#8B5CF6'][index % 3],
    items: entries.map((entry) => ({
      title: entry.title,
      description: entry.description || entry.body || '',
      icon: (entry.icon as keyof typeof Ionicons.glyphMap) || 'book-outline',
      color: entry.color || '#3B82F6',
      action: entry.actionLabel || 'Open',
      url: entry.url,
    })),
  }));

  const dynamicSections: ResourceSection[] = [
    {
      title: 'Training Materials',
      subtitle: `${overview.trainingActive} active course${overview.trainingActive === 1 ? '' : 's'} and ${overview.trainingCompleted} completed`,
      iconSection: 'book-outline',
      sectionColor: '#3B82F6',
      items: [
        { title: 'Staff Handbook 2025', description: `Built around ${overview.completedShifts} completed shifts and current field standards.`, icon: 'document-text-outline', color: '#3B82F6', action: 'Read Guide' },
        { title: 'Event Management Guide', description: 'Best practices for shift preparation, service flow, and on-site execution.', icon: 'calendar-outline', color: '#3B82F6', action: 'Open' },
        { title: 'Health & Safety Manual', description: overview.certificationsAttention > 0 ? `${overview.certificationsAttention} certification or compliance item${overview.certificationsAttention === 1 ? '' : 's'} need attention.` : 'Your compliance status looks good. Review before your next event.', icon: 'shield-outline', color: '#3B82F6', action: overview.certificationsAttention > 0 ? 'Review Now' : 'View' },
      ],
    },
    {
      title: 'Training & Performance',
      subtitle: 'Live progress from your current account activity',
      iconSection: 'play-circle-outline',
      sectionColor: '#10B981',
      items: [
        { title: 'Training Portal', description: overview.trainingActive > 0 ? `${overview.trainingActive} course${overview.trainingActive === 1 ? '' : 's'} in progress.` : 'No active course right now. Start your next module when ready.', icon: 'school-outline', color: '#10B981', action: overview.trainingActive > 0 ? 'Continue' : 'Browse' },
        { title: 'Performance Snapshot', description: overview.averageRating > 0 ? `Average rating ${overview.averageRating.toFixed(1)} with ${overview.completedShifts} completed shifts.` : 'Performance metrics will improve as you complete more shifts.', icon: 'stats-chart-outline', color: '#10B981', action: 'View Stats' },
        { title: 'Support Queue', description: overview.openTickets > 0 ? `${overview.openTickets} support ticket${overview.openTickets === 1 ? '' : 's'} open with the support team.` : 'No open support tickets.', icon: 'headset-outline', color: '#10B981', action: overview.openTickets > 0 ? 'Track Tickets' : 'Get Help' },
      ],
    },
    {
      title: 'Quick Links',
      subtitle: 'Fast access to pages that currently need attention',
      iconSection: 'link-outline',
      sectionColor: '#8B5CF6',
      items: [
        { title: 'Documents Center', description: overview.documentsPending > 0 ? `${overview.documentsPending} document${overview.documentsPending === 1 ? '' : 's'} pending review or re-upload.` : 'All uploaded documents are currently in a good state.', icon: 'folder-outline', color: '#8B5CF6', action: overview.documentsPending > 0 ? 'Take Action' : 'Open' },
        { title: 'My Certifications', description: overview.certificationsAttention > 0 ? `${overview.certificationsAttention} certification${overview.certificationsAttention === 1 ? '' : 's'} expiring, pending, or expired.` : 'Certification status is healthy.', icon: 'ribbon-outline', color: '#8B5CF6', action: 'Review' },
        { title: 'Documentation Library', description: 'Find policies, guides, tutorials, and required reading in one place.', icon: 'book-outline', color: '#8B5CF6', action: 'Explore' },
      ],
    },
  ];

  if (loading) {
    return (
      <ScreenLayout activeTab="Resources">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Resources">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <Text style={st.pageTitle}>Resources</Text>
        <Text style={st.pageSubtitle}>Live guidance, tools and quick access for your account</Text>

        <View style={st.statsRow}>
          {[
            { label: 'Pending Docs', value: overview.documentsPending, icon: 'folder-open-outline', color: '#3B82F6' },
            { label: 'Cert Alerts', value: overview.certificationsAttention, icon: 'ribbon-outline', color: '#F59E0B' },
            { label: 'Active Training', value: overview.trainingActive, icon: 'school-outline', color: '#10B981' },
            { label: 'Open Tickets', value: overview.openTickets, icon: 'help-buoy-outline', color: '#8B5CF6' },
          ].map((stat) => (
            <View key={stat.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: stat.color + '18' }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={st.statValue}>{stat.value}</Text>
              <Text style={st.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Banner */}
        <View style={st.banner}>
          <View style={st.bannerIcon}>
            <Ionicons name="library-outline" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.bannerTitle}>Resource Library</Text>
            <Text style={st.bannerSub}>
              {overview.documentsPending > 0 || overview.certificationsAttention > 0
                ? `${overview.documentsPending + overview.certificationsAttention} action item${overview.documentsPending + overview.certificationsAttention === 1 ? '' : 's'} need attention across your account.`
                : 'Access all your staff resources in one place.'}
            </Text>
          </View>
        </View>

        {(backendSections.length > 0 ? backendSections : dynamicSections).map(section => (
          <View key={section.title} style={{ marginBottom: 20 }}>
            <View style={st.sectionHeader}>
              <View style={[st.sectionIconBox, { backgroundColor: section.sectionColor + '18' }]}>
                <Ionicons name={section.iconSection} size={18} color={section.sectionColor} />
              </View>
              <View>
                <Text style={st.sectionTitle}>{section.title}</Text>
                <Text style={st.sectionSubtitle}>{section.subtitle}</Text>
              </View>
            </View>

            <View style={st.card}>
              {section.items.map((item, idx) => (
                <View key={item.title}>
                  <TouchableOpacity
                    style={st.resourceItem}
                    onPress={() => item.url && Linking.openURL(item.url)}
                    activeOpacity={0.75}
                  >
                    <View style={[st.itemIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.itemTitle}>{item.title}</Text>
                      <Text style={st.itemDesc}>{item.description}</Text>
                    </View>
                    <View style={[st.actionChip, { backgroundColor: item.color + '18' }]}>
                      <Text style={[st.actionChipText, { color: item.color }]}>{item.action}</Text>
                    </View>
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={st.divider} />}
                </View>
              ))}
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
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.primary, borderRadius: 14, padding: 16, marginBottom: 20 },
  bannerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },

  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  resourceItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  itemIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  itemDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  actionChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  actionChipText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 62 },
});
