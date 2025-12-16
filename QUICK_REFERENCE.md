# 🚀 Quick Reference Card - VeteranMeet

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── posts/           # Post creation
│   ├── events/          # Event management
│   ├── profile/         # Profile editing
│   └── gamification/    # Rank badges
├── pages/               # Route pages
├── context/             # Auth context
└── lib/                 # Utilities & types

supabase/
└── migrations/          # Database schemas
```

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User accounts |
| events | Community service events |
| posts | Social feed posts |
| event_participants | Event registrations |
| event_invitations | Event invites |
| follows | Social connections |

## Veteran Ranks

| Rank | Stars Required |
|------|---------------|
| Bronze Veteran | 0 |
| Silver Veteran | 25,000 |
| Ruby Veteran | 40,000 |
| Golden Veteran | 50,000 |
| Diamond Veteran | 60,000 |
| Sapphire Veteran | 65,000 |
| Platinum Veteran | 70,000 |
| Eternal Sage | 100,000 |

## Event Types

1. Public Talk
2. Motivational Talk
3. Professional Talk
4. Professional Task
5. Plantation Drive
6. Orphanage Visit
7. Hospital Visit
8. Recreational Visit
9. Old Home Visit
10. Book Reading

## Key Features

### Veteran Features
- ✅ Profile with profession & hobbies
- ✅ Create posts (text/image/video)
- ✅ Create events
- ✅ Register for events
- ✅ Receive invitations
- ✅ Earn stars & ranks
- ✅ Follow users
- ✅ Search events by location

### Organization Features
- ✅ Create community events
- ✅ Browse veterans by hobby
- ✅ Send invitations
- ✅ Mark attendance
- ✅ Award stars automatically

## Common Tasks

### Add a New Hobby Option

```typescript
// In ProfileEdit.tsx
const HOBBY_OPTIONS = [
  // ... existing hobbies
  'New Hobby Name',
];
```

### Modify Star Requirements

```sql
-- In database migration
CREATE OR REPLACE FUNCTION update_veteran_rank()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stars >= 100000 THEN
    NEW.rank := 'Eternal Sage';
  -- ... etc
END;
$$ LANGUAGE plpgsql;
```

### Add New Event Type

```typescript
// In supabase.ts
export type EventType =
  | 'Existing Types'
  | 'New Event Type';

// In CreateEvent.tsx
const EVENT_TYPES: EventType[] = [
  // ... existing types
  'New Event Type',
];
```

## API Endpoints (Supabase)

### Authentication
```typescript
// Sign up
supabase.auth.signUp({ email, password })

// Sign in
supabase.auth.signInWithPassword({ email, password })

// Sign out
supabase.auth.signOut()
```

### Database Operations
```typescript
// Insert
supabase.from('table').insert(data)

// Select
supabase.from('table').select('*')

// Update
supabase.from('table').update(data).eq('id', id)

// Delete
supabase.from('table').delete().eq('id', id)
```

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Issues
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### TypeScript Errors
```bash
# Run type check
npm run typecheck

# Fix common issues
- Import types from './lib/supabase'
- Ensure all props are typed
- Use optional chaining (?.)
```

## Testing Checklist

### Veteran Account
- [ ] Register as veteran
- [ ] Add hobbies
- [ ] Create a post
- [ ] Create an event
- [ ] Search for events
- [ ] Register for event
- [ ] Accept invitation
- [ ] Check star count

### Organization Account
- [ ] Register as organization
- [ ] Create an event
- [ ] Set star value
- [ ] Browse veterans
- [ ] Filter by hobby
- [ ] Send invitation
- [ ] Mark attendance

## Useful Links

- 📖 [Full Documentation](./FEATURES.md)
- 🛠️ [Setup Guide](./SETUP.md)
- 📊 [Project Summary](./PROJECT_SUMMARY.md)
- 🔗 [Supabase Docs](https://supabase.com/docs)
- 🔗 [React Docs](https://react.dev)
- 🔗 [Tailwind CSS](https://tailwindcss.com/docs)

## Common Patterns

### Create Modal Component
```typescript
{showModal && (
  <div className="fixed inset-0 bg-black/50 z-50">
    <Card className="max-w-2xl">
      {/* Modal content */}
    </Card>
  </div>
)}
```

### Fetch with Error Handling
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  setData(data);
} catch (error) {
  console.error('Error:', error);
  alert('Failed to fetch data');
}
```

### Protected Route
```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

## Performance Tips

### Optimize Images
- Use CDN for images
- Compress images before upload
- Use WebP format when possible

### Reduce Bundle Size
- Lazy load routes
- Code splitting
- Remove unused dependencies

### Database Optimization
- Use indexes on frequently queried fields
- Limit query results
- Use pagination for large lists

## Security Best Practices

- ✅ Never commit `.env` file
- ✅ Use RLS on all tables
- ✅ Validate all inputs
- ✅ Sanitize user content
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

## Deployment

### Netlify
```bash
netlify deploy --prod
```

### Vercel
```bash
vercel --prod
```

### Manual
```bash
npm run build
# Upload dist/ folder to hosting
```

## Support

For issues or questions:
1. Check documentation
2. Review error messages
3. Check Supabase logs
4. Review browser console
5. Contact team members

---

**Last Updated**: December 17, 2025  
**Version**: 1.0.0
