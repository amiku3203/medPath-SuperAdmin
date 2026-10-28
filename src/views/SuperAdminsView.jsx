import React, { useState } from 'react';
import { ShieldCheck, UserPlus, KeyRound, Mail, Phone, User, Calendar, ShieldAlert } from 'lucide-react';
import { Modal, Form, Input, notification, Tag, Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { superadminApi } from '../api/client';

export const SuperAdminsView = () => {
  const { admin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredAdmins, setRegisteredAdmins] = useState([]);
  const [form] = Form.useForm();

  const handleRegister = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone ? values.phone.trim() : undefined,
        password: values.password,
      };

      const res = await superadminApi.registerSuperAdmin(payload);
      const newAdmin = res.data?.superAdmin || {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      };

      setRegisteredAdmins((prev) => [newAdmin, ...prev]);

      notification.success({
        message: 'SuperAdmin Account Created',
        description: `Successfully registered ${payload.name} (${payload.email}) as a platform SuperAdmin.`,
        placement: 'topRight',
      });

      form.resetFields();
      setIsModalOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
        err.message ||
        'Registration failed';

      notification.error({
        message: 'Registration Failed',
        description: msg,
        placement: 'topRight',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>Platform SuperAdmin Operators</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage authenticated platform operators with unrestricted cross-tenant access and master governance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New SuperAdmin</span>
        </button>
      </div>

      {/* Current Operator Card */}
      <div className="p-6 rounded-2xl glass-panel border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-sky-950/20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-sky-500/20">
              {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'SA'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{admin?.name || 'Platform SuperAdmin'}</h3>
                <Tag color="cyan" className="font-mono text-[10px] uppercase font-bold">Active Session</Tag>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {admin?.email || 'operator@platform.internal'}
                </span>
                {admin?.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {admin.phone}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Role Authority</span>
            <span className="text-xs font-bold text-sky-400 font-mono">Global SuperAdmin (bypassTenant)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Access Scope</span>
            <span className="font-semibold text-white">Full Multi-Tenant Governance</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Database Queries</span>
            <span className="font-semibold text-emerald-400 font-mono">Unfiltered Across All Tenants</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Security Token</span>
            <span className="font-semibold text-sky-400 font-mono">JWT SuperAdmin Signature</span>
          </div>
        </div>
      </div>

      {/* Newly Registered in This Session */}
      {registeredAdmins.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recently Registered SuperAdmins (This Session)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredAdmins.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl glass-panel border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {item.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{item.email}</p>
                    {item.phone && <p className="text-[11px] text-slate-500 font-mono">{item.phone}</p>}
                  </div>
                </div>
                <Tag color="green">Ready to Login</Tag>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SuperAdmin Policy Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>SuperAdmin Privilege & Security Guidelines</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          SuperAdmin accounts possess root administrative privileges over the entire MedPath infrastructure.
          They can onboard isolated tenants, activate or suspend organizations, reset administrator passwords,
          and monitor cross-tenant telemetry. Register new SuperAdmin credentials only for authorized platform engineers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">🔐 Zero Tenant Boundaries</span>
            <span className="text-slate-400 text-[11px]">
              Every API call initiated by this portal bypasses tenant-scoped filters, providing a single-pane view across all colleges and clinics.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">⚡ Automatic Tenant Admin Provisioning</span>
            <span className="text-slate-400 text-[11px]">
              When onboarding a new tenant via the portal, an initial Root Admin for that organization is automatically registered.
            </span>
          </div>
        </div>
      </div>

      {/* Register SuperAdmin Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-white text-base font-bold pb-2 border-b border-slate-800">
            <UserPlus className="w-5 h-5 text-sky-400" />
            <span>Register Platform SuperAdmin</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="ant-modal-dark"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          className="pt-2 text-xs"
        >
          <Form.Item
            name="name"
            label={<span className="text-slate-300 text-xs">Full Name</span>}
            rules={[{ required: true, message: 'Please enter full name (min 2 chars)', min: 2 }]}
          >
            <Input
              prefix={<User className="w-3.5 h-3.5 text-slate-500 mr-1" />}
              placeholder="e.g. Master Operator"
              className="bg-slate-900 border-slate-700 text-white text-xs"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-slate-300 text-xs">Email Address</span>}
            rules={[
              { required: true, message: 'Valid email required' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input
              prefix={<Mail className="w-3.5 h-3.5 text-slate-500 mr-1" />}
              placeholder="operator@medpath.internal"
              className="bg-slate-900 border-slate-700 text-white text-xs font-mono"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span className="text-slate-300 text-xs">Phone (Optional)</span>}
          >
            <Input
              prefix={<Phone className="w-3.5 h-3.5 text-slate-500 mr-1" />}
              placeholder="+9779800000000"
              className="bg-slate-900 border-slate-700 text-white text-xs font-mono"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-slate-300 text-xs">Master Password</span>}
            rules={[{ required: true, min: 8, message: 'Minimum 8 characters required' }]}
          >
            <Input.Password
              prefix={<KeyRound className="w-3.5 h-3.5 text-slate-500 mr-1" />}
              placeholder="••••••••••••"
              className="bg-slate-900 border-slate-700 text-white text-xs"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Register SuperAdmin'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
