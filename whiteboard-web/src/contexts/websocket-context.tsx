'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface WebSocketContextType {
  notificationSocket: Socket | null;
  messageSocket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: Notification[];
  refreshNotifications: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

const WebSocketContext = createContext<WebSocketContextType>({
  notificationSocket: null,
  messageSocket: null,
  isConnected: false,
  unreadCount: 0,
  notifications: [],
  refreshNotifications: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [messageSocket, setMessageSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const token = session?.accessToken as string | undefined;
  const user = session?.user;

  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:4050/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user || !user.id) {
      // Cleanup on logout
      if (notificationSocket) {
        notificationSocket.disconnect();
        setNotificationSocket(null);
      }
      if (messageSocket) {
        messageSocket.disconnect();
        setMessageSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Connect to notifications
    const notifSocket = io('http://localhost:4050/notifications', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    notifSocket.on('connect', () => {
      console.log('✅ Connected to notifications');
      notifSocket.emit('register', { userId: user.id });
      setIsConnected(true);
    });

    notifSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notifications');
      setIsConnected(false);
    });

    notifSocket.on('registered', (data) => {
      console.log('✅ Registered for notifications:', data);
    });

    notifSocket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.title, {
        description: notification.message,
      });
    });

    notifSocket.on('error', (error) => {
      console.error('Notification socket error:', error);
    });

    setNotificationSocket(notifSocket);

    // Connect to messages
    const msgSocket = io('http://localhost:4050/messages', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    msgSocket.on('connect', () => {
      console.log('✅ Connected to messages');
      msgSocket.emit('register', { userId: user.id });
    });

    msgSocket.on('disconnect', () => {
      console.log('❌ Disconnected from messages');
    });

    msgSocket.on('registered', (data) => {
      console.log('✅ Registered for messages:', data);
    });

    msgSocket.on('error', (error) => {
      console.error('Message socket error:', error);
    });

    setMessageSocket(msgSocket);

    // Fetch initial notifications
    refreshNotifications();

    return () => {
      notifSocket.disconnect();
      msgSocket.disconnect();
    };
  }, [token, user, refreshNotifications]);

  return (
    <WebSocketContext.Provider
      value={{
        notificationSocket,
        messageSocket,
        isConnected,
        unreadCount,
        notifications,
        refreshNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
