import { createClient } from '@supabase/supabase-js';

const TRIAL_DAYS = 7;

function json(statusCode, body) {
return {
statusCode,
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(body),
};
}

export async function handler(event) {
try {
if (event.httpMethod !== 'POST') {
return json(405, { error: 'Method not allowed' });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
return json(500, {
error: 'Missing Supabase server environment variables.',
});
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const token = event.headers.authorization?.replace('Bearer ', '');

if (!token) {
return json(401, { error: 'Missing auth token.' });
}

const {
data: { user },
error: userError,
} = await supabaseAdmin.auth.getUser(token);

if (userError || !user) {
console.error('User auth error:', userError);
return json(401, { error: 'Unauthorized.' });
}

const body = JSON.parse(event.body || '{}');
const plan = body.plan === 'company' ? 'company' : 'diy';

const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
.from('profiles')
.select('id')
.eq('id', user.id)
.maybeSingle();

if (profileCheckError) {
console.error('Profile check error:', profileCheckError);
return json(500, {
error: profileCheckError.message || 'Could not check user profile.',
});
}

if (!existingProfile) {
const { error: profileInsertError } = await supabaseAdmin
.from('profiles')
.insert({
id: user.id,
email: user.email || null,
full_name: user.user_metadata?.full_name || null,
company_name: user.user_metadata?.company_name || null,
role: 'user',
created_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
});

if (profileInsertError) {
console.error('Profile insert error:', profileInsertError);
return json(500, {
error: profileInsertError.message || 'Could not create user profile.',
});
}
}

const { data: existingSubscription, error: existingError } = await supabaseAdmin
.from('subscriptions')
.select('*')
.eq('user_id', user.id)
.maybeSingle();

if (existingError) {
console.error('Existing subscription error:', existingError);
return json(500, {
error: existingError.message || 'Could not check subscription.',
});
}

if (existingSubscription?.status === 'active') {
return json(400, {
error: 'You already have an active subscription.',
});
}

if (existingSubscription?.status === 'trial') {
const trialEnd = existingSubscription.trial_end_date
? new Date(existingSubscription.trial_end_date)
: null;

if (trialEnd && trialEnd > new Date()) {
return json(200, {
success: true,
alreadyActive: true,
message: 'Your trial is already active.',
subscription: existingSubscription,
});
}
}

if (
existingSubscription?.trial_end_date ||
existingSubscription?.stripe_subscription_id
) {
return json(400, {
error: 'Your free trial has already been used. Please choose a paid plan.',
});
}

const endDate = new Date();
endDate.setDate(endDate.getDate() + TRIAL_DAYS);

let subscription = null;

if (existingSubscription?.id) {
const { data, error } = await supabaseAdmin
.from('subscriptions')
.update({
status: 'trial',
plan,
billing_cycle: null,
trial_end_date: endDate.toISOString(),
updated_at: new Date().toISOString(),
})
.eq('id', existingSubscription.id)
.select('*')
.single();

if (error) {
console.error('Subscription update error:', error);
return json(500, {
error: error.message || 'Could not start your trial.',
});
}

subscription = data;
} else {
const { data, error } = await supabaseAdmin
.from('subscriptions')
.insert({
user_id: user.id,
status: 'trial',
plan,
billing_cycle: null,
trial_end_date: endDate.toISOString(),
created_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
})
.select('*')
.single();

if (error) {
console.error('Subscription insert error:', error);
return json(500, {
error: error.message || 'Could not start your trial.',
});
}

subscription = data;
}

return json(200, {
success: true,
message: 'Your 7-day free trial has started.',
subscription,
});
} catch (error) {
console.error('Start trial function error:', error);

return json(500, {
error: error.message || 'Could not start your trial.',
});
}
}