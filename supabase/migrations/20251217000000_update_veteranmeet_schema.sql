/*
  # Updated VeteranMeet Database Schema

  ## Changes
  1. Add creator_id to events table (veterans can create events)
  2. Add event_invitations table for inviting veterans to events
  3. Add video_url to posts table for multimedia support
  4. Update profiles with veteran rank system
  5. Add hobby management features
  6. Add location tracking
  7. Ensure star_value is immutable after event creation

  ## New Tables
  - event_invitations: Track invitations to events
  
  ## Modified Tables
  - events: Add creator_id, creator_type
  - posts: Add video_url for multimedia
  - profiles: Add rank field
*/

-- Add creator fields to events table (can be created by veterans or organizations)
ALTER TABLE events ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS creator_type text CHECK (creator_type IN ('veteran', 'organization'));

-- Update existing events to have creator_id
UPDATE events SET creator_id = organization_id, creator_type = 'organization' WHERE creator_id IS NULL;

-- Make creator_id NOT NULL after migration
ALTER TABLE events ALTER COLUMN creator_id SET NOT NULL;
ALTER TABLE events ALTER COLUMN creator_type SET NOT NULL;

-- Add video_url to posts for multimedia support
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url text;

-- Add rank field to profiles for veteran ranking system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank text DEFAULT 'Bronze Veteran' CHECK (rank IN (
  'Bronze Veteran',
  'Silver Veteran',
  'Ruby Veteran',
  'Golden Veteran',
  'Diamond Veteran',
  'Sapphire Veteran',
  'Platinum Veteran',
  'Eternal Sage'
));

-- Add location coordinates for veteran location tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude decimal(10, 8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude decimal(11, 8);

-- Create event_invitations table
CREATE TABLE IF NOT EXISTS event_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  veteran_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  inviter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, veteran_id)
);

ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own invitations"
  ON event_invitations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = veteran_id OR
    auth.uid() = inviter_id OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_invitations.event_id
      AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and followers can invite veterans"
  ON event_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = inviter_id AND
    (
      EXISTS (
        SELECT 1 FROM events
        WHERE events.id = event_invitations.event_id
        AND events.creator_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM follows
        WHERE follows.follower_id = event_invitations.veteran_id
        AND follows.following_id = auth.uid()
      )
    )
  );

CREATE POLICY "Veterans can update their invitation status"
  ON event_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = veteran_id)
  WITH CHECK (auth.uid() = veteran_id);

-- Update RLS policies for events to allow veterans to create events
DROP POLICY IF EXISTS "Organizations can create events" ON events;

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.user_type = 'organization' OR profiles.user_type = 'veteran')
    )
  );

-- Update event update policy
DROP POLICY IF EXISTS "Organizations can update their own events" ON events;

CREATE POLICY "Creators can update their own events (except star_value)"
  ON events FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Create a function to prevent star_value changes after creation
CREATE OR REPLACE FUNCTION prevent_star_value_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.star_value IS DISTINCT FROM NEW.star_value THEN
    RAISE EXCEPTION 'Star value cannot be changed after event creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent star_value changes
DROP TRIGGER IF EXISTS prevent_star_value_change_trigger ON events;
CREATE TRIGGER prevent_star_value_change_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_star_value_change();

-- Function to update veteran rank based on stars
CREATE OR REPLACE FUNCTION update_veteran_rank()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stars >= 100000 THEN
    NEW.rank := 'Eternal Sage';
  ELSIF NEW.stars >= 70000 THEN
    NEW.rank := 'Platinum Veteran';
  ELSIF NEW.stars >= 65000 THEN
    NEW.rank := 'Sapphire Veteran';
  ELSIF NEW.stars >= 60000 THEN
    NEW.rank := 'Diamond Veteran';
  ELSIF NEW.stars >= 50000 THEN
    NEW.rank := 'Golden Veteran';
  ELSIF NEW.stars >= 40000 THEN
    NEW.rank := 'Ruby Veteran';
  ELSIF NEW.stars >= 25000 THEN
    NEW.rank := 'Silver Veteran';
  ELSE
    NEW.rank := 'Bronze Veteran';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update veteran rank
DROP TRIGGER IF EXISTS update_veteran_rank_trigger ON profiles;
CREATE TRIGGER update_veteran_rank_trigger
  BEFORE INSERT OR UPDATE OF stars ON profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'veteran')
  EXECUTE FUNCTION update_veteran_rank();

-- Function to award stars when event is marked as attended/completed
CREATE OR REPLACE FUNCTION award_event_stars()
RETURNS TRIGGER AS $$
DECLARE
  event_stars integer;
BEGIN
  IF NEW.status IN ('attended', 'completed') AND OLD.status NOT IN ('attended', 'completed') THEN
    -- Get the star value from the event
    SELECT star_value INTO event_stars
    FROM events
    WHERE id = NEW.event_id;
    
    -- Update stars_earned in event_participants
    NEW.stars_earned := event_stars;
    
    -- Update veteran's total stars
    UPDATE profiles
    SET stars = stars + event_stars
    WHERE id = NEW.veteran_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to award stars automatically
DROP TRIGGER IF EXISTS award_event_stars_trigger ON event_participants;
CREATE TRIGGER award_event_stars_trigger
  BEFORE UPDATE ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION award_event_stars();

-- Add indexes for new tables and columns
CREATE INDEX IF NOT EXISTS idx_event_invitations_veteran ON event_invitations(veteran_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_event ON event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON profiles(rank);
CREATE INDEX IF NOT EXISTS idx_profiles_stars ON profiles(stars DESC);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_type ON events(creator_type);

-- Add event types as a lookup for consistency
COMMENT ON COLUMN events.event_type IS 'Event types: Public Talk, Motivational Talk, Professional Talk, Professional Task, Plantation Drive, Orphanage Visit, Hospital Visit, Recreational Visit, Old Home Visit, Book Reading';
