export interface Event {
  id?: string;
  shortCode?: string;
  title: string;
  date: string;
  location: string;
  image?: string;
  attendees?: number;
  attendeesAvatars?: string[];
  startTime?: string;
  endTime?: string;
  coverImage?: string;
  portraitImage?: string;
  galleryImages?: string[];
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
  CreateEvent: { initialData?: any } | undefined;
  AddEventMedia: { eventData: any };
  ManageEvents: undefined;
  SearchResults: { query?: string };
  AddScheduleBlock: { onSave?: (block: any) => void; initialBlock?: any };
  AddVenue: { onSave?: (venue: any) => void; initialVenue?: any };
  InvitePeople: { onSave?: (people: any[]) => void; initialPeople?: any[] };
  Login: { returnTo?: string; eventCode?: string } | undefined;
  SignUp: { returnTo?: string; eventCode?: string } | undefined;
  ForgotPassword: undefined;
  EmailVerification: { email?: string };
  JoinEvent: { eventCode?: string; autoJoin?: boolean } | undefined;
  JoinedEvents: undefined;
  SelectLocation: { onSelect?: (location: any) => void } | undefined;
  DiscoverEvents: { eventType?: string } | undefined;
  CreateAnnouncement: { eventId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Announcements: undefined;
  Profile: undefined;
};
