// src/App.tsx
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

// This component will decide which page to show
const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gray-900 text-cyan-400 min-h-screen">
      {isAuthenticated ? <DashboardPage /> : <AuthPage />}
    </div>
  );
};

// The main App component wraps everything in the AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;