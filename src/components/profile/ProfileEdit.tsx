import { useState } from 'react';
import { Profile } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { X, Plus } from 'lucide-react';

interface ProfileEditProps {
  profile: Profile;
  onSave: (updatedProfile: Partial<Profile>) => Promise<void>;
  onClose: () => void;
}

const HOBBY_OPTIONS = [
  'Public Speaking',
  'Motivational Speaking',
  'Professional Training',
  'Consulting',
  'Plantation & Environment',
  'Social Service',
  'Healthcare & Medical',
  'Recreation & Travel',
  'Elder Care',
  'Book Reading & Discussion',
  'Teaching & Mentoring',
  'Technology',
  'Arts & Crafts',
  'Sports & Fitness',
  'Music & Dance',
  'Photography',
  'Cooking',
  'Gardening',
  'Writing',
  'Volunteering',
];

export function ProfileEdit({ profile, onSave, onClose }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    profession: profile.profession || '',
    organization_name: profile.organization_name || '',
    bio: profile.bio || '',
    city: profile.city || '',
    hobbies: profile.hobbies || [],
  });
  const [customHobby, setCustomHobby] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddHobby = (hobby: string) => {
    if (!formData.hobbies.includes(hobby)) {
      setFormData({
        ...formData,
        hobbies: [...formData.hobbies, hobby],
      });
    }
  };

  const handleRemoveHobby = (hobby: string) => {
    setFormData({
      ...formData,
      hobbies: formData.hobbies.filter((h) => h !== hobby),
    });
  };

  const handleAddCustomHobby = () => {
    if (customHobby.trim() && !formData.hobbies.includes(customHobby.trim())) {
      handleAddHobby(customHobby.trim());
      setCustomHobby('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
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
              Full Name
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>

          {profile.user_type === 'veteran' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession
                </label>
                <Input
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                  placeholder="e.g., Retired Army Officer, Former Teacher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hobbies & Interests
                </label>
                <div className="space-y-3">
                  {/* Selected Hobbies */}
                  <div className="flex flex-wrap gap-2">
                    {formData.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                      >
                        {hobby}
                        <button
                          type="button"
                          onClick={() => handleRemoveHobby(hobby)}
                          className="hover:text-teal-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Hobby Options */}
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Select from options:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {HOBBY_OPTIONS.filter(
                        (hobby) => !formData.hobbies.includes(hobby)
                      ).map((hobby) => (
                        <button
                          key={hobby}
                          type="button"
                          onClick={() => handleAddHobby(hobby)}
                          className="px-3 py-1 bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-800 rounded-full text-sm transition-colors"
                        >
                          + {hobby}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hobby Input */}
                  <div className="flex gap-2">
                    <Input
                      value={customHobby}
                      onChange={(e) => setCustomHobby(e.target.value)}
                      placeholder="Add custom hobby"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomHobby();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomHobby}
                      variant="secondary"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <Input
                value={formData.organization_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organization_name: e.target.value,
                  })
                }
                placeholder="e.g., Veterans Foundation, Community NGO"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="Your city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <Textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
