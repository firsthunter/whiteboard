'use client';

import axios, { AxiosRequestConfig } from 'axios';
import { isCacheValid } from '@/lib/database';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4050';

// Cache keys for different endpoints
const CACHE_KEYS = {
  courses: 'courses',
  course: (id: string) => `course_${id}`,
  assignments: 'assignments',
  assignment: (id: string) => `assignment_${id}`,
  messages: 'messages',
  announcements: 'announcements',
  users: 'users',
  user: (id: string) => `user_${id}`,
} as const;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
  fromCache?: boolean;
}

class OfflineApiClient {
  private getAuthToken(): string | null {
    // Get token from localStorage or session
    return localStorage.getItem('accessToken');
  }

  private isOnline(): boolean {
    return navigator.onLine;
  }

  async request<T>(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    urlPath: string,
    data?: any,
    options: {
      withToken?: boolean;
      cacheKey?: string;
      enableCache?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      withToken = true,
      cacheKey,
      enableCache = method === 'get'
    } = options;

    const config: AxiosRequestConfig = {
      method,
      url: `${SERVER_URL}/${urlPath}`,
      data,
      headers: {},
    };

    if (withToken) {
      const accessToken = this.getAuthToken();
      if (accessToken) {
        config.headers!.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Try to get from cache first if enabled and offline
    if (enableCache && !this.isOnline() && cacheKey) {
      try {
        const cachedData = await this.getFromCache(cacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            message: 'Data loaded from cache (offline mode)',
          };
        }
      } catch (error) {
        console.warn('Failed to load from cache:', error);
      }
    }

    // If offline and no cache, return offline error
    if (!this.isOnline()) {
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'You are currently offline. Please check your internet connection.',
        },
      };
    }

    try {
      const response = await axios(config);
      const result = response.data;

      // Cache successful GET responses
      if (enableCache && method === 'get' && cacheKey && result.success && result.data) {
        await this.saveToCache(cacheKey, result.data);
      }

      return result;
    } catch (error: any) {
      // If network error and we have cache, return cached data
      if (enableCache && cacheKey && (error.code === 'NETWORK_ERROR' || !this.isOnline())) {
        try {
          const cachedData = await this.getFromCache(cacheKey);
          if (cachedData) {
            return {
              success: true,
              data: cachedData,
              fromCache: true,
              message: 'Data loaded from cache due to network error',
            };
          }
        } catch (cacheError) {
          console.warn('Failed to load from cache:', cacheError);
        }
      }

      return {
        success: false,
        error: {
          code: error.response?.data?.error || 'NETWORK_ERROR',
          message: error.response?.data?.message || error.message || 'An error occurred',
        },
      };
    }
  }

  private async getFromCache(cacheKey: string): Promise<any> {
    // For now, use localStorage with Dexie integration planned
    const cacheData = localStorage.getItem(`cache_${cacheKey}`);
    if (cacheData) {
      const parsed = JSON.parse(cacheData);
      if (await isCacheValid(parsed._cachedAt)) {
        return parsed.data;
      } else {
        localStorage.removeItem(`cache_${cacheKey}`);
      }
    }
    return null;
  }

  private async saveToCache(cacheKey: string, data: any): Promise<void> {
    const cacheEntry = {
      data,
      _cachedAt: Date.now(),
    };
    localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheEntry));
  }

  async queueOfflineAction(
    method: 'post' | 'patch' | 'put' | 'delete',
    urlPath: string,
    data?: any,
    options: {
      withToken?: boolean;
      actionId?: string;
    } = {}
  ): Promise<ApiResponse<any>> {
    const { withToken = true, actionId } = options;
    const id = actionId || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const pendingAction = {
      id,
      method,
      urlPath,
      data,
      withToken,
      timestamp: Date.now(),
    };

    // Store in localStorage for background sync
    const pendingActions = JSON.parse(
      localStorage.getItem('pendingOfflineActions') || '[]'
    );
    pendingActions.push(pendingAction);
    localStorage.setItem('pendingOfflineActions', JSON.stringify(pendingActions));

    return {
      success: true,
      data: { queued: true, actionId: id },
      message: 'Action queued for sync when online',
    };
  }

  async getCourseById(courseId: string): Promise<ApiResponse<any>> {
    return this.request('get', `courses/${courseId}`, undefined, {
      cacheKey: CACHE_KEYS.course(courseId)
    });
  }

  async getAssignments(params: any = {}): Promise<ApiResponse<any>> {
    const queryString = new URLSearchParams(params).toString();
    const url = `assignments${queryString ? `?${queryString}` : ''}`;
    return this.request('get', url, undefined, { cacheKey: CACHE_KEYS.assignments });
  }

  async getMessages(params: any = {}): Promise<ApiResponse<any>> {
    const queryString = new URLSearchParams(params).toString();
    const url = `messages${queryString ? `?${queryString}` : ''}`;
    return this.request('get', url, undefined, { cacheKey: CACHE_KEYS.messages });
  }

  async getAnnouncements(params: any = {}): Promise<ApiResponse<any>> {
    const queryString = new URLSearchParams(params).toString();
    const url = `announcements${queryString ? `?${queryString}` : ''}`;
    return this.request('get', url, undefined, { cacheKey: CACHE_KEYS.announcements });
  }
}

export const offlineApiClient = new OfflineApiClient();