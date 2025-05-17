// app/lib/stripe/client.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
}

// Ensure the API version is compatible with your Stripe integration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion will default to the version pinned in your Stripe dashboard,
  // or the latest API version if no version is pinned.
  typescript: true, // Enable TypeScript support for better type checking
});

export default stripe;
