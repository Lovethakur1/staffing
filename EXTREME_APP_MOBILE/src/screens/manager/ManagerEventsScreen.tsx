import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';
import { ScreenLayout } from '../../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Event {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: string;
  staffAssigned: number;
  staffRequired: number;
  eventType: string;
}

export default function ManagerEventsScreen() {
  const nav = useNavigation<Nav>();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/events');
      const allEvents = Array.isArray(res.data) ? res.data : 
        (res.data?.data || res.data?.events || []);

      const mapped: Event[] = allEvents.map((e: any) => ({
        id: e.id,
        title: e.title || e.eventName || 'Event',
        client: e.client?.user?.name || 'Client',
        date: e.date || '',
        startTime: e.startTime || '09:00',
        endTime: e.endTime || '17:00',
        venue: e.venue || e.location || '',
        status: e.status || 'PENDING',
        staffAssigned: e.shifts?.length || 0,
        staffRequired: e.staffRequired || 0,
        eventType: e.eventType || 'General',
      }));

      // Sort by date (newest first)
      mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(mapped);
      applyFilters(mapped, search, filter);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEvents();
    }, [fetchEvents])
  );

  const applyFilters = (data: Event[], searchText: string, filterType: string) => {
    let filtered = [...data];
    const today = new Date().toISOString().split('T')[0];

    // Apply filter
    switch (filterType) {
      case 'today':
        filtered = filtered.filter(e => e.date === today);
        break;
      case 'upcoming':
        filtered = filtered.filter(e => 
          new Date(e.date) >= new Date(today) && e.status !== 'COMPLETED'
        );
        break;
      case 'completed':
        filtered = filtered.filter(e => e.status === 'COMPLETED');
        break;
    }

    // Apply search
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(lower) ||
        e.client.toLowerCase().includes(lower) ||
        e.venue.toLowerCase().includes(lower)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    applyFilters(events, text, filter);
  };

  const handleFilter = (f: typeof filter) => {
    setFilter(f);
    applyFilters(events, search, f);
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={st.eventCard}
      onPress={() => nav.navigate('ManagerEventDetail', { eventId: item.id })}
    >
      <View style={st.eventHeader}>
        <View style={{ flex: 1 }}>
          <Text style={st.eventTitle}>{item.title}</Text>
          <Text style={st.eventClient}>{item.client}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={st.eventDetails}>
        <View style={st.eventRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={st.eventText}>
            {new Date(item.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })}
          </Text>
        </View>
        <View style={st.eventRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={st.eventText}>{item.startTime} - {item.endTime}</Text>
        </View>
        <View style={st.eventRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={st.eventText} numberOfLines={1}>{item.venue}</Text>
        </View>
      </View>

      <View style={st.eventFooter}>
        <View style={st.eventType}>
          <Text style={st.eventTypeText}>{item.eventType}</Text>
        </View>
        <View style={st.staffInfo}>
          <Ionicons name="people" size={16} color={Colors.primary} />
          <Text style={st.staffText}>
            {item.staffAssigned}/{item.staffRequired}
          </Text>
          {item.staffAssigned < item.staffRequired && (
            <Ionicons name="alert-circle" size={14} color={Colors.warning} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout activeTab="ManagerEvents">
      <View style={st.container}>
        {/* Search Bar */}
        <View style={st.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search events..."
            value={search}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.textMuted}
          />
          {search ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Tabs */}
        <View style={st.filterTabs}>
          {(['all', 'today', 'upcoming', 'completed'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[st.filterTab, filter === f && st.filterTabActive]}
              onPress={() => handleFilter(f)}
            >
              <Text style={[st.filterText, filter === f && st.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events List */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={st.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchEvents(); }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={st.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textMuted} />
              <Text style={st.emptyTitle}>No Events Found</Text>
              <Text style={st.emptyText}>
                {filter === 'all' ? 'No events available' : `No ${filter} events`}
              </Text>
            </View>
          }
        />
      </View>
    </ScreenLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bg = Colors.info;
  let text = status;

  switch (status) {
    case 'CONFIRMED':
      bg = Colors.info;
      text = 'Confirmed';
      break;
    case 'IN_PROGRESS':
      bg = Colors.success;
      text = 'In Progress';
      break;
    case 'COMPLETED':
      bg = Colors.textMuted;
      text = 'Completed';
      break;
    case 'CANCELLED':
      bg = Colors.danger;
      text = 'Cancelled';
      break;
    case 'PENDING':
      bg = Colors.warning;
      text = 'Pending';
      break;
  }

  return (
    <View style={[st.badge, { backgroundColor: bg }]}>
      <Text style={st.badgeText}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },

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

  // Event Card
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  eventClient: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  eventDetails: {
    gap: 6,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  eventType: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventTypeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  staffText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
