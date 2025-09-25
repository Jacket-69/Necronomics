// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to the Dashboard, {user?.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default DashboardPage;