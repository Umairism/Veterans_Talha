/*
  # VeteranMeet Database Schema

  ## Overview
  Complete database schema for VeteranMeet - a social platform connecting retired professionals with community service opportunities.

  ## New Tables

  ### 1. profiles
  Extends auth.users with additional profile information for both Veterans and Organizations
  - `id` (uuid, references auth.users) - Primary key
  - `user_type` (text) - Either 'veteran' or 'organization'
  - `full_name` (text) - Display name
  - `email` (text) - User email
  - `profession` (text) - For veterans: their profession
  - `organization_name` (text) - For organizations: their name
  - `hobbies` (text[]) - Array of hobbies/interests (for veterans)
  - `bio` (text) - Profile description
  - `avatar_url` (text) - Profile picture URL
  - `stars` (integer) - Gamification points (default 0)
  - `city` (text) - Location
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. events
  Community service opportunities created by organizations
  - `id` (uuid) - Primary key
  - `organization_id` (uuid) - References profiles(id)
  - `title` (text) - Event name
  - `description` (text) - Event details
  - `event_type` (text) - Type: Public Talk, Plantation Drive, Medical Visit, etc.
  - `location` (text) - Event location
  - `city` (text) - City for search filtering
  - `star_value` (integer) - Points awarded (0-5000)
  - `event_date` (timestamptz) - When the event occurs
  - `created_at` (timestamptz) - When posted
  - `status` (text) - upcoming, completed, cancelled

  ### 3. posts
  Social feed content from veterans and organizations
  - `id` (uuid) - Primary key
  - `author_id` (uuid) - References profiles(id)
  - `content` (text) - Post text
  - `image_url` (text) - Optional image
  - `created_at` (timestamptz) - Post timestamp

  ### 4. event_participants
  Tracks veteran participation in events
  - `id` (uuid) - Primary key
  - `event_id` (uuid) - References events(id)
  - `veteran_id` (uuid) - References profiles(id)
  - `status` (text) - invited, registered, attended, completed
  - `stars_earned` (integer) - Points earned from this event
  - `created_at` (timestamptz) - When registered

  ### 5. follows
  Social connections between users
  - `id` (uuid) - Primary key
  - `follower_id` (uuid) - User following
  - `following_id` (uuid) - User being followed
  - `created_at` (timestamptz) - When follow occurred

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile and update it
  - Users can read public profiles
  - Only organizations can create events
  - Users can read all events
  - Users can read posts from users they follow
  - Event participation requires authentication
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('veteran', 'organization')),
  full_name text NOT NULL,
  email text NOT NULL,
  profession text,
  organization_name text,
  hobbies text[] DEFAULT '{}',
  bio text DEFAULT '',
  avatar_url text,
  stars integer DEFAULT 0,
  city text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  star_value integer NOT NULL CHECK (star_value >= 0 AND star_value <= 5000),
  event_date timestamptz NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizations can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'organization'
    )
  );

CREATE POLICY "Organizations can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  veteran_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered' CHECK (status IN ('invited', 'registered', 'attended', 'completed')),
  stars_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, veteran_id)
);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own participations"
  ON event_participants FOR SELECT
  TO authenticated
  USING (
    auth.uid() = veteran_id OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.organization_id = auth.uid()
    )
  );

CREATE POLICY "Veterans can register for events"
  ON event_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = veteran_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'veteran'
    )
  );

CREATE POLICY "Users can update their own participations"
  ON event_participants FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = veteran_id OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.organization_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = veteran_id OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.organization_id = auth.uid()
    )
  );

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_organization ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_veteran ON event_participants(veteran_id);
CREATE INDEX IF NOT EXISTS idx_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);