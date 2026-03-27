import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participants: { user: { id: string; name: string; role: string; avatar?: string } }[];
  lastMessage?: { content: string; createdAt: string; sender?: { name: string } };
  unreadCount: number;
}

export default function InboxScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    try {
      const [convRes, unreadRes] = await Promise.all([
        api.get('/chat/conversations'),
        api.get('/chat/unread-count'),
      ]);
      setConversations(convRes.data?.data || convRes.data || []);
      setTotalUnread(unreadRes.data?.count || 0);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConversations();
    }, [fetchConversations])
  );

  const initials = (user?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const filteredConversations = conversations.filter(c => {
    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'groups') return c.isGroup;
    return true;
  }).filter(c => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unreadConvCount = conversations.filter(c => c.unreadCount > 0).length;

  function getTimeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getOtherParticipantRole(conv: Conversation): string {
    const other = conv.participants.find(p => p.user.id !== user?.id);
    if (!other) return '';
    return other.user.role.charAt(0) + other.user.role.slice(1).toLowerCase();
  }

  if (loading) {
    return <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={st.container}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity><Ionicons name="menu" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <View style={st.logoBg}>
          <Text style={st.logoTextBig}>E</Text>
          <Text style={st.logoTextSmall}>XTREME{'\n'}STAFFING</Text>
        </View>
        <View style={st.headerRight}>
          <TouchableOpacity style={st.bellBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            {totalUnread > 0 && <View style={st.notifBadge}><Text style={st.notifCount}>{totalUnread}</Text></View>}
          </TouchableOpacity>
          <View style={st.avatarSmall}><Text style={st.avatarSmallText}>{initials}</Text></View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} colors={[Colors.primary]} />}
      >
        <Text style={st.pageTitle}>Messages</Text>
        <Text style={st.pageSubtitle}>{totalUnread} unread messages</Text>

        <View style={st.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={st.filterRow}>
          {[
            { key: 'all' as const, label: 'All Chats' },
            { key: 'unread' as const, label: `Unread (${unreadConvCount})` },
            { key: 'groups' as const, label: 'Groups' },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[st.filterBtn, activeFilter === f.key && st.filterActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[st.filterText, activeFilter === f.key && st.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredConversations.length === 0 ? (
          <View style={st.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No conversations yet</Text>
          </View>
        ) : (
          filteredConversations.map(conv => (
            <TouchableOpacity key={conv.id} style={st.msgRow}>
              <View style={st.msgAvatarWrap}>
                <View style={[st.msgAvatar, conv.isGroup && st.msgAvatarGroup]}>
                  {conv.isGroup ? (
                    <Ionicons name="people" size={20} color={Colors.textSecondary} />
                  ) : (
                    <Text style={st.msgAvatarText}>{getInitials(conv.name)}</Text>
                  )}
                </View>
              </View>

              <View style={st.msgContent}>
                <View style={st.msgTopRow}>
                  <Text style={[st.msgName, conv.unreadCount > 0 && { fontWeight: '700' }]} numberOfLines={1}>{conv.name}</Text>
                  <Text style={st.msgTime}>{getTimeAgo(conv.lastMessage?.createdAt)}</Text>
                </View>
                <View style={st.msgBottomRow}>
                  <Text style={st.msgText} numberOfLines={1}>
                    {conv.lastMessage?.content || 'No messages yet'}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View style={st.unreadBadge}><Text style={st.unreadText}>{conv.unreadCount}</Text></View>
                  )}
                </View>
                {!conv.isGroup && <Text style={st.msgType}>{getOtherParticipantRole(conv)}</Text>}
                {conv.isGroup && <Text style={st.msgType}>Group • {conv.participants.length} members</Text>}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  logoBg: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  logoTextBig: { color: '#fff', fontSize: 18, fontWeight: '900' },
  logoTextSmall: { color: '#fff', fontSize: 7, fontWeight: '700', marginLeft: 2, lineHeight: 9 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: Colors.primary, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifCount: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, marginLeft: 8 },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  filterActive: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  msgAvatarWrap: { position: 'relative', marginRight: 12 },
  msgAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  msgAvatarGroup: { backgroundColor: '#F1F5F9' },
  msgAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  msgContent: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  msgTime: { fontSize: 11, color: Colors.textMuted },
  msgBottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  msgText: { fontSize: 12, color: Colors.textSecondary, flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  msgType: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});
