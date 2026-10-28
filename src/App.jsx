import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { OrganizationsView } from './views/OrganizationsView';
import { UsersView } from './views/UsersView';
import { SuperAdminsView } from './views/SuperAdminsView';
import { SettingsView } from './views/SettingsView';
import { OnboardingView } from './views/OnboardingView';

// Protected Platform Layout with Collapsible Sidebar & Header
const PlatformLayout = ({ globalSearch, setGlobalSearch }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#070a12] text-slate-100 overflow-hidden font-sans">
      {/* Sleek Collapsible Sidebar with Route Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Dynamic Sticky Top Header */}
        <Header
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* Scrollable View Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route Guard for Protected Pages
const ProtectedRoute = ({ globalSearch, setGlobalSearch }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <PlatformLayout
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
    />
  );
};

// Public Route Guard for Login Page
const PublicLoginRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return <LoginView />;
};

const AppContent = () => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<PublicLoginRoute />} />

      {/* Protected SuperAdmin Platform Routes */}
      <Route
        element={
          <ProtectedRoute
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
          />
        }
      >
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route
          path="/organizations"
          element={<OrganizationsView globalSearch={globalSearch} />}
        />
        <Route
          path="/users"
          element={<UsersView globalSearch={globalSearch} />}
        />
        <Route path="/superadmins" element={<SuperAdminsView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0284c7',
          colorInfo: '#0ea5e9',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 10,
          colorBgBase: '#0b0f19',
          colorBgContainer: '#0f172a',
          colorBorder: 'rgba(255, 255, 255, 0.08)',
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
