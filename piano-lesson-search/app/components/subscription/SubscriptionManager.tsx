// app/components/subscription/SubscriptionManager.tsx
'use client';
import React, { useState, useEffect } from 'react';
// import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading';

interface Subscription {
  id: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  planName: string;
  currentPeriodEnd: string;
  // Add more fields as needed
}

const SubscriptionManager: React.FC = () => {
  // const supabase = createSupabaseBrowserClient();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Placeholder for fetching subscription status
        // const { data: userSubscription, error: subError } = await supabase
        //   .from('subscriptions')
        //   .select('*')
        //   .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        //   .single();
        // if (subError && subError.code !== 'PGRST116') throw subError; // PGRST116 means no rows found
        // setSubscription(userSubscription as Subscription | null);
        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API
        setSubscription({
            id: 'sub_mock123',
            status: 'active',
            planName: 'Pro Plan',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription details');
      }
      setIsLoading(false);
    };
    fetchSubscription();
  }, []);

  const handleManageSubscription = async () => {
    // Placeholder for redirecting to Stripe Customer Portal or similar
    console.log('Redirecting to manage subscription...');
    // const { data, error } = await fetch('/api/stripe/create-portal-link', { method: 'POST' });
    // if (error || !data?.url) { alert(error?.message || 'Could not create portal link.'); return; }
    // window.location.assign(data.url);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    // Placeholder for cancellation logic
    console.log('Cancelling subscription...');
    // await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
    // Refresh subscription status after cancellation
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-semibold mb-3">Your Subscription</h2>
      {subscription ? (
        <div className="space-y-2">
          <p>Plan: <strong>{subscription.planName}</strong> <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>{subscription.status}</Badge></p>
          <p>Renews on: {subscription.currentPeriodEnd}</p>
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleManageSubscription}>Manage Subscription</Button>
            {subscription.status === 'active' && (
              <Button onClick={handleCancelSubscription} variant="destructive">Cancel Subscription</Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>You do not have an active subscription.</p>
          <Link href="/pricing"><Button className="mt-2">View Plans</Button></Link> 
          {/* Assume a /pricing page exists */}
        </div>
      )}
    </div>
  );
};

// Need to add Link import if used
import Link from 'next/link';

export default SubscriptionManager;
