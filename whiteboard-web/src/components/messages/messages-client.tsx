'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConversationMessages } from '@/actions/messages';
import { useWebSocket } from '@/contexts/websocket-context';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  sender: User;
  receiver: User;
}

interface Conversation {
  partner: User;
  lastMessage: Message;
  unreadCount: number;
}

interface MessageableUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  courseTitle?: string;
  courseCode?: string;
}

interface MessagesClientProps {
  initialConversations: Conversation[];
  currentUserId: string;
  messageableUsers: MessageableUser[];
  currentUserRole: string;
}

export function MessagesClient({ 
  initialConversations, 
  currentUserId, 
  messageableUsers,
  currentUserRole 
}: MessagesClientProps) {
  const { messageSocket } = useWebSocket();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    initialConversations.length > 0 ? initialConversations[0] : null
  );
  const [selectedUser, setSelectedUser] = useState<MessageableUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const filteredConversations = conversations.filter(conv =>
    `${conv.partner.firstName} ${conv.partner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = messageableUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedConversation) {
      void loadMessages(selectedConversation.partner.id);
    }
  }, [selectedConversation]);

  // WebSocket listeners for real-time messages
  useEffect(() => {
    if (!messageSocket) return;

    const handleMessageReceived = (messageData: Message) => {
      console.log('📩 Message received via WebSocket:', messageData);
      
      // Only add message if it's in the current conversation
      const currentPartnerId = selectedConversation?.partner.id || selectedUser?.id;
      if (messageData.senderId === currentPartnerId) {
        // Check if message already exists before adding (prevent duplicates)
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === messageData.id);
          if (exists) {
            console.log('⚠️ Message already exists, skipping duplicate:', messageData.id);
            return prev;
          }
          return [...prev, messageData];
        });
        
        // Update conversation's last message
        setConversations(prev => prev.map(conv => 
          conv.partner.id === messageData.senderId
            ? { ...conv, lastMessage: messageData, unreadCount: conv.unreadCount + 1 }
            : conv
        ));
      } else {
        // Update conversation list for messages from other users
        setConversations(prev => {
          const existingConv = prev.find(c => c.partner.id === messageData.senderId);
          if (existingConv) {
            return prev.map(conv => 
              conv.partner.id === messageData.senderId
                ? { ...conv, lastMessage: messageData, unreadCount: conv.unreadCount + 1 }
                : conv
            );
          }
          // If no existing conversation, don't add it (user needs to refresh)
          return prev;
        });
      }
    };

    const handleMessageSent = (messageData: Message) => {
      console.log('📤 Message sent via WebSocket:', messageData);
      
      // Check if message already exists before adding (prevent duplicates)
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === messageData.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping duplicate:', messageData.id);
          return prev;
        }
        return [...prev, messageData];
      });
      
      // Update conversation's last message when we send a message
      setConversations(prev => prev.map(conv => 
        conv.partner.id === messageData.receiverId
          ? { ...conv, lastMessage: messageData }
          : conv
      ));
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      console.log('⌨️ User typing:', data);
      // TODO: Implement typing indicator UI
    };

    messageSocket.on('messageReceived', handleMessageReceived);
    messageSocket.on('messageSent', handleMessageSent);
    messageSocket.on('userTyping', handleUserTyping);

    return () => {
      messageSocket.off('messageReceived', handleMessageReceived);
      messageSocket.off('messageSent', handleMessageSent);
      messageSocket.off('userTyping', handleUserTyping);
    };
  }, [messageSocket, selectedConversation, selectedUser]);

  const loadMessages = async (partnerId: string) => {
    setIsLoading(true);
    const result = await getConversationMessages(partnerId);
    if (result.success && result.data) {
      setMessages(result.data.messages);
    } else {
      console.error('Failed to load messages:', result.error);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentPartner || !messageSocket) return;

    console.log('📤 Sending message via WebSocket...', {
      senderId: currentUserId,
      receiverId: currentPartner.id,
      content: messageInput.trim()
    });

    // Send message via WebSocket
    messageSocket.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: currentPartner.id,
      content: messageInput.trim()
    });

    setMessageInput('');
    
    // If this is a new conversation (from all users tab), update conversations
    if (selectedUser && !selectedConversation) {
      // Switch to conversations tab after sending first message
      setShowAllUsers(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    // Format as date
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleUserSelect = async (user: MessageableUser) => {
    setSelectedUser(user);
    setSelectedConversation(null);
    setShowAllUsers(false);
    await loadMessages(user.id);
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedUser(null);
    await loadMessages(conversation.partner.id);
  };

  const currentPartner = selectedConversation?.partner || selectedUser;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Connect with instructors and classmates
        </p>
      </div>

      {/* Messages Container */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-220px)]">
        {/* Conversations/Users List */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={!showAllUsers ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllUsers(false)}
                className="flex-1"
              >
                Conversations
              </Button>
              <Button
                variant={showAllUsers ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllUsers(true)}
                className="flex-1"
              >
                All Users
              </Button>
            </div>
          </div>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {!showAllUsers ? (
              // Show conversations
              filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm ? 'No conversations found' : 'No messages yet. Start a conversation!'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.partner.id}
                      onClick={() => void handleConversationSelect(conversation)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-accent/50 hover:text-accent-foreground transition-colors",
                        selectedConversation?.partner.id === conversation.partner.id && "bg-accent"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.partner.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(conversation.partner.firstName, conversation.partner.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.partner.firstName} {conversation.partner.lastName}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <Badge className="h-5 min-w-5 px-1.5 bg-primary text-primary-foreground">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(conversation.lastMessage.sentAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              // Show all messageable users
              filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm ? 'No users found' : 'No users available'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => void handleUserSelect(user)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-accent/50 hover:text-accent-foreground transition-colors",
                        selectedUser?.id === user.id && "bg-accent"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user.role.toLowerCase()}
                          </p>
                          {user.courseTitle && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {user.courseCode} - {user.courseTitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        {currentPartner ? (
          <Card className="flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentPartner.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(currentPartner.firstName, currentPartner.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {currentPartner.firstName} {currentPartner.lastName}
                  </h2>
                  <p className="text-xs text-muted-foreground capitalize">
                    {currentPartner.role.toLowerCase()}
                  </p>
                  {selectedUser?.courseTitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUser.courseCode} - {selectedUser.courseTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.senderId === currentUserId ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        message.senderId === currentUserId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          message.senderId === currentUserId
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatMessageTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && currentPartner) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </Card>
        )}
      </div>
    </div>
  );
}
