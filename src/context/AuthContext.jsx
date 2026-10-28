import React, { createContext, useContext, useState, useEffect } from 'react';
import { superadminApi } from '../api/client';
import { notification } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('superAdminToken') || null);
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('superAdminUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Validate session and check health on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        await superadminApi.getHealth();
        setIsBackendConnected(true);
      } catch (_err) {
        setIsBackendConnected(false);
      }

      if (token) {
        try {
          const res = await superadminApi.getProfile();
          if (res?.data) {
            setAdmin(res.data);
            localStorage.setItem('superAdminUser', JSON.stringify(res.data));
          }
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            // Token expired or invalid
            logout();
          }
        }
      }
    };

    fetchStatus();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await superadminApi.login(email, password);
      if (res.success && res.data?.tokens?.accessToken) {
        const accessToken = res.data.tokens.accessToken;
        const adminProfile = res.data.superAdmin;

        setToken(accessToken);
        setAdmin(adminProfile);
        localStorage.setItem('superAdminToken', accessToken);
        localStorage.setItem('superAdminUser', JSON.stringify(adminProfile));
        setIsBackendConnected(true);

        notification.success({
          message: 'SuperAdmin Authenticated',
          description: `Welcome back, ${adminProfile.name || adminProfile.email}`,
          placement: 'topRight',
        });
        return { success: true };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Unable to connect to SuperAdmin backend. Please verify your server is running.';

      notification.error({
        message: 'Authentication Failed',
        description: errorMsg,
        placement: 'topRight',
      });
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        loading,
        isBackendConnected,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
