import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ChevronLeft,
  ChevronDown,
  File,
  Download,
} from "lucide-react";
import { cn } from "../ui/utils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
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
  avatar?: string;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
}

interface UnifiedChatSystemProps {
  userRole: string;
  userId: string;
  userName: string;
}

export function UnifiedChatSystem({ userRole, userId, userName }: UnifiedChatSystemProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
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
  }, [selectedConversation]);

  // Mock conversations
  const getConversations = (): Conversation[] => {
    return [
      {
        id: "conv-1",
        participantId: "admin-1",
        participantName: "Sarah Johnson",
        participantRole: "Admin",
        lastMessage: "The event schedule has been updated",
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
        typing: false,
      },
      {
        id: "conv-3",
        participantId: "staff-1",
        participantName: "Emma Williams",
        participantRole: "Event Server",
        lastMessage: "When is the next shift?",
        lastMessageTime: new Date(Date.now() - 60 * 60000),
        unreadCount: 1,
        online: false,
      },
      {
        id: "conv-4",
        participantId: "client-1",
        participantName: "TechCorp Industries",
        participantRole: "Client",
        lastMessage: "Thank you for the excellent service!",
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60000),
        unreadCount: 0,
        online: false,
      },
      {
        id: "conv-5",
        participantId: "staff-2",
        participantName: "James Rodriguez",
        participantRole: "Bartender",
        lastMessage: "Can I swap my Saturday shift?",
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
      },
      {
        id: "conv-7",
        participantId: "client-2",
        participantName: "Hope Foundation",
        participantRole: "Client",
        lastMessage: "Looking forward to the charity event!",
        lastMessageTime: new Date(Date.now() - 5 * 60 * 60000),
        unreadCount: 0,
        online: false,
      },
      {
        id: "conv-8",
        participantId: "staff-4",
        participantName: "David Kim",
        participantRole: "Head Server",
        lastMessage: "Team briefing at 4:30 PM",
        lastMessageTime: new Date(Date.now() - 6 * 60 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-9",
        participantId: "manager-2",
        participantName: "Rachel Martinez",
        participantRole: "Manager",
        lastMessage: "Budget approved for next month",
        lastMessageTime: new Date(Date.now() - 8 * 60 * 60000),
        unreadCount: 0,
        online: false,
      },
      {
        id: "conv-10",
        participantId: "staff-5",
        participantName: "Kevin Taylor",
        participantRole: "Bartender",
        lastMessage: "New cocktail menu looks great!",
        lastMessageTime: new Date(Date.now() - 10 * 60 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-11",
        participantId: "client-3",
        participantName: "StartUp Inc",
        participantRole: "Client",
        lastMessage: "Can we add 50 more seats?",
        lastMessageTime: new Date(Date.now() - 12 * 60 * 60000),
        unreadCount: 3,
        online: false,
      },
      {
        id: "conv-12",
        participantId: "staff-6",
        participantName: "Amanda White",
        participantRole: "Event Coordinator",
        lastMessage: "Venue inspection completed ✓",
        lastMessageTime: new Date(Date.now() - 14 * 60 * 60000),
        unreadCount: 0,
        online: false,
      },
      {
        id: "conv-13",
        participantId: "staff-7",
        participantName: "Robert Garcia",
        participantRole: "Server",
        lastMessage: "Uniform ready for pickup",
        lastMessageTime: new Date(Date.now() - 16 * 60 * 60000),
        unreadCount: 0,
        online: false,
      },
      {
        id: "conv-14",
        participantId: "admin-2",
        participantName: "Jennifer Lee",
        participantRole: "Admin",
        lastMessage: "Payroll processed successfully",
        lastMessageTime: new Date(Date.now() - 20 * 60 * 60000),
        unreadCount: 0,
        online: true,
      },
      {
        id: "conv-15",
        participantId: "staff-8",
        participantName: "Chris Thompson",
        participantRole: "Bartender",
        lastMessage: "Thanks for the schedule update",
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60000),
        unreadCount: 0,
        online: false,
      },
    ];
  };

  // Mock messages
  const getMessages = (conversationId: string): Message[] => {
    const now = Date.now();
    return [
      {
        id: "msg-1",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "Hi! I wanted to discuss the upcoming event on Friday.",
        timestamp: new Date(now - 120 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-2",
        senderId: userId,
        senderName: userName,
        content: "Sure! What would you like to know?",
        timestamp: new Date(now - 115 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-3",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "We need to finalize the staff assignments for the corporate gala.",
        timestamp: new Date(now - 110 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-4",
        senderId: userId,
        senderName: userName,
        content: "I've attached the updated schedule for your review.",
        timestamp: new Date(now - 105 * 60000),
        read: true,
        type: 'file',
        fileName: 'Event_Schedule_Oct2025.pdf',
        fileUrl: '#',
      },
      {
        id: "msg-5",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "Perfect! This looks good. I'll review and get back to you shortly.",
        timestamp: new Date(now - 100 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-6",
        senderId: userId,
        senderName: userName,
        content: "Great! Let me know if you need any changes.",
        timestamp: new Date(now - 90 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-7",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "Actually, could we add 2 more bartenders? The guest count increased to 250.",
        timestamp: new Date(now - 85 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-8",
        senderId: userId,
        senderName: userName,
        content: "Absolutely! I'll reach out to our top-rated bartenders right away.",
        timestamp: new Date(now - 80 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-9",
        senderId: userId,
        senderName: userName,
        content: "I've found two excellent candidates - both have 4.9+ ratings and are available.",
        timestamp: new Date(now - 70 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-10",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "That was quick! What are their rates?",
        timestamp: new Date(now - 65 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-11",
        senderId: userId,
        senderName: userName,
        content: "Both are $32/hour. They have extensive experience with corporate events.",
        timestamp: new Date(now - 60 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-12",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "Perfect! Please assign them to the event.",
        timestamp: new Date(now - 55 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-13",
        senderId: userId,
        senderName: userName,
        content: "Done! They've been notified and have confirmed their availability. I've also updated the schedule document.",
        timestamp: new Date(now - 50 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-14",
        senderId: userId,
        senderName: userName,
        content: "Here's the updated budget breakdown with the additional staff.",
        timestamp: new Date(now - 45 * 60000),
        read: true,
        type: 'file',
        fileName: 'Updated_Budget_Oct2025.xlsx',
        fileUrl: '#',
      },
      {
        id: "msg-15",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "Excellent work! The new total is within our budget. One more thing...",
        timestamp: new Date(now - 40 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-16",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "Can we have the staff arrive 30 minutes earlier for a pre-event briefing?",
        timestamp: new Date(now - 35 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-17",
        senderId: userId,
        senderName: userName,
        content: "Of course! I'll adjust the timing. Staff will now arrive at 5:30 PM instead of 6:00 PM.",
        timestamp: new Date(now - 30 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-18",
        senderId: userId,
        senderName: userName,
        content: "Everyone has been notified of the time change via SMS and email.",
        timestamp: new Date(now - 25 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-19",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "You're amazing! This is exactly why we keep working with you. 🎉",
        timestamp: new Date(now - 20 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-20",
        senderId: userId,
        senderName: userName,
        content: "Thank you! We're here to make your events flawless. Is there anything else you need?",
        timestamp: new Date(now - 15 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-21",
        senderId: selectedConversation?.participantId || "",
        senderName: selectedConversation?.participantName || "",
        content: "That's everything for now. I'll reach out if anything comes up before Friday.",
        timestamp: new Date(now - 10 * 60000),
        read: true,
        type: 'text',
      },
      {
        id: "msg-22",
        senderId: userId,
        senderName: userName,
        content: "Sounds good! Feel free to message anytime. Have a great day! 😊",
        timestamp: new Date(now - 5 * 60000),
        read: true,
        type: 'text',
      },
    ];
  };

  const [conversations] = useState<Conversation[]>(getConversations());
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(getMessages(selectedConversation.id));
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      content: messageInput,
      timestamp: new Date(),
      read: false,
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    
    // Scroll to bottom after a short delay to ensure message is rendered
    setTimeout(scrollToBottom, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setShowCallDialog(true);
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setShowCallDialog(false);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#f0f2f5]">
      {/* Conversations Sidebar */}
      <div className={cn(
        "bg-white border-r border-slate-200 flex flex-col h-full",
        isMobileView 
          ? showConversationList ? "w-full" : "hidden"
          : "w-[380px] flex-shrink-0"
      )}>
        {/* Conversations Header */}
        <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
          <h2 className="text-slate-900 text-xl">Chats</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-slate-200">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-white flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-[#f0f2f5] border-none rounded-lg h-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white min-h-0">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f5f6f6] transition-colors border-b border-slate-100",
                selectedConversation?.id === conversation.id && "bg-[#f0f2f5]"
              )}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-sangria text-white">
                    {conversation.participantName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {conversation.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900 truncate text-[15px]">
                    {conversation.participantName}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 truncate flex-1">
                    {conversation.typing ? (
                      <span className="text-sangria italic">typing...</span>
                    ) : (
                      conversation.lastMessage
                    )}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-2 bg-sangria hover:bg-merlot text-white h-5 min-w-5 flex items-center justify-center text-xs rounded-full px-2">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col h-full min-w-0",
        isMobileView && showConversationList && "hidden"
      )}>
        {selectedConversation ? (
          <>
            {/* Chat Header - FIXED */}
            <div className="bg-[#f0f2f5] px-4 py-2.5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="mr-1 h-10 w-10 p-0 hover:bg-slate-200 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}
                
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-sangria text-white">
                    {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-medium text-slate-900 text-[15px]">
                    {selectedConversation.participantName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedConversation.online ? (
                      <span className="text-green-600">online</span>
                    ) : (
                      `last seen ${formatTime(selectedConversation.lastMessageTime)}`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startCall('voice')}
                  className="h-10 w-10 p-0 hover:bg-slate-200 rounded-full"
                >
                  <Phone className="w-5 h-5 text-slate-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startCall('video')}
                  className="h-10 w-10 p-0 hover:bg-slate-200 rounded-full"
                >
                  <Video className="w-5 h-5 text-slate-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-slate-200 rounded-full"
                >
                  <MoreVertical className="w-5 h-5 text-slate-600" />
                </Button>
              </div>
            </div>

            {/* Messages Area - SCROLLABLE */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-[#efeae2] px-4 py-4 min-h-0"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23efeae2\'/%3E%3Cpath d=\'M20 10h1v1h-1zM40 30h1v1h-1zM60 50h1v1h-1zM80 70h1v1h-1zM10 90h1v1h-1z\' fill=\'%23d9d3cc\' fill-opacity=\'.3\'/%3E%3C/svg%3E")',
              }}
            >
              <div className="max-w-5xl mx-auto space-y-2">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === userId;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  const showTime = index === messages.length - 1 || messages[index + 1]?.senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 items-end",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar space */}
                      <div className="w-8 flex-shrink-0">
                        {!isOwn && showAvatar && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-sangria text-white text-xs">
                              {message.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={cn(
                        "max-w-[65%] flex flex-col",
                        isOwn ? "items-end" : "items-start"
                      )}>
                        {message.type === 'text' && (
                          <div className={cn(
                            "relative px-3 py-2 rounded-lg shadow-sm",
                            isOwn 
                              ? "bg-[#dcf8c6] rounded-br-none" 
                              : "bg-white rounded-bl-none"
                          )}>
                            {/* WhatsApp-style tail */}
                            <div className={cn(
                              "absolute bottom-0 w-0 h-0",
                              isOwn 
                                ? "right-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#dcf8c6]"
                                : "left-0 border-r-[8px] border-r-transparent border-t-[8px] border-t-white"
                            )} />
                            
                            <p className="text-[14.5px] text-slate-800 break-words whitespace-pre-wrap">
                              {message.content}
                            </p>
                            
                            {/* Time and status */}
                            <div className={cn(
                              "flex items-center gap-1 mt-1 justify-end",
                              isOwn ? "ml-4" : ""
                            )}>
                              <span className="text-[11px] text-slate-500">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {isOwn && (
                                message.read ? (
                                  <CheckCheck className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <Check className="w-4 h-4 text-slate-400" />
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {message.type === 'file' && (
                          <div className={cn(
                            "relative px-3 py-2.5 rounded-lg shadow-sm min-w-[280px]",
                            isOwn 
                              ? "bg-[#dcf8c6] rounded-br-none" 
                              : "bg-white rounded-bl-none"
                          )}>
                            {/* WhatsApp-style tail */}
                            <div className={cn(
                              "absolute bottom-0 w-0 h-0",
                              isOwn 
                                ? "right-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#dcf8c6]"
                                : "left-0 border-r-[8px] border-r-transparent border-t-[8px] border-t-white"
                            )} />
                            
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-sangria/10 rounded-lg flex items-center justify-center">
                                <File className="w-5 h-5 text-sangria" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {message.fileName}
                                </p>
                                <p className="text-xs text-slate-500">PDF Document</p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="w-4 h-4 text-slate-600" />
                              </Button>
                            </div>
                            
                            {message.content && (
                              <p className="text-[14.5px] text-slate-800 mt-2">
                                {message.content}
                              </p>
                            )}
                            
                            {/* Time and status */}
                            <div className={cn(
                              "flex items-center gap-1 mt-1 justify-end",
                              isOwn ? "ml-4" : ""
                            )}>
                              <span className="text-[11px] text-slate-500">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {isOwn && (
                                message.read ? (
                                  <CheckCheck className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <Check className="w-4 h-4 text-slate-400" />
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input - FIXED */}
            <div className="bg-[#f0f2f5] px-4 py-2 flex-shrink-0">
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    console.log('File selected:', e.target.files?.[0]);
                  }}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full hover:bg-slate-200 flex-shrink-0"
                >
                  <Smile className="w-6 h-6 text-slate-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 p-0 rounded-full hover:bg-slate-200 flex-shrink-0"
                >
                  <Paperclip className="w-6 h-6 text-slate-600" />
                </Button>

                <div className="flex-1 bg-white rounded-lg overflow-hidden">
                  <Input
                    placeholder="Type a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-4"
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0 rounded-full flex-shrink-0",
                    messageInput.trim() 
                      ? "bg-sangria hover:bg-merlot" 
                      : "bg-slate-200 hover:bg-slate-300"
                  )}
                >
                  {messageInput.trim() ? (
                    <Send className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-slate-600" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 opacity-10">
                <svg viewBox="0 0 303 172" fill="none">
                  <path d="M118.5 17C118.5 8.16 125.66 1 134.5 1h134c8.84 0 16 7.16 16 16v118c0 8.84-7.16 16-16 16h-134c-8.84 0-16-7.16-16-16V17z" fill="#fff"/>
                  <path d="M134.5 0c-9.389 0-17 7.611-17 17v118c0 9.389 7.611 17 17 17h134c9.389 0 17-7.611 17-17V17c0-9.389-7.611-17-17-17h-134z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-2xl text-slate-800 mb-2">Extreme Staffing</h3>
              <p className="text-slate-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {callType === 'video' ? 'Video Call' : 'Voice Call'} with {selectedConversation?.participantName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ aspectRatio: callType === 'video' ? '16/9' : '1/1' }}>
            {isInCall ? (
              <>
                {callType === 'video' && !isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarFallback className="bg-sangria text-white text-4xl">
                          {selectedConversation?.participantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-lg">Video Call Active</p>
                    </div>
                  </div>
                )}
                
                {(callType === 'voice' || isVideoOff) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarFallback className="bg-sangria text-white text-4xl">
                          {selectedConversation?.participantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-lg mb-2">{selectedConversation?.participantName}</p>
                      <p className="text-sm text-slate-400">Call in progress...</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  {callType === 'video' && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={cn(
                        "rounded-full h-14 w-14 p-0 bg-white/10 border-white/20 hover:bg-white/20",
                        isVideoOff && "bg-red-500 hover:bg-red-600 border-red-500"
                      )}
                    >
                      {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsMuted(!isMuted)}
                    className={cn(
                      "rounded-full h-14 w-14 p-0 bg-white/10 border-white/20 hover:bg-white/20",
                      isMuted && "bg-red-500 hover:bg-red-600 border-red-500"
                    )}
                  >
                    {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={endCall}
                    className="rounded-full h-14 w-14 p-0 bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarFallback className="bg-sangria text-white text-4xl">
                      {selectedConversation?.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-lg mb-2">Calling {selectedConversation?.participantName}...</p>
                  <p className="text-sm text-slate-400">Waiting for answer</p>
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      size="lg"
                      onClick={endCall}
                      className="rounded-full h-14 px-8 bg-red-500 hover:bg-red-600"
                    >
                      <PhoneOff className="w-6 h-6 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}