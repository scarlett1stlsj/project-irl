
// Fix: Added ResponseStatus enum to define possible states for a response
export enum ResponseStatus {
  Confirmed = 'confirmed',
  Declined = 'declined',
  Pending = 'pending'
}

// User profile for authenticated users
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

// Contact imported by a user
export interface Contact {
  id: string;
  ownerId: string;
  name: string;
  email?: string;
  phone?: string;
  matchedUserId?: string; // If this contact is also a Trip Mode user
}

// Fix: Added TimeLabel type alias as string
export type TimeLabel = string;

// Fix: Added TimeWindow interface to represent available slots for coordination
export interface TimeWindow {
  id: string;
  date: string;
  timeLabel: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  location: {
    city: string;
    lat: number;
    lng: number;
  };
  availability: string[]; // Array of ISO date-time strings or simple labels like "2026-03-15T18:00"
}

export interface Venue {
  name: string;
  address: string;
  rating: number;
  description: string;
  type: string;
}

export interface Activity {
  id: string;
  tripId: string;
  friendId: string;
  friendName: string;
  timeSlot: string;
  venue: Venue;
  status: 'pending' | 'confirmed' | 'declined';
}

// Fix: Added Response interface for friends replying to a trip invitation
export interface Response {
  id: string;
  tripId: string;
  responderName: string;
  status: ResponseStatus;
  selectedWindowIds: string[];
  preferredVenueName?: string;
  note?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  ownerId?: string; // Firebase user ID of the trip creator
  city: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  activities: Activity[];
  // Fix: Added fields expected by ResponsePage.tsx for coordination features
  stayingLocations: string[];
  timeWindows: TimeWindow[];
  selectedVenues: Venue[];
}
