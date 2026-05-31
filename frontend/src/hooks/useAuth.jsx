import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginRequest,
  registerRequest,
  reactivateRequest,
} from "@/services/authApi";
import { getRoleId, normalizeFrontendRole } from "@/utils/authRoles";
import { getCapabilitiesForRole } from "@/config/capabilities";

const STORAGE_KEY = "shopymarket.auth.session.v1";
const REGISTRY_KEY = "shopymarket.auth.registry.v1";

const defaultActionContext = {
  isVendorMode: false,
  entryPoint: "login",
};

const defaultState = {
  auth: null,
  actionContext: defaultActionContext,
};

const AuthContext = createContext(null);

const safeReadStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const safeWriteStorage = (value) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
};

const safeClearStorage = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

const safeReadRegistry = () => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const safeWriteRegistry = (value) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(value));
  } catch {}
};

const normalizeStoredSession = (storedSession) => {
  if (!storedSession || typeof storedSession !== "object") {
    return null;
  }

  const auth = storedSession.auth || null;
  const actionContext = {
    ...defaultActionContext,
    ...(storedSession.actionContext || {}),
    isVendorMode: Boolean(storedSession.actionContext?.isVendorMode),
  };

  return {
    auth: auth
      ? {
          token: auth.token,
          user: auth.user,
          capabilities: auth.capabilities || {},
        }
      : null,
    actionContext,
  };
};

const buildPersistedSession = (auth, actionContext) => ({
  auth: auth
    ? {
        token: auth.token,
        user: auth.user,
        capabilities: auth.capabilities || {},
      }
    : null,
  actionContext: {
    ...defaultActionContext,
    ...actionContext,
    isVendorMode: Boolean(actionContext?.isVendorMode),
  },
  updatedAt: new Date().toISOString(),
});

const synthesizeToken = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `local-${window.crypto.randomUUID()}`;
  }
  return `local-${Date.now()}`;
};

const resolvePreferredRole = (
  authResult,
  actionContext,
  registry,
  credentials,
) => {
  const userEmail = credentials?.email?.trim().toLowerCase();
  const registryRole = userEmail ? registry[userEmail] : null;

  return (
    normalizeFrontendRole(authResult?.role) ||
    normalizeFrontendRole(authResult?.user?.role) ||
    normalizeFrontendRole(authResult?.user?.roles?.[0]?.name) ||
    normalizeFrontendRole(actionContext?.role) ||
    normalizeFrontendRole(registryRole) ||
    "customer"
  );
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const storedSession = normalizeStoredSession(safeReadStorage());
    return storedSession || defaultState;
  });
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState(null);
  const [registry, setRegistry] = useState(() => safeReadRegistry());
  const [currentView, setCurrentView] = useState("home");
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedServiceProfileId, setSelectedServiceProfileId] = useState(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (session.auth?.token) {
      safeWriteStorage(
        buildPersistedSession(session.auth, session.actionContext),
      );
      return;
    }

    safeClearStorage();
  }, [isHydrated, session]);

  const commitSession = (auth, actionContext, resolvedRole) => {
    const capabilities = getCapabilitiesForRole(resolvedRole);

    let sanitizedUser = null;
    if (auth?.user) {
      sanitizedUser = { ...auth.user };
      delete sanitizedUser.role;
      delete sanitizedUser.roles;
    }

    const nextAuth = auth
      ? {
          token: auth.token || synthesizeToken(),
          user: sanitizedUser,
          capabilities,
        }
      : null;

    const nextSession = {
      auth: nextAuth,
      actionContext: {
        ...defaultActionContext,
        ...actionContext,
        isVendorMode: Boolean(actionContext?.isVendorMode),
      },
    };

    setSession(nextSession);
    setError(null);
    return nextSession;
  };

  const authenticate = async ({
    credentials,
    isVendorMode = false,
    entryPoint = "login",
    role,
    roleId,
  }) => {
    setLoading(true);
    setError(null);

    try {
      const authResult =
        entryPoint === "register"
          ? await registerRequest(credentials)
          : entryPoint === "reactivate"
          ? await reactivateRequest(credentials)
          : await loginRequest(credentials);

      const resolvedRole = resolvePreferredRole(
        authResult,
        { role, isVendorMode, entryPoint },
        registry,
        credentials,
      );

      if (entryPoint === "register" && credentials?.email) {
        const email = credentials.email.trim().toLowerCase();
        const nextRegistry = {
          ...registry,
          [email]: resolvedRole,
        };
        setRegistry(nextRegistry);
        safeWriteRegistry(nextRegistry);
      }

      const nextSession = commitSession(authResult, {
        isVendorMode,
        entryPoint,
      }, resolvedRole);

      const caps = nextSession.auth.capabilities;
      let dashboardPath = "/profile";
      if (caps.canAccessAdminPanel) dashboardPath = "/dashboard/admin";
      else if (caps.canAccessVendorPanel) dashboardPath = "/dashboard/vendor";
      else if (caps.canDeliverOrders) dashboardPath = "/dashboard/delivery";

      return {
        token: nextSession.auth.token,
        user: nextSession.auth.user,
        capabilities: caps,
        actionContext: nextSession.actionContext,
        dashboardPath,
      };
    } catch (requestError) {
      const message =
        requestError?.message || "No se pudo completar la autenticación.";
      setError(message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  const login = (credentials, options = {}) =>
    authenticate({ credentials, ...options, entryPoint: "login" });
  const register = (credentials, options = {}) =>
    authenticate({ credentials, ...options, entryPoint: "register" });
  const reactivate = (credentials, options = {}) =>
    authenticate({ credentials, ...options, entryPoint: "reactivate" });

  const logout = () => {
    setSession(defaultState);
    setCurrentView("home");
    setError(null);
    safeClearStorage();
  };

  const updateSessionUser = (updatedUser) => {
    setSession((current) => {
      if (!current.auth) return current;
      const copyUser = { ...current.auth.user, ...updatedUser };
      delete copyUser.role;
      delete copyUser.roles;
      return {
        ...current,
        auth: {
          ...current.auth,
          user: copyUser,
        },
      };
    });
  };

  const updateActionContext = (actionContext) => {
    setSession((currentSession) => ({
      ...currentSession,
      actionContext: {
        ...defaultActionContext,
        ...actionContext,
        isVendorMode: Boolean(actionContext?.isVendorMode),
      },
    }));
  };

  const value = useMemo(() => {
    const isAuthenticated = Boolean(session.auth?.token);
    const capabilities = session.auth?.capabilities || {};

    const resolvedRole = capabilities.canAccessAdminPanel
      ? "administrator"
      : capabilities.canAccessVendorPanel
      ? "vendor"
      : capabilities.canDeliverOrders
      ? "delivery"
      : "customer";

    let dashboardPath = "/profile";
    if (capabilities.canAccessAdminPanel) dashboardPath = "/dashboard/admin";
    else if (capabilities.canAccessVendorPanel) dashboardPath = "/dashboard/vendor";
    else if (capabilities.canDeliverOrders) dashboardPath = "/dashboard/delivery";

    return {
      auth: session.auth,
      user: session.auth?.user || null,
      token: session.auth?.token || null,
      role: resolvedRole,
      capabilities,
      actionContext: session.actionContext,
      isVendorMode: Boolean(session.actionContext?.isVendorMode),
      entryPoint: session.actionContext?.entryPoint || "login",
      isAuthenticated,
      isHydrated,
      loading,
      error,
      currentView,
      setCurrentView,
      selectedStoreId,
      setSelectedStoreId,
      selectedServiceProfileId,
      setSelectedServiceProfileId,
      updateSessionUser,
      dashboardPath,
      login,
      register,
      reactivate,
      logout,
      updateActionContext,
      clearError: () => setError(null),
      setActionContext: updateActionContext,
    };
  }, [session, isHydrated, loading, error, currentView, selectedStoreId, selectedServiceProfileId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
