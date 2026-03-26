import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { Shift, RootStackParamList } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.statusPending,
  CONFIRMED: Colors.statusConfirmed,
  YET_TO_START: Colors.textSecondary,
  TRAVEL_TO_VENUE: Colors.statusTravel,
  ARRIVED: Colors.statusArrived,
  IN_PROGRESS: Colors.statusInProgress,
  BREAK: Colors.statusBreak,
  COMPLETED: Colors.statusCompleted,
  TRAVEL_HOME: Colors.statusTravel,
  REJECTED: Colors.danger,
};

export default function MyShiftsScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchShifts = useCallback(async () => {
    try {
      const res = await api.get('/shifts');
      const data: Shift[] = res.data?.data || [];
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setShifts(data);
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
      fetchShifts();
    }, [fetchShifts])
  );

  const filteredShifts = shifts.filter(s => {
    if (filter === 'active') return !['COMPLETED', 'REJECTED'].includes(s.status);
    if (filter === 'completed') return s.status === 'COMPLETED';
    return true;
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>My Shifts</Text>
        <Text style={styles.headerCount}>{shifts.length} total</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredShifts}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchShifts(); }} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate('ShiftWorkflow', { shiftId: item.id })}
          >
            <View style={styles.cardTop}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] || Colors.textMuted }]} />
              <Text style={styles.cardStatus}>{item.status.replace(/_/g, ' ')}</Text>
              {item.travelEnabled && <Ionicons name="car" size={14} color={Colors.statusTravel} style={{ marginLeft: 'auto' }} />}
            </View>
            <Text style={styles.cardTitle}>{item.event?.title || 'Shift'}</Text>
            <Text style={styles.cardDate}>{formatDate(item.date)} • {item.startTime} – {item.endTime}</Text>
            {item.event?.venue && (
              <Text style={styles.cardVenue} numberOfLines={1}>{item.event.venue}</Text>
            )}
            {item.totalHours != null && (
              <Text style={styles.cardHours}>{item.totalHours.toFixed(1)}h — ${item.totalPay?.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No shifts found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  headerCount: { fontSize: FontSize.md, color: Colors.textSecondary },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardStatus: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  cardDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardVenue: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  cardHours: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.success, marginTop: Spacing.sm },
  empty: { alignItems: 'center', marginTop: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
