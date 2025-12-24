/**
 * Utility functions to map backend event data to frontend Event type
 */

import { Event } from '../types';
import dayjs from 'dayjs';

export interface BackendEvent {
  id: string;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  location?: string | null;
  shortCode: string;
  visibility: string;
  type: string;
  admin?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  guestEvents?: Array<{
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }>;
  _count?: {
    guestEvents?: number;
  };
  coverImage?: string;
  portraitImage?: string;
  galleryImages?: string[];
}

/**
 * Map backend event to frontend Event type
 */
export const mapBackendEventToFrontend = (
  backendEvent: BackendEvent,
): Event => {
  const startDate = new Date(backendEvent.startDate);
  const formattedDate = dayjs(startDate).format('MMM D, YYYY');

  // Get attendee count
  const attendeeCount =
    backendEvent._count?.guestEvents || backendEvent.guestEvents?.length || 0;

  // Get attendee avatars (first 3)
  const attendeesAvatars =
    backendEvent.guestEvents
      ?.slice(0, 3)
      .map(ge => ge.user?.name?.charAt(0) || '')
      .filter(Boolean) || [];

  return {
    id: backendEvent.id,
    shortCode: backendEvent.shortCode,
    title: backendEvent.name,
    date: formattedDate,
    location: backendEvent.location || 'Location TBA',
    attendees: attendeeCount,
    attendeesAvatars,
    startTime: dayjs(startDate).format('h:mm A'),
    endTime: backendEvent.endDate
      ? dayjs(new Date(backendEvent.endDate)).format('h:mm A')
      : undefined,
    coverImage: backendEvent?.coverImage,
    portraitImage: backendEvent?.portraitImage,
    galleryImages: backendEvent?.galleryImages,
  };
};

/**
 * Map array of backend events to frontend Event array
 */
export const mapBackendEventsToFrontend = (
  backendEvents: BackendEvent[],
): Event[] => {
  return backendEvents.map(mapBackendEventToFrontend);
};

/**
 * Get event status based on start and end dates
 * @param startDate - Event start date (Date, string, or ISO string)
 * @param endDate - Event end date (Date, string, or ISO string, optional)
 * @returns EventStatus: 'Draft' | 'Live' | 'Past'
 */
export const getEventStatus = (
  startDate: string | Date,
  endDate?: string | Date | null,
): 'Live' | 'Past' | 'Upcoming' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (now < start) {
    return 'Upcoming'; // Event hasn't started yet
  } else if (end && now >= start && now <= end) {
    return 'Live'; // Event is currently happening
  } else if (end && now > end) {
    return 'Past'; // Event has ended
  } else {
    // If no endDate, consider it Live if it has started
    return now >= start ? 'Live' : 'Upcoming';
  }
};
