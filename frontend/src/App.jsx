import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/home/HomePage";
import MarketPage from "./pages/market/MarketPage";
import StoreDetailPage from "./pages/market/StoreDetailPage";
import ProductDetailPage from "./pages/market/ProductDetailPage";
import ServiceDetailPage from "./pages/market/ServiceDetailPage";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard Imports
import AdminDashboard from "./pages/dashboards/admin/AdminDashboard";
import StoreSetupPage from "./pages/dashboards/vendor/StoreSetupPage";
import VendorPanelPage from "./pages/dashboards/vendor/VendorPanelPage";
import DeliveryDashboard from "./pages/dashboards/delivery/DeliveryDashboard";

// Profile Imports
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import MyOrdersPage from "./pages/customer/MyOrdersPage";

// Cart Imports
import CheckoutPage from "./pages/cart/CheckoutPage";

// Component for public pages that shouldn't be accessible to logged in users (e.g. login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, capabilities, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    if (capabilities?.canAccessAdminPanel) {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (capabilities?.canAccessVendorPanel) {
      return <Navigate to="/dashboard/vendor" replace />;
    }
    if (capabilities?.canDeliverOrders) {
      return <Navigate to="/dashboard/delivery" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Guard to redirect authenticated staff/vendors away from public landing pages to their private dashboard
const HomeRouteGuard = ({ children }) => {
  const { isAuthenticated, capabilities, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    if (capabilities?.canAccessAdminPanel) {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (capabilities?.canAccessVendorPanel) {
      return <Navigate to="/dashboard/vendor" replace />;
    }
    if (capabilities?.canDeliverOrders) {
      return <Navigate to="/dashboard/delivery" replace />;
    }
  }

  return children;
};

// Redirect for the root path "/" based on user capabilities
const RootRedirect = () => {
  const { isAuthenticated, capabilities, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    if (capabilities?.canAccessAdminPanel) {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (capabilities?.canAccessVendorPanel) {
      return <Navigate to="/dashboard/vendor" replace />;
    }
    if (capabilities?.canDeliverOrders) {
      return <Navigate to="/dashboard/delivery" replace />;
    }
  }

  return <Navigate to="/home" replace />;
};

// Dispatcher for the generic "/dashboard" path
const DashboardDispatcher = () => {
  const { capabilities } = useAuth();

  if (capabilities.canAccessAdminPanel) {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (capabilities.canAccessVendorPanel) {
    return <Navigate to="/dashboard/vendor" replace />;
  }
  if (capabilities.canDeliverOrders) {
    return <Navigate to="/dashboard/delivery" replace />;
  }
  return <Navigate to="/profile" replace />;
};

function App() {
  const { isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthPage entryPoint="login" />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthPage entryPoint="register" />
          </PublicRoute>
        }
      />
      <Route
        path="/loginadmin"
        element={
          <PublicRoute>
            <AuthPage entryPoint="loginAdmin" />
          </PublicRoute>
        }
      />
      <Route path="/loginAdmin" element={<Navigate to="/loginadmin" replace />} />

      {/* ZONAS PÚBLICAS ABSOLUTAS - Con protección perimetral HomeRouteGuard para staff/vendors */}
      <Route
        path="/home"
        element={
          <HomeRouteGuard>
            <HomePage />
          </HomeRouteGuard>
        }
      />
      <Route
        path="/market"
        element={
          <HomeRouteGuard>
            <MarketPage />
          </HomeRouteGuard>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas de detalle dinámicas */}
      <Route path="/store/:storeName" element={<StoreDetailPage type="store" />} />
      <Route path="/service/:serviceName" element={<StoreDetailPage type="service" />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/service-detail/:id" element={<ServiceDetailPage />} />

      {/* Protected Profile views */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected dashboards & workspace routing */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardDispatcher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredCapability="canAccessAdminPanel">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/vendor"
        element={
          <ProtectedRoute requiredCapability="canAccessVendorPanel">
            <StoreSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/vendor-panel"
        element={
          <ProtectedRoute requiredCapability="canAccessVendorPanel">
            <VendorPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/delivery"
        element={
          <ProtectedRoute requiredCapability="canDeliverOrders">
            <DeliveryDashboard />
          </ProtectedRoute>
        }
      />


      {/* Root redirect - Redirects according to session/roles */}
      <Route path="/" element={<RootRedirect />} />

      {/* 404 Catch-all safe redirection */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
