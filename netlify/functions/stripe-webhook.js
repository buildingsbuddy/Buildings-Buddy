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

function getPlanFromPrice(priceId) {
  const priceMap = {
    [process.env.STRIPE_DIY_MONTHLY_PRICE_ID]: { plan: 'diy', billingCycle: 'monthly' },
    [process.env.STRIPE_DIY_YEARLY_PRICE_ID]: { plan: 'diy', billingCycle: 'yearly' },
    [process.env.STRIPE_COMPANY_MONTHLY_PRICE_ID]: { plan: 'company', billingCycle: 'monthly' },
    [process.env.STRIPE_COMPANY_YEARLY_PRICE_ID]: { plan: 'company', billingCycle: 'yearly' },
  };

  return priceMap[priceId] || { plan: null, billingCycle: null };
}

async function updateSubscription(subscription, fallback = {}) {
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const pricePlan = getPlanFromPrice(priceId);

  const userId =
    subscription.metadata?.user_id ||
    fallback.user_id ||
    fallback.userId ||
    null;

  const plan =
    subscription.metadata?.plan ||
    fallback.plan ||
    pricePlan.plan ||
    null;

  const billingCycle =
    subscription.metadata?.billing_cycle ||
    fallback.billing_cycle ||
    fallback.billingCycle ||
    pricePlan.billingCycle ||
    null;

  if (!userId || !plan || !billingCycle) {
    console.error('Missing subscription data:', {
      subscriptionId: subscription.id,
      metadata: subscription.metadata,
      fallback,
      priceId,
      pricePlan,
    });
    return;
  }

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
    throw error;
  }

  if (plan === 'company') {
    await ensureCompanyTeam(userId);
  }
}

async function ensureCompanyTeam(userId) {
  const { data: existingMembership, error: membershipError } = await supabaseAdmin
    .from('team_members')
    .select('id, team_id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError) {
    console.error('Failed checking company team membership:', membershipError);
    return;
  }

  if (existingMembership?.team_id) return;

  const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = userRecord?.user?.email || null;

  const companyName =
    userRecord?.user?.user_metadata?.company_name ||
    userRecord?.user?.user_metadata?.full_name ||
    email?.split('@')[0] ||
    'My Company';

  const { data: team, error: teamError } = await supabaseAdmin
    .from('teams')
    .insert({
      owner_id: userId,
      name: companyName,
      plan: 'company',
      max_users: 5,
    })
    .select('*')
    .single();

  if (teamError) {
    console.error('Failed creating company team:', teamError);
    return;
  }

  const { error: memberError } = await supabaseAdmin.from('team_members').insert({
    team_id: team.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
    invited_email: email,
  });

  if (memberError) {
    console.error('Failed creating owner team membership:', memberError);
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

        await updateSubscription(subscription, {
          user_id: session.metadata?.user_id || session.client_reference_id,
          plan: session.metadata?.plan,
          billing_cycle: session.metadata?.billing_cycle,
        });
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

      if (error) {
        console.error('Failed marking subscription inactive:', error);
        throw error;
      }
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