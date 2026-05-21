import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return <AuthPage />;
  }

  return isAuthenticated ? <DashboardPage /> : <AuthPage />;
}

export default App;
