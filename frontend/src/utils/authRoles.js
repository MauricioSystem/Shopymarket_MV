export const AUTH_ROLES = {
  ADMINISTRATOR: "administrator",
  VENDOR: "vendor",
  CUSTOMER: "customer",
  DELIVERY: "delivery",
};

export const ADMIN_LOGIN_PATH = "/loginadmin";

export const isAdminLoginPath = (pathname) =>
  String(pathname || "")
    .replace(/\/+$/, "")
    .toLowerCase() === ADMIN_LOGIN_PATH;

export const ROLE_IDS = {
  administrator: 1,
  vendor: 2,
  customer: 3,
  delivery: 4,
};

export const ROLE_LABELS = {
  administrator: "Administrador",
  vendor: "Vendedor",
  customer: "Cliente",
  delivery: "Delivery",
};

export const ROLE_ALIASES = {
  super_admin: AUTH_ROLES.ADMINISTRATOR,
  superadmin: AUTH_ROLES.ADMINISTRATOR,
  admin: AUTH_ROLES.VENDOR,
  cliente: AUTH_ROLES.CUSTOMER,
  repartidor: AUTH_ROLES.DELIVERY,
  administrator: AUTH_ROLES.ADMINISTRATOR,
  seller: AUTH_ROLES.VENDOR,
  vendor: AUTH_ROLES.VENDOR,
  tienda: AUTH_ROLES.VENDOR,
  customer: AUTH_ROLES.CUSTOMER,
  client: AUTH_ROLES.CUSTOMER,
  buyer: AUTH_ROLES.CUSTOMER,
  delivery: AUTH_ROLES.DELIVERY,
  courier: AUTH_ROLES.DELIVERY,
};

export const ROLE_OPTIONS = [
  { value: AUTH_ROLES.CUSTOMER, label: ROLE_LABELS.customer, roleId: ROLE_IDS.customer },
  { value: AUTH_ROLES.VENDOR, label: ROLE_LABELS.vendor, roleId: ROLE_IDS.vendor },
  { value: AUTH_ROLES.DELIVERY, label: ROLE_LABELS.delivery, roleId: ROLE_IDS.delivery },
];

export const normalizeFrontendRole = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase().replace(/\s+/g, "_");
  return ROLE_ALIASES[normalized] || normalized;
};

export const getRoleLabel = (role) =>
  ROLE_LABELS[normalizeFrontendRole(role)] || "Usuario";

export const getRoleId = (role) =>
  ROLE_IDS[normalizeFrontendRole(role)] || null;

export const toBackendRole = (role) => {
  const normalized = normalizeFrontendRole(role);
  if (normalized === AUTH_ROLES.ADMINISTRATOR) return "super_admin";
  if (normalized === AUTH_ROLES.VENDOR) return "admin";
  if (normalized === AUTH_ROLES.CUSTOMER) return "cliente";
  if (normalized === AUTH_ROLES.DELIVERY) return "repartidor";
  return null;
};

export const resolveDashboardPath = (role) => {
  const normalizedRole = normalizeFrontendRole(role);
  if (normalizedRole === AUTH_ROLES.ADMINISTRATOR) return "/dashboard/admin";
  if (normalizedRole === AUTH_ROLES.VENDOR) return "/dashboard/vendor";
  if (normalizedRole === AUTH_ROLES.DELIVERY) return "/dashboard/delivery";
  return "/profile";
};
