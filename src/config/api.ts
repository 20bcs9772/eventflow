/**
 * API Configuration
 *
 * Configure the base URL for your backend server.
 * Set API_URL in your .env file.
 */

import { ENV } from './env';

export const API_CONFIG = {
  baseURL: ENV.API_URL,
  timeout: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
    VERIFY: '/api/auth/verify',
    DELETE_ACCOUNT: '/api/auth/account',
  },
  // Events
  EVENTS: {
    LIST: '/api/events',
    PUBLIC: '/api/events/public',
    HAPPENING_NOW: '/api/events/happening-now',
    CALENDAR: '/api/events/calendar',
    ADMIN: '/api/events/admin',
    DETAIL: (id: string) => `/api/events/${id}`,
    CREATE: '/api/events',
    UPDATE: (id: string) => `/api/events/${id}`,
    DELETE: (id: string) => `/api/events/${id}`,
    BY_CODE: (code: string) => `/api/events/code/${code}`,
    TYPES: `/api/events/types`,
  },
  // Guest Events
  GUESTS: {
    JOIN: '/api/guests/join',
    MY_EVENTS: '/api/guests/my-events',
    LEAVE: (eventId: string) => `/api/guests/${eventId}`,
  },
  // Announcements
  ANNOUNCEMENTS: {
    LIST: (eventId: string) => `/api/announcements/event/${eventId}`,
    CREATE: '/api/announcements',
  },
  // Devices
  DEVICES: {
    REGISTER: '/api/devices',
    UPDATE: (id: string) => `/api/devices/${id}`,
  },
};
