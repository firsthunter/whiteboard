'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/contexts/websocket-context';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  courseName?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const { messageSocket, isConnected } = useWebSocket();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's course instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/courses/enrolled`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (response.ok) {
          const courses = await response.json();
          // Extract unique instructors from enrolled courses
          const uniqueInstructors = new Map<string, Instructor>();
          
          courses.forEach((course: any) => {
            if (course.instructor) {
              uniqueInstructors.set(course.instructor.id, {
                id: course.instructor.id,
                firstName: course.instructor.firstName,
                lastName: course.instructor.lastName,
                email: course.instructor.email,
                image: course.instructor.image,
                courseName: course.title,
              });
            }
          });

          setInstructors(Array.from(uniqueInstructors.values()));
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.accessToken) {
      void fetchInstructors();
    }
  }, [session]);

  // Fetch messages when instructor is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedInstructor) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversation/${selectedInstructor.id}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    void fetchMessages();
  }, [selectedInstructor, session]);

  // Listen for real-time messages
  useEffect(() => {
    if (!messageSocket) return;

    messageSocket.on('messageReceived', (message: Message) => {
      if (
        message.senderId === selectedInstructor?.id ||
        message.receiverId === selectedInstructor?.id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    messageSocket.on('userTyping', ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (userId === selectedInstructor?.id) {
        setIsTyping(typing);
      }
    });

    return () => {
      messageSocket.off('messageReceived');
      messageSocket.off('userTyping');
    };
  }, [messageSocket, selectedInstructor]);

  const sendMessage = () => {
    if (!newMessage.trim() || !messageSocket || !selectedInstructor) return;

    messageSocket.emit('sendMessage', {
      senderId: session?.user?.id,
      receiverId: selectedInstructor.id,
      content: newMessage,
    });

    setNewMessage('');
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (messageSocket && selectedInstructor) {
      messageSocket.emit('typing', {
        receiverId: selectedInstructor.id,
        isTyping: value.length > 0,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Loading instructors...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <MessageSquare className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your instructors</p>
        </div>
        {!isConnected && (
          <Badge variant="destructive" className="ml-auto">
            Disconnected
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-280px)]">
        {/* Instructors list */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Your Instructors</h2>
          <ScrollArea className="h-[calc(100vh-360px)]">
            {instructors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No instructors found. Enroll in a course first.
              </p>
            ) : (
              <div className="space-y-2">
                {instructors.map((instructor) => (
                  <Button
                    key={instructor.id}
                    variant={selectedInstructor?.id === instructor.id ? 'default' : 'ghost'}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedInstructor(instructor)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={instructor.image} />
                      <AvatarFallback>
                        {instructor.firstName[0]}
                        {instructor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium">
                        {instructor.firstName} {instructor.lastName}
                      </p>
                      {instructor.courseName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {instructor.courseName}
                        </p>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat area */}
        <Card className="flex flex-col">
          {selectedInstructor ? (
            <>
              {/* Chat header */}
              <div className="border-b p-4 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedInstructor(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedInstructor.image} />
                  <AvatarFallback>
                    {selectedInstructor.firstName[0]}
                    {selectedInstructor.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {selectedInstructor.firstName} {selectedInstructor.lastName}
                  </h3>
                  {isTyping && (
                    <p className="text-sm text-muted-foreground">Typing...</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isSender = msg.senderId === session?.user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isSender
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            } rounded-lg p-3`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isSender
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {formatDistanceToNow(new Date(msg.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Message input */}
              <div className="border-t p-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select an instructor to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
