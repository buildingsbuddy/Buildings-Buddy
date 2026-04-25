import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const priceMap = {
  diy: {
    monthly: process.env.STRIPE_DIY_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_DIY_YEARLY_PRICE_ID,
  },
  company: {
    monthly: process.env.STRIPE_COMPANY_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_COMPANY_YEARLY_PRICE_ID,
  },
};

function getSiteUrl(event) {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, '');
  }

  const origin = event.headers.origin || event.headers.Origin;

  if (origin && !origin.includes('localhost')) {
    return origin.replace(/\/$/, '');
  }

  return 'https://buildingsbuddy.com';
}

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing auth token' }),
      };
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const { plan, billingCycle } = JSON.parse(event.body || '{}');
    const priceId = priceMap?.[plan]?.[billingCycle];

    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid plan or billing cycle' }),
      };
    }

    const siteUrl = getSiteUrl(event);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/billing?checkout=success`,
      cancel_url: `${siteUrl}/billing?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        plan,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
          billing_cycle: billingCycle,
        },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Checkout error:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Checkout failed' }),
    };
  }
}