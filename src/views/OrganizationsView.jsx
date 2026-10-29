import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { Table, Tag, Select, Modal, Drawer, Switch, notification, Empty, Spin, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { superadminApi } from '../api/client';

export const OrganizationsView = ({ onOpenOnboardModal, globalSearch }) => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form state
  const [editPlan, setEditPlan] = useState('growth');
  const [editStatus, setEditStatus] = useState('active');
  const [editMaxUsers, setEditMaxUsers] = useState(2500);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (planFilter !== 'ALL') params.plan = planFilter.toLowerCase();
      if (statusFilter !== 'ALL') params.status = statusFilter.toLowerCase();
      if (search || globalSearch) params.search = (search || globalSearch).trim();

      const res = await superadminApi.listTenants(params);
      if (res?.success) {
        const list = res.data?.tenants || (Array.isArray(res.data) ? res.data : []);
        setTenants(list);
      }
    } catch (err) {
      notification.error({
        message: 'Failed to load tenants',
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [planFilter, statusFilter, search, globalSearch]);

  const handleOpenDetail = async (tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
    // Optionally fetch full tenant detail from GET /superadmin/tenants/:id
    try {
      const res = await superadminApi.getTenantById(tenant._id);
      if (res?.data) {
        setSelectedTenant(res.data);
      }
    } catch (_err) {
      // keep current record
    }
  };

  const handleOpenEdit = (tenant) => {
    setSelectedTenant(tenant);
    setEditPlan(tenant.plan || 'starter');
    setEditStatus(tenant.status || 'active');
    setEditMaxUsers(tenant.settings?.maxUsers || 1000);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTenant) return;

    try {
      await superadminApi.updateTenant(selectedTenant._id, {
        plan: editPlan,
        status: editStatus,
        settings: {
          ...selectedTenant.settings,
          maxUsers: Number(editMaxUsers),
        },
      });

      notification.success({
        message: 'Organization Updated',
        description: `${selectedTenant.name} settings saved successfully.`,
      });

      setIsEditModalOpen(false);
      fetchTenants();
    } catch (err) {
      notification.error({
        message: 'Update Failed',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDeleteTenant = (tenantId, tenantName) => {
    Modal.confirm({
      title: 'Deactivate / Delete Organization?',
      content: `Are you sure you want to deactivate ${tenantName}? Users in this organization will lose access.`,
      okText: 'Deactivate Organization',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await superadminApi.deleteTenant(tenantId);
          notification.success({
            message: 'Organization Deactivated',
            description: `${tenantName} has been deactivated.`,
          });
          fetchTenants();
        } catch (err) {
          notification.error({
            message: 'Action Failed',
            description: err.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  const columns = [
    {
      title: 'Organization & Slug',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
            style={{
              backgroundColor: `${record.settings?.primaryColor || '#0284c7'}20`,
              color: record.settings?.primaryColor || '#0284c7',
              border: `1.5px solid ${record.settings?.primaryColor || '#0284c7'}50`,
            }}
          >
            {name ? name.substring(0, 2).toUpperCase() : 'OR'}
          </div>
          <div>
            <div
              className="font-bold text-white text-xs hover:text-sky-400 cursor-pointer"
              onClick={() => handleOpenDetail(record)}
            >
              {name}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
              <span>slug: {record.slug}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 text-[10px]">ID: {record._id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tier Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => {
        const colors = {
          enterprise: 'purple',
          growth: 'cyan',
          starter: 'blue',
        };
        return <Tag color={colors[plan] || 'default'} className="uppercase font-bold text-[10px]">{plan || 'starter'}</Tag>;
      },
    },
    {
      title: 'Max Users Limit',
      dataIndex: 'settings',
      key: 'settings',
      render: (settings) => (
        <span className="text-xs text-slate-300 font-medium">
          {settings?.maxUsers || 1000} seats
        </span>
      ),
    },
    {
      title: 'Self-Registration',
      dataIndex: 'settings',
      key: 'selfReg',
      render: (settings) => (
        <Tag color={settings?.allowSelfRegistration ? 'green' : 'default'} className="text-[10px]">
          {settings?.allowSelfRegistration ? 'Enabled' : 'Disabled'}
        </Tag>
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
              : status === 'trial'
              ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
              : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'active' ? 'bg-emerald-400' : status === 'trial' ? 'bg-amber-400' : 'bg-rose-400'
            }`}
          />
          <span className="capitalize">{status || 'active'}</span>
        </span>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-slate-400 text-xs font-mono">
          {date ? new Date(date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenDetail(record)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Inspect Settings"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(record)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 transition-colors"
            title="Edit Tier & Limits"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {/* <button
            onClick={() => handleDeleteTenant(record._id, record.name)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/40 transition-colors"
            title="Deactivate / Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Controls Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Multi-Tenant Organizations Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage hospital and academic tenants isolated by `tenantId` in MongoDB
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Input
            prefix={<Search className="w-3.5 h-3.5 text-slate-500 mr-1" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug..."
            className="w-48 bg-slate-900 border-slate-700 text-white text-xs"
          />

          <Select
            value={planFilter}
            onChange={setPlanFilter}
            className="w-32"
            options={[
              { value: 'ALL', label: 'All Plans' },
              { value: 'starter', label: 'Starter' },
              { value: 'growth', label: 'Growth' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-32"
            options={[
              { value: 'ALL', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'trial', label: 'Trial' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />

          <button
            onClick={fetchTenants}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/onboarding')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard Tenant</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spin tip="Fetching tenant organizations..." />
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-16 text-center">
            <Empty description={<span className="text-slate-400 text-xs">No organizations found in database.</span>}>
              <button
                onClick={() => navigate('/onboarding')}
                className="mt-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                + Onboard Tenant Now
              </button>
            </Empty>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={tenants}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="middle"
          />
        )}
      </div>

      {/* Tenant Details Drawer */}
      <Drawer
        title={
          selectedTenant ? (
            <div className="flex items-center gap-2 text-white text-base">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>{selectedTenant.name}</span>
            </div>
          ) : (
            'Organization Details'
          )
        }
        placement="right"
        width={460}
        onClose={() => setIsDetailOpen(false)}
        open={isDetailOpen}
      >
        {selectedTenant && (
          <div className="space-y-6 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[10px]">Slug</span>
                <Tag color="cyan" className="font-mono text-xs">{selectedTenant.slug}</Tag>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[10px]">MongoDB Tenant ID</span>
                <span className="font-mono text-slate-300 text-[11px] select-all">
                  {selectedTenant._id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[10px]">Plan Tier</span>
                <span className="capitalize font-bold text-sky-400">
                  {selectedTenant.plan || 'Starter'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[10px]">Max Users Allowed</span>
                <span className="font-bold text-white">
                  {selectedTenant.settings?.maxUsers || 1000} seats
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Provisioned Module Features
              </h4>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Live Classes</div>
                    <div className="text-[11px] text-slate-500">Live lecture integration</div>
                  </div>
                  <Switch checked={selectedTenant.settings?.features?.liveClasses} disabled />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">AI Quiz Generation</div>
                    <div className="text-[11px] text-slate-500">AI questions builder</div>
                  </div>
                  <Switch checked={selectedTenant.settings?.features?.aiQuizGeneration} disabled />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Custom Certificates</div>
                    <div className="text-[11px] text-slate-500">Branded course certificates</div>
                  </div>
                  <Switch checked={selectedTenant.settings?.features?.customCertificates} disabled />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsDetailOpen(false);
                handleOpenEdit(selectedTenant);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
            >
              Modify Organization Settings
            </button>
          </div>
        )}
      </Drawer>

      {/* Edit Organization Modal */}
      <Modal
        title={
          <div className="text-white text-base font-bold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <span>Update Organization Settings</span>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <div className="space-y-4 py-2 text-xs text-slate-300">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Subscription Plan</label>
            <Select
              value={editPlan}
              onChange={setEditPlan}
              className="w-full"
              options={[
                { value: 'starter', label: 'Starter Tier' },
                { value: 'growth', label: 'Growth Tier' },
                { value: 'enterprise', label: 'Enterprise Tier' },
              ]}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Tenant Account Status</label>
            <Select
              value={editStatus}
              onChange={setEditStatus}
              className="w-full"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'trial', label: 'Trial' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Maximum Allowed Users</label>
            <Input
              type="number"
              value={editMaxUsers}
              onChange={(e) => setEditMaxUsers(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
