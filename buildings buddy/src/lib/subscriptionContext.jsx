import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SubscriptionContext = createContext(null);

const TRIAL_DAYS = 5;

export function SubscriptionProvider({ children }) {
  const [subState, setSubState] = useState({
    status: 'loading', // loading | no_subscription | trial | active | expired_trial | inactive
    plan: null, // diy | company
    billingCycle: null, // monthly | yearly
    trialEndDate: null,
    trialDaysLeft: 0,
  });

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const user = await base44.auth.me();
    const subData = user.subscription || null;

    if (!subData) {
      setSubState({ status: 'no_subscription', plan: null, billingCycle: null, trialEndDate: null, trialDaysLeft: 0 });
      return;
    }

    if (subData.status === 'trial') {
      const endDate = new Date(subData.trialEndDate);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      if (daysLeft <= 0) {
        setSubState({ status: 'expired_trial', plan: subData.plan, billingCycle: null, trialEndDate: subData.trialEndDate, trialDaysLeft: 0 });
      } else {
        setSubState({ status: 'trial', plan: subData.plan, billingCycle: null, trialEndDate: subData.trialEndDate, trialDaysLeft: daysLeft });
      }
      return;
    }

    if (subData.status === 'active') {
      setSubState({ status: 'active', plan: subData.plan, billingCycle: subData.billingCycle, trialEndDate: null, trialDaysLeft: 0 });
      return;
    }

    setSubState({ status: 'inactive', plan: subData.plan, billingCycle: subData.billingCycle, trialEndDate: null, trialDaysLeft: 0 });
  };

  const canCalculate = subState.status === 'trial' || subState.status === 'active';

  const startTrial = async (plan) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + TRIAL_DAYS);
    const trialData = { status: 'trial', plan, trialEndDate: endDate.toISOString() };
    await base44.auth.updateMe({ subscription: trialData });
    setSubState({ status: 'trial', plan, billingCycle: null, trialEndDate: endDate.toISOString(), trialDaysLeft: TRIAL_DAYS });
  };

  const activateSubscription = async (plan, billingCycle) => {
    const subData = { status: 'active', plan, billingCycle };
    await base44.auth.updateMe({ subscription: subData });
    setSubState({ status: 'active', plan, billingCycle, trialEndDate: null, trialDaysLeft: 0 });
  };

  const cancelSubscription = async () => {
    await base44.auth.updateMe({ subscription: { status: 'inactive', plan: subState.plan, billingCycle: subState.billingCycle } });
    setSubState(prev => ({ ...prev, status: 'inactive' }));
  };

  return (
    <SubscriptionContext.Provider value={{ ...subState, canCalculate, startTrial, activateSubscription, cancelSubscription, reload: loadSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);