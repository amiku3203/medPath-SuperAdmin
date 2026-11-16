import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, notification } from 'antd';
import {
  Building2,
  User,
  Phone,
  Lock,
  Sparkles,
  Shield,
  Palette,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { superadminApi, getTenantUrl } from '../../api/client';

export const OnboardTenantModal = ({ isOpen, onClose, onTenantCreated }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState({
    checking: false,
    available: null,
    reason: null,
    message: '',
  });
  const checkTimeoutRef = useRef(null);

  // Clean and format subdomain slug
  const formatSlug = (val) => {
    return (val || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .slice(0, 30);
  };

  const verifySubdomain = async (slugCandidate) => {
    const clean = (slugCandidate || '').toLowerCase().trim();
    if (!clean || clean.length < 3) {
      setSubdomainStatus({
        checking: false,
        available: false,
        reason: 'TOO_SHORT',
        message: 'Subdomain must be at least 3 characters',
      });
      return;
    }

    setSubdomainStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await superadminApi.checkSubdomain(clean);
      if (res?.data) {
        setSubdomainStatus({
          checking: false,
          available: res.data.available,
          reason: res.data.reason || null,
          message: res.data.message || (res.data.available ? 'Subdomain is available' : 'Subdomain unavailable'),
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error checking subdomain';
      setSubdomainStatus({
        checking: false,
        available: false,
        reason: 'CHECK_FAILED',
        message: errMsg,
      });
    }
  };

  const scheduleSubdomainCheck = (slug) => {
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => {
      verifySubdomain(slug);
    }, 400);
  };

  const handleNameChange = (e) => {
    const val = e.target.value || '';
    const generatedSlug = formatSlug(val);
    form.setFieldsValue({ slug: generatedSlug });
    if (generatedSlug.length >= 3) {
      scheduleSubdomainCheck(generatedSlug);
    } else {
      setSubdomainStatus({ checking: false, available: null, reason: null, message: '' });
    }
  };

  const handleSlugChange = (e) => {
    const val = formatSlug(e.target.value || '');
    form.setFieldsValue({ slug: val });
    if (val.length >= 3) {
      scheduleSubdomainCheck(val);
    } else {
      setSubdomainStatus({
        checking: false,
        available: false,
        reason: 'TOO_SHORT',
        message: 'Subdomain must be at least 3 characters',
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSubdomainStatus({ checking: false, available: null, reason: null, message: '' });
    }
  }, [isOpen, form]);

  const handleFinish = async (values) => {
    const cleanSlug = formatSlug(values.slug);

    if (subdomainStatus.available === false) {
      notification.error({
        message: 'Invalid Subdomain',
        description: subdomainStatus.message || 'Please choose an available subdomain before proceeding.',
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      name: values.name.trim(),
      slug: cleanSlug,
      plan: values.plan,
      settings: {
        maxUsers: values.maxUsers || 2000,
        primaryColor: values.primaryColor || '#0284c7',
        accentColor: values.accentColor || '#0ea5e9',
        allowSelfRegistration: values.allowSelfRegistration ?? true,
        features: {
          liveClasses: values.featureLiveClasses ?? true,
          aiQuizGeneration: values.featureAiQuizzes ?? true,
          customCertificates: values.featureCertificates ?? true,
        },
      },
      adminUser: {
        name: values.adminName.trim(),
        phone: values.adminPhone.trim(),
        password: values.adminPassword,
      },
    };

    try {
      const res = await superadminApi.createTenant(payload);
      const createdRecord = res.data?.tenant || res.data;

      notification.success({
        message: 'Organization Successfully Onboarded',
        description: `${payload.name} created. Subdomain Route: ${getTenantUrl(payload.slug)}`,
        placement: 'topRight',
      });

      if (onTenantCreated) {
        onTenantCreated(createdRecord);
      }

      form.resetFields();
      onClose();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
        err.message ||
        'Failed to onboard tenant organization';

      notification.error({
        message: 'Onboarding Failed',
        description: errMsg,
        placement: 'topRight',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentSlug = Form.useWatch('slug', form) || '';

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-white text-base font-bold pb-2 border-b border-slate-800">
          <Building2 className="w-5 h-5 text-sky-400" />
          <span>Onboard New Tenant Organization</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={640}
      className="ant-modal-dark"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          plan: 'growth',
          maxUsers: 2500,
          primaryColor: '#0284c7',
          accentColor: '#0ea5e9',
          allowSelfRegistration: true,
          featureLiveClasses: true,
          featureAiQuizzes: true,
          featureCertificates: true,
        }}
        className="pt-2 text-xs"
      >
        {/* Section 1: Organization Details & Subdomain */}
        <div className="space-y-3 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Organization & Wildcard Subdomain Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="name"
              label={<span className="text-slate-300 text-xs font-medium">Organization Name</span>}
              rules={[{ required: true, message: 'Please enter organization name' }]}
            >
              <Input
                placeholder="e.g. St. Jude Memorial Academy"
                onChange={handleNameChange}
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label={<span className="text-slate-300 text-xs font-medium">Subdomain (Wildcard)</span>}
              rules={[
                { required: true, message: 'Please enter tenant subdomain' },
                {
                  pattern: /^[a-z0-9](?!.*--)[a-z0-9-]{1,28}[a-z0-9]$/,
                  message: '3-30 chars, lowercase alphanumeric, hyphens in middle only',
                },
              ]}
            >
              <Input
                placeholder="e.g. st-jude"
                onChange={handleSlugChange}
                className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
              />
            </Form.Item>
          </div>

          {/* Real-time Subdomain Status & URL Preview */}
          {currentSlug && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-slate-300 truncate">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-sky-300 font-semibold">{getTenantUrl(currentSlug)}</span>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {subdomainStatus.checking && (
                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                      Checking...
                    </span>
                  )}
                  {!subdomainStatus.checking && subdomainStatus.available === true && (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available
                    </span>
                  )}
                  {!subdomainStatus.checking && subdomainStatus.available === false && (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {subdomainStatus.reason === 'RESERVED' ? 'Reserved' : 'Unavailable'}
                    </span>
                  )}
                </div>
              </div>
              {subdomainStatus.available === false && (
                <p className="text-[10px] text-rose-400">{subdomainStatus.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="plan"
              label={<span className="text-slate-300 text-xs">Subscription Tier</span>}
              rules={[{ required: true }]}
            >
              <Select
                className="w-full text-xs"
                options={[
                  { value: 'starter', label: 'Starter Tier ($199/mo - max 500)' },
                  { value: 'growth', label: 'Growth Tier ($499/mo - max 2,500)' },
                  { value: 'enterprise', label: 'Enterprise Tier ($1,299/mo - Custom)' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="maxUsers"
              label={<span className="text-slate-300 text-xs">Learner User Limit</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={50} max={50000} className="w-full bg-slate-900 border-slate-700 text-white" />
            </Form.Item>
          </div>
        </div>

        {/* Section 2: Initial Admin Credentials */}
        <div className="space-y-3 mb-4 pt-3 border-t border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Initial Tenant Administrator (Root Admin)</span>
          </div>

          <Form.Item
            name="adminName"
            label={<span className="text-slate-300 text-xs">Administrator Full Name</span>}
            rules={[{ required: true, message: 'Enter initial admin name' }]}
          >
            <Input placeholder="e.g. Dr. Robert Chase" className="bg-slate-900 border-slate-700 text-white text-xs" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="adminPhone"
              label={<span className="text-slate-300 text-xs">Admin Mobile (E.164)</span>}
              rules={[{ required: true, message: 'Enter phone number' }]}
            >
              <Input placeholder="+919876543210" className="bg-slate-900 border-slate-700 text-white font-mono text-xs" />
            </Form.Item>

            <Form.Item
              name="adminPassword"
              label={<span className="text-slate-300 text-xs">Temporary Password</span>}
              rules={[{ required: true, min: 8, message: 'Min 8 characters' }]}
            >
              <Input.Password placeholder="AdminPass123!" className="bg-slate-900 border-slate-700 text-white text-xs" />
            </Form.Item>
          </div>
        </div>

        {/* Section 3: Feature Toggles */}
        <div className="space-y-2 mb-6 pt-3 border-t border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feature Modules Allocation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 text-[11px]">Live Lectures</span>
              <Form.Item name="featureLiveClasses" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 text-[11px]">AI Quizzes</span>
              <Form.Item name="featureAiQuizzes" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 text-[11px]">Certificates</span>
              <Form.Item name="featureCertificates" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || subdomainStatus.available === false || subdomainStatus.checking}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Onboarding Tenant...' : 'Deploy Tenant Organization'}
          </button>
        </div>
      </Form>
    </Modal>
  );
};
