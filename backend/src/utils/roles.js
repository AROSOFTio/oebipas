const SYSTEM_ADMIN_ROLE_NAME = 'System administrator';
const BILLING_OFFICER_ROLE_NAME = 'Billing Officer';
const CUSTOMER_ROLE_NAME = 'Customer';

const ROLE_ALIASES = {
  [SYSTEM_ADMIN_ROLE_NAME]: ['Super Admin', 'Branch Manager', 'System administrator', 'System administrators'],
  [BILLING_OFFICER_ROLE_NAME]: ['Billing Officer', 'Billing officers', 'Billing Staff'],
  [CUSTOMER_ROLE_NAME]: ['Customer', 'Electricity consumer', 'Electricity consumers'],
};

const CANONICAL_ROLE_NAMES = Object.keys(ROLE_ALIASES);

const normalizeRoleName = role => {
  const value = String(role || '').trim();

  for (const [canonicalName, aliases] of Object.entries(ROLE_ALIASES)) {
    if (aliases.includes(value)) {
      return canonicalName;
    }
  }

  return value;
};

const isCustomerRole = role => normalizeRoleName(role) === CUSTOMER_ROLE_NAME;

const roleAliasesFor = role => ROLE_ALIASES[normalizeRoleName(role)] || [role];

module.exports = {
  SYSTEM_ADMIN_ROLE_NAME,
  BILLING_OFFICER_ROLE_NAME,
  CUSTOMER_ROLE_NAME,
  CANONICAL_ROLE_NAMES,
  ROLE_ALIASES,
  isCustomerRole,
  normalizeRoleName,
  roleAliasesFor,
};
