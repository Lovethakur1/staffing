import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getMobileContent, MobileContentItem } from '../services/extraScreens.service';

export default function TrainingPortalScreen() {
  const [courses, setCourses] = useState<MobileContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'required' | 'all'>('required');

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setCourses(await getMobileContent('TRAINING'));
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const stats = {
    total: courses.length,
    required: courses.filter(c => c.required).length,
    optional: courses.filter(c => !c.required).length,
    duration: courses.reduce((sum, course) => sum + (course.durationMinutes || 0), 0),
  };

  const displayed = tab === 'required'
    ? courses.filter(c => c.required)
    : courses;

  if (loading) {
    return (
      <ScreenLayout activeTab="TrainingPortal">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="TrainingPortal">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <Text style={st.pageTitle}>Training Portal</Text>
        <Text style={st.pageSubtitle}>Admin-published training courses and learning material</Text>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Total', value: stats.total, icon: 'book-outline', color: '#3B82F6' },
            { label: 'Required', value: stats.required, icon: 'checkmark-circle-outline', color: '#10B981' },
            { label: 'Optional', value: stats.optional, icon: 'time-outline', color: '#F59E0B' },
            { label: 'Minutes', value: stats.duration, icon: 'trophy-outline', color: '#8B5CF6', small: true },
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

        {/* Tabs */}
        <View style={st.tabsRow}>
          {(['required','all'] as const).map(t => (
            <TouchableOpacity key={t} style={[st.tabBtn, tab===t && st.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[st.tabText, tab===t && st.tabTextActive]}>
                {t === 'required' ? 'Required Training' : 'All Courses'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {displayed.length === 0 ? (
          <View style={st.emptyBox}>
            <Ionicons name="school-outline" size={52} color={Colors.textMuted} />
            <Text style={st.emptyText}>No training courses found</Text>
            <Text style={st.emptySubtext}>This page will populate after admin publishes training content.</Text>
          </View>
        ) : (
          displayed.map(course => {
            return (
              <View key={course.id} style={st.card}>
                {course.required && (
                  <View style={st.requiredBadge}>
                    <Ionicons name="star" size={10} color="#92400E" />
                    <Text style={st.requiredText}>Required</Text>
                  </View>
                )}
                <View style={st.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle}>{course.title}</Text>
                    <Text style={st.cardDesc} numberOfLines={3}>{course.description || course.body || ''}</Text>
                  </View>
                  <View style={st.statusBadge}> 
                    <Ionicons name="library-outline" size={12} color={Colors.primary} />
                    <Text style={st.statusText}>Published</Text>
                  </View>
                </View>
                <View style={st.courseMeta}>
                  {!!course.durationMinutes && <View style={st.metaChip}><Ionicons name="time-outline" size={12} color={Colors.textMuted} /><Text style={st.metaChipText}>{course.durationMinutes}m</Text></View>}
                  {!!course.modules && <View style={st.metaChip}><Ionicons name="list-outline" size={12} color={Colors.textMuted} /><Text style={st.metaChipText}>{course.modules} modules</Text></View>}
                  {!!course.instructor && <View style={st.metaChip}><Ionicons name="person-outline" size={12} color={Colors.textMuted} /><Text style={st.metaChipText}>{course.instructor}</Text></View>}
                  <View style={st.metaChip}><Ionicons name="folder-outline" size={12} color={Colors.textMuted} /><Text style={st.metaChipText}>{course.category}</Text></View>
                </View>
                <TouchableOpacity
                  style={[st.actionBtn, !course.url && st.actionBtnOutline]}
                  disabled={!course.url}
                  onPress={() => course.url && Linking.openURL(course.url)}
                >
                  <Ionicons name={course.url ? 'open-outline' : 'document-text-outline'} size={14} color={course.url ? '#fff' : Colors.primary} />
                  <Text style={[st.actionBtnText, !course.url && { color: Colors.primary }]}> 
                    {course.url ? (course.actionLabel || 'Open Course') : 'Published by Admin'}
                  </Text>
                </TouchableOpacity>
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

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center', paddingHorizontal: 24 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  requiredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8 },
  requiredText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, backgroundColor: '#EEF2FF' },
  statusText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  courseMeta: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaChipText: { fontSize: 11, color: Colors.textSecondary },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
