import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

type IncidentType = 'injury' | 'property-damage' | 'complaint' | 'safety' | 'theft' | 'other';
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  eventTitle: string;
  location: string;
  date: string;
}

const TYPES: { value: IncidentType; label: string; icon: string }[] = [
  { value: 'injury', label: 'Injury', icon: 'medkit-outline' },
  { value: 'property-damage', label: 'Property Damage', icon: 'hammer-outline' },
  { value: 'complaint', label: 'Complaint', icon: 'chatbubble-ellipses-outline' },
  { value: 'safety', label: 'Safety', icon: 'shield-outline' },
  { value: 'theft', label: 'Theft', icon: 'lock-open-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: '#94A3B8' },
  { value: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
  { value: 'HIGH', label: 'High', color: '#EF4444' },
  { value: 'CRITICAL', label: 'Critical', color: '#7C3AED' },
];

export default function IncidentReportScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'report' | 'my-reports'>('report');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myIncidents, setMyIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [showEventPicker, setShowEventPicker] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IncidentType>('other');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('none');

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/events');
      const all = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setEvents(all.map((e: any) => ({ id: e.id, title: e.title })));
    } catch {}
  }, []);

  const fetchMyIncidents = useCallback(async () => {
    try {
      const res = await api.get('/events/incidents');
      const all = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const mapped: Incident[] = all.map((i: any) => ({
        id: i.id,
        title: i.title || i.description?.substring(0, 50) || 'Incident',
        description: i.description || '',
        type: i.type || 'other',
        severity: i.severity || 'MEDIUM',
        status: i.status || 'OPEN',
        eventTitle: i.event?.title || '—',
        location: i.location || '',
        date: i.createdAt || '',
      }));
      mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMyIncidents(mapped);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchMyIncidents();
    fetchEvents();
  }, [fetchMyIncidents, fetchEvents]));

  const resetForm = () => {
    setTitle('');
    setType('other');
    setSeverity('MEDIUM');
    setDescription('');
    setLocation('');
    setActionsTaken('');
    setFollowUp(false);
    setSelectedEventId('none');
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter an incident title'); return; }
    if (!description.trim()) { Alert.alert('Required', 'Please describe the incident'); return; }

    setSubmitting(true);
    try {
      await api.post(`/events/${selectedEventId}/incidents`, {
        title: title.trim(),
        type,
        severity,
        description: description.trim(),
        location: location.trim() || undefined,
        actionsTaken: actionsTaken.trim() || undefined,
        followUpRequired: followUp,
        involvedParties: [],
        witnesses: [],
      });
      Alert.alert('Submitted', 'Your incident report has been submitted. Admin will review it.');
      resetForm();
      setTab('my-reports');
      fetchMyIncidents();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to submit report');
    }
    setSubmitting(false);
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'LOW': return '#94A3B8';
      case 'MEDIUM': return '#F59E0B';
      case 'HIGH': return '#EF4444';
      case 'CRITICAL': return '#7C3AED';
      default: return '#94A3B8';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'RESOLVED': case 'CLOSED': return Colors.success;
      case 'INVESTIGATING': return '#3B82F6';
      default: return Colors.warning;
    }
  };

  return (
    <ScreenLayout activeTab="IncidentReport">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={st.container}>
          {/* Header */}
          <View style={st.header}>
            <Ionicons name="warning-outline" size={24} color={Colors.primary} />
            <Text style={st.headerTitle}>Incident Report</Text>
          </View>
          <Text style={st.headerSub}>Report safety issues, damages, or complaints</Text>

          {/* Tabs */}
          <View style={st.tabs}>
            <TouchableOpacity style={[st.tab, tab === 'report' && st.tabActive]} onPress={() => setTab('report')}>
              <Ionicons name="create-outline" size={16} color={tab === 'report' ? '#fff' : Colors.textSecondary} />
              <Text style={[st.tabText, tab === 'report' && st.tabTextActive]}>New Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.tab, tab === 'my-reports' && st.tabActive]} onPress={() => setTab('my-reports')}>
              <Ionicons name="list-outline" size={16} color={tab === 'my-reports' ? '#fff' : Colors.textSecondary} />
              <Text style={[st.tabText, tab === 'my-reports' && st.tabTextActive]}>My Reports ({myIncidents.length})</Text>
            </TouchableOpacity>
          </View>

          {tab === 'report' ? (
            <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text style={st.label}>Title *</Text>
              <TextInput style={st.input} value={title} onChangeText={setTitle} placeholder="Brief incident title" />

              {/* Event Selector */}
              <Text style={st.label}>Event</Text>
              <TouchableOpacity
                style={st.eventSelector}
                onPress={() => setShowEventPicker(!showEventPicker)}
              >
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={[st.eventSelectorText, selectedEventId !== 'none' && { color: Colors.textPrimary }]}>
                  {selectedEventId === 'none'
                    ? 'No event (general incident)'
                    : events.find(e => e.id === selectedEventId)?.title || 'Select event'}
                </Text>
                <Ionicons name={showEventPicker ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {showEventPicker && (
                <View style={st.eventDropdown}>
                  <TouchableOpacity
                    style={[st.eventOption, selectedEventId === 'none' && st.eventOptionActive]}
                    onPress={() => { setSelectedEventId('none'); setShowEventPicker(false); }}
                  >
                    <Ionicons name="remove-circle-outline" size={16} color={selectedEventId === 'none' ? Colors.primary : Colors.textMuted} />
                    <Text style={[st.eventOptionText, selectedEventId === 'none' && { color: Colors.primary, fontWeight: '600' }]}>No event (general incident)</Text>
                  </TouchableOpacity>
                  {events.map(ev => (
                    <TouchableOpacity
                      key={ev.id}
                      style={[st.eventOption, selectedEventId === ev.id && st.eventOptionActive]}
                      onPress={() => { setSelectedEventId(ev.id); setShowEventPicker(false); }}
                    >
                      <Ionicons name="calendar" size={16} color={selectedEventId === ev.id ? Colors.primary : Colors.textMuted} />
                      <Text style={[st.eventOptionText, selectedEventId === ev.id && { color: Colors.primary, fontWeight: '600' }]}>{ev.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Type picker */}
              <Text style={st.label}>Type *</Text>
              <View style={st.typeGrid}>
                {TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[st.typeChip, type === t.value && st.typeChipActive]}
                    onPress={() => setType(t.value)}
                  >
                    <Ionicons name={t.icon as any} size={16} color={type === t.value ? '#fff' : Colors.textSecondary} />
                    <Text style={[st.typeChipText, type === t.value && st.typeChipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Severity picker */}
              <Text style={st.label}>Severity *</Text>
              <View style={st.severityRow}>
                {SEVERITIES.map(s => (
                  <TouchableOpacity
                    key={s.value}
                    style={[st.sevChip, { borderColor: s.color }, severity === s.value && { backgroundColor: s.color }]}
                    onPress={() => setSeverity(s.value)}
                  >
                    <Text style={[st.sevChipText, { color: severity === s.value ? '#fff' : s.color }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(severity === 'HIGH' || severity === 'CRITICAL') && (
                <View style={st.sevWarning}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={st.sevWarningText}>
                    {severity === 'CRITICAL' ? 'Critical incidents require immediate attention' : 'High severity — admin will be notified'}
                  </Text>
                </View>
              )}

              {/* Description */}
              <Text style={st.label}>Description *</Text>
              <TextInput
                style={[st.input, st.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what happened in detail..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Location */}
              <Text style={st.label}>Location</Text>
              <TextInput style={st.input} value={location} onChangeText={setLocation} placeholder="Where did this occur?" />

              {/* Actions taken */}
              <Text style={st.label}>Actions Taken</Text>
              <TextInput
                style={[st.input, st.textArea]}
                value={actionsTaken}
                onChangeText={setActionsTaken}
                placeholder="What immediate actions were taken?"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Follow-up toggle */}
              <TouchableOpacity style={st.followUpRow} onPress={() => setFollowUp(!followUp)}>
                <Ionicons name={followUp ? 'checkbox' : 'square-outline'} size={22} color={followUp ? Colors.primary : Colors.textMuted} />
                <Text style={st.followUpText}>Follow-up required</Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity style={st.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={18} color="#fff" />
                    <Text style={st.submitBtnText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={st.scroll}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyIncidents(); }} tintColor={Colors.primary} />}
            >
              {loading && myIncidents.length === 0 ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
              ) : myIncidents.length === 0 ? (
                <View style={st.empty}>
                  <Ionicons name="checkmark-circle-outline" size={56} color={Colors.success} />
                  <Text style={st.emptyTitle}>No Reports</Text>
                  <Text style={st.emptyText}>You haven't submitted any incident reports yet</Text>
                </View>
              ) : (
                myIncidents.map(inc => (
                  <View key={inc.id} style={st.card}>
                    <View style={st.cardHeader}>
                      <View style={[st.badge, { backgroundColor: severityColor(inc.severity) }]}>
                        <Ionicons name="warning" size={11} color="#fff" />
                        <Text style={st.badgeText}>{inc.severity}</Text>
                      </View>
                      <View style={[st.badge, { backgroundColor: statusColor(inc.status) }]}>
                        <Text style={st.badgeText}>{inc.status}</Text>
                      </View>
                    </View>
                    <Text style={st.cardTitle}>{inc.title}</Text>
                    <Text style={st.cardDesc} numberOfLines={2}>{inc.description}</Text>
                    <View style={st.cardMeta}>
                      <View style={st.metaItem}>
                        <Ionicons name="pricetag-outline" size={12} color={Colors.textMuted} />
                        <Text style={st.metaText}>{inc.type}</Text>
                      </View>
                      {inc.location ? (
                        <View style={st.metaItem}>
                          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                          <Text style={st.metaText}>{inc.location}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={st.cardFooter}>
                      <Text style={st.footerText}>{inc.eventTitle}</Text>
                      <Text style={st.footerDate}>
                        {inc.date ? new Date(inc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </Text>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textMuted, paddingHorizontal: 16, marginTop: 2, marginBottom: 12 },

  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary },
  textArea: { minHeight: 90 },

  eventSelector: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  eventSelectorText: { flex: 1, fontSize: 14, color: Colors.textMuted },
  eventDropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, maxHeight: 200, overflow: 'hidden' },
  eventOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  eventOptionActive: { backgroundColor: '#EFF6FF' },
  eventOptionText: { fontSize: 13, color: Colors.textPrimary },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  typeChipTextActive: { color: '#fff' },

  severityRow: { flexDirection: 'row', gap: 8 },
  sevChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  sevChipText: { fontSize: 12, fontWeight: '700' },
  sevWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginTop: 8 },
  sevWarningText: { fontSize: 12, color: '#EF4444', flex: 1 },

  followUpRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingVertical: 4 },
  followUpText: { fontSize: 14, color: Colors.textPrimary },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 10, marginTop: 20 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptyText: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  footerText: { fontSize: 12, color: Colors.textSecondary },
  footerDate: { fontSize: 12, color: Colors.textMuted },
});
