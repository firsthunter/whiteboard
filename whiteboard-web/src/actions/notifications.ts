'use server';

import { revalidatePath } from 'next/cache';
import { handleRequest } from './utils/handleRequest';
import { ApiResponse } from './utils/types';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<ApiResponse<NotificationsResponse>> {
  return handleRequest<NotificationsResponse>('get', 'notifications');
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('patch', `notifications/${notificationId}/read`);
  
  if (result.success) {
    revalidatePath('/notifications');
  }
  
  return result;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
  const result = await handleRequest<any>('patch', 'notifications/read-all');
  
  if (result.success) {
    revalidatePath('/notifications');
  }
  
  return result;
}
