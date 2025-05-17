// app/components/search/search-form.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // If using App Router
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const SearchForm: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Construct search params and navigate
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (location) params.set('location', location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-gray-100 rounded-lg">
      <div>
        <Label htmlFor="search-query">What are you looking for?</Label>
        <Input
          id="search-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Piano teacher, music theory, etc."
        />
      </div>
      <div>
        <Label htmlFor="search-location">Location</Label>
        <Input
          id="search-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or zip code"
        />
      </div>
      <Button type="submit" className="w-full">Search</Button>
    </form>
  );
};

export default SearchForm;
