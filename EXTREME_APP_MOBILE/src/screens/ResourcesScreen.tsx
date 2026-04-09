import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getMobileContent, MobileContentItem } from '../services/extraScreens.service';

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

export default function ResourcesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [managedItems, setManagedItems] = useState<MobileContentItem[]>([]);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const contentItems = await getMobileContent('RESOURCE');
      setManagedItems(contentItems);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const backendSections: ResourceSection[] = Object.entries(
    managedItems.reduce<Record<string, MobileContentItem[]>>((acc, item) => {
      const key = item.category || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {})
  ).map(([category, entries], index) => ({
    title: category,
    subtitle: `${entries.length} item${entries.length === 1 ? '' : 's'}${entries.some((entry) => entry.required) ? ' · required content included' : ''}`,
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
        <Text style={st.pageSubtitle}>Admin-published resources for your account</Text>

        {backendSections.map(section => (
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

        {backendSections.length === 0 && (
          <View style={st.emptyBox}>
            <Ionicons name="library-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No admin resources published</Text>
            <Text style={st.emptySubtext}>This page will populate after admin publishes resource content.</Text>
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

  emptyBox: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 12, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },

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
