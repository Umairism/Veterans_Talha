-- Sample seed data for VeteranMeet
-- This file contains sample posts and events to demonstrate the application

-- Note: You'll need to create users through the application's registration first
-- Then you can manually run these queries with the actual user IDs

-- Sample Posts (replace USER_ID_1, USER_ID_2 with actual user IDs from your profiles table)
-- INSERT INTO posts (author_id, content, created_at) VALUES
-- ('USER_ID_1', 'Just completed my first community service event! It was amazing to connect with the local youth and share my teaching experience. Looking forward to more opportunities!', NOW() - INTERVAL '2 days'),
-- ('USER_ID_2', 'Volunteered at the medical camp today. It''s wonderful to see how our collective experience can make such a difference in people''s lives. #CommunityService', NOW() - INTERVAL '1 day'),
-- ('USER_ID_1', 'Excited to announce I''ve reached Silver rank! 25,000 stars and counting. Every event brings new connections and purpose.', NOW());

-- Sample Events (replace ORG_ID with actual organization user ID from your profiles table)
-- INSERT INTO events (organization_id, title, description, event_type, location, city, star_value, event_date, status) VALUES
-- ('ORG_ID', 'Community Tree Plantation Drive', 'Join us for a day of planting trees in the city park. We need experienced volunteers to guide community members in proper planting techniques.', 'Plantation Drive', 'Central Park', 'New York', 500, NOW() + INTERVAL '7 days', 'upcoming'),
-- ('ORG_ID', 'Youth Mentorship Workshop', 'Share your professional expertise with young adults entering the workforce. We''re looking for retired professionals to conduct workshops on career guidance.', 'Educational Workshop', 'Community Center', 'New York', 750, NOW() + INTERVAL '14 days', 'upcoming'),
-- ('ORG_ID', 'Free Medical Checkup Camp', 'Healthcare professionals needed to assist in a free medical checkup camp for underserved communities. Your experience can save lives!', 'Medical Visit', 'District Hospital', 'New York', 1000, NOW() + INTERVAL '21 days', 'upcoming');

-- Instructions:
-- 1. Register as a veteran and an organization through the application
-- 2. Get the user IDs from the profiles table
-- 3. Replace the placeholder IDs in the queries above
-- 4. Run the queries in the Supabase SQL editor
