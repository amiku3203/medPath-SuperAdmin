import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { Tooltip } from 'antd';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      key: 'onboarding',
      path: '/onboarding',
      label: 'Onboard Tenant',
      icon: PlusCircle,
      badge: 'Active',
      disabled: false,
    },
    {
      key: 'dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      disabled: true,
    },
    {
      key: 'organizations',
      path: '/organizations',
      label: 'Organizations',
      icon: Building2,
      badge: null,
      disabled:  false,
    },
    {
      key: 'users',
      path: '/users',
      label: 'User Directory',
      icon: Users,
      badge: null,
      disabled: true,
    },
    {
      key: 'superadmins',
      path: '/superadmins',
      label: 'SuperAdmins',
      icon: ShieldCheck,
      badge: null,
      disabled: true,
    },
    {
      key: 'settings',
      path: '/settings',
      label: 'Settings & Health',
      icon: Settings,
      badge: null,
      disabled: true,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-slate-800/80 bg-slate-950/95 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800/80">
        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-3 overflow-hidden text-left cursor-pointer group"
          title="MedPath Onboarding Portal"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold tracking-tight text-white text-base leading-tight">
                Med<span className="text-sky-400">Path</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-400/90 flex items-center gap-1">
                SuperAdmin Hub
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div
          className={`px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 ${
            collapsed ? 'text-center' : ''
          }`}
        >
          {collapsed ? '•••' : 'Platform Menu'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          // Render Disabled sidebar items
          if (item.disabled) {
            return (
              <Tooltip
                title={collapsed ? `${item.label} (Disabled)` : 'Temporarily disabled'}
                placement="right"
                key={item.key}
              >
                <div
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-900/20 cursor-not-allowed select-none opacity-40 transition-colors"
                >
                  <Icon className="w-5 h-5 shrink-0 text-slate-600" />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left text-slate-500">{item.label}</span>
                  )}
                  {!collapsed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-600 font-mono flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Disabled</span>
                    </span>
                  )}
                </div>
              </Tooltip>
            );
          }

          // Render Active/Enabled sidebar item (Onboarding)
          return (
            <Tooltip title={collapsed ? item.label : ''} placement="right" key={item.key}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/25 ring-1 ring-sky-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge != null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      {/* Quick Action Button for Onboarding */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-sky-950/40 to-slate-900 border border-sky-500/20">
          <div className="flex items-center justify-between text-xs text-sky-400 font-semibold mb-1">
            <span>Onboard Tenant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Active Provisioner: deploy hospital or college tenants.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full py-2 px-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Open Onboarding Page</span>
          </button>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0 shadow-inner">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-white truncate">
                {admin?.name || 'SuperAdmin'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {admin?.email || 'Platform Operator'}
              </div>
            </div>
          )}
          <Tooltip title="Sign Out">
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
