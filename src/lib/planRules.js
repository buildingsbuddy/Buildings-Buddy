export const PLAN_RULES = {
  diy: {
    name: 'DIY',
    monthlyPrice: 19.99,
    projectLimit: 20,
    canUsePricing: true,
    canExportPdf: true,
    canSaveProjects: true,
    canUseTeam: false,
    canUseAdvancedOrdering: false,
    outputLevel: 'standard',
  },

  company: {
    name: 'Company',
    monthlyPrice: 49,
    projectLimit: Infinity,
    canUsePricing: true,
    canExportPdf: true,
    canSaveProjects: true,
    canUseTeam: true,
    canUseAdvancedOrdering: true,
    outputLevel: 'professional',
  },
};

export function getPlanRules(plan) {
  return PLAN_RULES[plan] || PLAN_RULES.diy;
}

export function isCompanyPlan(plan) {
  return plan === 'company';
}