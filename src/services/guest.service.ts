/**
 * Guest Service
 * 
 * Handles all guest/join event-related API operations.
 * Provides methods for joining events, leaving events, and managing guest status.
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

// Type definitions
export interface JoinEventInput {
  eventId?: string;
  shortCode?: string;
  userId?: string;
  email?: string;
  name?: string;
}

export interface GuestEvent {
  id: string;
  userId: string;
  eventId: string;
  status: 'INVITED' | 'JOINED' | 'CHECKED_IN';
  joinedAt?: string | Date;
  checkedInAt?: string | Date;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  event?: {
    id: string;
    name: string;
    startDate: string | Date;
    endDate: string | Date;
    location?: string | null;
    shortCode: string;
    scheduleItems?: Array<{
      id: string;
      title: string;
      startTime: string | Date;
      endTime: string | Date;
      location?: string | null;
    }>;
    _count?: {
      guestEvents?: number;
    };
  };
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class GuestService {
  // Cache for guest events
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
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
    requestFn: () => Promise<ServiceResponse<T>>
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
   * Join an event
   */
  async joinEvent(data: JoinEventInput): Promise<ServiceResponse<GuestEvent>> {
    try {
      const response = await apiService.post<GuestEvent>(
        API_ENDPOINTS.GUESTS.JOIN,
        data,
        !!data.userId // Require auth if userId is provided
      );

      if (response.success && response.data) {
        // Clear relevant caches
        this.clearCache('my-events');
        if (response.data.eventId) {
          this.clearCache(`guests:event:${response.data.eventId}`);
        }
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to join event',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error joining event:', error);
      return {
        success: false,
        message: error.message || 'Failed to join event',
        error: 'JOIN_EVENT_ERROR',
      };
    }
  }

  /**
   * Get events joined by the current user
   */
  async getMyJoinedEvents(): Promise<ServiceResponse<GuestEvent[]>> {
    const cacheKey = 'my-events';

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<GuestEvent[]>(
          API_ENDPOINTS.GUESTS.MY_EVENTS
        );

        if (response.success && response.data) {
          this.setCache(cacheKey, response.data);
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to fetch joined events',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching joined events:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch joined events',
          error: 'FETCH_JOINED_EVENTS_ERROR',
        };
      }
    });
  }

  /**
   * Get guests for a specific event
   */
  async getEventGuests(eventId: string): Promise<ServiceResponse<GuestEvent[]>> {
    const cacheKey = `guests:event:${eventId}`;

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        // Note: This endpoint might need to be added to API_ENDPOINTS
        // For now, using the pattern from routes
        const response = await apiService.get<GuestEvent[]>(
          `/api/guests/event/${eventId}`
        );

        if (response.success && response.data) {
          this.setCache(cacheKey, response.data);
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to fetch event guests',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching event guests:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch event guests',
          error: 'FETCH_EVENT_GUESTS_ERROR',
        };
      }
    });
  }

  /**
   * Leave an event
   */
  async leaveEvent(eventId: string): Promise<ServiceResponse<void>> {
    try {
      const response = await apiService.delete(
        API_ENDPOINTS.GUESTS.LEAVE(eventId)
      );

      if (response.success) {
        // Clear relevant caches
        this.clearCache('my-events');
        this.clearCache(`guests:event:${eventId}`);
        return {
          success: true,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to leave event',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error leaving event:', error);
      return {
        success: false,
        message: error.message || 'Failed to leave event',
        error: 'LEAVE_EVENT_ERROR',
      };
    }
  }

  /**
   * Update guest status (e.g., check in)
   */
  async updateGuestStatus(
    userId: string,
    eventId: string,
    status: 'INVITED' | 'JOINED' | 'CHECKED_IN'
  ): Promise<ServiceResponse<GuestEvent>> {
    try {
      // Note: This endpoint might need to be added to API_ENDPOINTS
      // For now, using the pattern from routes
      const response = await apiService.patch<GuestEvent>(
        `/api/guests/${userId}/${eventId}/status`,
        { status }
      );

      if (response.success && response.data) {
        // Clear relevant caches
        this.clearCache('my-events');
        this.clearCache(`guests:event:${eventId}`);
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to update guest status',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error updating guest status:', error);
      return {
        success: false,
        message: error.message || 'Failed to update guest status',
        error: 'UPDATE_GUEST_STATUS_ERROR',
      };
    }
  }
}

export const guestService = new GuestService();
export default guestService;

