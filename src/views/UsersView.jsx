import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Key,
  UserCheck,
  UserX,
  Building,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Table, Tag, Input, Select, Modal, notification, Empty, Spin } from 'antd';
import { superadminApi } from '../api/client';

export const UsersView = ({ globalSearch }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter.toLowerCase();
      if (statusFilter !== 'ALL') params.status = statusFilter.toLowerCase();
      if (search || globalSearch) params.search = (search || globalSearch).trim();

      const res = await superadminApi.listUsers(params);
      if (res?.success) {
        const userList = res.data?.users || (Array.isArray(res.data) ? res.data : []);
        setUsers(userList);
      }
    } catch (err) {
      notification.error({
        message: 'Failed to load users',
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, search, globalSearch]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await superadminApi.updateUserStatus(userId, nextStatus);
      notification.success({
        message: 'User Status Updated',
        description: `Account has been updated to ${nextStatus}.`,
      });
      fetchUsers();
    } catch (err) {
      notification.error({
        message: 'Status Update Failed',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetModalUser || !newPassword) return;
    try {
      await superadminApi.resetUserPassword(resetModalUser._id, newPassword);
      notification.success({
        message: 'Password Overridden',
        description: `Master password reset for ${resetModalUser.name || resetModalUser.phone}.`,
      });
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      notification.error({
        message: 'Password Reset Failed',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDeleteUser = (userId, userName) => {
    Modal.confirm({
      title: 'Delete User Account?',
      content: `Are you sure you want to permanently delete user ${userName || userId}?`,
      okText: 'Delete User',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await superadminApi.deleteUser(userId);
          notification.success({
            message: 'User Deleted',
            description: 'User record removed from database.',
          });
          fetchUsers();
        } catch (err) {
          notification.error({
            message: 'Deletion Failed',
            description: err.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  const columns = [
    {
      title: 'User & Contact',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
            {name ? name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-semibold text-white text-xs">{name || 'Unnamed User'}</div>
            <div className="text-[11px] text-slate-400 font-mono">{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tenant ID',
      dataIndex: 'tenantId',
      key: 'tenantId',
      render: (tenantId) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Building className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{tenantId ? String(tenantId).substring(0, 8) + '...' : 'Global'}</span>
        </div>
      ),
    },
    {
      title: 'Platform Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          superadmin: 'magenta',
          admin: 'gold',
          instructor: 'cyan',
          learner: 'blue',
        };
        return <Tag color={colors[role] || 'default'} className="uppercase font-bold text-[10px]">{role || 'learner'}</Tag>;
      },
    },
    {
      title: 'Subscription Tier',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => (
        <Tag color={plan === 'paid' ? 'green' : 'default'} className="uppercase text-[10px] font-semibold">
          {plan || 'demo'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const active = record.isActive !== false && status !== 'suspended';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              active
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span>{active ? 'Active' : 'Suspended'}</span>
          </span>
        );
      },
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (val) => (
        <span className="text-slate-400 text-xs">
          {val ? new Date(val).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetModalUser(record)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            title="Force Reset Password"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(record._id, record.status)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 transition-colors"
            title="Toggle Status"
          >
            {record.status === 'suspended' ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserX className="w-3.5 h-3.5 text-rose-400" />}
          </button>
          <button
            onClick={() => handleDeleteUser(record._id, record.name)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Delete User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
            <Users className="w-5 h-5 text-sky-400" />
            <span>Cross-Tenant Platform User Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real user records across all organizations (SuperAdmin platform scope)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Input
            prefix={<Search className="w-3.5 h-3.5 text-slate-500 mr-1" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone or name..."
            className="w-48 bg-slate-900 border-slate-700 text-white text-xs"
          />

          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            className="w-32"
            options={[
              { value: 'ALL', label: 'All Roles' },
              { value: 'admin', label: 'Admins' },
              { value: 'instructor', label: 'Instructors' },
              { value: 'learner', label: 'Learners' },
            ]}
          />

          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spin tip="Loading user directory from database..." />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Empty description={<span className="text-slate-400 text-xs">No users found in database.</span>} />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="middle"
          />
        )}
      </div>

      {/* Force Reset Password Modal */}
      <Modal
        title={
          <div className="text-white text-base font-bold flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <span>Admin Master Password Override</span>
          </div>
        }
        open={Boolean(resetModalUser)}
        onCancel={() => setResetModalUser(null)}
        onOk={handleConfirmResetPassword}
        okText="Update Password"
        cancelText="Cancel"
      >
        {resetModalUser && (
          <div className="space-y-4 py-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-semibold text-white">{resetModalUser.name || 'User'}</div>
              <div className="text-[11px] text-slate-400">Phone: {resetModalUser.phone}</div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">New Security Password</label>
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new 8+ character password"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
