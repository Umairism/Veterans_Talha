import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea, Input } from '../ui/Input';
import { Image, Video, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreatePostProps {
  authorId: string;
  onPostCreated: () => void;
}

export function CreatePost({ authorId, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('posts').insert({
        author_id: authorId,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        video_url: videoUrl.trim() || null,
      });

      if (error) throw error;

      // Reset form
      setContent('');
      setImageUrl('');
      setVideoUrl('');
      setShowImageInput(false);
      setShowVideoInput(false);

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share your experiences, thoughts, or community service stories..."
          rows={4}
          className="w-full"
        />

        {/* Image Input */}
        {showImageInput && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Image URL
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowImageInput(false);
                  setImageUrl('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Video Input */}
        {showVideoInput && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Video URL (YouTube, Vimeo, etc.)
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowVideoInput(false);
                  setVideoUrl('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {!showImageInput && (
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Image size={20} />
                <span className="text-sm">Add Image</span>
              </button>
            )}
            {!showVideoInput && (
              <button
                type="button"
                onClick={() => setShowVideoInput(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Video size={20} />
                <span className="text-sm">Add Video</span>
              </button>
            )}
          </div>

          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
