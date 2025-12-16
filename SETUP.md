# 🚀 Setup and Deployment Guide

Complete guide for setting up and deploying VeteranMeet.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Git installed
- Code editor (VS Code recommended)

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Veterans
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React 18 and React DOM
- TypeScript dependencies
- Tailwind CSS
- React Router
- Supabase client
- Lucide React icons
- And all other dependencies

---

## Step 3: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: VeteranMeet
   - Database Password: (save this!)
   - Region: Choose closest to you
   - Pricing: Free tier is sufficient
5. Wait for project to be created (~2 minutes)

### Get API Credentials

1. Go to Project Settings (gear icon)
2. Click "API" in the sidebar
3. Copy these values:
   - Project URL (starts with https://)
   - anon public key (long string)

---

## Step 4: Configure Environment Variables

### Create .env File

Create a file named `.env` in the root directory:

```bash
touch .env
```

### Add Supabase Credentials

Open `.env` and add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `your-project-id` with your actual Supabase project URL
- `your-anon-key-here` with your actual anon key

**Important:** Never commit the `.env` file to Git. It's already in `.gitignore`.

---

## Step 5: Set Up Database

### Run Initial Migration

1. Open Supabase Dashboard
2. Go to SQL Editor (database icon)
3. Click "New Query"
4. Copy and paste the contents of:
   ```
   supabase/migrations/20251216191817_create_veteranmeet_schema.sql
   ```
5. Click "Run" button
6. Wait for "Success" message

### Run Update Migration

1. In SQL Editor, create another new query
2. Copy and paste the contents of:
   ```
   supabase/migrations/20251217000000_update_veteranmeet_schema.sql
   ```
3. Click "Run" button
4. Wait for "Success" message

### Verify Tables Created

1. Go to Table Editor in Supabase
2. You should see these tables:
   - profiles
   - events
   - posts
   - event_participants
   - event_invitations
   - follows

### Verify Triggers and Functions

1. Go to SQL Editor
2. Run this query to check triggers:
   ```sql
   SELECT trigger_name, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'public';
   ```
3. You should see:
   - prevent_star_value_change_trigger
   - update_veteran_rank_trigger
   - award_event_stars_trigger

---

## Step 6: Start Development Server

```bash
npm run dev
```

The app will start at: `http://localhost:5173`

You should see the landing page with:
- Welcome message
- Sign Up button
- Sign In button

---

## Step 7: Test the Application

### Create Test Accounts

#### Create a Veteran Account

1. Click "Get Started" or "Sign Up"
2. Fill in the form:
   - Email: veteran@test.com
   - Password: Test123456!
   - User Type: Veteran
   - Full Name: John Smith
   - Profession: Retired Army Officer
   - City: New York
3. Click "Create Account"
4. You should be redirected to Veteran Dashboard

#### Create an Organization Account

1. Open in incognito window or sign out first
2. Click "Sign Up"
3. Fill in the form:
   - Email: org@test.com
   - Password: Test123456!
   - User Type: Organization
   - Organization Name: Community Foundation
   - City: New York
4. Click "Create Account"
5. You should be redirected to Organization Dashboard

### Test Veteran Features

1. **Profile Editing**:
   - Click "Edit Profile" button
   - Add hobbies (e.g., "Public Speaking", "Social Service")
   - Add bio
   - Save changes

2. **Create a Post**:
   - Type some text in the post box
   - Optionally add an image URL
   - Click "Post"
   - Post should appear in feed

3. **Create an Event**:
   - Click "My Events" tab
   - Click "Create Event"
   - Fill in event details
   - Set star value (100-5000)
   - Submit
   - Event should appear in your events list

4. **Browse Events**:
   - Click "Find Events" tab
   - Filter by city
   - Filter by event type
   - Events with matching hobbies show special badge

### Test Organization Features

1. **Create an Event**:
   - Click "Create Event" button
   - Fill in all fields
   - Set star value (e.g., 1000)
   - Submit

2. **Browse Veterans**:
   - Click "Find Veterans" tab
   - Select your event from dropdown
   - Filter by hobby
   - See veterans with matching hobbies

3. **Send Invitations**:
   - Select an event
   - Find a veteran with matching hobbies
   - Click "Invite to Event"
   - Should see success message

4. **Mark Attendance**:
   - Go to "My Events" tab
   - Find event with participants
   - Click "Mark Attended" for a participant
   - Stars should be awarded automatically

### Test Cross-Module Features

1. **Veteran Receives Invitation**:
   - Log in as veteran
   - Bell icon should show notification badge
   - Click "Invitations" tab
   - See pending invitation
   - Click "Accept"
   - Should auto-register for event

2. **Earn Stars**:
   - Organization marks veteran as attended
   - Veteran's star count increases
   - Rank updates automatically if threshold reached

---

## Step 8: Build for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Visit `http://localhost:4173` to see the production build.

---

## Deployment Options

### Option 1: Netlify (Recommended)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize**:
   ```bash
   netlify init
   ```

4. **Configure Environment Variables**:
   - In Netlify Dashboard
   - Go to Site Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add Environment Variables**:
   - In Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Add the same variables as above

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option 3: Manual Hosting

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload dist/ folder** to your hosting provider:
   - AWS S3 + CloudFront
   - Firebase Hosting
   - GitHub Pages
   - Any static host

3. **Configure environment variables** in your hosting platform

---

## Troubleshooting

### "Missing Supabase environment variables"

**Solution**: Check that your `.env` file exists and has correct values.

### Database Connection Errors

**Solutions**:
1. Verify Supabase URL and key are correct
2. Check if Supabase project is active
3. Verify RLS policies are enabled

### "Failed to create event" or Similar Errors

**Solutions**:
1. Check browser console for detailed errors
2. Verify database migrations ran successfully
3. Check Supabase logs in Dashboard

### Star Value Cannot Be Modified

**This is expected!** Star values are immutable by design (requirement #10).

### Ranks Not Updating

**Solution**: Check that the `update_veteran_rank_trigger` exists in database.

### Cannot Invite Veteran

**Possible causes**:
1. Veteran already invited to that event
2. Hobby mismatch (check event type requirements)
3. No event selected

---

## Database Maintenance

### Backup Database

In Supabase Dashboard:
1. Go to Database → Backups
2. Download backup or schedule automatic backups

### Reset Database (Caution!)

```sql
-- Run in Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run both migrations
```

### Check Database Health

```sql
-- Check table row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] RLS enabled on all tables
- [ ] Strong database password
- [ ] HTTPS enabled in production
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using parameterized queries)
- [ ] Regular backups scheduled

---

## Performance Optimization

### Enable Caching

Add to `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
```

### Database Indexes

Already included in migrations:
- All foreign keys have indexes
- Created_at fields indexed for sorting
- City and type fields indexed for filtering

### Image Optimization

For better performance, consider:
1. Image CDN (Cloudinary, Imgix)
2. WebP format
3. Lazy loading
4. Responsive images

---

## Monitoring

### Supabase Dashboard

Monitor in real-time:
- Database connections
- Query performance
- Storage usage
- API requests
- Error logs

### Error Tracking

Consider adding:
- Sentry for error tracking
- Google Analytics for usage stats
- LogRocket for session replay

---

## Support & Resources

- **Documentation**: See [FEATURES.md](./FEATURES.md)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **React Docs**: [react.dev](https://react.dev)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## Next Steps After Setup

1. ✅ Test all veteran features
2. ✅ Test all organization features
3. ✅ Test gamification system
4. ✅ Test invitation system
5. ✅ Add test data
6. ✅ Deploy to production
7. ✅ Share with team
8. ✅ Commit to GitHub

---

**🎉 Setup Complete!** You're ready to start using VeteranMeet.
