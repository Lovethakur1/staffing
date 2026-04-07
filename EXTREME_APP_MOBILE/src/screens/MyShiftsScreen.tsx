import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, Modal, Alert, Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Shift, RootStackParamList } from '../types';
import { Colors } from '../theme';
import { ScreenLayout } from '../components';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface UnavailabilityItem {
  id: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export default function MyShiftsScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<UnavailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [calView, setCalView] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [subTab, setSubTab] = useState<'unavailability' | 'portal'>('portal');

  // Unavailability modal
  const [showUnavailModal, setShowUnavailModal] = useState(false);
  const [unavailForm, setUnavailForm] = useState({
    startDate: '', endDate: '', startTime: '09:00 AM', endTime: '05:00 PM', reason: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [shiftsRes, unavailRes] = await Promise.all([
        api.get('/shifts'),
        api.get('/unavailability'),
      ]);
      const shiftData: Shift[] = shiftsRes.data?.data || [];
      shiftData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setShifts(shiftData);
      setUnavailabilities(unavailRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const completed = shifts.filter(s => s.status === 'COMPLETED');
  const confirmed = shifts.filter(s => s.status === 'CONFIRMED');
  const pending = shifts.filter(s => s.status === 'PENDING');
  const totalHours = completed.reduce((sum, s) => sum + (s.totalHours || 0), 0);
  const totalEarnings = completed.reduce((sum, s) => sum + (s.totalPay || 0), 0);

  const upcomingShifts = shifts.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d >= now && !['COMPLETED', 'REJECTED'].includes(s.status);
  });

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Also get prev month days to fill leading cells
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrentMonth: true });
  }
  // Next month leading days
  const remaining = 42 - calendarDays.length; // 6 rows x 7
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, isCurrentMonth: false });
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => setCurrentMonth(new Date());

  function getShiftsForDay(day: number): Shift[] {
    return shifts.filter(sh => {
      const sd = new Date(sh.date);
      return sd.getDate() === day && sd.getMonth() === month && sd.getFullYear() === year;
    });
  }

  function getUnavailabilitiesForDay(day: number): UnavailabilityItem[] {
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);

    return unavailabilities.filter(u => {
      const s = new Date(u.startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(u.endDate);
      e.setHours(0, 0, 0, 0);
      return targetDate >= s && targetDate <= e;
    });
  }

  async function handleDayPress(day: number) {
    if (subTab !== 'unavailability' || saving || deletingId) return;

    const unavailForItem = getUnavailabilitiesForDay(day);
    if (unavailForItem.length > 0) {
      handleDeleteUnavailability(unavailForItem[0].id);
    } else {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
      try {
        setSaving(true);
        await api.post('/unavailability', {
          startDate: dateStr,
          endDate: dateStr,
          startTime: '00:00',
          endTime: '23:59',
          reason: 'Unavailable (Calendar)',
        });
        fetchData();
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.error || 'Failed to set unavailability');
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleSaveUnavailability() {
    if (!unavailForm.startDate || !unavailForm.endDate) {
      Alert.alert('Error', 'Please enter start and end dates');
      return;
    }
    try {
      setSaving(true);
      await api.post('/unavailability', {
        startDate: unavailForm.startDate,
        endDate: unavailForm.endDate,
        startTime: unavailForm.startTime,
        endTime: unavailForm.endTime,
        reason: unavailForm.reason || undefined,
      });
      setShowUnavailModal(false);
      setUnavailForm({ startDate: '', endDate: '', startTime: '09:00 AM', endTime: '05:00 PM', reason: '' });
      fetchData();
      Alert.alert('Success', 'Unavailability saved');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUnavailability(id: string) {
    Alert.alert('Delete', 'Remove this unavailability?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setDeletingId(id);
            await api.delete(`/unavailability/${id}`);
            fetchData();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenLayout activeTab="MyShifts" notificationCount={pending.length}>
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="MyShifts" notificationCount={pending.length}>

      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[Colors.primary]} />}
      >
        <Text style={st.pageTitle}>Schedule Management</Text>
        <Text style={st.pageSubtitle}>Manage your shifts and set your unavailability</Text>

        {/* Sub tabs */}
        <View style={st.subTabs}>
          <TouchableOpacity style={[st.subTab, subTab === 'unavailability' && st.subTabActive]} onPress={() => setSubTab('unavailability')}>
            <Text style={st.subTabIcon}>📋</Text>
            <Text style={[st.subTabText, subTab === 'unavailability' && st.subTabTextActive]}>Set Unavailability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.subTab, subTab === 'portal' && st.subTabActive]} onPress={() => setSubTab('portal')}>
            <Text style={st.subTabIcon}>👥</Text>
            <Text style={[st.subTabText, subTab === 'portal' && st.subTabTextActive]}>Staff Portal</Text>
          </TouchableOpacity>
        </View>

        {/* Stat cards */}
        <View style={st.statsGrid}>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar" size={18} color={Colors.info} />
            </View>
            <Text style={st.statNumber}>{shifts.length}</Text>
            <Text style={st.statLabel}>Total Shifts</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            </View>
            <Text style={[st.statNumber, { color: Colors.success }]}>{completed.length}</Text>
            <Text style={st.statLabel}>Completed</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-done" size={18} color={Colors.success} />
            </View>
            <Text style={st.statNumber}>{confirmed.length}</Text>
            <Text style={st.statLabel}>Confirmed</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="alert-circle" size={18} color={Colors.warning} />
            </View>
            <Text style={[st.statNumber, { color: Colors.warning }]}>{pending.length}</Text>
            <Text style={st.statLabel}>Pending</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="time" size={18} color={Colors.info} />
            </View>
            <Text style={[st.statNumber, { color: Colors.info }]}>{Math.round(totalHours)}h</Text>
            <Text style={st.statLabel}>Total Hours</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Text style={{ fontSize: 16 }}>💲</Text>
            </View>
            <Text style={[st.statNumber, { color: Colors.success }]}>${Math.round(totalEarnings)}</Text>
            <Text style={st.statLabel}>Earnings</Text>
          </View>
        </View>

        {/* Search */}
        <View style={st.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search shifts..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Calendar */}
        <View style={st.card}>
          <View style={st.calHeader}>
            <Text style={st.calTitle}>{MONTHS[month]} {year}</Text>
            {(saving || deletingId) && (
              <View style={st.calLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={st.calLoadingText}>{saving ? 'Saving...' : 'Removing...'}</Text>
              </View>
            )}
          </View>

          <View style={st.calControls}>
            {(['Day', 'Week', 'Month'] as const).map(v => (
              <TouchableOpacity key={v} style={[st.calViewBtn, calView === v && st.calViewActive]} onPress={() => setCalView(v)}>
                <Text style={[st.calViewText, calView === v && st.calViewTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={prevMonth}><Ionicons name="chevron-back" size={20} color={Colors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity style={st.todayBtn} onPress={goToday}><Text style={st.todayBtnText}>Today</Text></TouchableOpacity>
            <TouchableOpacity onPress={nextMonth}><Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} /></TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={st.calRow}>
            {DAYS.map(d => <Text key={d} style={st.calDayHeader}>{d}</Text>)}
          </View>

          {/* Calendar grid with shift events */}
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, rowIdx) => (
            <View key={rowIdx} style={st.calWeekRow}>
              {calendarDays.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                const isToday = cell.isCurrentMonth && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const dayShifts = cell.isCurrentMonth ? getShiftsForDay(cell.day) : [];
                const dayUnavail = cell.isCurrentMonth ? getUnavailabilitiesForDay(cell.day) : [];
                const isUnavailable = dayUnavail.length > 0;

                return (
                  <TouchableOpacity
                    key={colIdx}
                    style={[
                      st.calCellBig,
                      isToday && st.calCellToday,
                      isUnavailable && st.calCellUnavailable
                    ]}
                    activeOpacity={subTab === 'unavailability' ? 0.7 : 1}
                    onPress={() => {
                      if (subTab === 'unavailability' && cell.isCurrentMonth) {
                        handleDayPress(cell.day);
                      }
                    }}
                  >
                    <Text style={[
                      st.calDayNum,
                      !cell.isCurrentMonth && st.calDayNumDim,
                      isToday && st.calDayNumToday,
                      colIdx === 5 && cell.isCurrentMonth && { color: Colors.info },
                      colIdx === 6 && cell.isCurrentMonth && { color: Colors.danger },
                    ]}>{cell.day}</Text>
                    {dayShifts.slice(0, 1).map(sh => (
                      <TouchableOpacity
                        key={sh.id}
                        style={st.calEvent}
                        onPress={() => nav.navigate('ShiftWorkflow', { shiftId: sh.id })}
                      >
                        <Text style={st.calEventText} numberOfLines={1}>
                          ⏱ {sh.startTime} {sh.event?.title || ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {dayShifts.length > 1 && (
                      <Text style={st.calMoreText}>+{dayShifts.length - 1} more</Text>
                    )}
                    {isUnavailable && subTab === 'unavailability' && (
                      <Text style={st.unavailIndicator}>⛔ Leave</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Upcoming Shifts */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>Upcoming Shifts</Text>
          {upcomingShifts.length === 0 ? (
            <Text style={st.noShiftsText}>No upcoming shifts</Text>
          ) : (
            upcomingShifts.slice(0, 5).map(shift => (
              <TouchableOpacity key={shift.id} style={st.shiftItem} onPress={() => nav.navigate('ShiftWorkflow', { shiftId: shift.id })}>
                <Text style={st.shiftItemTitle}>{shift.event?.title || 'Shift'}</Text>
                <Text style={st.shiftItemSub}>{new Date(shift.date).toLocaleDateString()} • {shift.startTime} – {shift.endTime}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Note: Unavailability List is now perfectly integrated into the visual calendar above! */}
      </ScrollView>

      {/* Set Unavailability Modal */}
      <Modal visible={showUnavailModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Set Unavailability</Text>
              <TouchableOpacity onPress={() => setShowUnavailModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={st.modalSubtitle}>Mark the dates and times you are not available for shifts</Text>

            <View style={st.formRow}>
              <View style={st.formCol}>
                <Text style={st.formLabel}>Start Date</Text>
                <TextInput
                  style={st.formInput}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor={Colors.textMuted}
                  value={unavailForm.startDate}
                  onChangeText={v => setUnavailForm(f => ({ ...f, startDate: v }))}
                />
              </View>
              <View style={st.formCol}>
                <Text style={st.formLabel}>Start Time</Text>
                <TextInput
                  style={st.formInput}
                  placeholder="09:00 AM"
                  placeholderTextColor={Colors.textMuted}
                  value={unavailForm.startTime}
                  onChangeText={v => setUnavailForm(f => ({ ...f, startTime: v }))}
                />
              </View>
            </View>

            <View style={st.formRow}>
              <View style={st.formCol}>
                <Text style={st.formLabel}>End Date</Text>
                <TextInput
                  style={st.formInput}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor={Colors.textMuted}
                  value={unavailForm.endDate}
                  onChangeText={v => setUnavailForm(f => ({ ...f, endDate: v }))}
                />
              </View>
              <View style={st.formCol}>
                <Text style={st.formLabel}>End Time</Text>
                <TextInput
                  style={st.formInput}
                  placeholder="05:00 PM"
                  placeholderTextColor={Colors.textMuted}
                  value={unavailForm.endTime}
                  onChangeText={v => setUnavailForm(f => ({ ...f, endTime: v }))}
                />
              </View>
            </View>

            <Text style={st.formLabel}>Reason (Optional)</Text>
            <TextInput
              style={[st.formInput, { height: 70, textAlignVertical: 'top' }]}
              placeholder="e.g., Vacation, Medical Appointment, Class"
              placeholderTextColor={Colors.textMuted}
              multiline
              value={unavailForm.reason}
              onChangeText={v => setUnavailForm(f => ({ ...f, reason: v }))}
            />

            <TouchableOpacity style={[st.saveBtn, saving && st.saveBtnDisabled]} onPress={handleSaveUnavailability} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={st.saveBtnText}>Save Unavailability</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={st.cancelBtn} onPress={() => setShowUnavailModal(false)} disabled={saving}>
              <Text style={st.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 12 },
  subTabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  subTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  subTabActive: { backgroundColor: '#F1F5F9', borderColor: Colors.textSecondary },
  subTabIcon: { fontSize: 14 },
  subTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  subTabTextActive: { color: Colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', flexGrow: 1 },
  statIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, marginLeft: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  calTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  calLoading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calLoadingText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  calControls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  calViewBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  calViewActive: { backgroundColor: Colors.primary },
  calViewText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  calViewTextActive: { color: '#fff' },
  todayBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  todayBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  calRow: { flexDirection: 'row' },
  calDayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: Colors.textSecondary, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  calWeekRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  calCellBig: { flex: 1, minHeight: 60, padding: 2, borderRightWidth: 1, borderRightColor: '#F1F5F9' },
  calCellToday: { backgroundColor: '#FEF3C7' },
  calDayNum: { fontSize: 12, color: Colors.textPrimary, fontWeight: '500', padding: 2 },
  calDayNumDim: { color: Colors.textMuted },
  calDayNumToday: { color: Colors.primary, fontWeight: '700' },
  calEvent: { backgroundColor: Colors.primary, borderRadius: 4, paddingHorizontal: 3, paddingVertical: 2, marginTop: 1 },
  calEventText: { color: '#fff', fontSize: 8, fontWeight: '600' },
  calMoreText: { fontSize: 8, color: Colors.textMuted, paddingLeft: 2 },
  noShiftsText: { fontSize: 13, color: Colors.info, paddingVertical: 16 },
  shiftItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  shiftItemTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  shiftItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  unavailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  unavailDates: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  unavailTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  unavailReason: { fontSize: 12, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  calCellUnavailable: { backgroundColor: '#FEE2E2' },
  unavailIndicator: { fontSize: 8, color: Colors.danger, fontWeight: '700', paddingLeft: 2, marginTop: 2, textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalSubtitle: { fontSize: 12, color: Colors.primary, marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  formCol: { flex: 1 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  formInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, backgroundColor: '#fff' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10 },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  saveBtnDisabled: { backgroundColor: '#94A3B8' },
});
