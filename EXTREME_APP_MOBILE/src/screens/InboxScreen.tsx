import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';
import { RootStackParamList } from '../types';
import { ScreenLayout } from '../components';

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

  const filteredConversations = conversations.filter(c => {
    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'groups') return c.isGroup;
    return true;
  }).filter(c => {
    if (!searchQuery) return true;
    const displayName = getConversationName(c);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
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

  function getInitials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getConversationName(conv: Conversation): string {
    if (conv.name) return conv.name;
    const other = conv.participants.find(p => p.user.id !== user?.id);
    return other?.user.name || 'Chat';
  }

  function getOtherParticipantRole(conv: Conversation): string {
    const other = conv.participants.find(p => p.user.id !== user?.id);
    if (!other) return '';
    return other.user.role.charAt(0) + other.user.role.slice(1).toLowerCase();
  }

  if (loading) {
    return (
      <ScreenLayout activeTab="Inbox" notificationCount={0}>
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Inbox" notificationCount={totalUnread}>
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
            <TouchableOpacity
              key={conv.id}
              style={st.msgRow}
              onPress={() => navigation.navigate('ChatDetail', {
                conversationId: conv.id,
                conversationName: getConversationName(conv),
              })}
            >
              <View style={st.msgAvatarWrap}>
                <View style={[st.msgAvatar, conv.isGroup && st.msgAvatarGroup]}>
                  {conv.isGroup ? (
                    <Ionicons name="people" size={20} color={Colors.textSecondary} />
                  ) : (
                    <Text style={st.msgAvatarText}>{getInitials(getConversationName(conv))}</Text>
                  )}
                </View>
              </View>

              <View style={st.msgContent}>
                <View style={st.msgTopRow}>
                  <Text style={[st.msgName, conv.unreadCount > 0 && { fontWeight: '700' }]} numberOfLines={1}>{getConversationName(conv)}</Text>
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
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* New Chat FAB */}
      <TouchableOpacity
        style={st.fab}
        onPress={() => navigation.navigate('NewChat')}
      >
        <Ionicons name="create-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
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
  fab: { position: 'absolute', bottom: 24, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
});
