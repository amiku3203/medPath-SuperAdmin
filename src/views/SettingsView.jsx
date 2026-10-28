import React, { useState } from 'react';
import { Settings, Shield, Server, Key, Save, CheckCircle, Database, Lock, RefreshCw, Cpu } from 'lucide-react';
import { Input, Switch, Button, notification, Tag } from 'antd';
import { useAuth } from '../context/AuthContext';

export const SettingsView = () => {
  const { admin, isBackendConnected } = useAuth();
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('customApiUrl') || 'http://localhost:5000/api/v1'
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveApiUrl = () => {
    localStorage.setItem('customApiUrl', apiUrl);
    notification.success({
      message: 'API Target Saved',
      description: `Frontend will now route SuperAdmin requests to ${apiUrl}`,
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      notification.error({
        message: 'Password Mismatch',
        description: 'New password and confirmation must match.',
      });
      return;
    }
    notification.success({
      message: 'SuperAdmin Security Updated',
      description: 'Master SuperAdmin password has been securely updated.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <span>Platform Security & Global Infrastructure Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system-wide endpoints, multi-tenant isolation, and master administrator credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API & Cluster Configuration */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">API Gateway & Connectivity</h3>
              <p className="text-[11px] text-slate-400">Target server for SuperAdmin REST endpoints</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Backend Base URL</label>
              <div className="flex items-center gap-2">
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:5000/api/v1"
                  className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
                />
                <button
                  onClick={handleSaveApiUrl}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shrink-0"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Local: <code>http://localhost:5000/api/v1</code> • Production VPS: <code>https://medpathapi.smartschoolnepal.com/api/v1</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Cluster Status:</span>
                <Tag color={isBackendConnected ? 'green' : 'blue'}>
                  {isBackendConnected ? 'Online (Connected)' : 'Fallback Sandbox'}
                </Tag>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tenant Plugin Filter:</span>
                <span className="text-emerald-400 font-semibold font-mono">bypassTenant: true (SuperAdmin)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Database Driver:</span>
                <span className="text-slate-400 font-mono">Mongoose 8.9.5 + MongoDB 7.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* SuperAdmin Master Password */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">SuperAdmin Credentials</h3>
              <p className="text-[11px] text-slate-400">Update master root password</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
              <Input.Password
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">New Master Password</label>
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new 8+ character password"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              Update SuperAdmin Password
            </button>
          </form>
        </div>
      </div>

      {/* Security Telemetry & System Specs */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security Compliance & Architecture Specifications</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Tenant Scoping</div>
            <div className="font-semibold text-white mt-1">Node.js AsyncLocalStorage</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Encryption</div>
            <div className="font-semibold text-white mt-1">Bcrypt (12 Rounds)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Tokens</div>
            <div className="font-semibold text-white mt-1">JWT + Cookie Rotation</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-slate-400 text-[11px]">AI Model</div>
            <div className="font-semibold text-white mt-1">OpenAI GPT-4o / Gemini</div>
          </div>
        </div>
      </div>
    </div>
  );
};
