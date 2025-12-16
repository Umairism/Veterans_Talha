import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VeteranRank = 
  | 'Bronze Veteran'
  | 'Silver Veteran'
  | 'Ruby Veteran'
  | 'Golden Veteran'
  | 'Diamond Veteran'
  | 'Sapphire Veteran'
  | 'Platinum Veteran'
  | 'Eternal Sage';

export type EventType =
  | 'Public Talk'
  | 'Motivational Talk'
  | 'Professional Talk'
  | 'Professional Task'
  | 'Plantation Drive'
  | 'Orphanage Visit'
  | 'Hospital Visit'
  | 'Recreational Visit'
  | 'Old Home Visit'
  | 'Book Reading';

export interface Profile {
  id: string;
  user_type: 'veteran' | 'organization';
  full_name: string;
  email: string;
  profession?: string;
  organization_name?: string;
  hobbies?: string[];
  bio?: string;
  avatar_url?: string;
  stars: number;
  rank?: VeteranRank;
  city?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Event {
  id: string;
  organization_id?: string; // Deprecated, use creator_id
  creator_id: string;
  creator_type: 'veteran' | 'organization';
  title: string;
  description: string;
  event_type: EventType;
  location: string;
  city: string;
  star_value: number;
  event_date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
  organization?: Profile;
  creator?: Profile;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  author?: Profile;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  veteran_id: string;
  status: 'invited' | 'registered' | 'attended' | 'completed';
  stars_earned: number;
  created_at: string;
  event?: Event;
  veteran?: Profile;
}

export interface EventInvitation {
  id: string;
  event_id: string;
  veteran_id: string;
  inviter_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  event?: Event;
  veteran?: Profile;
  inviter?: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}
