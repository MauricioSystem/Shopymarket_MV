import AuthPage from "./pages/AuthPage";
import RoleDispatcher from "./pages/RoleDispatcher";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return <AuthPage />;
  }

  return isAuthenticated ? <RoleDispatcher /> : <AuthPage />;
}

export default App;
