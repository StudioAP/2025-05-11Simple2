import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe/client';

// Stripeウェブフックの処理
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook secret not set');
    return NextResponse.json(
      { error: 'Webhook secret not set' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const stripeSubscriptionId = session.subscription as string | null; 
        const stripeCustomerId = session.customer; 

        if (userId && stripeSubscriptionId && stripeCustomerId) {
          const subscriptionDetails: Stripe.Subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          
          const customerIdString = typeof stripeCustomerId === 'string' ? stripeCustomerId : stripeCustomerId.id;

          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerIdString,
              stripe_subscription_id: stripeSubscriptionId,
              status: subscriptionDetails.status,
              current_period_end: new Date(subscriptionDetails.items.data[0].current_period_end * 1000).toISOString(),
              created_at: new Date(session.created * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Subscription save error:', error);
            throw error;
          }

          const { error: schoolError } = await supabase
            .from('schools')
            .update({ is_published: true })
            .eq('user_id', userId);

          if (schoolError) {
            console.error('School publish status update error:', schoolError);
            throw schoolError;
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // @ts-expect-error Property 'subscription' might exist on invoice but not be in the type.
        const subscriptionFromInvoice = invoice.subscription;
        const stripeSubscriptionId = typeof subscriptionFromInvoice === 'string' 
          ? subscriptionFromInvoice 
          : (subscriptionFromInvoice as Stripe.Subscription)?.id;

        if (stripeSubscriptionId) {
          const subscriptionDetails: Stripe.Subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          let subUserId = subscriptionDetails.metadata?.user_id;

          if (!subUserId && invoice.customer) {
            const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_subscription_id', stripeSubscriptionId)
              .eq('stripe_customer_id', customerId)
              .single();
            if (subData) {
              subUserId = subData.user_id;
            }
          }
          
          if (subUserId) {
            const { error } = await supabase
              .from('subscriptions')
              .update({
                status: subscriptionDetails.status,
                current_period_end: new Date(subscriptionDetails.items.data[0].current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_subscription_id', stripeSubscriptionId);

            if (error) {
              console.error('Subscription update error:', error);
              throw error;
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as Stripe.Invoice;
        // @ts-expect-error Property 'subscription' might exist on invoice but not be in the type.
        const subscriptionFromFailedInvoice = failedInvoice.subscription;
        const stripeSubscriptionId = typeof subscriptionFromFailedInvoice === 'string'
          ? subscriptionFromFailedInvoice
          : (subscriptionFromFailedInvoice as Stripe.Subscription)?.id;

        if (stripeSubscriptionId) {
          const subscriptionDetails: Stripe.Subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscriptionDetails.status, 
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', stripeSubscriptionId);

          if (error) {
            console.error('Subscription status update error (payment_failed):', error);
            // Potentially throw error depending on business logic for failed payments
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object as Stripe.Subscription;
        let deletedUserId = deletedSubscription.metadata?.user_id;

        if (!deletedUserId) {
          const { data: deletedSubData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', deletedSubscription.id)
            .single();
          if (deletedSubData) {
            deletedUserId = deletedSubData.user_id;
          }
        }
        
        if (deletedUserId) {
          const { error: subUpdateError } = await supabase
            .from('subscriptions')
            .update({
              status: deletedSubscription.status, 
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', deletedSubscription.id);

          if (subUpdateError) {
            console.error('Subscription cancel update error:', subUpdateError);
          }

          const { error: schoolError } = await supabase
            .from('schools')
            .update({ is_published: false })
            .eq('user_id', deletedUserId);

          if (schoolError) {
            console.error('School unpublish status update error:', schoolError);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const webhookHandlerErrorMessage = error instanceof Error ? error.message : "Unknown webhook handler error";
    console.error(`Webhook handler error: ${webhookHandlerErrorMessage}`);
    return NextResponse.json(
      { error: `Webhook handler error: ${webhookHandlerErrorMessage}` },
      { status: 500 }
    );
  }
}
