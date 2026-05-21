import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginRequest,
  registerRequest,
  normalizeRole,
} from "@/services/authApi";
import {
  AUTH_ROLES,
  getRoleId,
  normalizeFrontendRole,
  resolveDashboardPath,
} from "@/utils/authRoles";

const STORAGE_KEY = "shopymarket.auth.session.v1";
const REGISTRY_KEY = "shopymarket.auth.registry.v1";

const defaultActionContext = {
  isVendorMode: false,
  role: AUTH_ROLES.CUSTOMER,
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
  } catch {
    // Ignore persistence errors so auth still works in restrictive browsers.
  }
};

const safeClearStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
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
  } catch {
    // Ignore registry persistence errors.
  }
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
    role:
      normalizeFrontendRole(storedSession.actionContext?.role) ||
      defaultActionContext.role,
  };

  return {
    auth: auth
      ? {
          ...auth,
          role: normalizeFrontendRole(auth.role) || normalizeRole(auth.role),
        }
      : null,
    actionContext,
  };
};

const buildPersistedSession = (auth, actionContext) => ({
  auth: auth
    ? {
        ...auth,
        role: normalizeFrontendRole(auth.role) || normalizeRole(auth.role),
      }
    : null,
  actionContext: {
    ...defaultActionContext,
    ...actionContext,
    isVendorMode: Boolean(actionContext?.isVendorMode),
    role:
      normalizeFrontendRole(actionContext?.role) || defaultActionContext.role,
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
    defaultActionContext.role
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

  const commitSession = (auth, actionContext) => {
    const nextAuth = auth
      ? {
          ...auth,
          token: auth.token || synthesizeToken(),
          role: normalizeFrontendRole(auth.role) || normalizeRole(auth.role),
        }
      : null;

    const nextSession = {
      auth: nextAuth,
      actionContext: {
        ...defaultActionContext,
        ...actionContext,
        isVendorMode: Boolean(actionContext?.isVendorMode),
        role:
          normalizeFrontendRole(actionContext?.role) ||
          defaultActionContext.role,
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
          : await loginRequest(credentials);

      const resolvedRole = resolvePreferredRole(
        authResult,
        { role, isVendorMode, entryPoint },
        registry,
        credentials,
      );

      const nextAuthResult = {
        ...authResult,
        token: authResult.token || synthesizeToken(),
        role: resolvedRole,
        user: authResult.user
          ? {
              ...authResult.user,
              role: authResult.user.role || resolvedRole,
              role_id:
                authResult.user.role_id || roleId || getRoleId(resolvedRole),
            }
          : authResult.user,
      };

      if (entryPoint === "register" && credentials?.email) {
        const email = credentials.email.trim().toLowerCase();
        const nextRegistry = {
          ...registry,
          [email]: resolvedRole,
        };
        setRegistry(nextRegistry);
        safeWriteRegistry(nextRegistry);
      }

      const nextSession = commitSession(nextAuthResult, {
        isVendorMode,
        role: resolvedRole,
        entryPoint,
      });

      return {
        ...nextAuthResult,
        actionContext: nextSession.actionContext,
        dashboardPath: resolveDashboardPath(resolvedRole),
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

  const logout = () => {
    setSession(defaultState);
    setError(null);
    safeClearStorage();
  };

  const updateActionContext = (actionContext) => {
    setSession((currentSession) => ({
      ...currentSession,
      actionContext: {
        ...defaultActionContext,
        ...actionContext,
        isVendorMode: Boolean(actionContext?.isVendorMode),
        role:
          normalizeFrontendRole(actionContext?.role) ||
          defaultActionContext.role,
      },
    }));
  };

  const value = useMemo(() => {
    const isAuthenticated = Boolean(session.auth?.token);

    return {
      auth: session.auth,
      user: session.auth?.user || null,
      token: session.auth?.token || null,
      role: normalizeFrontendRole(session.auth?.role) || null,
      actionContext: session.actionContext,
      isVendorMode: Boolean(session.actionContext?.isVendorMode),
      entryPoint: session.actionContext?.entryPoint || "login",
      isAuthenticated,
      isHydrated,
      loading,
      error,
      dashboardPath: resolveDashboardPath(
        session.auth?.role || session.actionContext?.role,
      ),
      login,
      register,
      logout,
      updateActionContext,
      clearError: () => setError(null),
      setActionContext: updateActionContext,
      getDashboardPath: () =>
        resolveDashboardPath(session.auth?.role || session.actionContext?.role),
    };
  }, [session, isHydrated, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
