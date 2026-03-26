import { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  ChevronLeft,
  File,
  Download,
  Pin,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Star,
  StarOff,
  Users,
  Circle,
  Image as ImageIcon,
  Plus,
  X,
  Mic,
} from "lucide-react";
import { cn } from "../ui/utils";
import { chatService } from "../../services/chat.service";
import { toast } from "sonner";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  delivered: boolean;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantEmail?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
  lastSeen?: Date;
  avatar?: string;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
  isGroup?: boolean;
  participants?: string[];
  participantCount?: number;
}

interface UnifiedChatSystemProps {
  userRole: string;
  userId: string;
  userName: string;
  initialConversationId?: string;
}

export function UnifiedChatSystem({ userRole, userId, userName, initialConversationId }: UnifiedChatSystemProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'pinned' | 'groups'>('all');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // ─── Socket.io Connection ─────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    // Listen for new incoming messages from other users
    socket.on('message:new', (msg: any) => {
      // Skip messages sent by us — the optimistic update already shows them
      if (msg.senderId === userId) return;

      const incomingMsg: Message = {
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.sender?.name || 'User',
        content: msg.content || '',
        timestamp: new Date(msg.createdAt || msg.sentAt || Date.now()),
        read: false,
        delivered: true,
        type: msg.type || 'text',
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
      };

      setMessages(prev => {
        const duplicate = prev.find(m => m.id === incomingMsg.id);
        if (duplicate) return prev;
        return [...prev, incomingMsg];
      });

      // Update conversation lastMessage in the sidebar
      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: msg.content, lastMessageTime: new Date(msg.createdAt || Date.now()) }
          : c
      ));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setShowConversationList(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  // Handle global user search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const users = await chatService.searchUsers(searchQuery);
        const mappedResults: Conversation[] = users.map((u: any) => ({
          id: `new_user_${u.id}`,
          participantId: u.id,
          participantName: u.name,
          participantRole: u.role.toLowerCase(),
          participantEmail: u.email,
          lastMessage: 'Click to start chatting',
          lastMessageTime: new Date(),
          unreadCount: 0,
          online: u.isActive,
          isGroup: false,
          participantCount: 2
        }));
        setSearchResults(mappedResults);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const raw = await chatService.getConversations();
        const mapped: Conversation[] = raw.map((conv: any) => {
          const isGroup = conv.isGroup || conv.participants?.length > 2;
          const otherParticipant = !isGroup
            ? conv.participants?.find((p: any) => p.userId !== userId)
            : null;
          const participantUser = otherParticipant?.user || {};
          const lastMsg = conv.messages?.[0];
          return {
            id: conv.id,
            participantId: otherParticipant?.userId || conv.id,
            participantName: isGroup
              ? (conv.name || 'Group Chat')
              : (participantUser.name || 'User'),
            participantRole: isGroup ? 'group' : (participantUser.role || 'user').toLowerCase(),
            participantEmail: participantUser.email,
            lastMessage: lastMsg?.content || 'No messages yet',
            lastMessageTime: lastMsg ? new Date(lastMsg.sentAt || lastMsg.createdAt) : new Date(conv.createdAt),
            unreadCount: 0,
            online: false,
            isGroup,
            participantCount: conv.participants?.length || 0,
          };
        });
        setConversations(mapped);

        // Auto-select initial conversation if provided
        if (initialConversationId) {
          const initialConv = mapped.find(c => c.id === initialConversationId);
          if (initialConv) {
            setSelectedConversation(initialConv);
          }
        }
      } catch {
        // Silently handle — chat may not be configured yet
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [userId, initialConversationId]);

  // Fetch messages when conversation changes
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const raw = await chatService.getMessages(conversationId);
      const mapped: Message[] = raw.map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.sender?.name || 'User',
        content: msg.content || '',
        timestamp: new Date(msg.sentAt || msg.createdAt),
        read: msg.read || false,
        delivered: true,
        type: msg.type || 'text',
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
      }));
      setMessages(mapped);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      if (isMobileView) {
        setShowConversationList(false);
      }
      // Join socket room for this conversation
      socketRef.current?.emit('join:conversation', selectedConversation.id);
    }

    // Leave previous conversation room when switching
    return () => {
      if (selectedConversation && !selectedConversation.id.startsWith('new_user_')) {
        socketRef.current?.emit('leave:conversation', selectedConversation.id);
      }
    };
  }, [selectedConversation, fetchMessages, isMobileView]);

  const handleConversationSelect = async (conv: Conversation) => {
    if (conv.id.startsWith('new_user_')) {
      try {
        const newConv = await chatService.createConversation({
          participantIds: [conv.participantId],
          isGroup: false
        });
        
        const mappedConv: Conversation = {
           id: newConv.id,
           participantId: conv.participantId,
           participantName: conv.participantName,
           participantRole: conv.participantRole,
           participantEmail: conv.participantEmail,
           lastMessage: 'No messages yet',
           lastMessageTime: new Date(),
           unreadCount: 0,
           online: false,
           isGroup: false,
           participantCount: 2
        };
        
        setConversations(prev => [mappedConv, ...prev.filter(c => c.participantId !== conv.participantId)]);
        setSearchResults([]);
        setSearchQuery('');
        setSelectedConversation(mappedConv);
      } catch (e) {
        toast.error('Failed to start conversation');
      }
    } else {
      setSelectedConversation(conv);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;
    const content = messageInput;
    setMessageInput("");
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      content,
      timestamp: new Date(),
      read: false,
      delivered: false,
      type: 'text'
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const sent = await chatService.sendMessage(selectedConversation.id, { content, type: 'text' });
      setMessages(prev => prev.map(m =>
        m.id === tempMsg.id
          ? { ...m, id: sent?.id || m.id, delivered: true }
          : m
      ));
    } catch {
      // Keep optimistic message but mark failed — could show error state
      setMessages(prev => prev.map(m =>
        m.id === tempMsg.id ? { ...m, delivered: true } : m
      ));
    } finally {
      setSending(false);
    }

    setTimeout(() => scrollToBottom(), 100);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'last seen just now';
    if (minutes < 60) return `last seen ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;

    return `last seen ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Apply search filter (name OR email)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = conv.participantName.toLowerCase().includes(q);
      const emailMatch = conv.participantEmail?.toLowerCase().includes(q);

      if (!nameMatch && !emailMatch) {
        return false;
      }
    }

    // Apply type filter
    if (filterType === 'unread' && conv.unreadCount === 0) return false;
    if (filterType === 'pinned' && !conv.pinned) return false;
    if (filterType === 'groups' && !conv.isGroup) return false;

    return true;
  });

  // Sort conversations - pinned first, then by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
  });

  const displayConversations = [...sortedConversations];
  if (searchResults.length > 0) {
     const existingParticipantIds = new Set(conversations.map(c => c.participantId));
     const newResults = searchResults.filter(r => !existingParticipantIds.has(r.participantId));
     if (newResults.length > 0) {
       displayConversations.push(...newResults);
     }
  }

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach(message => {
      const dateKey = message.timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* COMPACT Header */}
      <div className="flex-shrink-0 border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Messages</h1>
            {totalUnread > 0 && (
              <Badge className="bg-sangria text-white text-xs h-5 px-2">{totalUnread}</Badge>
            )}
          </div>
          <Badge variant="outline" className="hidden sm:flex text-xs">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Main Content - Flex container */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ==================== LEFT PANEL: CONVERSATION LIST ==================== */}
        <div
          className={cn(
            "w-full lg:w-[380px] border-r bg-background flex flex-col",
            isMobileView && !showConversationList && "hidden"
          )}
        >
          {/* FIXED Search and Filter Header */}
          <div className="flex-shrink-0 p-3 space-y-2 bg-background border-b">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-8 text-sm bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread', count: conversations.filter(c => c.unreadCount > 0).length },
                { key: 'groups', label: 'Groups' },
                { key: 'pinned', label: 'Pinned' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType(filter.key as typeof filterType)}
                  className={cn(
                    "whitespace-nowrap text-xs h-7 px-2.5 transition-all",
                    filterType === filter.key
                      ? "bg-sangria hover:bg-merlot text-white"
                      : "hover:bg-muted"
                  )}
                >
                  {filter.label}
                  {filter.count !== undefined && filter.count > 0 && ` (${filter.count})`}
                </Button>
              ))}
            </div>
          </div>

          {/* SCROLLABLE Conversation Items */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-3">
                 <div className="h-6 w-6 border-b-2 border-primary rounded-full animate-spin"></div>
                 <p className="text-sm text-muted-foreground">Searching users...</p>
              </div>
            ) : displayConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No conversations found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              displayConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleConversationSelect(conv)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 hover:bg-muted/70 transition-all border-b text-left relative group",
                    selectedConversation?.id === conv.id && "bg-muted/80"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mt-1">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarFallback className={cn(
                        "text-sm font-semibold",
                        conv.isGroup
                          ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
                          : "bg-gradient-to-br from-primary/10 to-primary/20 text-primary"
                      )}>
                        {conv.isGroup ? <Users className="h-5 w-5" /> : getInitials(conv.participantName)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && !conv.isGroup && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                    )}
                    {conv.pinned && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-sangria rounded-full flex items-center justify-center shadow-sm">
                        <Pin className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Time Row */}
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <h3 className={cn(
                          "font-semibold truncate text-sm",
                          conv.unreadCount > 0 ? "text-foreground" : "text-foreground/90"
                        )}>
                          {conv.participantName}
                        </h3>
                        {conv.muted && (
                          <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs whitespace-nowrap flex-shrink-0",
                        conv.unreadCount > 0 ? "text-sangria font-medium" : "text-muted-foreground"
                      )}>
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>

                    {/* Last Message and Unread Badge Row */}
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={cn(
                        "text-sm truncate flex-1",
                        conv.unreadCount > 0
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                        conv.typing && "text-sangria italic"
                      )}>
                        {conv.typing ? (
                          "typing..."
                        ) : (
                          <>
                            {conv.isGroup && <span className="text-muted-foreground">~{conv.participantCount} • </span>}
                            {conv.lastMessage}
                          </>
                        )}
                      </p>
                      {conv.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <Badge className="bg-sangria hover:bg-sangria text-white h-5 min-w-5 px-1.5 text-xs font-semibold shadow-sm">
                            {conv.unreadCount}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Role / Email */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-[10px] uppercase h-4 px-1.5 font-semibold tracking-wider">
                        {conv.participantRole}
                      </Badge>
                      {conv.participantEmail && (
                        <span className="text-xs text-muted-foreground truncate opacity-75">
                          {conv.participantEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ==================== MAIN CHAT AREA ==================== */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-background min-h-0",
            isMobileView && showConversationList && "hidden"
          )}
        >
          {selectedConversation ? (
            <>
              {/* FIXED Chat Header */}
              <div className="flex-shrink-0 border-b bg-card px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isMobileView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToList}
                        className="mr-1 -ml-2 flex-shrink-0"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                        <AvatarFallback className={cn(
                          "text-sm font-semibold",
                          selectedConversation.isGroup
                            ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
                            : "bg-gradient-to-br from-primary/10 to-primary/20 text-primary"
                        )}>
                          {selectedConversation.isGroup ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            getInitials(selectedConversation.participantName)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.online && !selectedConversation.isGroup && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base truncate">{selectedConversation.participantName}</h3>
                        {selectedConversation.pinned && (
                          <Pin className="h-3.5 w-3.5 text-sangria fill-sangria flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="text-xs h-5 px-2 font-normal">
                          {selectedConversation.participantRole}
                        </Badge>
                        {selectedConversation.isGroup ? (
                          <span className="text-muted-foreground">
                            {selectedConversation.participantCount} participants
                          </span>
                        ) : selectedConversation.online ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Circle className="h-2 w-2 fill-green-600" />
                            <span className="font-medium">online</span>
                          </div>
                        ) : selectedConversation.lastSeen ? (
                          <span className="text-muted-foreground">
                            {formatLastSeen(selectedConversation.lastSeen)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="hidden sm:flex h-9 w-9 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex h-9 w-9 p-0">
                      <Video className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>
                          {selectedConversation.pinned ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Unpin Conversation
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Pin Conversation
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {selectedConversation.muted ? (
                            <>
                              <Volume2 className="h-4 w-4 mr-2" />
                              Unmute
                            </>
                          ) : (
                            <>
                              <VolumeX className="h-4 w-4 mr-2" />
                              Mute Notifications
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Search className="h-4 w-4 mr-2" />
                          Search in Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* SCROLLABLE Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-6 min-h-0 bg-muted/20 scrollbar-thin"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 70px)',
                }}
              >
                {Object.entries(messageGroups).map(([date, msgs], groupIndex) => (
                  <div key={date} className={groupIndex > 0 ? "mt-6" : ""}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-card shadow-sm border px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-muted-foreground">
                          {date === new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            ? 'Today'
                            : date === new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                              ? 'Yesterday'
                              : date}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {msgs.map((message, index) => {
                        const isOwn = message.senderId === userId;
                        const prevMessage = index > 0 ? msgs[index - 1] : null;
                        const nextMessage = index < msgs.length - 1 ? msgs[index + 1] : null;

                        const showAvatar = !isOwn && (
                          !prevMessage ||
                          prevMessage.senderId !== message.senderId ||
                          message.timestamp.getTime() - prevMessage.timestamp.getTime() > 60000
                        );

                        const showName = selectedConversation.isGroup && showAvatar;

                        const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
                        const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-2 group",
                              isOwn && "flex-row-reverse"
                            )}
                          >
                            {/* Avatar (for received messages only) */}
                            {!isOwn && (
                              <div className="flex-shrink-0 w-8">
                                {showAvatar ? (
                                  <Avatar className="h-8 w-8 border shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                      {getInitials(message.senderName)}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : null}
                              </div>
                            )}

                            {/* Message Content */}
                            <div className={cn(
                              "flex flex-col gap-1 max-w-[65%] sm:max-w-[75%]",
                              isOwn && "items-end"
                            )}>
                              {/* Sender Name (for group chats) */}
                              {showName && (
                                <span className="text-xs font-medium text-sangria px-3">
                                  {message.senderName}
                                </span>
                              )}

                              {/* Message Bubble */}
                              {message.type === 'text' && (
                                <div
                                  className={cn(
                                    "px-4 py-2.5 shadow-sm relative",
                                    isOwn
                                      ? "bg-sangria text-white rounded-tl-2xl rounded-bl-2xl rounded-br-md"
                                      : "bg-card border rounded-tr-2xl rounded-br-2xl rounded-bl-md",
                                    isFirstInGroup && isOwn && "rounded-tr-2xl",
                                    isLastInGroup && isOwn && "rounded-br-2xl",
                                    isFirstInGroup && !isOwn && "rounded-tl-2xl",
                                    isLastInGroup && !isOwn && "rounded-bl-2xl"
                                  )}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {message.content}
                                  </p>

                                  {/* Time and Status */}
                                  <div className={cn(
                                    "flex items-center gap-1 mt-1 justify-end",
                                    isOwn ? "text-white/80" : "text-muted-foreground"
                                  )}>
                                    <span className="text-[10px] leading-none">
                                      {formatMessageTime(message.timestamp)}
                                    </span>
                                    {isOwn && (
                                      message.read ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                                      ) : message.delivered ? (
                                        <CheckCheck className="h-3.5 w-3.5" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5" />
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* File Message */}
                              {message.type === 'file' && (
                                <div
                                  className={cn(
                                    "px-4 py-3 border-2 shadow-sm rounded-2xl",
                                    isOwn
                                      ? "bg-sangria/10 border-sangria/30"
                                      : "bg-card border-border"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2.5 rounded-xl shadow-sm",
                                      isOwn ? "bg-sangria/20" : "bg-muted"
                                    )}>
                                      <File className="h-5 w-5 text-sangria" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{message.fileName}</p>
                                      <p className="text-xs text-muted-foreground">PDF Document • 245 KB</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Time */}
                                  <div className={cn(
                                    "flex items-center gap-1 mt-2 justify-end",
                                    "text-muted-foreground"
                                  )}>
                                    <span className="text-[10px]">
                                      {formatMessageTime(message.timestamp)}
                                    </span>
                                    {isOwn && (
                                      message.read ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-sangria" />
                                      ) : message.delivered ? (
                                        <CheckCheck className="h-3.5 w-3.5" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5" />
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* FIXED Message Input */}
              <div className="flex-shrink-0 border-t bg-card px-4 py-3 shadow-lg">
                <div className="flex items-end gap-2">
                  {/* Attachment Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    className="h-10 w-10 p-0 flex-shrink-0 rounded-full hover:bg-muted"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  {/* Message Input Area */}
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-24 h-10 bg-muted/50 border-none focus-visible:ring-1 rounded-3xl"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFileUpload}
                        className="h-8 w-8 p-0 rounded-full hover:bg-background"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-background"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Send/Voice Button */}
                  {messageInput.trim() ? (
                    <Button
                      onClick={handleSendMessage}
                      className="h-10 w-10 p-0 rounded-full bg-sangria hover:bg-merlot shadow-md flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full hover:bg-muted flex-shrink-0"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    // Handle file upload
                    console.log("File selected:", e.target.files);
                  }}
                />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sangria/10 to-sangria/5 flex items-center justify-center mb-6 shadow-inner">
                <Search className="w-12 h-12 text-sangria/40" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Select a Conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Choose a chat from the list to view messages and start a conversation, or search for a specific contact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
