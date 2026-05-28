import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/home/HomePage";
import MarketPage from "./pages/market/MarketPage";
import StoreDetailPage from "./pages/market/StoreDetailPage";
import RoleDispatcher from "./pages/RoleDispatcher";
import { useAuth } from "./context/AuthContext";
import { AUTH_ROLES } from "./utils/authRoles";

function App() {
  const { isAuthenticated, isHydrated, currentView, capabilities } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated && capabilities?.canAccessAdminPanel) {
    return <RoleDispatcher />;
  }

  const isVendor = isAuthenticated && capabilities?.canAccessVendorPanel;

  if (currentView === "home") {
    if (isVendor) {
      return <RoleDispatcher />;
    }
    return <HomePage />;
  }
  if (currentView === "market") {
    if (isVendor) {
      return <RoleDispatcher />;
    }
    return <MarketPage />;
  }
  if (currentView === "store-detail") {
    return <StoreDetailPage />;
  }

  if (!isAuthenticated) {
    if (currentView === "login") {
      return <AuthPage />;
    }
    return <HomePage />;
  }

  if (currentView === "login") {
    return <RoleDispatcher />;
  }

  return <RoleDispatcher />;
}

export default App;
