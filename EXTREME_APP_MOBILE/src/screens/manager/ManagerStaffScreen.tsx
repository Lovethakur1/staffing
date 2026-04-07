import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, Linking, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';
import { ScreenLayout } from '../../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  staffType: string;
  skills: string[];
  rating: number;
  totalEvents: number;
  availabilityStatus: string;
  isActive: boolean;
}

export default function ManagerStaffScreen() {
  const nav = useNavigation<Nav>();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get('/staff');
      const allStaff = Array.isArray(res.data) ? res.data : 
        (res.data?.data || res.data?.staff || []);

      const mapped: StaffMember[] = allStaff.map((s: any) => ({
        id: s.id,
        userId: s.userId,
        name: s.user?.name || s.name || 'Staff',
        email: s.user?.email || s.email || '',
        phone: s.user?.phone || s.phone || '',
        staffType: s.staffType || 'General',
        skills: s.skills || [],
        rating: s.rating || 0,
        totalEvents: s.totalEvents || 0,
        availabilityStatus: s.availabilityStatus || 'AVAILABLE',
        isActive: s.user?.isActive ?? true,
      }));

      // Sort by rating (highest first)
      mapped.sort((a, b) => b.rating - a.rating);
      setStaff(mapped);
      applyFilters(mapped, search, filter);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchStaff();
    }, [fetchStaff])
  );

  const applyFilters = (data: StaffMember[], searchText: string, filterType: string) => {
    let filtered = [...data];

    // Apply filter
    switch (filterType) {
      case 'available':
        filtered = filtered.filter(s => 
          s.availabilityStatus === 'AVAILABLE' && s.isActive
        );
        break;
      case 'unavailable':
        filtered = filtered.filter(s => 
          s.availabilityStatus !== 'AVAILABLE' || !s.isActive
        );
        break;
    }

    // Apply search
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(lower) ||
        s.email.toLowerCase().includes(lower) ||
        s.staffType.toLowerCase().includes(lower) ||
        s.skills.some(skill => skill.toLowerCase().includes(lower))
      );
    }

    setFilteredStaff(filtered);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    applyFilters(staff, text, filter);
  };

  const handleFilter = (f: typeof filter) => {
    setFilter(f);
    applyFilters(staff, search, f);
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = (staffId: string) => {
    nav.navigate('NewChat');
  };

  const renderStaff = ({ item }: { item: StaffMember }) => (
    <View style={st.staffCard}>
      <View style={st.staffHeader}>
        <View style={st.avatar}>
          <Text style={st.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.staffName}>{item.name}</Text>
          <Text style={st.staffType}>{item.staffType}</Text>
        </View>
        <AvailabilityBadge status={item.availabilityStatus} isActive={item.isActive} />
      </View>

      {/* Contact Info */}
      <View style={st.contactInfo}>
        {item.phone && (
          <View style={st.contactRow}>
            <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
            <Text style={st.contactText}>{item.phone}</Text>
          </View>
        )}
        {item.email && (
          <View style={st.contactRow}>
            <Ionicons name="mail-outline" size={14} color={Colors.textSecondary} />
            <Text style={st.contactText} numberOfLines={1}>{item.email}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={st.statsRow}>
        <View style={st.stat}>
          <Ionicons name="star" size={14} color={Colors.warning} />
          <Text style={st.statText}>{item.rating.toFixed(1)}</Text>
        </View>
        <View style={st.stat}>
          <Ionicons name="calendar" size={14} color={Colors.primary} />
          <Text style={st.statText}>{item.totalEvents} events</Text>
        </View>
      </View>

      {/* Skills */}
      {item.skills.length > 0 && (
        <View style={st.skillsRow}>
          {item.skills.slice(0, 3).map((skill, i) => (
            <View key={i} style={st.skillTag}>
              <Text style={st.skillText}>{skill}</Text>
            </View>
          ))}
          {item.skills.length > 3 && (
            <Text style={st.moreSkills}>+{item.skills.length - 3}</Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={st.actions}>
        {item.phone && (
          <TouchableOpacity style={st.actionBtn} onPress={() => handleCall(item.phone)}>
            <Ionicons name="call" size={18} color={Colors.primary} />
            <Text style={st.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={st.actionBtn} onPress={() => handleMessage(item.id)}>
          <Ionicons name="chatbubble" size={18} color={Colors.primary} />
          <Text style={st.actionText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={st.actionBtn} 
          onPress={() => nav.navigate('ManagerStaffDetail', { staffId: item.id })}
        >
          <Ionicons name="person" size={18} color={Colors.primary} />
          <Text style={st.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && staff.length === 0) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenLayout activeTab="ManagerStaff">
      <View style={st.container}>
        {/* Search Bar */}
        <View style={st.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search staff by name, skill..."
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
          {(['all', 'available', 'unavailable'] as const).map(f => (
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

        {/* Stats Summary */}
        <View style={st.summary}>
          <Text style={st.summaryText}>
            {filteredStaff.length} staff members
          </Text>
          <Text style={st.summarySubtext}>
            {staff.filter(s => s.availabilityStatus === 'AVAILABLE').length} available
          </Text>
        </View>

        {/* Staff List */}
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          renderItem={renderStaff}
          contentContainerStyle={st.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchStaff(); }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={st.emptyState}>
              <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
              <Text style={st.emptyTitle}>No Staff Found</Text>
              <Text style={st.emptyText}>
                {search ? 'Try a different search' : 'No staff available'}
              </Text>
            </View>
          }
        />
      </View>
    </ScreenLayout>
  );
}

function AvailabilityBadge({ status, isActive }: { status: string; isActive: boolean }) {
  let bg = Colors.success;
  let text = 'Available';

  if (!isActive) {
    bg = Colors.danger;
    text = 'Inactive';
  } else if (status === 'BUSY' || status === 'ON_SHIFT') {
    bg = Colors.warning;
    text = 'On Shift';
  } else if (status === 'UNAVAILABLE') {
    bg = Colors.textMuted;
    text = 'Unavailable';
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

  // Summary
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summaryText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  summarySubtext: { fontSize: 13, color: Colors.success },

  // List
  list: {
    padding: 16,
    paddingTop: 8,
  },

  // Staff Card
  staffCard: {
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
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  staffName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  staffType: { fontSize: 13, color: Colors.textSecondary },

  // Contact
  contactInfo: { marginBottom: 12 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: { fontSize: 13, color: Colors.textSecondary },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  // Skills
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillText: { fontSize: 11, color: Colors.primary, fontWeight: '500' },
  moreSkills: { fontSize: 11, color: Colors.textMuted, alignSelf: 'center' },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  actionText: { fontSize: 12, fontWeight: '500', color: Colors.primary },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.white },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
});
