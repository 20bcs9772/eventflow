/**
 * Announcement Service
 *
 * Handles all announcement-related API operations.
 * Provides methods for creating and fetching announcements.
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

// Type definitions
export interface CreateAnnouncementInput {
  eventId: string;
  title: string;
  message: string;
  senderId?: string;
}

export interface Announcement {
  id: string;
  eventId: string;
  senderId: string;
  title: string;
  message: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  sender?: {
    id: string;
    name?: string | null;
  };
}

export interface UserAnnouncementEvent {
  event: {
    id: string;
    name: string;
    startDate: string | Date;
    endDate: string | Date;
    announcements: Array<{
      id: string;
      title: string;
      message: string;
      createdAt: string | Date;
      senderId: string;
    }>;
  };
}

export interface FlattenedAnnouncement {
  id: string;
  title: string;
  message: string;
  createdAt: string | Date;
  senderId: string;
  eventId: string;
  eventName: string;
  eventStartDate: string | Date;
  eventEndDate: string | Date;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AnnouncementService {
  // Cache for announcements
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1 * 60 * 1000; // 1 minute (announcements change frequently)
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Clear cache for a specific event or all announcements
   */
  clearCache(eventId?: string): void {
    if (eventId) {
      this.cache.delete(`announcements:event:${eventId}`);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cached data if valid
   */
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Deduplicate concurrent requests
   */
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<ServiceResponse<T>>,
  ): Promise<ServiceResponse<T>> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const request = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Get announcements for an event
   */
  async getEventAnnouncements(
    eventId: string,
    useCache = true,
  ): Promise<ServiceResponse<Announcement[]>> {
    const cacheKey = `announcements:event:${eventId}`;

    // Check cache
    if (useCache) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<Announcement[]>(
          API_ENDPOINTS.ANNOUNCEMENTS.LIST(eventId),
        );

        if (response.success && response.data) {
          if (useCache) {
            this.setCache(cacheKey, response.data);
          }
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to fetch announcements',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching announcements:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch announcements',
          error: 'FETCH_ANNOUNCEMENTS_ERROR',
        };
      }
    });
  }

  /**
   * Get user's announcements (all events with their announcements)
   */
  async getUserAnnouncements(
    useCache = true,
  ): Promise<ServiceResponse<UserAnnouncementEvent[]>> {
    const cacheKey = 'announcements:user';

    // Check cache
    if (useCache) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<UserAnnouncementEvent[]>(
          API_ENDPOINTS.ANNOUNCEMENTS.USER,
        );

        if (response.success && response.data) {
          if (useCache) {
            this.setCache(cacheKey, response.data);
          }
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to fetch announcements',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching user announcements:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch announcements',
          error: 'FETCH_USER_ANNOUNCEMENTS_ERROR',
        };
      }
    });
  }

  /**
   * Create a new announcement
   */
  async createAnnouncement(
    data: CreateAnnouncementInput & { senderId?: string },
  ): Promise<ServiceResponse<Announcement>> {
    try {
      const requestData = {
        ...data,
        ...(data.senderId && { senderId: data.senderId }),
      };

      const response = await apiService.post<Announcement>(
        API_ENDPOINTS.ANNOUNCEMENTS.CREATE,
        requestData,
      );

      if (response.success && response.data) {
        // Clear cache for this event
        this.clearCache(data.eventId);
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to create announcement',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      return {
        success: false,
        message: error.message || 'Failed to create announcement',
        error: 'CREATE_ANNOUNCEMENT_ERROR',
      };
    }
  }
}

export const announcementService = new AnnouncementService();
export default announcementService;
