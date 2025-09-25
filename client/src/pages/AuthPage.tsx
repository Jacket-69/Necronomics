// src/pages/AuthPage.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// The component is now a standard const, not exported directly here
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
      // The context will handle redirecting upon successful authentication
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="bg-gray-900 text-cyan-400 min-h-screen flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-md bg-gray-800 border border-cyan-700/50 rounded-lg shadow-lg shadow-cyan-900/20 p-8">
        <h1 className="text-4xl font-bold text-center mb-2">{isLogin ? 'Enter the Nexus' : 'Perform the Ritual'}</h1>
        <p className="text-gray-500 text-center mb-6">{isLogin ? 'Provide your credentials to proceed.' : 'Inscribe your essence into the grimoire.'}</p>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-400 mb-2" htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-cyan-800/60 rounded py-2 px-3 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 border border-cyan-800/60 rounded py-2 px-3 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-900 border border-cyan-800/60 rounded py-2 px-3 text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-cyan-700 hover:bg-cyan-600 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          {isLogin ? "Don't have an incantation?" : "Already initiated?"}{' '}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }} 
            className="text-cyan-400 hover:text-cyan-300 font-bold focus:outline-none"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// This is the main door
export default AuthPage;