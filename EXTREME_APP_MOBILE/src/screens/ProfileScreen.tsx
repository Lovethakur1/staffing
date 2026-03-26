import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data);
    } catch {
      // Use auth context user as fallback
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const data = profile || user;
  const sp = data?.staffProfile;

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Avatar & Name */}
        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            {data?.avatar ? (
              <Image source={{ uri: data.avatar }} style={s.avatarImage} />
            ) : (
              <Text style={s.avatarInitial}>
                {(data?.name || 'S').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={s.name}>{data?.name}</Text>
          <Text style={s.email}>{data?.email}</Text>
          {data?.phone && <Text style={s.phone}>{data.phone}</Text>}
        </View>

        {/* Staff Profile */}
        {sp && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Staff Profile</Text>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Rating</Text>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={16} color={Colors.warning} />
                <Text style={s.infoValue}>{sp.rating?.toFixed(1) || '0.0'}</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Hourly Rate</Text>
              <Text style={s.infoValue}>${sp.hourlyRate?.toFixed(2)}/hr</Text>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Events Completed</Text>
              <Text style={s.infoValue}>{sp.totalEvents || 0}</Text>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Status</Text>
              <View style={[s.statusBadge, { backgroundColor: sp.availabilityStatus === 'available' ? Colors.successLight : Colors.warningLight }]}>
                <Text style={[s.statusText, { color: sp.availabilityStatus === 'available' ? Colors.success : Colors.warning }]}>
                  {sp.availabilityStatus || 'Available'}
                </Text>
              </View>
            </View>

            {sp.skills?.length > 0 && (
              <View style={s.skillsSection}>
                <Text style={s.infoLabel}>Skills</Text>
                <View style={s.skillsWrap}>
                  {sp.skills.map((skill: string, i: number) => (
                    <View key={i} style={s.skillTag}>
                      <Text style={s.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() => {
            Alert.alert('Logout', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: logout },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarInitial: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: '700' },
  name: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  phone: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.sm, fontWeight: '600' },
  skillsSection: { marginTop: Spacing.md },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  skillTag: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  skillText: { fontSize: FontSize.sm, color: Colors.info, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.dangerLight,
    borderRadius: BorderRadius.md,
  },
  logoutText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.danger },
});
