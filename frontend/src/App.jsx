import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/home/HomePage";
import MarketPage from "./pages/market/MarketPage";
import StoreDetailPage from "./pages/market/StoreDetailPage";
import RoleDispatcher from "./pages/RoleDispatcher";
import { useAuth } from "./context/AuthContext";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rutas que requieren no estar autenticado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
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

      {/* Rutas públicas (pero también accesibles autenticado) */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/market" element={<MarketPage />} />

      {/* Rutas de detalle dinámicas */}
      <Route path="/store/:storeName" element={<StoreDetailPage type="store" />} />
      <Route path="/service/:serviceName" element={<StoreDetailPage type="service" />} />

      {/* Rutas protegidas (dashboards, etc) */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <RoleDispatcher />
          </ProtectedRoute>
        }
      />

      {/* Ruta raíz por defecto */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Ruta 404 - no encontrada */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
