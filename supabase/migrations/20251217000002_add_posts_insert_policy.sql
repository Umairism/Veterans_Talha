-- Allow anyone to create posts (for dev mode with mock auth)
CREATE POLICY "Allow post creation"
ON posts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to read all posts
CREATE POLICY "Allow reading posts"
ON posts FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to update posts (for dev mode)
CREATE POLICY "Allow updating posts"
ON posts FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to delete posts (for dev mode)
CREATE POLICY "Allow deleting posts"
ON posts FOR DELETE
TO anon, authenticated
USING (true);
