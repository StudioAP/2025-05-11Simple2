// app/components/schools/contact-form.tsx
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast'; // Assuming toaster setup
// import { createSupabaseBrowserClient } from '@/utils/supabase/client';

interface ContactFormProps {
  schoolId: string;
  schoolName?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ schoolId, schoolName }) => {
  // const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Placeholder for contact form submission
      console.log('Submitting contact form for school:', schoolId, { name, email, message });
      // Example: await supabase.from('contacts').insert({ school_id: schoolId, name, email, message });
      // toast({ title: 'Message sent!', description: 'The school will get back to you soon.' });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-semibold">Contact {schoolName || 'the School'}</h3>
      <div>
        <Label htmlFor="contact-name">Your Name</Label>
        <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="contact-email">Your Email</Label>
        <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Message sent successfully!</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};

export default ContactForm;
