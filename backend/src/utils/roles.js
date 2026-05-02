const CUSTOMER_ROLE_NAME = 'Electricity consumers';

const isCustomerRole = role => role === CUSTOMER_ROLE_NAME;

const normalizeRoleName = role => {
  const value = String(role || '').trim();

  if (['Super Admin', 'Branch Manager', 'System administrator', 'System administrators'].includes(value)) {
    return 'System administrators';
  }

  if (['Billing Officer', 'Billing officers', 'Billing Staff'].includes(value)) {
    return 'Billing officers';
  }

  if (['Customer', 'Electricity consumer', 'Electricity consumers'].includes(value)) {
    return CUSTOMER_ROLE_NAME;
  }

  return value;
};

module.exports = {
  CUSTOMER_ROLE_NAME,
  isCustomerRole,
  normalizeRoleName,
};
