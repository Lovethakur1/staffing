import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';
import { ScreenLayout } from '../../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Incident {
  id: string;
  title: string;
  description: string;
  eventTitle: string;
  reportedBy: string;
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  eventId: string;
}

export default function ManagerIncidentsScreen() {
  const nav = useNavigation<Nav>();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await api.get('/events/incidents');
      const all = Array.isArray(res.data) ? res.data : 
        (res.data?.data || res.data?.incidents || []);

      const mapped: Incident[] = all.map((i: any) => ({
        id: i.id,
        title: i.description?.substring(0, 50) || 'Incident Report',
        description: i.description || '',
        eventTitle: i.event?.title || 'Event',
        reportedBy: i.reporter?.name || 'Unknown',
        date: i.createdAt || new Date().toISOString(),
        priority: i.severity || 'MEDIUM',
        status: i.status || 'OPEN',
        eventId: i.eventId,
      }));

      // Sort by date (newest first)
      mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setIncidents(mapped);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchIncidents();
    }, [fetchIncidents])
  );

  const handleResolve = async (id: string) => {
    Alert.alert(
      'Resolve Incident',
      'Mark this incident as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              await api.put(`/events/incidents/${id}`, { status: 'RESOLVED' });
              await fetchIncidents();
              Alert.alert('Success', 'Incident resolved');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to resolve');
            }
          },
        },
      ]
    );
  };

  const filteredIncidents = incidents.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'open') return i.status !== 'RESOLVED';
    return i.status === 'RESOLVED';
  });

  const openCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  const renderIncident = ({ item }: { item: Incident }) => (
    <View style={st.card}>
      <View style={st.cardHeader}>
        <PriorityBadge priority={item.priority} />
        <StatusBadge status={item.status} />
      </View>

      <Text style={st.title}>{item.title}</Text>
      <Text style={st.description} numberOfLines={2}>{item.description}</Text>

      <View style={st.infoRow}>
        <View style={st.info}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={st.infoText}>{item.eventTitle}</Text>
        </View>
      </View>

      <View style={st.footer}>
        <View>
          <Text style={st.footerLabel}>Reported by</Text>
          <Text style={st.footerValue}>{item.reportedBy}</Text>
        </View>
        <View>
          <Text style={st.footerLabel}>Date</Text>
          <Text style={st.footerValue}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      {item.status !== 'RESOLVED' && (
        <TouchableOpacity 
          style={st.resolveBtn}
          onPress={() => handleResolve(item.id)}
        >
          <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
          <Text style={st.resolveBtnText}>Mark as Resolved</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && incidents.length === 0) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout activeTab="ManagerIncidents">
      <View style={st.container}>
        {/* Header */}
        <View style={st.header}>
          <Text style={st.headerTitle}>Incidents</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {openCount > 0 && (
              <View style={st.openBadge}>
                <Text style={st.openText}>{openCount} open</Text>
              </View>
            )}
            <TouchableOpacity
              style={{ backgroundColor: Colors.primary, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => nav.navigate('IncidentReport')}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={st.filterTabs}>
          {(['all', 'open', 'resolved'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[st.filterTab, filter === f && st.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[st.filterText, filter === f && st.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          renderItem={renderIncident}
          contentContainerStyle={st.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchIncidents(); }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={st.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} />
              <Text style={st.emptyTitle}>No Incidents</Text>
              <Text style={st.emptyText}>All clear! No incidents reported.</Text>
            </View>
          }
        />
      </View>
    </ScreenLayout>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  let bg = Colors.info;
  let text = priority;

  switch (priority) {
    case 'LOW':
      bg = Colors.textMuted;
      text = 'Low';
      break;
    case 'MEDIUM':
      bg = Colors.warning;
      text = 'Medium';
      break;
    case 'HIGH':
      bg = Colors.danger;
      text = 'High';
      break;
    case 'CRITICAL':
      bg = '#7C3AED';
      text = 'Critical';
      break;
  }

  return (
    <View style={[st.priorityBadge, { backgroundColor: bg }]}>
      <Ionicons name="warning" size={12} color={Colors.white} />
      <Text style={st.priorityText}>{text}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isResolved = status === 'RESOLVED';
  
  return (
    <View style={[st.statusBadge, { backgroundColor: isResolved ? Colors.success : Colors.warning }]}>
      <Text style={st.statusText}>{isResolved ? 'Resolved' : 'Open'}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  openBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  openText: { fontSize: 12, fontWeight: '600', color: Colors.white },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
  },

  // List
  list: {
    padding: 16,
    paddingTop: 8,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },

  // Info
  infoRow: {
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: { fontSize: 13, color: Colors.textSecondary },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerLabel: { fontSize: 11, color: Colors.textMuted },
  footerValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  // Resolve Button
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  resolveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  // Badges
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600', color: Colors.white },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
});
