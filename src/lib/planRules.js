export const PLAN_RULES = {
  diy: {
    name: 'DIY',
    monthlyPrice: 19.99,
    yearlyPrice: 199,
    projectLimit: 20,
  },
  company: {
    name: 'Company',
    monthlyPrice: 49,
    yearlyPrice: 490,
    projectLimit: Infinity,
  },
};

export function getPlanRules(plan) {
  return PLAN_RULES[plan] || PLAN_RULES.diy;
}