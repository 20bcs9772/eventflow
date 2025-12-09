/**
 * Event Service
 * 
 * Handles all event-related API operations.
 * Provides methods for creating, fetching, updating, and deleting events.
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

// Type definitions
export interface CreateEventInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
  location?: string;
  venue?: {
    name?: string;
    fullAddress?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  type?: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'COLLEGE_FEST' | 'OTHER';
  scheduleItems?: Array<{
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    orderIndex?: number;
  }>;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  type?: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'COLLEGE_FEST' | 'OTHER';
}

export interface Event {
  id: string;
  name: string;
  description?: string | null;
  shortCode: string;
  startDate: string | Date;
  endDate: string | Date;
  location?: string | null;
  visibility: string;
  type: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  scheduleItems?: Array<{
    id: string;
    title: string;
    description?: string | null;
    startTime: string | Date;
    endTime: string | Date;
    location?: string | null;
    orderIndex: number;
  }>;
  announcements?: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    sender?: {
      id: string;
      name?: string | null;
    };
  }>;
  guestEvents?: Array<{
    id: string;
    status: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }>;
  _count?: {
    guestEvents?: number;
  };
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class EventService {
  // Cache for event data (simple in-memory cache)
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Clear cache for a specific event or all events
   */
  clearCache(eventId?: string): void {
    if (eventId) {
      this.cache.delete(`event:${eventId}`);
      this.cache.delete(`event:code:*`); // Clear code-based lookups
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
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const request = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventInput): Promise<ServiceResponse<Event>> {
    try {
      const response = await apiService.post<Event>(
        API_ENDPOINTS.EVENTS.CREATE,
        data
      );

      if (response.success && response.data) {
        // Clear relevant caches
        this.clearCache();
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to create event',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error creating event:', error);
      return {
        success: false,
        message: error.message || 'Failed to create event',
        error: 'CREATE_EVENT_ERROR',
      };
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string, useCache = true): Promise<ServiceResponse<Event>> {
    const cacheKey = `event:${id}`;

    // Check cache first
    if (useCache) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<Event>(
          API_ENDPOINTS.EVENTS.DETAIL(id),
          true
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
          message: response.message || 'Event not found',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching event:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch event',
          error: 'FETCH_EVENT_ERROR',
        };
      }
    });
  }

  /**
   * Get event by short code
   */
  async getEventByShortCode(
    shortCode: string,
    useCache = true
  ): Promise<ServiceResponse<Event>> {
    const cacheKey = `event:code:${shortCode}`;

    // Check cache first
    if (useCache) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<Event>(
          API_ENDPOINTS.EVENTS.BY_CODE(shortCode),
          false // Public endpoint
        );

        if (response.success && response.data) {
          if (useCache) {
            this.setCache(cacheKey, response.data);
            // Also cache by ID
            this.setCache(`event:${response.data.id}`, response.data);
          }
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Event not found',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching event by code:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch event',
          error: 'FETCH_EVENT_ERROR',
        };
      }
    });
  }

  /**
   * Get events created by the current user (admin)
   */
  async getMyEvents(): Promise<ServiceResponse<Event[]>> {
    const cacheKey = 'events:admin';

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<Event[]>(
          API_ENDPOINTS.EVENTS.ADMIN
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
          message: response.message || 'Failed to fetch events',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching my events:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch events',
          error: 'FETCH_EVENTS_ERROR',
        };
      }
    });
  }

  /**
   * Get public events for discovery
   */
  async getPublicEvents(
    limit = 10,
    offset = 0
  ): Promise<ServiceResponse<Event[]>> {
    const cacheKey = `events:public:${limit}:${offset}`;

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<Event[]>(
          `${API_ENDPOINTS.EVENTS.PUBLIC}?limit=${limit}&offset=${offset}`,
          false // Public endpoint
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
          message: response.message || 'Failed to fetch public events',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching public events:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch public events',
          error: 'FETCH_PUBLIC_EVENTS_ERROR',
        };
      }
    });
  }

  /**
   * Get events happening now (next 24 hours)
   */
  async getEventsHappeningNow(limit = 5): Promise<ServiceResponse<Event[]>> {
    const cacheKey = `events:happening-now:${limit}`;

    // Check cache (shorter TTL for this)
    const cached = this.getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await apiService.get<Event[]>(
          `${API_ENDPOINTS.EVENTS.HAPPENING_NOW}?limit=${limit}`,
          false // Public endpoint
        );

        if (response.success && response.data) {
          // Shorter cache for "happening now" events (1 minute)
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to fetch events',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching happening now events:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch events',
          error: 'FETCH_EVENTS_ERROR',
        };
      }
    });
  }

  /**
   * Get calendar events (created + joined) for current user
   */
  async getCalendarEvents(
    startDate?: string,
    endDate?: string
  ): Promise<ServiceResponse<Event[]>> {
    const cacheKey = `events:calendar:${startDate || 'default'}:${endDate || 'default'}`;

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.deduplicateRequest(cacheKey, async () => {
      try {
        let url = API_ENDPOINTS.EVENTS.CALENDAR;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await apiService.get<Event[]>(url);

        if (response.success && response.data) {
          this.setCache(cacheKey, response.data);
          return {
            success: true,
            data: response.data,
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to fetch calendar events',
          error: response.error,
        };
      } catch (error: any) {
        console.error('Error fetching calendar events:', error);
        return {
          success: false,
          message: error.message || 'Failed to fetch calendar events',
          error: 'FETCH_CALENDAR_EVENTS_ERROR',
        };
      }
    });
  }

  /**
   * Update an event
   */
  async updateEvent(
    eventId: string,
    data: UpdateEventInput
  ): Promise<ServiceResponse<Event>> {
    try {
      const response = await apiService.patch<Event>(
        API_ENDPOINTS.EVENTS.UPDATE(eventId),
        data
      );

      if (response.success && response.data) {
        // Clear cache for this event
        this.clearCache(eventId);
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to update event',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error updating event:', error);
      return {
        success: false,
        message: error.message || 'Failed to update event',
        error: 'UPDATE_EVENT_ERROR',
      };
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<ServiceResponse<void>> {
    try {
      const response = await apiService.delete(
        API_ENDPOINTS.EVENTS.DELETE(eventId)
      );

      if (response.success) {
        // Clear cache
        this.clearCache(eventId);
        return {
          success: true,
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to delete event',
        error: response.error,
      };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete event',
        error: 'DELETE_EVENT_ERROR',
      };
    }
  }
}

export const eventService = new EventService();
export default eventService;

