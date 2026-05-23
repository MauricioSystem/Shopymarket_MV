import { useAuth } from "@/context/AuthContext";
import { AUTH_ROLES } from "@/utils/authRoles";
import AdminDashboard from "@/dashboards/AdminDashboard";
import CustomerDashboard from "@/dashboards/CustomerDashboard";
import VendorDashboard from "@/dashboards/VendorDashboard";
import DeliveryDashboard from "@/dashboards/DeliveryDashboard";
import ProfilePage from "./ProfilePage";
import EditProfilePage from "./EditProfilePage";
import UsersPage from "./UsersPage";

function RoleDispatcher() {
  const { role, currentView } = useAuth();

  if (currentView === "profile") {
    return <ProfilePage />;
  }

  if (currentView === "edit-profile") {
    return <EditProfilePage />;
  }

  if (currentView === "users") {
    return <UsersPage />;
  }

  if (role === AUTH_ROLES.ADMINISTRATOR) {
    return <AdminDashboard />;
  }

  if (role === AUTH_ROLES.VENDOR) {
    return <VendorDashboard />;
  }

  if (role === AUTH_ROLES.DELIVERY) {
    return <DeliveryDashboard />;
  }

  return <CustomerDashboard />;
}

export default RoleDispatcher;
