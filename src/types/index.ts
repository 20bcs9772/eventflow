export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image?: string;
  attendees?: number;
  attendeesAvatars?: string[];
  startTime?: string;
  endTime?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isNew?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  device?: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Main: undefined;
  EventDetails: { event: Event };
  CreateEvent: undefined;
  SearchResults: { query?: string };
  AddScheduleBlock: { onSave?: (block: any) => void; initialBlock?: any };
  AddVenue: { onSave?: (venue: any) => void; initialVenue?: any };
  InvitePeople: { onSave?: (people: any[]) => void; initialPeople?: any[] };
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Announcements: undefined;
  Profile: undefined;
};

