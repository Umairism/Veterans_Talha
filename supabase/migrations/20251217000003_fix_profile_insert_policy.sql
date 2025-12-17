-- Fix RLS policy to allow profile creation during signup
-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new permissive INSERT policy that allows authenticated and anon users to insert
CREATE POLICY "Allow profile creation during signup"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

-- Also ensure authenticated users can still insert
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);
