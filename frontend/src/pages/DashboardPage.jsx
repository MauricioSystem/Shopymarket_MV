import RoleDashboard from "@/dashboards/RoleDashboard";
import SuperAdminDashboard from "@/dashboards/SuperAdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { AUTH_ROLES } from "@/utils/authRoles";

function DashboardPage() {
  const { role, user, logout } = useAuth();

  if (role === AUTH_ROLES.SUPER_ADMIN) {
    return <SuperAdminDashboard onLogout={logout} />;
  }

  return <RoleDashboard role={role} user={user} onLogout={logout} />;
}

export default DashboardPage;
