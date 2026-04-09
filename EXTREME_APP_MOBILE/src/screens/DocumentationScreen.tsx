import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getMobileContent, MobileContentItem } from '../services/extraScreens.service';

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

export default function DocumentationScreen() {
  const [tab, setTab] = useState<DocTab>('guides');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [managedDocs, setManagedDocs] = useState<DocItem[]>([]);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
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
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const managedData: Record<DocTab, DocItem[]> = {
    guides: managedDocs.filter((item) => item.kind !== 'VIDEO' && item.kind !== 'POLICY'),
    videos: managedDocs.filter((item) => item.kind === 'VIDEO'),
    policies: managedDocs.filter((item) => item.kind === 'POLICY'),
  };

  const items = managedData[tab].filter(d =>
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
        <Text style={st.pageSubtitle}>Admin-published guides, tutorials and policies</Text>

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
            <Text style={st.emptyText}>{search ? `No results for "${search}"` : 'No admin documentation published'}</Text>
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

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

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
