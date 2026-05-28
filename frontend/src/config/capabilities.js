import { AUTH_ROLES, normalizeFrontendRole } from "@/utils/authRoles";

export const ROLE_CAPABILITIES = {
  [AUTH_ROLES.ADMINISTRATOR]: {
    canAccessAdminPanel: true,
    canManageUsers: true,
    canManageStores: true,
    canManageCategories: true,
    canViewReports: true,
    canManageProducts: true,
  },
  [AUTH_ROLES.VENDOR]: {
    canAccessVendorPanel: true,
    canManageProducts: true,
    canManageStores: true,
  },
  [AUTH_ROLES.CUSTOMER]: {
    canBrowseMarket: true,
  },
  [AUTH_ROLES.DELIVERY]: {
    canDeliverOrders: true,
  },
};

export function getCapabilitiesForRole(role) {
  const normalized = normalizeFrontendRole(role);
  return ROLE_CAPABILITIES[normalized] || {};
}
