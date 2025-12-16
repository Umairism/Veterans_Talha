import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { X } from 'lucide-react';
import { supabase, EventType, Profile } from '../../lib/supabase';

interface CreateEventProps {
  profile: Profile;
  onEventCreated: () => void;
  onClose: () => void;
}

const EVENT_TYPES: EventType[] = [
  'Public Talk',
  'Motivational Talk',
  'Professional Talk',
  'Professional Task',
  'Plantation Drive',
  'Orphanage Visit',
  'Hospital Visit',
  'Recreational Visit',
  'Old Home Visit',
  'Book Reading',
];

const EVENT_TYPE_DESCRIPTIONS: Record<EventType, string> = {
  'Public Talk': 'General meetup and discussions at a place of interest',
  'Motivational Talk': 'Inspire and motivate employees or students',
  'Professional Talk': 'Professional training sessions',
  'Professional Task': 'Assistance, monitoring, implementing processes',
  'Plantation Drive': 'Environmental conservation and tree plantation',
  'Orphanage Visit': 'Spend time with children at orphanages',
  'Hospital Visit': 'Visit and comfort patients in hospitals',
  'Recreational Visit': 'Trip or visit to places of interest',
  'Old Home Visit': 'Spend time with elderly at care homes',
  'Book Reading': 'Book reading and discussion sessions',
};

export function CreateEvent({ profile, onEventCreated, onClose }: CreateEventProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Public Talk' as EventType,
    location: '',
    city: profile.city || '',
    star_value: 100,
    event_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.star_value < 0 || formData.star_value > 5000) {
      alert('Star value must be between 0 and 5000');
      return;
    }

    const eventDate = new Date(formData.event_date);
    if (eventDate < new Date()) {
      alert('Event date must be in the future');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('events').insert({
        ...formData,
        creator_id: profile.id,
        creator_type: profile.user_type,
        organization_id: profile.user_type === 'organization' ? profile.id : null,
        status: 'upcoming',
      });

      if (error) throw error;

      alert('Event created successfully!');
      onEventCreated();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Community Event</h2>
            <p className="text-sm text-gray-600 mt-1">
              {profile.user_type === 'veteran'
                ? 'Create an event and invite your followers'
                : 'Create an event and invite veterans to participate'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Community Plantation Drive 2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <Select
              value={formData.event_type}
              onChange={(e) =>
                setFormData({ ...formData, event_type: e.target.value as EventType })
              }
              required
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {EVENT_TYPE_DESCRIPTIONS[formData.event_type]}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your event, what participants will do, and any requirements..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Venue address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) =>
                  setFormData({ ...formData, event_date: e.target.value })
                }
                min={minDate}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Star Value (0-5000) *
              </label>
              <Input
                type="number"
                value={formData.star_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    star_value: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                max={5000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Points awarded to participants (cannot be changed later)
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Star value cannot be edited after the event is
              created. Make sure to set the correct value (0-5000 stars).
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
