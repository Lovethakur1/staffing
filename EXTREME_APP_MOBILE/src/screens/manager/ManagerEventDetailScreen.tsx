import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme';

type RouteType = RouteProp<RootStackParamList, 'ManagerEventDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  shiftId: string;
}

interface EventDetail {
  id: string;
  title: string;
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  location: string;
  status: string;
  eventType: string;
  staffRequired: number;
  dressCode?: string;
  specialRequirements?: string;
  contactOnSite?: string;
  contactOnSitePhone?: string;
  staff: StaffMember[];
}

export default function ManagerEventDetailScreen() {
  const route = useRoute<RouteType>();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'notes'>('overview');

  const fetchEvent = useCallback(async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      const e = res.data;

      const staffList: StaffMember[] = (e.shifts || []).map((shift: any) => ({
        id: shift.staff?.id || shift.staffId,
        name: shift.staff?.user?.name || shift.staff?.name || 'Staff',
        role: shift.role || shift.staff?.staffType || 'General',
        phone: shift.staff?.user?.phone || shift.staff?.phone || '',
        email: shift.staff?.user?.email || shift.staff?.email || '',
        status: shift.status || 'PENDING',
        checkInTime: shift.clockIn,
        checkOutTime: shift.clockOut,
        shiftId: shift.id,
      }));

      setEvent({
        id: e.id,
        title: e.title || e.eventName || 'Event',
        client: e.client?.user?.name || 'Client',
        clientPhone: e.client?.user?.phone,
        clientEmail: e.client?.user?.email,
        date: e.date || '',
        startTime: e.startTime || '09:00',
        endTime: e.endTime || '17:00',
        venue: e.venue || e.location || '',
        location: e.location || e.address || '',
        status: e.status || 'PENDING',
        eventType: e.eventType || 'General',
        staffRequired: e.staffRequired || 0,
        dressCode: e.dressCode,
        specialRequirements: e.specialRequirements || e.notes,
        contactOnSite: e.contactOnSite,
        contactOnSitePhone: e.contactOnSitePhone,
        staff: staffList,
      });
    } catch (err) {
      console.error('Failed to fetch event:', err);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleCallStaff = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleMessageStaff = (staffId: string, staffName: string) => {
    // Navigate to chat with this staff member
    nav.navigate('NewChat');
  };

  const handleCheckInStaff = async (shiftId: string, staffName: string) => {
    Alert.alert(
      'Check In Staff',
      `Manual check-in for ${staffName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            try {
              await api.post(`/shifts/${shiftId}/clock-in`, { manual: true });
              await fetchEvent();
              Alert.alert('Success', `${staffName} has been checked in`);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to check in');
            }
          },
        },
      ]
    );
  };

  const handleCheckOutStaff = async (shiftId: string, staffName: string) => {
    Alert.alert(
      'Check Out Staff',
      `Manual check-out for ${staffName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            try {
              await api.post(`/shifts/${shiftId}/clock-out`, { manual: true });
              await fetchEvent();
              Alert.alert('Success', `${staffName} has been checked out`);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to check out');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={st.center}>
        <Text>Event not found</Text>
      </View>
    );
  }

  const checkedInCount = event.staff.filter(s => 
    s.checkInTime || s.status === 'IN_PROGRESS' || s.status === 'ARRIVED'
  ).length;
  const progressPercent = event.staff.length > 0 
    ? (checkedInCount / event.staff.length) * 100 
    : 0;

  return (
    <View style={[st.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={st.headerSubtitle}>{event.client}</Text>
        </View>
        <StatusBadge status={event.status} />
      </View>

      {/* Event Summary Bar */}
      <View style={st.summaryBar}>
        <View style={st.summaryItem}>
          <Ionicons name="calendar" size={16} color={Colors.primary} />
          <Text style={st.summaryText}>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })}
          </Text>
        </View>
        <View style={st.summaryItem}>
          <Ionicons name="time" size={16} color={Colors.primary} />
          <Text style={st.summaryText}>{event.startTime} - {event.endTime}</Text>
        </View>
        <View style={st.summaryItem}>
          <Ionicons name="people" size={16} color={Colors.primary} />
          <Text style={st.summaryText}>{checkedInCount}/{event.staff.length}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={st.progressContainer}>
        <Text style={st.progressLabel}>Staff Check-in Progress</Text>
        <View style={st.progressBar}>
          <View style={[st.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={st.progressText}>{Math.round(progressPercent)}% checked in</Text>
      </View>

      {/* Tabs */}
      <View style={st.tabs}>
        {(['overview', 'staff', 'notes'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[st.tab, activeTab === tab && st.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[st.tabText, activeTab === tab && st.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={st.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchEvent(); }}
            colors={[Colors.primary]}
          />
        }
      >
        {activeTab === 'overview' && (
          <>
            {/* Event Info */}
            <View style={st.card}>
              <Text style={st.cardTitle}>Event Details</Text>
              <InfoRow icon="pin" label="Venue" value={event.venue} />
              <InfoRow icon="location" label="Address" value={event.location} />
              <InfoRow icon="pricetag" label="Event Type" value={event.eventType} />
              {event.dressCode && (
                <InfoRow icon="shirt" label="Dress Code" value={event.dressCode} />
              )}
            </View>

            {/* Client Contact */}
            <View style={st.card}>
              <Text style={st.cardTitle}>Client Contact</Text>
              <View style={st.contactRow}>
                <View style={{ flex: 1 }}>
                  <Text style={st.contactName}>{event.client}</Text>
                  {event.clientPhone && (
                    <Text style={st.contactInfo}>{event.clientPhone}</Text>
                  )}
                  {event.clientEmail && (
                    <Text style={st.contactInfo}>{event.clientEmail}</Text>
                  )}
                </View>
                {event.clientPhone && (
                  <TouchableOpacity 
                    style={st.callBtn}
                    onPress={() => Linking.openURL(`tel:${event.clientPhone}`)}
                  >
                    <Ionicons name="call" size={20} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* On-Site Contact */}
            {event.contactOnSite && (
              <View style={st.card}>
                <Text style={st.cardTitle}>On-Site Contact</Text>
                <View style={st.contactRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.contactName}>{event.contactOnSite}</Text>
                    {event.contactOnSitePhone && (
                      <Text style={st.contactInfo}>{event.contactOnSitePhone}</Text>
                    )}
                  </View>
                  {event.contactOnSitePhone && (
                    <TouchableOpacity 
                      style={st.callBtn}
                      onPress={() => Linking.openURL(`tel:${event.contactOnSitePhone}`)}
                    >
                      <Ionicons name="call" size={20} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'staff' && (
          <>
            {/* Staff Needed Warning */}
            {event.staff.length < event.staffRequired && (
              <View style={st.warningCard}>
                <Ionicons name="warning" size={20} color={Colors.warning} />
                <Text style={st.warningText}>
                  {event.staffRequired - event.staff.length} more staff needed
                </Text>
              </View>
            )}

            {/* Staff List */}
            {event.staff.length === 0 ? (
              <View style={st.emptyState}>
                <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
                <Text style={st.emptyText}>No staff assigned</Text>
              </View>
            ) : (
              event.staff.map(staff => (
                <View key={staff.id} style={st.staffCard}>
                  <View style={st.staffHeader}>
                    <View style={st.staffAvatar}>
                      <Text style={st.staffInitial}>
                        {staff.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.staffName}>{staff.name}</Text>
                      <Text style={st.staffRole}>{staff.role}</Text>
                    </View>
                    <StaffStatusBadge status={staff.status} checkedIn={!!staff.checkInTime} />
                  </View>

                  {/* Check-in/out times */}
                  {staff.checkInTime && (
                    <View style={st.timeRow}>
                      <Ionicons name="log-in" size={14} color={Colors.success} />
                      <Text style={st.timeText}>
                        In: {new Date(staff.checkInTime).toLocaleTimeString()}
                      </Text>
                      {staff.checkOutTime && (
                        <>
                          <Ionicons name="log-out" size={14} color={Colors.textMuted} />
                          <Text style={st.timeText}>
                            Out: {new Date(staff.checkOutTime).toLocaleTimeString()}
                          </Text>
                        </>
                      )}
                    </View>
                  )}

                  {/* Actions */}
                  <View style={st.staffActions}>
                    {staff.phone && (
                      <TouchableOpacity 
                        style={st.actionBtn}
                        onPress={() => handleCallStaff(staff.phone)}
                      >
                        <Ionicons name="call" size={18} color={Colors.primary} />
                        <Text style={st.actionText}>Call</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={st.actionBtn}
                      onPress={() => handleMessageStaff(staff.id, staff.name)}
                    >
                      <Ionicons name="chatbubble" size={18} color={Colors.primary} />
                      <Text style={st.actionText}>Message</Text>
                    </TouchableOpacity>
                    {!staff.checkInTime && (
                      <TouchableOpacity 
                        style={[st.actionBtn, st.actionBtnPrimary]}
                        onPress={() => handleCheckInStaff(staff.shiftId, staff.name)}
                      >
                        <Ionicons name="log-in" size={18} color={Colors.white} />
                        <Text style={[st.actionText, { color: Colors.white }]}>Check In</Text>
                      </TouchableOpacity>
                    )}
                    {staff.checkInTime && !staff.checkOutTime && (
                      <TouchableOpacity 
                        style={[st.actionBtn, st.actionBtnDanger]}
                        onPress={() => handleCheckOutStaff(staff.shiftId, staff.name)}
                      >
                        <Ionicons name="log-out" size={18} color={Colors.white} />
                        <Text style={[st.actionText, { color: Colors.white }]}>Check Out</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'notes' && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Special Requirements</Text>
            <Text style={st.noteText}>
              {event.specialRequirements || 'No special requirements noted.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={st.infoRow}>
      <Ionicons name={icon as any} size={16} color={Colors.textSecondary} />
      <Text style={st.infoLabel}>{label}:</Text>
      <Text style={st.infoValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bg = Colors.info;
  let text = status;

  switch (status) {
    case 'CONFIRMED': bg = Colors.info; text = 'Confirmed'; break;
    case 'IN_PROGRESS': bg = Colors.success; text = 'Live'; break;
    case 'COMPLETED': bg = Colors.textMuted; text = 'Done'; break;
    case 'CANCELLED': bg = Colors.danger; text = 'Cancelled'; break;
    case 'PENDING': bg = Colors.warning; text = 'Pending'; break;
  }

  return (
    <View style={[st.badge, { backgroundColor: bg }]}>
      <Text style={st.badgeText}>{text}</Text>
    </View>
  );
}

function StaffStatusBadge({ status, checkedIn }: { status: string; checkedIn: boolean }) {
  let bg = Colors.info;
  let text = 'Pending';

  if (checkedIn || status === 'IN_PROGRESS' || status === 'ARRIVED') {
    bg = Colors.success;
    text = 'Checked In';
  } else if (status === 'COMPLETED') {
    bg = Colors.textMuted;
    text = 'Done';
  } else if (status === 'TRAVEL_TO_VENUE') {
    bg = Colors.info;
    text = 'Travelling';
  } else if (status === 'CONFIRMED') {
    bg = Colors.warning;
    text = 'Not Arrived';
  }

  return (
    <View style={[st.badge, { backgroundColor: bg }]}>
      <Text style={st.badgeText}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary },

  // Summary Bar
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  // Progress
  progressContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressText: { fontSize: 12, color: Colors.success, marginTop: 4, textAlign: 'right' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },

  content: { padding: 16 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, width: 80 },
  infoValue: { fontSize: 13, color: Colors.textPrimary, flex: 1 },

  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  contactInfo: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Warning
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  warningText: { fontSize: 14, color: Colors.warning, fontWeight: '500' },

  // Staff Card
  staffCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffInitial: { fontSize: 16, fontWeight: '700', color: Colors.white },
  staffName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  staffRole: { fontSize: 12, color: Colors.textSecondary },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeText: { fontSize: 12, color: Colors.textSecondary },
  staffActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnDanger: { backgroundColor: Colors.danger },
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
    paddingVertical: 48,
  },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },

  // Notes
  noteText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
});
