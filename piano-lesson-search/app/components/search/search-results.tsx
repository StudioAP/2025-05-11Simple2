// app/components/search/search-results.tsx
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // For App Router
// import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { Spinner as LoadingSpinner } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error';
// import { FadeIn } from '@/components/ui/animations'; // Assuming animations exist

interface SchoolResult {
  id: string;
  name: string;
  description: string;
  // Add other relevant fields
}

const SearchResultsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const location = searchParams.get('location');
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Placeholder for fetching search results
        console.log('Fetching results for:', { query, location });
        // Example: const { data, error } = await supabase.rpc('search_schools', { keyword: query, search_location: location });
        // if (error) throw error;
        // setResults(data || []);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setResults([
          {id: '1', name: 'Mock School A', description: 'Teaches piano and theory.'},
          {id: '2', name: 'Mock School B', description: 'Focuses on classical piano.'}
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
        setResults([]);
      }
      setIsLoading(false);
    };

    if (query || location) {
      fetchResults();
    }
  }, [query, location]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!results.length && (query || location)) return <p>No results found for your criteria.</p>;
  if (!query && !location) return <p>Please enter a search query or location.</p>; 

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Search Results for &quot;{query}&quot; {location && `in &quot;{location}&quot;`}</h2>
      {results.map((school) => (
        // <FadeIn key={school.id}>
          <div key={school.id} className="p-4 border rounded-md shadow-sm">
            <h3 className="text-lg font-bold">{school.name}</h3>
            <p>{school.description}</p>
            {/* Add more details and a link to the school page */}
          </div>
        // </FadeIn>
      ))}
    </div>
  );
};

const SearchResults: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResults;
