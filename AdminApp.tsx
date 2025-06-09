import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { apiService } from './services/apiService';

const AdminApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const response = await apiService.getProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            apiService.logout();
          }
        } catch (error) {
          // Token is invalid, clear it
          apiService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
};

export default AdminApp;
