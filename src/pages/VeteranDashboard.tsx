import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, Event, Post, Profile, EventInvitation } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { RankBadge } from '../components/gamification/RankBadge';
import { CreatePost } from '../components/posts/CreatePost';
import { CreateEvent } from '../components/events/CreateEvent';
import { ProfileEdit } from '../components/profile/ProfileEdit';
import {
  LogOut,
  Search,
  Calendar,
  MapPin,
  Star,
  User,
  Heart,
  Plus,
  Edit,
  Bell,
  MessageCircle,
  Video,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VeteranDashboard() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchEventType, setSearchEventType] = useState('all');
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'myEvents' | 'invitations'>('feed');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchCity, searchEventType, events, profile]);

  const fetchData = async () => {
    try {
      const [postsResult, eventsResult, invitationsResult, followersResult, followingResult, myEventsResult] =
        await Promise.all([
          // Fetch all posts (from both veterans and organizations)
          supabase
            .from('posts')
            .select('*, author:profiles(*)')
            .order('created_at', { ascending: false })
            .limit(20),
          // Fetch all upcoming events
          supabase
            .from('events')
            .select('*, creator:profiles(*)')
            .eq('status', 'upcoming')
            .order('event_date', { ascending: true }),
          // Fetch my invitations
          supabase
            .from('event_invitations')
            .select('*, event:events(*, creator:profiles(*)), inviter:profiles(*)')
            .eq('veteran_id', profile?.id)
            .eq('status', 'pending'),
          // Fetch followers
          supabase
            .from('follows')
            .select('follower:profiles!follows_follower_id_fkey(*)')
            .eq('following_id', profile?.id),
          // Fetch following
          supabase
            .from('follows')
            .select('following:profiles!follows_following_id_fkey(*)')
            .eq('follower_id', profile?.id),
          // Fetch my created events
          supabase
            .from('events')
            .select('*, creator:profiles(*)')
            .eq('creator_id', profile?.id)
            .order('created_at', { ascending: false }),
        ]);

      if (postsResult.data) {
        setPosts(postsResult.data as Post[]);
      }

      if (eventsResult.data) {
        setEvents(eventsResult.data as Event[]);
        setFilteredEvents(eventsResult.data as Event[]);
      }

      if (invitationsResult.data) {
        setInvitations(invitationsResult.data as EventInvitation[]);
      }

      if (followersResult.data) {
        setFollowers(followersResult.data.map((f: any) => f.follower));
      }

      if (followingResult.data) {
        setFollowing(followingResult.data.map((f: any) => f.following));
      }

      if (myEventsResult.data) {
        setMyEvents(myEventsResult.data as Event[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by city
    if (searchCity) {
      filtered = filtered.filter((event) =>
        event.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    // Filter by event type
    if (searchEventType !== 'all') {
      filtered = filtered.filter((event) => event.event_type === searchEventType);
    }

    // Filter by hobbies if specified
    if (profile?.hobbies && profile.hobbies.length > 0) {
      // Events matching hobbies shown first
      filtered = filtered.sort((a, b) => {
        const aMatches = matchesHobbies(a.event_type);
        const bMatches = matchesHobbies(b.event_type);
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }

    setFilteredEvents(filtered);
  };

  const matchesHobbies = (eventType: string): boolean => {
    if (!profile?.hobbies) return false;
    
    const hobbyEventMap: Record<string, string[]> = {
      'Public Speaking': ['Public Talk', 'Motivational Talk'],
      'Professional Training': ['Professional Talk', 'Professional Task'],
      'Plantation & Environment': ['Plantation Drive'],
      'Social Service': ['Orphanage Visit', 'Hospital Visit', 'Old Home Visit'],
      'Book Reading & Discussion': ['Book Reading'],
      'Recreation & Travel': ['Recreational Visit'],
    };

    return profile.hobbies.some(hobby => 
      hobbyEventMap[hobby]?.includes(eventType)
    );
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from('event_participants').insert({
        event_id: eventId,
        veteran_id: profile?.id,
        status: 'registered',
      });

      if (error) throw error;

      alert('Successfully registered for the event!');
      fetchData();
    } catch (error: any) {
      console.error('Error registering for event:', error);
      if (error.code === '23505') {
        alert('You are already registered for this event.');
      } else {
        alert('Failed to register for event.');
      }
    }
  };

  const handleInvitationResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('event_invitations')
        .update({ status })
        .eq('id', invitationId);

      if (error) throw error;

      if (status === 'accepted') {
        // Also register for the event
        const invitation = invitations.find(inv => inv.id === invitationId);
        if (invitation) {
          await handleRegisterEvent(invitation.event_id);
        }
      }

      fetchData();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Failed to respond to invitation');
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      fetchData();
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const eventTypes = [
    { value: 'all', label: 'All Event Types' },
    { value: 'Public Talk', label: 'Public Talk' },
    { value: 'Motivational Talk', label: 'Motivational Talk' },
    { value: 'Professional Talk', label: 'Professional Talk' },
    { value: 'Professional Task', label: 'Professional Task' },
    { value: 'Plantation Drive', label: 'Plantation Drive' },
    { value: 'Orphanage Visit', label: 'Orphanage Visit' },
    { value: 'Hospital Visit', label: 'Hospital Visit' },
    { value: 'Recreational Visit', label: 'Recreational Visit' },
    { value: 'Old Home Visit', label: 'Old Home Visit' },
    { value: 'Book Reading', label: 'Book Reading' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className="text-amber-600" size={32} />
              <h1 className="text-2xl font-serif font-bold text-gray-800">VeteranMeet</h1>
            </div>
            <div className="flex items-center gap-4">
              {invitations.length > 0 && (
                <button
                  onClick={() => setActiveTab('invitations')}
                  className="relative"
                >
                  <Bell className="text-gray-600 hover:text-amber-600" size={24} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {invitations.length}
                  </span>
                </button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-200 to-amber-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-amber-700" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">
                  {profile?.full_name}
                </h2>
                <p className="text-gray-600 text-lg mb-4">{profile?.profession}</p>
                {profile?.city && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                    <MapPin size={18} />
                    <span>{profile.city}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfileEdit(true)}
                  className="mb-4"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </div>

              <RankBadge stars={profile?.stars || 0} showProgress />

              {profile?.hobbies && profile.hobbies.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{followers.length}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{following.length}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-lg p-2 shadow-md flex-wrap">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'feed'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageCircle size={18} className="inline mr-2" />
                Feed
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'events'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search size={18} className="inline mr-2" />
                Find Events
              </button>
              <button
                onClick={() => setActiveTab('myEvents')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'myEvents'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} className="inline mr-2" />
                My Events
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors relative ${
                  activeTab === 'invitations'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bell size={18} className="inline mr-2" />
                Invitations
                {invitations.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {invitations.length}
                  </span>
                )}
              </button>
            </div>

            {/* Feed Tab */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-serif font-bold text-gray-800">
                    Community Feed
                  </h2>
                </div>

                {profile && <CreatePost authorId={profile.id} onPostCreated={fetchData} />}

                <Card>
                  {posts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No posts yet. Start connecting with the community!
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full flex items-center justify-center">
                              <User size={24} className="text-teal-700" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {post.author?.full_name || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {post.author_id === profile?.id && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                title="Delete post"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt="Post"
                              className="rounded-2xl w-full max-h-96 object-cover mb-3"
                            />
                          )}
                          {post.video_url && (
                            <div className="rounded-2xl overflow-hidden mb-3">
                              <div className="bg-gray-100 p-4 flex items-center gap-3">
                                <Video className="text-gray-600" />
                                <a
                                  href={post.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-600 hover:underline"
                                >
                                  Watch Video
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-gray-800">Find Events</h2>
                <Card>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Input
                      placeholder="Search by city..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                    />
                    <Select
                      value={searchEventType}
                      onChange={(e) => setSearchEventType(e.target.value)}
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {filteredEvents.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No events found. Try adjusting your search filters.
                      </p>
                    ) : (
                      filteredEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-2xl p-6 border-2 border-amber-100 hover:border-amber-200 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {event.title}
                              </h3>
                              <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {event.event_type}
                              </span>
                              {matchesHobbies(event.event_type) && (
                                <span className="ml-2 inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                                  Matches your interests
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold">
                              <Star size={18} />
                              {event.star_value}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              <span>
                                {event.location}, {event.city}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>
                                {new Date(event.event_date).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button size="sm" onClick={() => handleRegisterEvent(event.id)}>
                              Mark as Interested
                            </Button>
                            {event.creator && (
                              <span className="text-sm text-gray-600">
                                by {event.creator.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* My Events Tab */}
            {activeTab === 'myEvents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-serif font-bold text-gray-800">My Events</h2>
                  <Button onClick={() => setShowCreateEvent(true)}>
                    <Plus size={18} className="mr-2" />
                    Create Event
                  </Button>
                </div>

                <Card>
                  {myEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 mb-4">
                        You haven't created any events yet.
                      </p>
                      <Button onClick={() => setShowCreateEvent(true)}>
                        <Plus size={18} className="mr-2" />
                        Create Your First Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-2xl p-6 border-2 border-amber-100"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {event.title}
                              </h3>
                              <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {event.event_type}
                              </span>
                              <span className="ml-2 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {event.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold">
                              <Star size={18} />
                              {event.star_value}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              <span>
                                {event.location}, {event.city}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>
                                {new Date(event.event_date).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Invitations Tab */}
            {activeTab === 'invitations' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif font-bold text-gray-800">
                  Event Invitations
                </h2>
                <Card>
                  {invitations.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500">No pending invitations</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">
                                {invitation.event?.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                Invited by {invitation.inviter?.full_name}
                              </p>
                              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {invitation.event?.event_type}
                              </span>
                            </div>
                            {invitation.event && (
                              <div className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold">
                                <Star size={18} />
                                {invitation.event.star_value}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4">
                            {invitation.event?.description}
                          </p>
                          {invitation.event && (
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <MapPin size={16} />
                                <span>
                                  {invitation.event.location}, {invitation.event.city}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>
                                  {new Date(invitation.event.event_date).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleInvitationResponse(invitation.id, 'accepted')
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                handleInvitationResponse(invitation.id, 'declined')
                              }
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateEvent && profile && (
        <CreateEvent
          profile={profile}
          onEventCreated={fetchData}
          onClose={() => setShowCreateEvent(false)}
        />
      )}

      {showProfileEdit && profile && (
        <ProfileEdit
          profile={profile}
          onSave={handleProfileUpdate}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </div>
  );
}
