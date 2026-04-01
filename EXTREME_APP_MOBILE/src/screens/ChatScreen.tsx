import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  isSystem: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

const SOCKET_URL = API_BASE_URL.replace('/api', '');

export default function ChatScreen({ route, navigation }: Props) {
  const { conversationId, conversationName } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum: number, append = false) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page: pageNum, limit: 50 },
      });
      const data = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;

      if (append) {
        setMessages((prev) => [...data, ...prev]);
      } else {
        setMessages(data);
      }

      if (pagination) {
        setHasMore(pageNum < pagination.totalPages);
      } else {
        setHasMore(data.length === 50);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId]);

  // Initial load
  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // Socket connection
  useEffect(() => {
    let socket: Socket;

    const connectSocket = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        socket.emit('join:conversation', conversationId);
      });

      socket.on('message:new', (msg: Message) => {
        if (msg.conversationId === conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Mark as read
          socket.emit('message:read', conversationId);
        }
      });

      socket.on('typing:start', (data: { conversationId: string; userName: string; userId: string }) => {
        if (data.conversationId === conversationId && data.userId !== user?.id) {
          setTypingUser(data.userName);
        }
      });

      socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
        if (data.conversationId === conversationId && data.userId !== user?.id) {
          setTypingUser(null);
        }
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.emit('leave:conversation', conversationId);
        socket.disconnect();
      }
    };
  }, [conversationId, user?.id]);

  // Send message
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');
    Keyboard.dismiss();

    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content: trimmed,
        type: 'TEXT',
      });
      const newMsg = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setText(trimmed); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  // Typing indicator
  const handleTextChange = (val: string) => {
    setText(val);
    if (socketRef.current && val.length > 0) {
      socketRef.current.emit('typing:start', conversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing:stop', conversationId);
      }, 2000);
    }
  };

  // Load more (older messages)
  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage, true);
  };

  // Group messages by date
  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function getInitials(name: string): string {
    return (name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Render message
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === user?.id;
    const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId !== item.senderId);
    const showDate = index === 0 || formatDate(item.createdAt) !== formatDate(messages[index - 1]?.createdAt);

    if (item.isSystem) {
      return (
        <View>
          {showDate && <Text style={st.dateLabel}>{formatDate(item.createdAt)}</Text>}
          <View style={st.systemMsg}>
            <Text style={st.systemMsgText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        {showDate && <Text style={st.dateLabel}>{formatDate(item.createdAt)}</Text>}
        <View style={[st.msgRow, isMe && st.msgRowMe]}>
          {!isMe && showAvatar ? (
            <View style={st.msgAvatar}>
              <Text style={st.msgAvatarText}>{getInitials(item.sender?.name)}</Text>
            </View>
          ) : !isMe ? (
            <View style={st.msgAvatarSpacer} />
          ) : null}

          <View style={[st.bubble, isMe ? st.bubbleMe : st.bubbleOther]}>
            {!isMe && showAvatar && (
              <Text style={st.senderName}>{item.sender?.name}</Text>
            )}
            <Text style={[st.bubbleText, isMe && st.bubbleTextMe]}>{item.content}</Text>
            <Text style={[st.timeText, isMe && st.timeTextMe]}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={st.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={st.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={st.headerInfo}>
          <Text style={st.headerName} numberOfLines={1}>{conversationName}</Text>
          {typingUser && (
            <Text style={st.typingText}>{typingUser} is typing...</Text>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={st.messagesList}
        onContentSizeChange={() => {
          if (!loadingMore) flatListRef.current?.scrollToEnd({ animated: false });
        }}
        onStartReached={loadMore}
        onStartReachedThreshold={0.1}
        ListHeaderComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 10 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={st.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No messages yet. Say hello!</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={[st.inputBar, { paddingBottom: insets.bottom || 12 }]}>
        <View style={st.inputWrap}>
          <TextInput
            style={st.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
          />
        </View>
        <TouchableOpacity
          style={[st.sendBtn, (!text.trim() || sending) && st.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerName: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  typingText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },

  // Messages
  messagesList: { paddingHorizontal: 12, paddingVertical: 8 },

  dateLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginVertical: 12,
    backgroundColor: '#EEF2F6',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },

  msgRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  msgRowMe: { flexDirection: 'row-reverse' },

  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  msgAvatarText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  msgAvatarSpacer: { width: 34 },

  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  senderName: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  bubbleText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextMe: { color: Colors.white },
  timeText: { fontSize: 10, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  timeTextMe: { color: 'rgba(255,255,255,0.6)' },

  systemMsg: { alignItems: 'center', marginVertical: 8 },
  systemMsgText: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 8 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    minHeight: 40,
    maxHeight: 100,
    justifyContent: 'center',
    marginRight: 8,
  },
  input: { fontSize: 14, color: Colors.textPrimary, paddingVertical: 8 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
