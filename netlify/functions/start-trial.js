import { createClient } from '@supabase/supabase-js';

const TRIAL_DAYS = 7;
const COMPANY_MAX_USERS = 5;

const supabaseAdmin = createClient(
process.env.VITE_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

function json(statusCode, body) {
return {
statusCode,
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body),
};
}

async function getUserFromToken(token) {
const {
data: { user },
error,
} = await supabaseAdmin.auth.getUser(token);

if (error) {
console.error('Auth token error:', error);
return null;
}

return user || null;
}

async function ensureCompanyTeam(user) {
const { data: existingMembership, error: membershipError } = await supabaseAdmin
.from('team_members')
.select('id, team_id, status, teams(id, name, owner_id, plan, max_users)')
.eq('user_id', user.id)
.eq('status', 'active')
.maybeSingle();

if (membershipError) {
console.error('Team membership check error:', membershipError);
throw new Error('Could not check team membership.');
}

if (existingMembership?.teams) {
return existingMembership.teams;
}

const companyName =
user.user_metadata?.company_name ||
user.user_metadata?.full_name ||
user.email?.split('@')[0] ||
'My Company';

const { data: team, error: teamError } = await supabaseAdmin
.from('teams')
.insert({
owner_id: user.id,
name: companyName,
plan: 'company',
max_users: COMPANY_MAX_USERS,
})
.select('*')
.single();

if (teamError) {
console.error('Team creation error:', teamError);
throw new Error('Could not create company team.');
}

const { error: memberError } = await supabaseAdmin.from('team_members').insert({
team_id: team.id,
user_id: user.id,
role: 'owner',
status: 'active',
invited_email: user.email || null,
});

if (memberError) {
console.error('Team owner membership error:', memberError);
throw new Error('Could not create team owner membership.');
}

return team;
}

export async function handler(event) {
try {
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
console.error('Missing Supabase env vars for start-trial function.');
return json(500, { error: 'Trial setup is missing server configuration.' });
}

if (event.httpMethod !== 'POST') {
return json(405, { error: 'Method not allowed' });
}

const token = event.headers.authorization?.replace('Bearer ', '');

if (!token) {
return json(401, { error: 'Missing auth token' });
}

const user = await getUserFromToken(token);

if (!user) {
return json(401, { error: 'Unauthorized' });
}

const body = JSON.parse(event.body || '{}');
const safePlan = body.plan === 'company' ? 'company' : 'diy';

const { data: existingSubscription, error: existingError } = await supabaseAdmin
.from('subscriptions')
.select('*')
.eq('user_id', user.id)
.maybeSingle();

if (existingError) {
console.error('Existing subscription check error:', existingError);
return json(500, { error: 'Could not check existing subscription.' });
}

if (existingSubscription?.status === 'active') {
return json(400, { error: 'You already have an active subscription.' });
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

if (safePlan === 'company') {
await ensureCompanyTeam(user);
}

const endDate = new Date();
endDate.setDate(endDate.getDate() + TRIAL_DAYS);

const { data: subscription, error: upsertError } = await supabaseAdmin
.from('subscriptions')
.upsert(
{
user_id: user.id,
status: 'trial',
plan: safePlan,
billing_cycle: null,
trial_end_date: endDate.toISOString(),
updated_at: new Date().toISOString(),
},
{ onConflict: 'user_id' }
)
.select('*')
.single();

if (upsertError) {
console.error('Trial upsert error:', upsertError);
return json(500, { error: 'Could not start your trial.' });
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