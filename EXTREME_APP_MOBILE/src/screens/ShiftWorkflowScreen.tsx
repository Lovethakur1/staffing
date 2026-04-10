import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Vibration,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api, { API_BASE_URL } from '../config/api';
import { getDeviceInfo } from '../utils/deviceInfo';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../services/backgroundLocation';
import { Shift, ShiftStatus, RootStackParamList } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

type RouteType = RouteProp<RootStackParamList, 'ShiftWorkflow'>;

// Ordered workflow steps
const WORKFLOW_STEPS: { key: ShiftStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'CONFIRMED',       label: 'Shift Confirmed',  icon: 'checkmark-circle-outline' },
  { key: 'TRAVEL_TO_VENUE', label: 'Travel to Venue',  icon: 'car-outline' },
  { key: 'ARRIVED',         label: 'Arrived at Venue',  icon: 'location-outline' },
  { key: 'IN_PROGRESS',     label: 'Checked In',        icon: 'play-circle-outline' },
  { key: 'BREAK',           label: 'Break',              icon: 'cafe-outline' },
  { key: 'COMPLETED',       label: 'Checked Out',        icon: 'checkmark-done-circle-outline' },
  { key: 'TRAVEL_HOME',     label: 'Travel Home',        icon: 'home-outline' },
];

function getStepIndex(status: ShiftStatus): number {
  const map: Record<string, number> = {
    PENDING: -1, REJECTED: -1, YET_TO_START: -1,
    CONFIRMED: 0, TRAVEL_TO_VENUE: 1, ARRIVED: 2,
    IN_PROGRESS: 3, ONGOING: 3, BREAK: 4, COMPLETED: 5, TRAVEL_HOME: 6,
  };
  return map[status] ?? -1;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ShiftWorkflowScreen() {
  const route = useRoute<RouteType>();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { shiftId } = route.params;
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    fetchShift();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (locationSub.current) locationSub.current.remove();
    };
  }, [shiftId]);

  useEffect(() => {
    if (shift?.clockIn && !shift.clockOut) {
      startTimer(shift.clockIn);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [shift?.clockIn, shift?.clockOut]);

  function startTimer(clockInTime: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Date.now() - new Date(clockInTime).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);
  }

  async function fetchShift() {
    try {
      const res = await api.get(`/shifts/${shiftId}`);
      setShift(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load shift details.');
      nav.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function getLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    } catch {
      return null;
    }
  }

  async function startLocationTracking() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      locationSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 50, timeInterval: 30000 },
        async (loc) => {
          try {
            await api.post(`/shifts/${shiftId}/update-location`, {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            });
          } catch {}
        }
      );
    } catch {}
  }

  function stopLocationTracking() {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
  }

  async function performAction(action: string, endpoint: string) {
    setActionLoading(action);
    try {
      const location = await getLocation();
      const device = await getDeviceInfo();
      await api.post(`/shifts/${shiftId}/${endpoint}`, { ...location, ...device });
      Vibration.vibrate(100);

      if (endpoint === 'start-travel' || endpoint === 'travel-home') {
        startLocationTracking();
        startBackgroundLocationTracking(shiftId, API_BASE_URL).catch(() => {});
      }
      if (endpoint === 'arrive' || endpoint === 'end-travel') {
        stopLocationTracking();
        stopBackgroundLocationTracking().catch(() => {});
      }

      await fetchShift();
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.error || 'Action failed.';
      if (code === 'DEVICE_MISMATCH') {
        Alert.alert(
          'Device Mismatch',
          msg + '\n\nWould you like to request a device change?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Request Change',
              onPress: async () => {
                try {
                  const device = await getDeviceInfo();
                  await api.post('/shifts/device/request-change', {
                    reason: `Requesting from ${device.deviceName} (${device.deviceModel})`,
                  });
                  Alert.alert('Request Sent', 'Your device change request has been sent to admin for approval.');
                } catch (e: any) {
                  Alert.alert('Error', e?.response?.data?.error || 'Failed to send request.');
                }
              },
            },
          ]
        );
      } else if (code === 'TOO_FAR_FROM_VENUE') {
        const distance = err?.response?.data?.distance;
        Alert.alert(
          'Too Far From Venue',
          `You are ${distance ? distance + 'm' : 'too far'} from the event venue. You must be within 50m to check in.`,
        );
      } else if (code === 'TOO_EARLY_FOR_CHECKIN') {
        const reportTime = err?.response?.data?.reportTime;
        Alert.alert(
          'Too Early',
          `Check-in is not open yet. Your report time is ${reportTime || 'not set'}. Check-in opens 30 minutes before your report time.`,
        );
      } else if (code === 'LOCATION_REQUIRED') {
        Alert.alert('Location Required', 'Please enable GPS and allow location access to check in.');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAcceptShift() {
    setActionLoading('accept');
    try {
      await api.put(`/shifts/${shiftId}/status`, { status: 'CONFIRMED' });
      Vibration.vibrate(100);
      await fetchShift();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to accept shift.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectShift() {
    Alert.alert('Reject Shift', 'Are you sure you want to reject this shift?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading('reject');
          try {
            await api.put(`/shifts/${shiftId}/status`, { status: 'REJECTED' });
            await fetchShift();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to reject.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }

  if (loading || !shift) {
    return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const stepIdx = getStepIndex(shift.status);
  const isCompleted = shift.status === 'COMPLETED' && !shift.travelEnabled;
  const isFullyDone = shift.status === 'COMPLETED' || (shift.travelHomeEnd != null);

  function renderTimeline() {
    const steps = WORKFLOW_STEPS.filter(step => {
      // Hide travel steps if travel not enabled
      if (!shift!.travelEnabled && (step.key === 'TRAVEL_TO_VENUE' || step.key === 'TRAVEL_HOME')) return false;
      return true;
    });

    return (
      <View style={s.timeline}>
        {steps.map((step, i) => {
          const currentIdx = getStepIndex(shift!.status);
          const thisIdx = getStepIndex(step.key);
          const isDone = thisIdx < currentIdx || (thisIdx === currentIdx && step.key !== 'BREAK');
          const isCurrent = thisIdx === currentIdx;
          const isBreakActive = shift!.status === 'BREAK' && step.key === 'BREAK';

          let dotColor = Colors.border;
          if (isDone || isFullyDone) dotColor = Colors.success;
          else if (isCurrent || isBreakActive) dotColor = Colors.primary;

          return (
            <View key={step.key} style={s.timelineStep}>
              <View style={s.timelineLeft}>
                <View style={[s.dot, { backgroundColor: dotColor }]}>
                  {isDone || isFullyDone ? (
                    <Ionicons name="checkmark" size={12} color={Colors.white} />
                  ) : isCurrent || isBreakActive ? (
                    <View style={s.dotPulse} />
                  ) : null}
                </View>
                {i < steps.length - 1 && (
                  <View style={[s.line, (isDone || isFullyDone) && { backgroundColor: Colors.success }]} />
                )}
              </View>
              <View style={s.timelineContent}>
                <View style={s.timelineRow}>
                  <Ionicons name={step.icon} size={18} color={isCurrent || isBreakActive ? Colors.primary : isDone ? Colors.success : Colors.textMuted} />
                  <Text style={[
                    s.timelineLabel,
                    isCurrent && { color: Colors.primary, fontWeight: '700' },
                    (isDone || isFullyDone) && { color: Colors.success },
                  ]}>
                    {step.label}
                  </Text>
                </View>
                {step.key === 'TRAVEL_TO_VENUE' && shift!.travelStartTime && (
                  <Text style={s.timelineTime}>{new Date(shift!.travelStartTime).toLocaleTimeString()}</Text>
                )}
                {step.key === 'ARRIVED' && shift!.travelArrivalTime && (
                  <Text style={s.timelineTime}>{new Date(shift!.travelArrivalTime).toLocaleTimeString()}</Text>
                )}
                {step.key === 'IN_PROGRESS' && shift!.clockIn && (
                  <Text style={s.timelineTime}>Checked in: {new Date(shift!.clockIn).toLocaleTimeString()}</Text>
                )}
                {step.key === 'COMPLETED' && shift!.clockOut && (
                  <Text style={s.timelineTime}>Checked out: {new Date(shift!.clockOut).toLocaleTimeString()}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  function renderBreaks() {
    if (!shift?.breaks?.length) return null;

    return (
      <View style={s.breakSection}>
        <Text style={s.breakTitle}>Break Log</Text>
        {shift.breaks.map((b, i) => (
          <View key={b.id} style={s.breakRow}>
            <Ionicons name="cafe" size={14} color={Colors.statusBreak} />
            <Text style={s.breakText}>
              Break {i + 1}: {new Date(b.startTime).toLocaleTimeString()}
              {b.endTime ? ` – ${new Date(b.endTime).toLocaleTimeString()}` : ' (active)'}
              {b.durationMinutes != null ? ` (${Math.round(b.durationMinutes)} min)` : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  function renderActionButton() {
    const status = shift!.status;

    // Pending → Accept / Reject
    if (status === 'PENDING') {
      return (
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnDanger]}
            onPress={handleRejectShift}
            disabled={actionLoading === 'reject'}
          >
            {actionLoading === 'reject' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="close-circle" size={22} color={Colors.white} />
                <Text style={s.actionBtnText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnSuccess]}
            onPress={handleAcceptShift}
            disabled={actionLoading === 'accept'}
          >
            {actionLoading === 'accept' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
                <Text style={s.actionBtnText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // Confirmed → Start Travel (if enabled) or Check In
    if (status === 'CONFIRMED' || status === 'YET_TO_START') {
      if (shift!.travelEnabled) {
        return (
          <ActionButton
            label="Start Travel"
            icon="car"
            color={Colors.statusTravel}
            loading={actionLoading === 'start-travel'}
            onPress={async () => {
              await performAction('start-travel', 'start-travel');
              nav.navigate('LiveMap', {
                shiftId: shift!.id,
                eventLat: shift!.event?.locationLat,
                eventLng: shift!.event?.locationLng,
                eventTitle: shift!.event?.title,
                eventAddress: shift!.event?.location || shift!.event?.venue,
              });
            }}
          />
        );
      }
      return (
        <ActionButton
          label="Check In"
          icon="log-in"
          color={Colors.success}
          loading={actionLoading === 'clock-in'}
          onPress={() => performAction('clock-in', 'clock-in')}
        />
      );
    }

    // Traveling → Reached Location
    if (status === 'TRAVEL_TO_VENUE') {
      return (
        <ActionButton
          label="Reached Location"
          icon="location"
          color={Colors.statusArrived}
          loading={actionLoading === 'arrive'}
          onPress={() => performAction('arrive', 'arrive')}
        />
      );
    }

    // Arrived → Check In
    if (status === 'ARRIVED') {
      return (
        <ActionButton
          label="Check In"
          icon="log-in"
          color={Colors.success}
          loading={actionLoading === 'clock-in'}
          onPress={() => performAction('clock-in', 'clock-in')}
        />
      );
    }

    // In Progress → Break or Check Out
    if (status === 'IN_PROGRESS' || status === 'ONGOING') {
      return (
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: Colors.statusBreak }]}
            onPress={() => performAction('break-in', 'break-in')}
            disabled={actionLoading === 'break-in'}
          >
            {actionLoading === 'break-in' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="cafe" size={22} color={Colors.white} />
                <Text style={s.actionBtnText}>Break</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: Colors.danger }]}
            onPress={() => {
              Alert.alert('Check Out', 'Are you sure you want to check out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Check Out', style: 'destructive', onPress: () => performAction('clock-out', 'clock-out') },
              ]);
            }}
            disabled={actionLoading === 'clock-out'}
          >
            {actionLoading === 'clock-out' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="log-out" size={22} color={Colors.white} />
                <Text style={s.actionBtnText}>Check Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // On Break → End Break
    if (status === 'BREAK') {
      return (
        <ActionButton
          label="End Break"
          icon="play"
          color={Colors.primary}
          loading={actionLoading === 'break-out'}
          onPress={() => performAction('break-out', 'break-out')}
        />
      );
    }

    // Completed → Start Return Travel (if enabled and not already traveled home)
    if (status === 'COMPLETED' && shift!.travelEnabled && !shift!.travelHomeStart) {
      return (
        <ActionButton
          label="Start Return Travel"
          icon="car"
          color={Colors.statusTravel}
          loading={actionLoading === 'travel-home'}
          onPress={async () => {
            await performAction('travel-home', 'travel-home');
            nav.navigate('LiveMap', {
              shiftId: shift!.id,
              eventLat: shift!.event?.locationLat,
              eventLng: shift!.event?.locationLng,
              eventTitle: shift!.event?.title,
              eventAddress: shift!.event?.location || shift!.event?.venue,
            });
          }}
        />
      );
    }

    // Traveling Home → Reached End Point
    if (status === 'TRAVEL_HOME') {
      return (
        <ActionButton
          label="Reached End Point"
          icon="home"
          color={Colors.success}
          loading={actionLoading === 'end-travel'}
          onPress={() => performAction('end-travel', 'end-travel')}
        />
      );
    }

    return null;
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{shift.event?.title || 'Shift'}</Text>
          <Text style={s.headerSubtitle}>{shift.role || 'Staff'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Event Info */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Ionicons name="calendar" size={18} color={Colors.primary} />
            <Text style={s.infoText}>
              {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="time" size={18} color={Colors.primary} />
            <Text style={s.infoText}>{shift.startTime} – {shift.endTime}</Text>
          </View>
          {shift.reportTime && (
            <View style={[s.infoRow, { backgroundColor: Colors.primary + '15', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }]}>
              <Ionicons name="alarm" size={18} color={Colors.primary} />
              <Text style={[s.infoText, { color: Colors.primary, fontWeight: '700' }]}>
                Report by: {shift.reportTime}
              </Text>
            </View>
          )}
          {shift.event?.venue && (
            <View style={s.infoRow}>
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={s.infoText}>{shift.event.venue}</Text>
            </View>
          )}
          {shift.event?.location && (
            <View style={s.infoRow}>
              <Ionicons name="navigate" size={18} color={Colors.primary} />
              <Text style={s.infoText} numberOfLines={2}>{shift.event.location}</Text>
            </View>
          )}
          {shift.event?.dressCode && (
            <View style={s.infoRow}>
              <Ionicons name="shirt" size={18} color={Colors.primary} />
              <Text style={s.infoText}>Dress: {shift.event.dressCode}</Text>
            </View>
          )}
          {shift.event?.contactOnSite && (
            <View style={s.infoRow}>
              <Ionicons name="call" size={18} color={Colors.primary} />
              <Text style={s.infoText}>{shift.event.contactOnSite} {shift.event.contactOnSitePhone ? `• ${shift.event.contactOnSitePhone}` : ''}</Text>
            </View>
          )}
          {shift.travelEnabled && (
            <View style={[s.infoRow, s.travelEnabledBadge]}>
              <Ionicons name="car" size={16} color={Colors.statusTravel} />
              <Text style={[s.infoText, { color: Colors.statusTravel, fontWeight: '600' }]}>Travel Tracking Enabled</Text>
            </View>
          )}

          {/* Live Map button - show during travel or when event has coordinates */}
          {(['TRAVEL_TO_VENUE', 'TRAVEL_HOME', 'CONFIRMED', 'ARRIVED'].includes(shift.status)) && (
            <TouchableOpacity
              style={s.mapBtn}
              onPress={() => nav.navigate('LiveMap', {
                shiftId: shift.id,
                eventLat: shift.event?.locationLat,
                eventLng: shift.event?.locationLng,
                eventTitle: shift.event?.title,
                eventAddress: shift.event?.location || shift.event?.venue,
              })}
            >
              <Ionicons name="map" size={18} color={Colors.white} />
              <Text style={s.mapBtnText}>
                {shift.status === 'TRAVEL_TO_VENUE' || shift.status === 'TRAVEL_HOME' ? 'Live Map & Navigate' : 'View Map'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Live Timer */}
        {shift.clockIn && !shift.clockOut && (
          <View style={s.timerCard}>
            <Text style={s.timerLabel}>Working Time</Text>
            <Text style={s.timerValue}>{elapsedTime}</Text>
            {shift.status === 'BREAK' && (
              <View style={s.breakActiveTag}>
                <Ionicons name="cafe" size={14} color={Colors.white} />
                <Text style={s.breakActiveText}>On Break</Text>
              </View>
            )}
          </View>
        )}

        {/* Completed Summary */}
        {isFullyDone && shift.totalHours != null && (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Shift Summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Total Hours</Text>
              <Text style={s.summaryValue}>{shift.totalHours.toFixed(1)}h</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Hourly Rate</Text>
              <Text style={s.summaryValue}>${shift.hourlyRate.toFixed(2)}/hr</Text>
            </View>
            <View style={[s.summaryRow, s.summaryTotal]}>
              <Text style={s.summaryTotalLabel}>Total Pay</Text>
              <Text style={s.summaryTotalValue}>${(shift.totalPay ?? 0).toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        {renderTimeline()}

        {/* Breaks */}
        {renderBreaks()}
      </ScrollView>

      {/* Bottom Action */}
      <View style={[s.bottomAction, { paddingBottom: insets.bottom || Spacing.xl }]}>
        {renderActionButton()}
      </View>
    </View>
  );
}

function ActionButton({ label, icon, color, loading, onPress }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.fullBtn, { backgroundColor: color }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <>
          <Ionicons name={icon} size={24} color={Colors.white} />
          <Text style={s.fullBtnText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.sm },
  headerCenter: { marginLeft: Spacing.sm, flex: 1 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  scrollContent: { padding: Spacing.lg, paddingBottom: 140 },
  // Info card
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSize.md, color: Colors.textPrimary, flex: 1 },
  travelEnabledBadge: {
    backgroundColor: '#FDE8E4',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  mapBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  // Timer
  timerCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  timerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  timerValue: { color: Colors.white, fontSize: 48, fontWeight: '700', fontVariant: ['tabular-nums'], marginTop: Spacing.xs },
  breakActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.statusBreak,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  breakActiveText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  // Summary
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  summaryTotalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  summaryTotalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.success },
  // Timeline
  timeline: { marginTop: Spacing.lg },
  timelineStep: { flexDirection: 'row', minHeight: 56 },
  timelineLeft: { width: 32, alignItems: 'center' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 2 },
  timelineContent: { flex: 1, marginLeft: Spacing.sm, paddingBottom: Spacing.md },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timelineLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  timelineTime: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2, marginLeft: 26 },
  // Break log
  breakSection: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  breakText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  // Bottom action
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionBtnDanger: { backgroundColor: Colors.danger },
  actionBtnSuccess: { backgroundColor: Colors.success },
  actionBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  fullBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
