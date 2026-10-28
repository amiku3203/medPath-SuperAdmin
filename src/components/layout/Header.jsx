import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ globalSearch, setGlobalSearch, onRefreshData }) => {
  const { admin, isBackendConnected } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/organizations')) return 'Tenant Organizations Directory';
    if (pathname.startsWith('/users')) return 'Cross-Tenant User Management';
    if (pathname.startsWith('/superadmins')) return 'Platform SuperAdmins Management';
    if (pathname.startsWith('/settings')) return 'Infrastructure & Database Health';
    if (pathname.startsWith('/onboarding')) return 'Onboard Tenant Organization Provisioning';
    return 'Platform Overview & Live Telemetry';
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Multi-Tenant Isolation: <span className="text-sky-400 font-semibold">Active (`tenantId` Query Scoped)</span>
          </p>
        </div>
      </div>

      {/* Middle Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-56 sm:w-72 hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search organizations, users..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            title="Refresh Live Data"
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Backend Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
            isBackendConnected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          ></span>
          <span>{isBackendConnected ? 'API Online' : 'API Offline'}</span>
        </div>

        {/* Onboard Tenant Action Button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Onboard Tenant</span>
          <span className="sm:hidden">Onboard</span>
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-sky-500/10">
            SA
          </div>
        </div>
      </div>
    </header>
  );
};
