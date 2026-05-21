export const AUTH_ROLES = {
    SUPER_ADMIN: "super_admin",
    VENDOR: "vendor",
    CUSTOMER: "customer",
    DELIVERY: "delivery",
};

export const ROLE_IDS = {
    super_admin: 1,
    vendor: 2,
    customer: 3,
    delivery: 4,
};

export const ROLE_LABELS = {
    super_admin: "Super Admin",
    vendor: "Vendedor",
    customer: "Cliente",
    delivery: "Delivery",
};

export const ROLE_ALIASES = {
    // super_admin y sus variantes
    superadmin: AUTH_ROLES.SUPER_ADMIN,
    super_admin: AUTH_ROLES.SUPER_ADMIN,
    // admin (BD) es el rol de vendedor/dueño de tienda
    admin: AUTH_ROLES.VENDOR,
    seller: AUTH_ROLES.VENDOR,
    vendor: AUTH_ROLES.VENDOR,
    tienda: AUTH_ROLES.VENDOR,
    // cliente (BD) es el comprador
    customer: AUTH_ROLES.CUSTOMER,
    client: AUTH_ROLES.CUSTOMER,
    buyer: AUTH_ROLES.CUSTOMER,
    cliente: AUTH_ROLES.CUSTOMER,
    // repartidor (BD) es el delivery
    delivery: AUTH_ROLES.DELIVERY,
    courier: AUTH_ROLES.DELIVERY,
    repartidor: AUTH_ROLES.DELIVERY,
};

export const ROLE_THEME = {
    super_admin: {
        shell: "vendor",
        label: "Super Admin",
        dataMode: "super_admin",
    },
    vendor: {
        shell: "vendor",
        label: "Vendedor",
        dataMode: "vendor",
    },
    customer: {
        shell: "customer",
        label: "Cliente",
        dataMode: "customer",
    },
    delivery: {
        shell: "customer",
        label: "Delivery",
        dataMode: "delivery",
    },
};

export const ROLE_OPTIONS = [
    { value: AUTH_ROLES.CUSTOMER, label: ROLE_LABELS.customer, roleId: ROLE_IDS.customer },
    { value: AUTH_ROLES.VENDOR, label: ROLE_LABELS.vendor, roleId: ROLE_IDS.vendor },
    { value: AUTH_ROLES.DELIVERY, label: ROLE_LABELS.delivery, roleId: ROLE_IDS.delivery },
];

export const normalizeFrontendRole = (value) => {
    if (!value) {
        return null;
    }

    const normalized = String(value).trim().toLowerCase().replace(/\s+/g, "_");
    return ROLE_ALIASES[normalized] || normalized;
};

export const getRoleLabel = (role) => ROLE_LABELS[normalizeFrontendRole(role)] || "Usuario";

export const getRoleId = (role) => ROLE_IDS[normalizeFrontendRole(role)] || null;

export const resolveDashboardPath = (role) => {
    const normalizedRole = normalizeFrontendRole(role);

    if (normalizedRole === AUTH_ROLES.SUPER_ADMIN) {
        return "/dashboard/super-admin";
    }

    if (normalizedRole === AUTH_ROLES.VENDOR) {
        return "/dashboard/vendor";
    }

    if (normalizedRole === AUTH_ROLES.DELIVERY) {
        return "/dashboard/delivery";
    }

    return "/dashboard/customer";
};
