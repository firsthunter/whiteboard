'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { getNotifications } from '@/actions/notifications';

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
      const result = await getNotifications();
      if (result.success && result.data) {
        setNotifications(result.data.notifications || []);
        setUnreadCount(result.data.unreadCount || 0);
      }
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

    // Debug listeners
    msgSocket.on('messageSent', (data) => {
      console.log('🔔 [WebSocket Context] messageSent event:', data);
    });

    msgSocket.on('messageReceived', (data) => {
      console.log('🔔 [WebSocket Context] messageReceived event:', data);
    });

    msgSocket.on('error', (error) => {
      console.error('Message socket error:', error);
    });

    setMessageSocket(msgSocket);

    // Fetch initial notifications
    void refreshNotifications();

    return () => {
      notifSocket.disconnect();
      msgSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

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
