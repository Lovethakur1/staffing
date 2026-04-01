import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NewChat'>;

interface SearchUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function NewChatScreen({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get('/chat/users/search', { params: { q } });
      setResults(res.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUsers(val), 400);
  };

  const startConversation = async (targetUser: SearchUser) => {
    setCreating(targetUser.id);
    try {
      const res = await api.post('/chat/conversations', {
        participantIds: [targetUser.id],
        isGroup: false,
      });
      const conv = res.data;
      navigation.replace('ChatDetail', {
        conversationId: conv.id,
        conversationName: targetUser.name,
      });
    } catch (err) {
      console.error('Failed to create conversation:', err);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setCreating(null);
    }
  };

  function getInitials(name: string): string {
    return (name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function formatRole(role: string): string {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  const renderUser = ({ item }: { item: SearchUser }) => (
    <TouchableOpacity
      style={st.userRow}
      onPress={() => startConversation(item)}
      disabled={creating === item.id}
    >
      <View style={st.userAvatar}>
        <Text style={st.userAvatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={st.userInfo}>
        <Text style={st.userName}>{item.name}</Text>
        <Text style={st.userRole}>{formatRole(item.role)}</Text>
      </View>
      {creating === item.id ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={st.container}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>New Message</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={st.searchWrap}>
        <View style={st.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {searching ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : results.length === 0 && query.length >= 2 ? (
        <View style={st.emptyWrap}>
          <Ionicons name="person-outline" size={48} color={Colors.textMuted} />
          <Text style={st.emptyText}>No users found</Text>
        </View>
      ) : query.length < 2 ? (
        <View style={st.emptyWrap}>
          <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
          <Text style={st.emptyText}>Search for a person to start chatting</Text>
          <Text style={st.emptyHint}>Type at least 2 characters</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={st.list}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: Colors.white, fontSize: 17, fontWeight: '700' },

  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, marginLeft: 8 },

  list: { paddingHorizontal: 16, paddingTop: 8 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  userRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 8 },
  emptyHint: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
});
