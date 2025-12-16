# 🔐 Development Authentication Guide

## Overview

The authentication system has been modified for easy development and testing. You can now login with **any valid email format and any password** as long as the account exists in the database.

## How It Works

1. **Email Check**: System checks if email exists in profiles table
2. **Auto Login**: If found, automatically logs you in (bypasses Supabase auth)
3. **Session Persistence**: Login state saved in localStorage
4. **No Password Validation**: Any password works for existing accounts

## Test Accounts

### Setup Test Accounts

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the file: `supabase/test-accounts.sql`
4. This creates 4 test accounts with sample data

### Available Test Accounts

| Email | Type | Name | Stars | Rank |
|-------|------|------|-------|------|
| `veteran@test.com` | Veteran | John Smith | 15,000 | Bronze |
| `sarah@test.com` | Veteran | Sarah Johnson | 27,000 | Silver |
| `michael@test.com` | Veteran | Michael Chen | 42,000 | Ruby |
| `org@test.com` | Organization | Community Foundation | - | - |

**Password**: Use any password (e.g., `password123`, `test`, `12345678`, etc.)

## Usage

### Login Steps

1. Go to login page
2. Enter any test email (e.g., `veteran@test.com`)
3. Enter any password (e.g., `test123`)
4. Click "Sign In"
5. ✅ You're logged in!

### Example Logins

```
Email: veteran@test.com
Password: anything

Email: org@test.com
Password: whatever

Email: sarah@test.com
Password: 123
```

## Features

### ✅ What Works

- Login with any email/password combination
- Session persists across page refreshes
- Sign out clears session
- All dashboard features work normally
- Profile editing and updates work
- Creating posts and events works
- No Supabase authentication errors

### 📝 Notes

- Accounts must exist in database first
- Email format must be valid (contain @)
- New signups still use normal Supabase auth
- Production deployment should remove this bypass

## For New Users

If you want to create your own test account:

### Option 1: Use Test Account SQL

```sql
-- Run in Supabase SQL Editor
INSERT INTO profiles (
  id,
  user_type,
  full_name,
  email,
  profession,
  hobbies,
  city,
  stars,
  rank
) VALUES (
  gen_random_uuid(),
  'veteran',
  'Your Name',
  'your@email.com',
  'Your Profession',
  ARRAY['Hobby1', 'Hobby2'],
  'Your City',
  0,
  'Bronze Veteran'
);
```

### Option 2: Use Registration (Normal Flow)

1. Click "Sign Up"
2. Fill in the form
3. Use real email and password
4. Supabase will create account normally
5. After first signup, you can login with any password

## Reverting to Production

To restore normal Supabase authentication:

1. Open `src/context/AuthContext.tsx`
2. Replace the modified `signIn` function with:

```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
};
```

3. Revert the `useEffect` and `signOut` functions
4. Remove mock auth localStorage logic

## Troubleshooting

### "Account not found" Error

**Solution**: Run the test-accounts.sql file to create accounts, or ensure the email exists in profiles table.

### Login Not Persisting

**Solution**: 
```bash
# Clear browser storage
# In browser console:
localStorage.clear()
# Then try logging in again
```

### Profile Not Loading

**Solution**: Check that the profile exists in Supabase:
```sql
SELECT * FROM profiles WHERE email = 'your@email.com';
```

## Security Warning ⚠️

**This bypass is for DEVELOPMENT ONLY!**

- ❌ Do NOT use in production
- ❌ Do NOT commit to production branch
- ❌ Do NOT deploy with this enabled
- ✅ Only for local development and testing

## Quick Start

```bash
# 1. Start the dev server
npm run dev

# 2. Open browser to localhost:5173

# 3. Login with:
#    Email: veteran@test.com
#    Password: test

# 4. Start testing!
```

## Sample Data Included

The test accounts come with:
- ✅ 4 user profiles (3 veterans + 1 organization)
- ✅ 3 sample events
- ✅ 3 sample posts
- ✅ Various star levels and ranks
- ✅ Different hobbies and professions

---

**Happy Testing! 🚀**
