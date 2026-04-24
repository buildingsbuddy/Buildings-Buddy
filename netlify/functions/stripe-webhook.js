import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getBodyBuffer(event) {
  if (event.isBase64Encoded) {
    return Buffer.from(event.body || '', 'base64');
  }

  return Buffer.from(event.body || '', 'utf8');
}

function mapStripeStatus(status) {
  if (status === 'active' || status === 'trialing') return 'active';
  return 'inactive';
}

async function updateSubscription(subscription) {
  const userId = subscription.metadata?.user_id;
  const plan = subscription.metadata?.plan;
  const billingCycle = subscription.metadata?.billing_cycle;

  if (!userId || !plan || !billingCycle) {
    console.error('Missing metadata on subscription:', subscription.id, subscription.metadata);
    return;
  }

  const priceId = subscription.items?.data?.[0]?.price?.id || null;

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      status: mapStripeStatus(subscription.status),
      plan,
      billing_cycle: billingCycle,
      trial_end_date: null,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed updating Supabase subscription:', error);
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const signature = event.headers['stripe-signature'];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      getBodyBuffer(event),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await updateSubscription(subscription);
      }
    }

    if (
      stripeEvent.type === 'customer.subscription.created' ||
      stripeEvent.type === 'customer.subscription.updated'
    ) {
      await updateSubscription(stripeEvent.data.object);
    }

    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object;

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) console.error('Failed marking subscription inactive:', error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('Webhook handler error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}