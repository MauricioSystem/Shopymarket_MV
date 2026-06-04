import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_LOGIN_PATH } from "@/utils/authRoles";

/**
 * Route protection component.
 * Verifies if user is authenticated and, if a specific capability is required,
 * checks if the user possesses it.
 * If unauthorized, immediately purges the URL bar (via replace) and redirects to safe zone.
 */
export default function ProtectedRoute({ children, requiredCapability }) {
  const { isAuthenticated, isHydrated, capabilities } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return null; // Don't redirect prematurely during initial load / hydration
  }

  // 1. If not authenticated, redirect to /login and save original attempt location
  if (!isAuthenticated) {
    const loginPath =
      requiredCapability === "canAccessAdminPanel" ? ADMIN_LOGIN_PATH : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. If authenticated but lacks required capability, determine their authorized safe dashboard
  if (requiredCapability && !capabilities[requiredCapability]) {
    let safeRoute = "/home";
    if (capabilities.canAccessAdminPanel) {
      safeRoute = "/dashboard/admin";
    } else if (capabilities.canAccessVendorPanel) {
      safeRoute = "/dashboard/vendor";
    } else if (capabilities.canDeliverOrders) {
      safeRoute = "/dashboard/delivery";
    }

    return <Navigate to={safeRoute} replace />;
  }

  return children;
}
