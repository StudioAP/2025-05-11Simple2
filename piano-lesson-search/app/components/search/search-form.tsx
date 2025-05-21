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
          placeholder="キーワードを入力（例：初心者、子供向け）"
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
        <p className="text-xs text-gray-500 mt-1">例: 渋谷区、横浜市</p>
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg">Search</Button>
    </form>
  );
};

export default SearchForm;
