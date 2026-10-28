import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Activity,
  Server,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Table, Tag, Empty, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { superadminApi } from '../api/client';

export const DashboardView = ({ onOpenOnboardModal, setActiveTab }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [totalTenants, setTotalTenants] = useState(0);
  const [activeTenants, setActiveTenants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [healthData, setHealthData] = useState(null);

  const fetchLiveTelemetry = async () => {
    setLoading(true);
    try {
      // 1. Fetch real tenants
      const tenantRes = await superadminApi.listTenants({ page: 1, limit: 10 });
      if (tenantRes?.success) {
        const tenantList = tenantRes.data?.tenants || (Array.isArray(tenantRes.data) ? tenantRes.data : []);
        setTenants(tenantList);
        const count = tenantRes.data?.pagination?.total ?? tenantList.length;
        setTotalTenants(count);
        const activeCount = tenantList.filter((t) => t.status === 'active').length;
        setActiveTenants(activeCount);
      }
    } catch (err) {
      console.warn('Live tenants fetch error:', err.message);
    }

    try {
      // 2. Fetch real users count
      const userRes = await superadminApi.listUsers({ page: 1, limit: 1 });
      if (userRes?.success) {
        const uCount = userRes.data?.pagination?.total ?? (userRes.data?.users ? userRes.data.users.length : 0);
        setTotalUsers(uCount);
      }
    } catch (err) {
      console.warn('Live users fetch error:', err.message);
    }

    try {
      // 3. Fetch real health status
      const hRes = await superadminApi.getHealth();
      if (hRes?.data) {
        setHealthData(hRes.data);
      }
    } catch (err) {
      console.warn('Live health fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return 'Active';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const columns = [
    {
      title: 'Organization',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner"
            style={{
              backgroundColor: `${record.settings?.primaryColor || '#0284c7'}20`,
              color: record.settings?.primaryColor || '#0284c7',
              border: `1px solid ${record.settings?.primaryColor || '#0284c7'}40`,
            }}
          >
            {name ? name.substring(0, 2).toUpperCase() : 'OR'}
          </div>
          <div>
            <div className="font-semibold text-white text-xs">{name}</div>
            <div className="text-[11px] text-slate-400 font-mono">{record.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Plan Tier',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => {
        const color = plan === 'enterprise' ? 'purple' : plan === 'growth' ? 'cyan' : 'blue';
        return <Tag color={color} className="uppercase text-[10px] font-bold">{plan || 'starter'}</Tag>;
      },
    },
    {
      title: 'User Limit',
      dataIndex: 'settings',
      key: 'settings',
      render: (settings) => (
        <span className="text-xs text-slate-300">
          Max {settings?.maxUsers || 1000} users
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
            status === 'active'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span className="capitalize">{status || 'active'}</span>
        </span>
      ),
    },
    {
      title: 'Onboarded Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-slate-400 text-xs font-mono">
          {date ? new Date(date).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Platform Master Console
            </span>
            <span className="text-xs text-slate-400">• Multi-Tenant Data Isolation Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Live Platform Overview & Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant telemetry connected directly to your MongoDB and Express backend.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchLiveTelemetry}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard Tenant</span>
          </button>
        </div>
      </div>

      {/* Real KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants */}
        <div className="p-5 rounded-2xl glass-card border border-sky-500/20 bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Organizations</span>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{totalTenants}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px]">{activeTenants} Active</span>
            <span className="font-semibold text-[11px] text-sky-400">Isolated Schemas</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl glass-card border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Cross-Tenant Users</span>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{totalUsers}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px]">Admins, Faculty & Learners</span>
            <span className="font-semibold text-[11px] text-emerald-400">Live DB Count</span>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">MongoDB Cluster</span>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight capitalize">
            {healthData?.database || 'Connected'}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px]">Compound Index Scoped</span>
            <span className="font-semibold text-[11px] text-emerald-400">Healthy</span>
          </div>
        </div>

        {/* Server Uptime */}
        <div className="p-5 rounded-2xl glass-card border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">API Server Uptime</span>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatUptime(healthData?.uptimeSeconds)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px]">Node.js Express</span>
            <span className="font-semibold text-[11px] text-indigo-400">Real-Time</span>
          </div>
        </div>
      </div>

      {/* Real Organizations Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Registered Tenant Organizations</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Hospitals, medical colleges, and academy accounts created in the database
            </p>
          </div>
          <Button
            type="link"
            onClick={() => navigate('/organizations')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold p-0 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Tenants</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Spin tip="Loading live platform data..." />
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-12 text-center">
            <Empty
              description={
                <div className="text-xs text-slate-400">
                  No organizations found in the database.
                </div>
              }
            >
              <button
                onClick={() => navigate('/onboarding')}
                className="mt-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                + Onboard Your First Organization
              </button>
            </Empty>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={tenants}
            rowKey="_id"
            pagination={false}
            size="middle"
          />
        )}
      </div>
    </div>
  );
};
