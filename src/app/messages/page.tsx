"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchNormal1, Send2 } from "iconsax-react";

const conversations = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Instructor",
    avatar: "SJ",
    lastMessage: "Your assignment submission looks great!",
    time: "2m ago",
    unread: 2,
  },
  {
    id: 2,
    name: "Study Group - Math",
    role: "Group",
    avatar: "SG",
    lastMessage: "Anyone available for study session?",
    time: "15m ago",
    unread: 5,
  },
  {
    id: 3,
    name: "Prof. Michael Chen",
    role: "Instructor",
    avatar: "MC",
    lastMessage: "Lab report deadline extended",
    time: "1h ago",
    unread: 0,
  },
];

const messages = [
  {
    id: 1,
    sender: "Dr. Sarah Johnson",
    content: "Hi! I reviewed your latest assignment.",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Thank you! Do you have any feedback?",
    time: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Dr. Sarah Johnson",
    content: "Your assignment submission looks great! Keep up the good work.",
    time: "10:35 AM",
    isOwn: false,
  },
];

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Connect with instructors and classmates
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <div className="relative">
                <SearchNormal1
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>{conversation.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">
                        {conversation.name}
                      </h4>
                      {conversation.unread > 0 && (
                        <Badge
                          variant="default"
                          className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Dr. Sarah Johnson</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Mathematics Instructor
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Type a message..." />
                <Button size="icon">
                  <Send2 size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
