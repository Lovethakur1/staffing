import { useState, useRef, useEffect } from "react";
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
}

export function UnifiedChatSystem({ userRole, userId, userName }: UnifiedChatSystemProps) {
  // Mock conversations based on user role
  const getConversations = (): Conversation[] => {
    const baseConversations: Conversation[] = [
      {
        id: "conv-1",
        participantId: "admin-1",
        participantName: "Sarah Johnson",
        participantRole: "Admin",
        lastMessage: "The event schedule has been updated for next week",
        lastMessageTime: new Date(Date.now() - 5 * 60000),
        unreadCount: 2,
        online: true,
        pinned: true,
      },
      {
        id: "conv-2",
        participantId: "manager-1",
        participantName: "Michael Chen",
        participantRole: "Manager",
        lastMessage: "All staff checked in successfully",
        lastMessageTime: new Date(Date.now() - 15 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-3",
        participantId: "staff-1",
        participantName: "Emma Williams",
        participantRole: "Event Server",
        lastMessage: "When is my next shift scheduled?",
        lastMessageTime: new Date(Date.now() - 60 * 60000),
        unreadCount: 1,
        online: false,
        lastSeen: new Date(Date.now() - 30 * 60000),
      },
      {
        id: "conv-4",
        participantId: "client-1",
        participantName: "TechCorp Industries",
        participantRole: "Client",
        lastMessage: "Thank you for the excellent service at our event!",
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60000),
        unreadCount: 0,
        online: false,
        lastSeen: new Date(Date.now() - 60 * 60000),
      },
      {
        id: "conv-5",
        participantId: "staff-2",
        participantName: "James Rodriguez",
        participantRole: "Bartender",
        lastMessage: "Can I swap my Saturday shift with someone?",
        lastMessageTime: new Date(Date.now() - 3 * 60 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-6",
        participantId: "staff-3",
        participantName: "Lisa Anderson",
        participantRole: "Server",
        lastMessage: "Got it, I'll be there at 5 PM sharp!",
        lastMessageTime: new Date(Date.now() - 4 * 60 * 60000),
        unreadCount: 0,
        online: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60000),
      },
      {
        id: "conv-7",
        participantId: "client-2",
        participantName: "Hope Foundation",
        participantRole: "Client",
        lastMessage: "Looking forward to our charity event next month!",
        lastMessageTime: new Date(Date.now() - 5 * 60 * 60000),
        unreadCount: 0,
        online: false,
        lastSeen: new Date(Date.now() - 4 * 60 * 60000),
      },
      {
        id: "conv-8",
        participantId: "staff-4",
        participantName: "David Kim",
        participantRole: "Head Server",
        lastMessage: "Team briefing scheduled for 4:30 PM today",
        lastMessageTime: new Date(Date.now() - 6 * 60 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-9",
        participantId: "manager-2",
        participantName: "Rachel Martinez",
        participantRole: "Event Manager",
        lastMessage: "Budget has been approved for next month",
        lastMessageTime: new Date(Date.now() - 8 * 60 * 60000),
        unreadCount: 0,
        online: false,
        lastSeen: new Date(Date.now() - 6 * 60 * 60000),
      },
      {
        id: "conv-10",
        participantId: "staff-5",
        participantName: "Kevin Taylor",
        participantRole: "Bartender",
        lastMessage: "The new cocktail menu looks fantastic!",
        lastMessageTime: new Date(Date.now() - 10 * 60 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-11",
        participantId: "client-3",
        participantName: "StartUp Inc",
        participantRole: "Client",
        lastMessage: "Can we add 50 more seats to the reservation?",
        lastMessageTime: new Date(Date.now() - 12 * 60 * 60000),
        unreadCount: 3,
        online: false,
        lastSeen: new Date(Date.now() - 8 * 60 * 60000),
      },
      {
        id: "conv-12",
        participantId: "staff-6",
        participantName: "Amanda White",
        participantRole: "Event Coordinator",
        lastMessage: "Venue inspection completed successfully ✓",
        lastMessageTime: new Date(Date.now() - 14 * 60 * 60000),
        unreadCount: 0,
        online: false,
        lastSeen: new Date(Date.now() - 10 * 60 * 60000),
      },
      {
        id: "group-1",
        participantId: "group-wedding",
        participantName: "Wedding Team - Miller Event",
        participantRole: "Event Team",
        lastMessage: "Setup complete, ready for guests",
        lastMessageTime: new Date(Date.now() - 30 * 60000),
        unreadCount: 5,
        online: true,
        isGroup: true,
        participants: ["Sarah Johnson", "Michael Chen", "Emma Williams", "+4 others"],
        participantCount: 7,
        pinned: true,
      },
      {
        id: "group-2",
        participantId: "group-corporate",
        participantName: "Corporate Gala - TechCorp",
        participantRole: "Event Team",
        lastMessage: "VIP guests arriving in 15 minutes",
        lastMessageTime: new Date(Date.now() - 45 * 60000),
        unreadCount: 2,
        online: true,
        isGroup: true,
        participants: ["David Kim", "Lisa Anderson", "James Rodriguez", "+6 others"],
        participantCount: 9,
      },
    ];

    return baseConversations;
  };

  // Mock messages
  const getMessages = (conversationId: string): Message[] => {
    const now = Date.now();
    
    // Generate different message patterns based on conversation
    if (conversationId === "conv-1") {
      return [
        {
          id: "msg-1",
          senderId: "admin-1",
          senderName: "Sarah Johnson",
          content: "Hi! I wanted to update you on the event schedule changes.",
          timestamp: new Date(now - 60 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-2",
          senderId: userId,
          senderName: userName,
          content: "Thanks for letting me know. What are the main changes?",
          timestamp: new Date(now - 58 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-3",
          senderId: "admin-1",
          senderName: "Sarah Johnson",
          content: "We've moved the Tech Summit corporate event from Friday to Saturday next week. The client requested a date change.",
          timestamp: new Date(now - 55 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-4",
          senderId: "admin-1",
          senderName: "Sarah Johnson",
          content: "I've attached the updated schedule for your review.",
          timestamp: new Date(now - 55 * 60000),
          read: true,
          delivered: true,
          type: 'file',
          fileName: "Updated_Event_Schedule_Nov2025.pdf",
          fileUrl: "#"
        },
        {
          id: "msg-5",
          senderId: userId,
          senderName: userName,
          content: "Perfect, I'll review it and confirm all staff are available for the new date.",
          timestamp: new Date(now - 50 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-6",
          senderId: "admin-1",
          senderName: "Sarah Johnson",
          content: "Great! Let me know if you need anything else. The client is expecting confirmation by tomorrow.",
          timestamp: new Date(now - 45 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-7",
          senderId: userId,
          senderName: userName,
          content: "Will do. I'll check with the team and get back to you within 2 hours.",
          timestamp: new Date(now - 40 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-8",
          senderId: "admin-1",
          senderName: "Sarah Johnson",
          content: "The event schedule has been updated for next week",
          timestamp: new Date(now - 5 * 60000),
          read: false,
          delivered: true,
          type: 'text'
        },
      ];
    }

    if (conversationId === "group-1") {
      return [
        {
          id: "msg-g1",
          senderId: "manager-1",
          senderName: "Michael Chen",
          content: "Good morning team! Wedding setup starts at 9 AM. Please confirm you've received your assignments.",
          timestamp: new Date(now - 3 * 60 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-g2",
          senderId: "staff-1",
          senderName: "Emma Williams",
          content: "Confirmed! I'm on table setup duty.",
          timestamp: new Date(now - 2.5 * 60 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-g3",
          senderId: "staff-4",
          senderName: "David Kim",
          content: "Ready to go. Bar area is my responsibility.",
          timestamp: new Date(now - 2.5 * 60 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-g4",
          senderId: "admin-1",
          senderName: "Sarah Johnson",
          content: "Great work everyone! The client just arrived for the final walkthrough.",
          timestamp: new Date(now - 60 * 60000),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: "msg-g5",
          senderId: "staff-3",
          senderName: "Lisa Anderson",
          content: "Setup complete, ready for guests",
          timestamp: new Date(now - 30 * 60000),
          read: false,
          delivered: true,
          type: 'text'
        },
      ];
    }

    // Default messages for other conversations
    return [
      {
        id: "msg-default-1",
        senderId: "other-user",
        senderName: "Team Member",
        content: "Hi! How are you today?",
        timestamp: new Date(now - 120 * 60000),
        read: true,
        delivered: true,
        type: 'text'
      },
      {
        id: "msg-default-2",
        senderId: userId,
        senderName: userName,
        content: "I'm doing great, thanks! How can I help you?",
        timestamp: new Date(now - 100 * 60000),
        read: true,
        delivered: true,
        type: 'text'
      },
      {
        id: "msg-default-3",
        senderId: "other-user",
        senderName: "Team Member",
        content: "I wanted to discuss the upcoming event schedule.",
        timestamp: new Date(now - 80 * 60000),
        read: true,
        delivered: true,
        type: 'text'
      },
      {
        id: "msg-default-4",
        senderId: userId,
        senderName: userName,
        content: "Sure, let me pull up the details. Give me one moment.",
        timestamp: new Date(now - 60 * 60000),
        read: false,
        delivered: true,
        type: 'text'
      },
    ];
  };

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'pinned' | 'groups'>('all');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [conversations] = useState<Conversation[]>(getConversations());
  const [messages, setMessages] = useState<Message[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (selectedConversation) {
      setMessages(getMessages(selectedConversation.id));
      if (isMobileView) {
        setShowConversationList(false);
      }
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      content: messageInput,
      timestamp: new Date(),
      read: false,
      delivered: false,
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, delivered: true } : msg
      ));
    }, 1000);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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
    // Apply search filter
    if (searchQuery && !conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
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
      {/* FIXED Header */}
      <div className="flex-shrink-0 border-b bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Messages</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
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
          <div className="flex-shrink-0 p-4 space-y-3 bg-background border-b">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { key: 'all', label: 'All Chats' },
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
                    "whitespace-nowrap text-xs h-8 px-3 transition-all",
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
            {sortedConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No conversations found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
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
                    <div className="flex items-center justify-between gap-2">
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
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Badge variant="secondary" className="text-xs h-5 px-2 font-normal">
                        {conv.participantRole}
                      </Badge>
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
              <div className="flex-shrink-0 border-b bg-card px-4 py-3 shadow-sm">
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