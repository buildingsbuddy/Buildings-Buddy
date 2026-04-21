import React, { createContext, useContext, useState } from 'react';

const SubscriptionContext = createContext(null);

const TRIAL_DAYS = 5;

export function SubscriptionProvider({ children }) {
  const [subState, setSubState] = useState({
    status: 'trial', // loading | no_subscription | trial | active | expired_trial | inactive
    plan: 'diy', // diy | company
    billingCycle: null, // monthly | yearly
    trialEndDate: null,
    trialDaysLeft: TRIAL_DAYS,
  });

  const canCalculate = subState.status === 'trial' || subState.status === 'active';

  const loadSubscription = async () => {
    return subState;
  };

  const startTrial = async (plan = 'diy') => {
    setSubState({
      status: 'trial',
      plan,
      billingCycle: null,
      trialEndDate: null,
      trialDaysLeft: TRIAL_DAYS,
    });
  };

  const activateSubscription = async (plan = 'diy', billingCycle = 'monthly') => {
    setSubState({
      status: 'active',
      plan,
      billingCycle,
      trialEndDate: null,
      trialDaysLeft: 0,
    });
  };

  const cancelSubscription = async () => {
    setSubState((prev) => ({
      ...prev,
      status: 'inactive',
    }));
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