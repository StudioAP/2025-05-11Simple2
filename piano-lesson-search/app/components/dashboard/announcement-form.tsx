// app/components/dashboard/announcement-form.tsx
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Assuming title might be an input
// import { createSupabaseBrowserClient } from '@/utils/supabase/client'; // If needed for direct Supabase calls

interface AnnouncementFormProps {
  schoolId?: string; // Assuming school context might be needed
  initialData?: { title: string; content: string };
  onSubmit?: (data: { title: string; content: string }) => Promise<void>;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ schoolId, initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Placeholder for submission logic
      if (onSubmit) {
        await onSubmit({ title, content });
      } else {
        console.log('Submitting announcement:', { schoolId, title, content });
        // Example: await supabase.from('announcements').insert({ school_id: schoolId, title, content });
      }
      // Reset form or provide feedback
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="announcement-title">Title</Label>
        <Input
          id="announcement-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement Title"
          required
        />
      </div>
      <div>
        <Label htmlFor="announcement-content">Content</Label>
        <Textarea
          id="announcement-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement here..."
          rows={6}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : (initialData ? 'Update Announcement' : 'Create Announcement')}
      </Button>
    </form>
  );
};

export default AnnouncementForm;
