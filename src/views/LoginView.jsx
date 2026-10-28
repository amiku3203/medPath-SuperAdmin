import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Activity,
  Cpu,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  Terminal,
  Fingerprint,
  Info,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const LoginView = () => {
  const navigate = useNavigate();
  const { login, loading, isBackendConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [showEmergencyHelp, setShowEmergencyHelp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const res = await login(email.trim(), password);
    if (res?.success) {
      navigate('/onboarding');
    }
  };

  const fillDemoAdmin = () => {
    setEmail('superadmin@medpath.org');
    setPassword('SuperAdmin@2026!');
    notification.info({
      message: 'Demo Credentials Loaded',
      description: 'SuperAdmin test credentials filled into the terminal.',
      placement: 'topRight',
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#060913] text-slate-100 overflow-hidden px-4 py-8">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 -left-32 w-[32rem] h-[32rem] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-[34rem] h-[34rem] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-10 right-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Modern High-Tech Grid Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand Showcase & Live Telemetry Panel */}
        <div className="lg:col-span-6 space-y-6 lg:pr-4 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/30 text-sky-400 text-xs font-semibold shadow-lg shadow-sky-500/10">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>MedPath Orchestration v1.0.0</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="text-slate-400 font-normal">SuperAdmin Console</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Centralized <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Multi-Tenant Control Plane
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-3 font-normal leading-relaxed">
              Provision, govern, and monitor isolated healthcare institutions, medical universities, and hospital training portals from a single unified control plane.
            </p>
          </div>

          {/* Architecture Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Compound Isolation</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated `tenantId` scoped MongoDB compound indexes.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Real-Time Telemetry</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Live platform cluster ping, health checks & user quotas.</p>
            </div>
          </div>
 
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-2xl glass-panel p-6 sm:p-8 shadow-2xl shadow-black/80 border border-slate-700/60 glow-card">
            
            {/* Top Brand & Header */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800/90">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 border border-sky-400/30">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                    Terminal Login
                  </h2>
                  <p className="text-xs text-slate-400">MedPath SuperAdmin Portal</p>
                </div>
              </div>

              {/* Quick Demo Fill Pill */}
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1 cursor-pointer"
                title="Populate test SuperAdmin credentials"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Demo Fill</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Operator Email or ID</span>
                  <span className="text-[10px] text-slate-500 font-normal">Registered SuperAdmin</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. superadmin@medpath.org"
                    required
                    autoComplete="email"
                    className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Master Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyHelp(!showEmergencyHelp)}
                    className="text-[10px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Lost access?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Extra Checkbox & Security notice */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none text-[11px]">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Trust this administrative workstation</span>
                </label>
              </div>

              {/* Emergency Help Dropdown */}
              {showEmergencyHelp && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 text-[11px] text-slate-300 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>SuperAdmin Access Recovery</span>
                  </div>
                  <p className="text-slate-400 leading-normal">
                    SuperAdmin credentials require root terminal authority. If you lost your password, run the backend seed script or contact the platform DevOps lead.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" />
                    Verifying Credentials...
                  </span>
                ) : (
                  <>
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Footer */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit TLS Scoped Access</span>
              </div>
              <div className="flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                <span>Operator Logged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
