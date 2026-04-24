import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const SubscriptionContext = createContext(null);

const TRIAL_DAYS = 7;
const COMPANY_MAX_USERS = 5;

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [subState, setSubState] = useState({
    status: 'loading',
    plan: null,
    billingCycle: null,
    trialEndDate: null,
    trialDaysLeft: 0,
    team: null,
    teamRole: null,
    isTeamOwner: false,
  });

  const buildState = (subscription, teamMembership = null) => {
    const team = teamMembership?.teams || null;
    const teamRole = teamMembership?.role || null;

    if (!subscription) {
      return {
        status: 'no_subscription',
        plan: null,
        billingCycle: null,
        trialEndDate: null,
        trialDaysLeft: 0,
        team,
        teamRole,
        isTeamOwner: teamRole === 'owner',
      };
    }

    if (subscription.status === 'trial') {
      const endDate = subscription.trial_end_date
        ? new Date(subscription.trial_end_date)
        : null;

      const now = new Date();
      const daysLeft = endDate
        ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        status: daysLeft <= 0 ? 'expired_trial' : 'trial',
        plan: subscription.plan,
        billingCycle: subscription.billing_cycle,
        trialEndDate: subscription.trial_end_date,
        trialDaysLeft: daysLeft,
        team,
        teamRole,
        isTeamOwner: teamRole === 'owner',
      };
    }

    if (subscription.status === 'active') {
      return {
        status: 'active',
        plan: subscription.plan,
        billingCycle: subscription.billing_cycle,
        trialEndDate: subscription.trial_end_date,
        trialDaysLeft: 0,
        team,
        teamRole,
        isTeamOwner: teamRole === 'owner',
      };
    }

    if (subscription.status === 'inactive') {
      return {
        status: 'inactive',
        plan: subscription.plan,
        billingCycle: subscription.billing_cycle,
        trialEndDate: subscription.trial_end_date,
        trialDaysLeft: 0,
        team,
        teamRole,
        isTeamOwner: teamRole === 'owner',
      };
    }

    return {
      status: 'no_subscription',
      plan: null,
      billingCycle: null,
      trialEndDate: null,
      trialDaysLeft: 0,
      team,
      teamRole,
      isTeamOwner: teamRole === 'owner',
    };
  };

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

    if (error) {
      console.error('Failed to load team membership:', error);
      return null;
    }

    return data || null;
  };

  const loadSubscription = async () => {
    if (isLoadingAuth) return null;

    if (!isAuthenticated || !user?.id) {
      setSubState({
        status: 'no_subscription',
        plan: null,
        billingCycle: null,
        trialEndDate: null,
        trialDaysLeft: 0,
        team: null,
        teamRole: null,
        isTeamOwner: false,
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

      const { data: subscription, error } = subscriptionResponse;

      if (error) {
        console.error('Failed to load subscription:', error);
        setSubState({
          status: 'no_subscription',
          plan: null,
          billingCycle: null,
          trialEndDate: null,
          trialDaysLeft: 0,
          team: teamMembership?.teams || null,
          teamRole: teamMembership?.role || null,
          isTeamOwner: teamMembership?.role === 'owner',
        });
        return null;
      }

      const nextState = buildState(subscription, teamMembership);
      setSubState(nextState);

      return subscription;
    } catch (error) {
      console.error('Unexpected subscription load error:', error);
      setSubState({
        status: 'no_subscription',
        plan: null,
        billingCycle: null,
        trialEndDate: null,
        trialDaysLeft: 0,
        team: null,
        teamRole: null,
        isTeamOwner: false,
      });
      return null;
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user?.id, isAuthenticated, isLoadingAuth]);

  const canCalculate =
    subState.status === 'trial' || subState.status === 'active';

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

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
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

  const startTrial = async (plan = 'diy') => {
    if (!user?.id) return;

    let team = null;

    if (plan === 'company') {
      team = await ensureCompanyTeam();

      if (!team) {
        console.error('Company trial could not start because team creation failed.');
        return;
      }
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + TRIAL_DAYS);

    const payload = {
      user_id: user.id,
      status: 'trial',
      plan,
      billing_cycle: null,
      trial_end_date: endDate.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('subscriptions')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to start trial:', error);
      return;
    }

    await loadSubscription();
  };

  const activateSubscription = async (plan = 'diy', billingCycle = 'monthly') => {
    if (!user?.id) return;

    if (plan === 'company') {
      const team = await ensureCompanyTeam();

      if (!team) {
        console.error('Company subscription could not activate because team creation failed.');
        return;
      }
    }

    const payload = {
      user_id: user.id,
      status: 'active',
      plan,
      billing_cycle: billingCycle,
      trial_end_date: null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('subscriptions')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to activate subscription:', error);
      return;
    }

    await loadSubscription();
  };

  const cancelSubscription = async () => {
    if (!user?.id) return;

    const payload = {
      user_id: user.id,
      status: 'inactive',
      plan: subState.plan,
      billing_cycle: subState.billingCycle,
      trial_end_date: subState.trialEndDate,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('subscriptions')
      .upsert(payload, { onConflict: 'user_id' });

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