import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';

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
  return (
    <ScreenLayout activeTab="Dashboard">
      <ScrollView contentContainerStyle={st.scroll}>
        <Text style={st.pageTitle}>Resources</Text>
        <Text style={st.pageSubtitle}>Training materials, guides and useful links</Text>

        {/* Banner */}
        <View style={st.banner}>
          <View style={st.bannerIcon}>
            <Ionicons name="library-outline" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.bannerTitle}>Resource Library</Text>
            <Text style={st.bannerSub}>Access all your staff resources in one place</Text>
          </View>
        </View>

        {SECTIONS.map(section => (
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
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 14 },

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
