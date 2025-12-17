# VeteranMeet - Community Service Platform

A comprehensive social platform connecting retired professionals (veterans) with community service opportunities provided by organizations and NGOs.

## 📋 Project Overview

VeteranMeet facilitates meaningful connections between veterans and community service organizations through:
- Social networking features
- Gamified engagement system with veteran ranks
- Event management and invitations
- Location-based event discovery
- Multimedia content sharing

**Total Marks:** 300 (Veteran Module: 200, Community Module: 80, Github Check-in: 20)

---

## 🎯 Features Implementation

### Veteran Module (200 Marks)

#### 1. Profile Creation & Management ✅
- **Profile based on profession**: Veterans can create profiles with their professional background
- **Editable hobbies**: Pre-defined hobby options + custom hobby support
- **Profile fields**:
  - Full name, profession, bio
  - City and location
  - Hobbies/interests (array)
  - Star count and veteran rank
  - Avatar support

#### 2. Hobby Management ✅
- **20+ pre-defined hobbies** including:
  - Public Speaking
  - Professional Training
  - Plantation & Environment
  - Social Service
  - Healthcare & Medical
  - Book Reading & Discussion
  - And more...
- **Custom hobby addition**: Veterans can add hobbies not in the list
- **Edit anytime**: Full hobby management with add/remove capabilities

#### 3. Social Feed & Posts ✅
- **Text posts**: Share thoughts and experiences
- **Multimedia support**:
  - Image URLs (with preview)
  - Video URLs (YouTube, Vimeo, etc.)
- **Both text and media**: Can post text with images/videos
- **Feed visibility**: View posts from all users and followed veterans/organizations

#### 4. Follow System ✅
- **Follow veterans and organizations**
- **Follower/following counts** displayed on profile
- **Feed based on follows**: See posts from followed users

#### 5. Event Management ✅
- **Create events**: Veterans can create their own community service events
- **Mark as Interested**: Register for existing events
- **Event types** (10 types):
  - Public Talk
  - Motivational Talk
  - Professional Talk
  - Professional Task
  - Plantation Drive
  - Orphanage Visit
  - Hospital Visit
  - Recreational Visit
  - Old Home Visit
  - Book Reading

#### 6. Hobby-Based Event Discovery ✅
- **Smart filtering**: Events matching veteran's hobbies shown first
- **Visual indicator**: "Matches your interests" badge on relevant events
- **Automatic matching**: System maps hobbies to event types

#### 7. Event Invitations ✅
- **Receive invitations**: Veterans get invited to events by organizers or other veterans
- **Notification system**: Bell icon shows pending invitation count
- **Accept/Decline**: Respond to invitations
- **Auto-registration**: Accepting an invitation registers you for the event

#### 8. Location-Based Event Search ✅
- **City filter**: Search events by city name
- **Event type filter**: Filter by specific event types
- **Combined filters**: Use city + event type together
- **Current location**: Profile stores city information

#### 9. Gamification - Star System ✅
- **Event stars**: Earn stars (0-5000) by attending events
- **Automatic award**: Stars awarded when marked as "attended" by organizer
- **Profile star count**: Total stars displayed on profile
- **Star value per event**: Set by event creator (cannot be edited later)

#### 10. Star Value Immutability ✅
- **Set at creation**: Star value defined when creating event
- **Database trigger**: Prevents modification after creation
- **Error handling**: Alert shown if attempt to modify
- **Max 5000 stars**: Per event limit enforced

#### 11. Veteran Rank System ✅
- **7 rank tiers** based on star count:
  - **Bronze Veteran** - 0+ stars
  - **Silver Veteran** - 25,000 stars
  - **Ruby Veteran** - 40,000 stars
  - **Golden Veteran** - 50,000 stars
  - **Diamond Veteran** - 60,000 stars
  - **Sapphire Veteran** - 65,000 stars
  - **Platinum Veteran** - 70,000 stars
  - **Eternal Sage** - 100,000 stars

- **Automatic rank updates**: Database trigger updates rank when stars change
- **Visual badges**: Gradient-colored badges with unique styling per rank
- **Progress tracking**: Shows progress to next rank with percentage and remaining stars
- **Profile display**: Rank badge prominently shown on veteran profiles

### Community Module (80 Marks)

#### 1. Organization Profiles ✅
- **Profile types**: Organizations, educational institutions, NGOs
- **Organization fields**:
  - Organization name
  - Bio/description
  - City
  - Contact information

#### 2. Event Creation by Organizations ✅
- **Full event management**: Create and manage community service events
- **Event details**:
  - Title, description
  - Event type (10 options)
  - Location and city
  - Date and time
  - Star value (0-5000)
- **Status tracking**: upcoming, completed, cancelled

#### 3. Veteran-Organization Connection ✅
- **Interest registration**: Veterans mark events as "Interested"
- **Automatic connection**: Creates participant record in database
- **Participant tracking**: Organizations see all registered veterans
- **Status management**: registered → attended → completed

#### 4. Smart Invitation System ✅
- **Hobby-based filtering**: Only invite veterans with matching hobbies
- **Example restrictions**:
  - Book Reading events → only veterans with book reading hobby
  - Plantation Drive → only veterans with environmental/gardening interests
- **Visual matching indicator**: Shows which veterans match event requirements
- **Invite functionality**: Send invitations with one click
- **Duplicate prevention**: Cannot invite same veteran twice

#### 5. Event Star System for Organizations ✅
- **Star allocation**: Organizations set 0-5000 stars per event
- **Audience attraction**: Higher stars attract more participants
- **One-time setting**: Cannot be changed after event creation
- **Database enforcement**: Trigger prevents modifications

#### 6. Star Value Immutability (Organizations) ✅
- **Same rules as veterans**: Set once at creation
- **Max 5000 stars**: Per event limit
- **Database protection**: Trigger-based enforcement

### Additional Features

#### Event Participant Management ✅
- **Participant list**: See all registered veterans per event
- **Mark attendance**: Organizations can mark veterans as attended
- **Automatic star award**: Stars transferred when attendance marked
- **Status tracking**: invited → registered → attended → completed

#### Multimedia Posts ✅
- **Image support**: Add images via URL
- **Video support**: Embed YouTube, Vimeo links
- **Combined content**: Text + image + video in single post
- **Preview**: Image preview before posting

#### Profile Editing ✅
- **Full edit capability**: Update all profile fields
- **Hobby management**: Add/remove hobbies from profile
- **Instant updates**: Changes reflected immediately
- **Validation**: Input validation for all fields

---

## 🗄️ Database Schema

### Tables

1. **profiles**
   - User information (veterans & organizations)
   - Stars, rank, hobbies, location
   - Bio and contact info

2. **events**
   - Event details with creator tracking
   - Both veterans and organizations can create
   - Immutable star_value field

3. **posts**
   - Text content
   - Image and video URLs
   - Author relationships

4. **event_participants**
   - Veteran-event relationships
   - Status tracking
   - Stars earned per event

5. **event_invitations**
   - Invitation tracking
   - Inviter-veteran relationships
   - pending/accepted/declined status

6. **follows**
   - Social connections
   - Follower-following relationships

### Database Triggers

1. **prevent_star_value_change**: Prevents editing star_value after event creation
2. **update_veteran_rank**: Auto-updates rank based on star count
3. **award_event_stars**: Automatically awards stars when attendance marked

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only modify their own data
- Event creators can manage their events
- Invitation system with proper authorization

---

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation Steps

```bash
# Install dependencies
npm install

# Run database migrations
# In Supabase Dashboard → SQL Editor, run:
# 1. supabase/migrations/20251216191817_create_veteranmeet_schema.sql
# 2. supabase/migrations/20251217000000_update_veteranmeet_schema.sql

# Start development server
npm run dev
```

### Database Setup

1. Create a Supabase project
2. Run the initial schema migration
3. Run the update migration for new features
4. Verify all triggers and policies are created

---

## 📱 User Flow

### For Veterans

1. **Registration**: Sign up with email, choose "Veteran" type
2. **Profile Setup**: Add profession, hobbies, city
3. **Browse Events**: Search by city and event type
4. **Mark Interest**: Register for events matching hobbies
5. **Create Events**: Host your own community service events
6. **Respond to Invitations**: Accept/decline event invitations
7. **Create Posts**: Share experiences with text, images, videos
8. **Follow Others**: Connect with other veterans and organizations
9. **Earn Stars**: Attend events to earn stars and increase rank
10. **Track Progress**: Monitor star count and rank advancement

### For Organizations

1. **Registration**: Sign up with email, choose "Organization" type
2. **Profile Setup**: Add organization name, description, city
3. **Create Events**: Set up community service opportunities
4. **Set Star Values**: Allocate 0-5000 stars per event
5. **Find Veterans**: Browse veterans by hobbies
6. **Send Invitations**: Invite veterans matching event requirements
7. **Manage Participants**: View registered veterans
8. **Mark Attendance**: Confirm attendance and award stars
9. **Share Updates**: Post about organization activities

---

## 🎮 Gamification Details

### Star Earning
- Attend events to earn stars
- Each event awards 0-5000 stars
- Stars automatically added when marked "attended"
- Total stars determine veteran rank

### Rank Progression
| Rank | Stars Required | Increase from Previous |
|------|---------------|----------------------|
| Bronze Veteran | 0 | Starting rank |
| Silver Veteran | 25,000 | +25,000 |
| Ruby Veteran | 40,000 | +15,000 |
| Golden Veteran | 50,000 | +10,000 |
| Diamond Veteran | 60,000 | +10,000 |
| Sapphire Veteran | 65,000 | +5,000 |
| Platinum Veteran | 70,000 | +5,000 |
| Eternal Sage | 100,000 | +30,000 |

### Progress Tracking
- Visual progress bar to next rank
- Percentage completion shown
- Stars remaining to next rank displayed
- Color-coded rank badges

---

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Gradient Theme**: Warm amber and teal color scheme
- **Tabbed Navigation**: Easy switching between sections
- **Modal Dialogs**: Clean forms for creating events and posts
- **Real-time Updates**: Instant feedback on actions
- **Loading States**: Clear loading indicators
- **Error Handling**: User-friendly error messages
- **Visual Hierarchy**: Clear content organization
- **Icon System**: Intuitive iconography throughout

---

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure email/password authentication
- **Authorization**: Role-based access (veteran vs organization)
- **Data Validation**: Input validation on client and server
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Safe content rendering

---

## 📈 Future Enhancements

- Real-time notifications
- In-app messaging
- File upload for images/videos
- Location services with maps
- Event ratings and reviews
- Achievement badges
- Leaderboards
- Mobile app (React Native)
- Email notifications
- Advanced search filters

---

## 🤝 Contributing

This is an academic project. For development:

1. Create feature branches
2. Make regular commits with clear messages
3. Test thoroughly before merging
4. Document all changes
5. Follow code style guidelines

---

## 📄 License

This project is created for academic purposes.

---

## 👥 Team & Github Check-in

**Github Check-in History**: 20 Marks
- Regular commits from all team members
- Clear commit messages
- Feature-based branching
- Code reviews and collaboration

---

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review database schema
3. Check Supabase logs
4. Review browser console for errors
5. Verify environment variables

---

## ✅ Testing Checklist

### Veteran Features
- [ ] Profile creation with profession
- [ ] Hobby addition and editing
- [ ] Text post creation
- [ ] Image post creation
- [ ] Video post creation
- [ ] Event creation by veteran
- [ ] Event registration
- [ ] Event filtering by city
- [ ] Event filtering by type
- [ ] Hobby-based event recommendations
- [ ] Invitation acceptance
- [ ] Invitation decline
- [ ] Star earning on attendance
- [ ] Rank progression
- [ ] Follow/unfollow users

### Organization Features
- [ ] Organization profile creation
- [ ] Event creation with star value
- [ ] Star value immutability
- [ ] Veteran browsing
- [ ] Hobby-based filtering
- [ ] Event invitation sending
- [ ] Duplicate invitation prevention
- [ ] Participant viewing
- [ ] Attendance marking
- [ ] Automatic star award

### System Features
- [ ] Authentication (login/logout)
- [ ] Profile editing
- [ ] Location-based search
- [ ] Responsive design
- [ ] Error handling
- [ ] Database triggers
- [ ] RLS policies
- [ ] Data validation

---