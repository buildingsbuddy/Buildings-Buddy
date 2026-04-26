import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const SubscriptionContext = createContext(null);

const COMPANY_MAX_USERS = 5;

const emptyState = {
status: 'loading',
plan: null,
billingCycle: null,
trialEndDate: null,
trialDaysLeft: 0,
stripeCustomerId: null,
stripeSubscriptionId: null,
stripePriceId: null,
currentPeriodEnd: null,
team: null,
teamRole: null,
isTeamOwner: false,
};

function calculateTrialDaysLeft(trialEndDate) {
if (!trialEndDate) return 0;

const endDate = new Date(trialEndDate);
const now = new Date();

return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
}

function normaliseSubscription(subscription, teamMembership = null) {
const team = teamMembership?.teams || null;
const teamRole = teamMembership?.role || null;

if (!subscription) {
return {
...emptyState,
status: 'no_subscription',
team,
teamRole,
isTeamOwner: teamRole === 'owner',
};
}

if (subscription.status === 'active') {
return {
...emptyState,
status: 'active',
plan: subscription.plan,
billingCycle: subscription.billing_cycle,
trialEndDate: null,
trialDaysLeft: 0,
stripeCustomerId: subscription.stripe_customer_id || null,
stripeSubscriptionId: subscription.stripe_subscription_id || null,
stripePriceId: subscription.stripe_price_id || null,
currentPeriodEnd: subscription.current_period_end || null,
team,
teamRole,
isTeamOwner: teamRole === 'owner',
};
}

if (subscription.status === 'trial') {
const daysLeft = calculateTrialDaysLeft(subscription.trial_end_date);

return {
...emptyState,
status: daysLeft <= 0 ? 'expired_trial' : 'trial',
plan: subscription.plan,
billingCycle: subscription.billing_cycle,
trialEndDate: subscription.trial_end_date,
trialDaysLeft: daysLeft,
stripeCustomerId: subscription.stripe_customer_id || null,
stripeSubscriptionId: subscription.stripe_subscription_id || null,
stripePriceId: subscription.stripe_price_id || null,
currentPeriodEnd: subscription.current_period_end || null,
team,
teamRole,
isTeamOwner: teamRole === 'owner',
};
}

if (subscription.status === 'inactive') {
return {
...emptyState,
status: 'inactive',
plan: subscription.plan,
billingCycle: subscription.billing_cycle,
trialEndDate: subscription.trial_end_date || null,
trialDaysLeft: 0,
stripeCustomerId: subscription.stripe_customer_id || null,
stripeSubscriptionId: subscription.stripe_subscription_id || null,
stripePriceId: subscription.stripe_price_id || null,
currentPeriodEnd: subscription.current_period_end || null,
team,
teamRole,
isTeamOwner: teamRole === 'owner',
};
}

return {
...emptyState,
status: 'no_subscription',
team,
teamRole,
isTeamOwner: teamRole === 'owner',
};
}

export function SubscriptionProvider({ children }) {
const { user, isAuthenticated, isLoadingAuth } = useAuth();
const [subState, setSubState] = useState(emptyState);

const loadTeamMembership = async () => {
if (!user?.id) return null;

const { data, error } = await supabase
.from('team_members')
.select(`
id,
role,
status,
team_id,
teams (
id,
name,
owner_id,
plan,
max_users,
created_at
)
`)
.eq('user_id', user.id)
.eq('status', 'active')
.maybeSingle();

if (error && error.code !== 'PGRST116') {
  console.error('Failed to load team membership:', error);
}

return data || null;
};

const loadOwnerSubscription = async (ownerId) => {
if (!ownerId) return null;

const { data, error } = await supabase
.from('subscriptions')
.select('*')
.eq('user_id', ownerId)
.maybeSingle();

if (error) {
console.error('Failed to load team owner subscription:', error);
return null;
}

return data || null;
};

const ensureCompanyTeam = async () => {
if (!user?.id) return null;

const { data: existingMembership, error: membershipError } = await supabase
.from('team_members')
.select(`
id,
role,
status,
team_id,
teams (
id,
name,
owner_id,
plan,
max_users,
created_at
)
`)
.eq('user_id', user.id)
.eq('status', 'active')
.maybeSingle();

if (membershipError) {
console.error('Failed to check existing team membership:', membershipError);
return null;
}

if (existingMembership?.teams) {
return existingMembership.teams;
}

const companyName =
user.user_metadata?.company_name ||
user.user_metadata?.full_name ||
user.email?.split('@')[0] ||
'My Company';

const { data: team, error: teamError } = await supabase
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
console.error('Failed to create company team:', teamError);
return null;
}

const { error: memberError } = await supabase.from('team_members').insert({
team_id: team.id,
user_id: user.id,
role: 'owner',
status: 'active',
invited_email: user.email || null,
});

if (memberError) {
console.error('Failed to create owner team membership:', memberError);
return null;
}

return team;
};

const loadSubscription = async () => {
if (isLoadingAuth) return null;

if (!isAuthenticated || !user?.id) {
setSubState({
...emptyState,
status: 'no_subscription',
});
return null;
}

try {
setSubState((prev) => ({ ...prev, status: 'loading' }));

const [subscriptionResponse, teamMembership] = await Promise.all([
supabase
.from('subscriptions')
.select('*')
.eq('user_id', user.id)
.maybeSingle(),
loadTeamMembership(),
]);

const { data: ownSubscription, error } = subscriptionResponse;

if (error) {
console.error('Failed to load subscription:', error);
setSubState({
...emptyState,
status: 'no_subscription',
team: teamMembership?.teams || null,
teamRole: teamMembership?.role || null,
isTeamOwner: teamMembership?.role === 'owner',
});
return null;
}

let effectiveSubscription = ownSubscription;
let effectiveTeamMembership = teamMembership;

const hasOwnActiveAccess =
ownSubscription?.status === 'active' ||
(ownSubscription?.status === 'trial' &&
calculateTrialDaysLeft(ownSubscription.trial_end_date) > 0);

if (!hasOwnActiveAccess && teamMembership?.teams?.owner_id) {
const ownerSubscription = await loadOwnerSubscription(
teamMembership.teams.owner_id
);

const ownerHasCompanyAccess =
ownerSubscription?.plan === 'company' &&
(ownerSubscription?.status === 'active' ||
(ownerSubscription?.status === 'trial' &&
calculateTrialDaysLeft(ownerSubscription.trial_end_date) > 0));

if (ownerHasCompanyAccess) {
effectiveSubscription = ownerSubscription;
}
}

if (
effectiveSubscription?.plan === 'company' &&
(effectiveSubscription.status === 'active' ||
effectiveSubscription.status === 'trial') &&
!effectiveTeamMembership
) {
await ensureCompanyTeam();
effectiveTeamMembership = await loadTeamMembership();
}

const nextState = normaliseSubscription(
effectiveSubscription,
effectiveTeamMembership
);

setSubState(nextState);
return effectiveSubscription;
} catch (error) {
console.error('Unexpected subscription load error:', error);
setSubState({
...emptyState,
status: 'no_subscription',
});
return null;
}
};

useEffect(() => {
loadSubscription();
}, [user?.id, isAuthenticated, isLoadingAuth]);

const canCalculate =
subState.status === 'trial' || subState.status === 'active';

const canStartTrial =
subState.status === 'no_subscription' &&
!subState.trialEndDate &&
!subState.stripeSubscriptionId;

const startTrial = async (plan = 'diy') => {
if (!user?.id) {
return {
success: false,
error: 'You must be logged in to start a trial.',
};
}

try {
const {
data: { session },
error: sessionError,
} = await supabase.auth.getSession();

if (sessionError || !session?.access_token) {
return {
success: false,
error: 'Please log in again before starting your trial.',
};
}

const response = await fetch('/.netlify/functions/start-trial', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${session.access_token}`,
},
body: JSON.stringify({ plan }),
});

const data = await response.json();

if (!response.ok) {
return {
success: false,
error: data.error || 'Could not start your trial.',
};
}

await loadSubscription();

return {
success: true,
message: data.message || 'Your 7-day free trial has started.',
};
} catch (error) {
console.error('Unexpected start trial error:', error);

return {
success: false,
error: 'Could not start your trial. Please try again.',
};
}
};

const activateSubscription = async (plan = 'diy', billingCycle = 'monthly') => {
console.warn(
'activateSubscription is legacy. Stripe webhook should activate paid subscriptions.'
);

if (!user?.id) return;

if (plan === 'company') {
const team = await ensureCompanyTeam();

if (!team) {
console.error('Company subscription could not activate because team creation failed.');
return;
}
}

const { error } = await supabase.from('subscriptions').upsert(
{
user_id: user.id,
status: 'active',
plan,
billing_cycle: billingCycle,
trial_end_date: null,
updated_at: new Date().toISOString(),
},
{ onConflict: 'user_id' }
);

if (error) {
console.error('Failed to activate subscription:', error);
return;
}

await loadSubscription();
};

const cancelSubscription = async () => {
console.warn(
'cancelSubscription is legacy. Stripe Customer Portal should cancel paid subscriptions.'
);

if (!user?.id) return;

const { error } = await supabase.from('subscriptions').upsert(
{
user_id: user.id,
status: 'inactive',
plan: subState.plan,
billing_cycle: subState.billingCycle,
trial_end_date: subState.trialEndDate,
updated_at: new Date().toISOString(),
},
{ onConflict: 'user_id' }
);

if (error) {
console.error('Failed to cancel subscription:', error);
return;
}

await loadSubscription();
};

return (
<SubscriptionContext.Provider
value={{
...subState,
canCalculate,
canStartTrial,
startTrial,
activateSubscription,
cancelSubscription,
reload: loadSubscription,
ensureCompanyTeam,
}}
>
{children}
</SubscriptionContext.Provider>
);
}

export const useSubscription = () => {
const context = useContext(SubscriptionContext);

if (!context) {
throw new Error('useSubscription must be used within a SubscriptionProvider');
}

return context;
};