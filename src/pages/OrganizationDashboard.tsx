import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, Event, Profile, EventParticipant, Post } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { CreateEvent } from '../components/events/CreateEvent';
import { CreatePost } from '../components/posts/CreatePost';
import { ProfileEdit } from '../components/profile/ProfileEdit';
import {
  LogOut,
  Plus,
  Users,
  Calendar,
  MapPin,
  Star,
  Heart,
  UserPlus,
  Edit,
  MessageCircle,
  Trash2,
  User,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OrganizationDashboard() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [veterans, setVeterans] = useState<Profile[]>([]);
  const [filteredVeterans, setFilteredVeterans] = useState<Profile[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventParticipants, setEventParticipants] = useState<Record<string, EventParticipant[]>>({});
  const [hobbyFilter, setHobbyFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'events' | 'veterans' | 'posts'>('events');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVeterans();
  }, [hobbyFilter, veterans, selectedEvent]);

  const fetchData = async () => {
    try {
      const [eventsResult, postsResult, veteransResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('creator_id', profile?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select('*, author:profiles(*)')
          .eq('author_id', profile?.id)
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('user_type', 'veteran'),
      ]);

      if (eventsResult.data) {
        const eventsData = eventsResult.data as Event[];
        setEvents(eventsData);

        // Fetch participants for each event
        const participantsMap: Record<string, EventParticipant[]> = {};
        for (const event of eventsData) {
          const { data } = await supabase
            .from('event_participants')
            .select('*, veteran:profiles(*)')
            .eq('event_id', event.id);
          if (data) {
            participantsMap[event.id] = data as EventParticipant[];
          }
        }
        setEventParticipants(participantsMap);
      }

      if (postsResult.data) {
        setPosts(postsResult.data as Post[]);
      }

      if (veteransResult.data) {
        setVeterans(veteransResult.data as Profile[]);
        setFilteredVeterans(veteransResult.data as Profile[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVeterans = () => {
    let filtered = veterans;

    // Filter by hobby
    if (hobbyFilter !== 'all') {
      filtered = filtered.filter((veteran) => veteran.hobbies?.includes(hobbyFilter));
    }

    // If an event is selected, filter by matching hobbies for that event type
    if (selectedEvent) {
      const event = events.find((e) => e.id === selectedEvent);
      if (event) {
        filtered = filtered.filter((veteran) => matchesEventType(veteran, event.event_type));
      }
    }

    setFilteredVeterans(filtered);
  };

  const matchesEventType = (veteran: Profile, eventType: string): boolean => {
    if (!veteran.hobbies || veteran.hobbies.length === 0) return false;

    const eventHobbyMap: Record<string, string[]> = {
      'Public Talk': ['Public Speaking', 'Teaching & Mentoring'],
      'Motivational Talk': ['Public Speaking', 'Motivational Speaking', 'Teaching & Mentoring'],
      'Professional Talk': ['Professional Training', 'Teaching & Mentoring', 'Consulting'],
      'Professional Task': ['Professional Training', 'Consulting', 'Technology'],
      'Plantation Drive': ['Plantation & Environment', 'Gardening', 'Volunteering'],
      'Orphanage Visit': ['Social Service', 'Volunteering', 'Teaching & Mentoring'],
      'Hospital Visit': ['Healthcare & Medical', 'Social Service', 'Volunteering'],
      'Recreational Visit': ['Recreation & Travel', 'Photography'],
      'Old Home Visit': ['Elder Care', 'Social Service', 'Volunteering'],
      'Book Reading': ['Book Reading & Discussion', 'Writing', 'Teaching & Mentoring'],
    };

    const relevantHobbies = eventHobbyMap[eventType] || [];
    return veteran.hobbies.some((hobby) => relevantHobbies.includes(hobby));
  };

  const handleInviteVeteran = async (veteranId: string) => {
    if (!selectedEvent) {
      alert('Please select an event first');
      return;
    }

    try {
      const { error } = await supabase.from('event_invitations').insert({
        event_id: selectedEvent,
        veteran_id: veteranId,
        inviter_id: profile?.id,
        status: 'pending',
      });

      if (error) throw error;

      alert('Invitation sent successfully!');
    } catch (error: any) {
      console.error('Error inviting veteran:', error);
      if (error.code === '23505') {
        alert('This veteran has already been invited to this event.');
      } else {
        alert('Failed to send invitation.');
      }
    }
  };

  const handleMarkAttended = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status: 'attended' })
        .eq('id', participantId);

      if (error) throw error;

      alert('Participant marked as attended! Stars will be awarded automatically.');
      fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
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

  const allHobbies = Array.from(new Set(veterans.flatMap((v) => v.hobbies || []))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-teal-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className="text-teal-600" size={32} />
              <h1 className="text-2xl font-serif font-bold text-gray-800">VeteranMeet</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileEdit(true)}
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
            Welcome, {profile?.organization_name}
          </h1>
          <p className="text-gray-600 text-lg">Manage your events and connect with veterans</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-lg p-2 shadow-md mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar size={18} className="inline mr-2" />
            My Events
          </button>
          <button
            onClick={() => setActiveTab('veterans')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'veterans'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            Find Veterans
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageCircle size={18} className="inline mr-2" />
            Share Updates
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif font-bold text-gray-800">Your Events</h2>
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus size={18} className="mr-2" />
                Create Event
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {events.length === 0 ? (
                <Card className="md:col-span-2">
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 mb-4">
                      No events created yet. Create your first event to get started!
                    </p>
                    <Button onClick={() => setShowCreateEvent(true)}>
                      <Plus size={18} className="mr-2" />
                      Create Your First Event
                    </Button>
                  </div>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          event.status === 'upcoming'
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {event.status}
                      </span>
                      <div className="flex items-center gap-2 bg-amber-600 text-white px-3 py-1 rounded-xl font-bold text-sm">
                        <Star size={16} />
                        {event.star_value}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      {event.event_type}
                    </span>
                    <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>
                          {event.location}, {event.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(event.event_date).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">
                          Participants ({eventParticipants[event.id]?.length || 0})
                        </h4>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedEvent(event.id);
                            setActiveTab('veterans');
                          }}
                        >
                          <UserPlus size={14} className="mr-1" />
                          Invite
                        </Button>
                      </div>

                      {eventParticipants[event.id]?.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {eventParticipants[event.id].map((participant) => (
                            <div
                              key={participant.id}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {participant.veteran?.full_name}
                                </p>
                                <p className="text-xs text-gray-500">{participant.status}</p>
                              </div>
                              {participant.status === 'registered' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAttended(participant.id)}
                                >
                                  Mark Attended
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Veterans Tab */}
        {activeTab === 'veterans' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                Find Veterans to Invite
              </h2>
              <p className="text-gray-600">
                {selectedEvent
                  ? `Inviting to: ${events.find((e) => e.id === selectedEvent)?.title}`
                  : 'Select an event from the Events tab to invite veterans'}
              </p>
            </div>

            <Card>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Select
                  value={selectedEvent || ''}
                  onChange={(e) => setSelectedEvent(e.target.value || null)}
                >
                  <option value="">Select an event</option>
                  {events
                    .filter((e) => e.status === 'upcoming')
                    .map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                </Select>

                <Select value={hobbyFilter} onChange={(e) => setHobbyFilter(e.target.value)}>
                  <option value="all">All Hobbies</option>
                  {allHobbies.map((hobby) => (
                    <option key={hobby} value={hobby}>
                      {hobby}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredVeterans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No veterans found with the selected filters.
                  </p>
                ) : (
                  filteredVeterans.map((veteran) => (
                    <div
                      key={veteran.id}
                      className="bg-gradient-to-r from-amber-50 to-teal-50 rounded-xl p-4 border-2 border-amber-100 hover:border-amber-200 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{veteran.full_name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{veteran.profession}</p>
                          {veteran.city && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                              <MapPin size={12} />
                              <span>{veteran.city}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1 rounded-lg text-sm font-bold mb-2">
                            <Star size={14} />
                            {veteran.stars}
                          </div>
                          {veteran.rank && (
                            <span className="text-xs text-gray-600">{veteran.rank}</span>
                          )}
                        </div>
                      </div>

                      {veteran.hobbies && veteran.hobbies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {veteran.hobbies.map((hobby) => (
                            <span
                              key={hobby}
                              className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs"
                            >
                              {hobby}
                            </span>
                          ))}
                        </div>
                      )}

                      {selectedEvent && (
                        <>
                          {matchesEventType(
                            veteran,
                            events.find((e) => e.id === selectedEvent)?.event_type || ''
                          ) && (
                            <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold mb-2">
                              ✓ Matches event requirements
                            </span>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleInviteVeteran(veteran.id)}
                            className="w-full"
                          >
                            <UserPlus size={14} className="mr-2" />
                            Invite to Event
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                Share Updates
              </h2>
              <p className="text-gray-600">
                Post updates about your organization and upcoming events
              </p>
            </div>

            {profile && <CreatePost authorId={profile.id} onPostCreated={fetchData} />}

            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <p className="text-gray-500 text-center py-8">
                    No posts yet. Share your first update!
                  </p>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {post.author?.organization_name || post.author?.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="rounded-lg w-full max-h-96 object-cover mb-4"
                      />
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateEvent && profile && (
        <CreateEvent
          profile={profile}
          onEventCreated={() => {
            fetchData();
            setShowCreateEvent(false);
          }}
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
