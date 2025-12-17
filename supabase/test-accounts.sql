-- Test Accounts for VeteranMeet
-- Run this in Supabase SQL Editor to create test accounts
-- NOTE: Make sure you've run the schema migration first!

-- Temporarily disable RLS for inserting test data
SET session_replication_role = replica;

-- Clean up existing test data (optional - comment out if you want to keep existing data)
DELETE FROM event_participants WHERE veteran_id IN (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM event_invitations WHERE veteran_id IN (
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM posts WHERE id IN (
  'aaaaaaaa-1111-1111-1111-111111111111',
  'aaaaaaaa-2222-2222-2222-222222222222',
  'aaaaaaaa-3333-3333-3333-333333333333'
) OR author_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM events WHERE creator_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM follows WHERE follower_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
) OR following_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Insert test veteran account
INSERT INTO profiles (
  id,
  user_type,
  full_name,
  email,
  profession,
  hobbies,
  bio,
  city,
  stars,
  rank,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'veteran',
  'Major Talha Ahmed',
  'veteran@test.com',
  'Retired Army Officer',
  ARRAY['Public Speaking', 'Social Service', 'Motivational Speaking', 'Professional Training'],
  'Served 20 years in Pakistan Army. Now dedicated to community service and mentoring youth.',
  'Karachi',
  15000,
  'Bronze Veteran',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  profession = EXCLUDED.profession,
  hobbies = EXCLUDED.hobbies,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  stars = EXCLUDED.stars,
  rank = EXCLUDED.rank;

-- Insert test organization account
INSERT INTO profiles (
  id,
  user_type,
  full_name,
  email,
  organization_name,
  bio,
  city,
  stars,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'organization',
  'Khidmat Foundation',
  'org@test.com',
  'Khidmat Foundation Pakistan',
  'Leading NGO focused on community development and social welfare programs across Pakistan.',
  'Lahore',
  0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  organization_name = EXCLUDED.organization_name,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city;

-- Insert another veteran with high stars (Silver rank)
INSERT INTO profiles (
  id,
  user_type,
  full_name,
  email,
  profession,
  hobbies,
  bio,
  city,
  stars,
  rank,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'veteran',
  'Colonel Ayesha Khan',
  'ayesha@test.com',
  'Retired Education Officer',
  ARRAY['Teaching & Mentoring', 'Book Reading & Discussion', 'Elder Care', 'Social Service'],
  'Former principal at Army Public School with 30 years of dedicated service in education.',
  'Islamabad',
  27000,
  'Silver Veteran',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  profession = EXCLUDED.profession,
  hobbies = EXCLUDED.hobbies,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  stars = EXCLUDED.stars,
  rank = EXCLUDED.rank;

-- Insert another veteran with Ruby rank
INSERT INTO profiles (
  id,
  user_type,
  full_name,
  email,
  profession,
  hobbies,
  bio,
  city,
  stars,
  rank,
  created_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'veteran',
  'Brigadier Imran Hassan',
  'imran@test.com',
  'Retired Military Engineer',
  ARRAY['Technology', 'Professional Training', 'Consulting', 'Plantation & Environment'],
  'Former Corps of Engineers officer passionate about environmental conservation and sustainable development.',
  'Rawalpindi',
  42000,
  'Ruby Veteran',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  profession = EXCLUDED.profession,
  hobbies = EXCLUDED.hobbies,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  stars = EXCLUDED.stars,
  rank = EXCLUDED.rank;

-- Insert sample events
INSERT INTO events (
  id,
  organization_id,
  creator_id,
  creator_type,
  title,
  description,
  event_type,
  location,
  city,
  star_value,
  event_date,
  status,
  created_at
) VALUES 
(
  'eeeeeeee-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'organization',
  'Community Cleanup Drive',
  'Join us for a neighborhood cleanup initiative. Help make our community cleaner and greener!',
  'Plantation Drive',
  'Central Park, 5th Avenue',
  'New York',
  500,
  NOW() + INTERVAL '7 days',
  'upcoming',
  NOW()
),
(
  'eeeeeeee-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'organization',
  'Youth Mentorship Program',
  'Share your experience with young students. Inspire the next generation!',
  'Motivational Talk',
  'Lincoln High School, 123 Main St',
  'New York',
  1000,
  NOW() + INTERVAL '10 days',
  'upcoming',
  NOW()
),
(
  'eeeeeeee-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'veteran',
  'Book Discussion: Leadership Lessons',
  'Discussing leadership principles from military experience and how they apply to civilian life.',
  'Book Reading',
  'Public Library, Room 201',
  'New York',
  300,
  NOW() + INTERVAL '14 days',
  'upcoming',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (
  id,
  author_id,
  content,
  created_at
) VALUES
(
  'aaaaaaaa-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Just finished volunteering at the local food bank. Amazing experience connecting with the community!',
  NOW() - INTERVAL '2 days'
),
(
  'aaaaaaaa-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'Looking forward to our upcoming book reading session. It''s wonderful to see so many veterans interested in sharing knowledge with the younger generation.',
  NOW() - INTERVAL '1 day'
),
(
  'aaaaaaaa-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'Exciting news! We''re launching three new community service programs next month. Stay tuned for details!',
  NOW() - INTERVAL '3 hours'
) ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
SET session_replication_role = DEFAULT;

-- Success message
SELECT 'Test accounts created successfully!' as message,
       'Veteran: veteran@test.com - Major Talha Ahmed (any password)' as account_1,
       'Organization: org@test.com - Khidmat Foundation (any password)' as account_2,
       'Veteran: ayesha@test.com - Colonel Ayesha Khan (any password)' as account_3,
       'Veteran: imran@test.com - Brigadier Imran Hassan (any password)' as account_4;
