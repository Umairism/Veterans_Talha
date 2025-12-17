-- Allow unauthenticated users to read profiles by email for login
-- This is needed for the dev auth system to check if a user exists

CREATE POLICY "Allow public email lookup for login"
ON profiles FOR SELECT
TO anon
USING (true);
