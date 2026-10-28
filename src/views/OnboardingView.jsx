import React, { useState } from 'react';
import {
  Building2,
  User,
  Shield,
  Palette,
  CheckCircle2,
  Globe,
  Radio,
  Layers,
  Key,
} from 'lucide-react';
import { Form, Input, Select, InputNumber, Switch, notification } from 'antd';
import { superadminApi } from '../api/client';

export const OnboardingView = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [deployedTenant, setDeployedTenant] = useState(null);

  // Live preview states
  const [previewName, setPreviewName] = useState('');
  const [previewSlug, setPreviewSlug] = useState('');
  const [previewPlan, setPreviewPlan] = useState('growth');
  const [previewMaxUsers, setPreviewMaxUsers] = useState(2500);
  const [previewPrimaryColor, setPreviewPrimaryColor] = useState('#0284c7');
  const [previewAccentColor, setPreviewAccentColor] = useState('#0ea5e9');
  const [previewAdminName, setPreviewAdminName] = useState('');
  const [previewAdminPhone, setPreviewAdminPhone] = useState('');
  const [featureLive, setFeatureLive] = useState(true);
  const [featureAi, setFeatureAi] = useState(true);
  const [featureCert, setFeatureCert] = useState(true);

  const handleNameChange = (e) => {
    const val = e.target.value || '';
    setPreviewName(val || 'Organization Name');
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    form.setFieldsValue({ slug: generatedSlug });
    setPreviewSlug(generatedSlug || 'tenant-slug');
  };

  const handleSlugChange = (e) => {
    const val = e.target.value || '';
    setPreviewSlug(val || 'tenant-slug');
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ adminPassword: pwd });
    notification.success({
      message: 'Secure Password Generated',
      description: 'A 12-character strong password has been assigned.',
      placement: 'topRight',
    });
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
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
        message: 'Tenant Organization Deployed',
        description: `Successfully provisioned ${payload.name} with dedicated isolation schema!`,
        placement: 'topRight',
      });

      setDeployedTenant({
        ...createdRecord,
        rawPayload: payload,
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
        err.message ||
        'Failed to onboard tenant organization';

      notification.error({
        message: 'Onboarding Deployment Failed',
        description: errMsg,
        placement: 'topRight',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If deployment succeeded, display full celebratory success page
  if (deployedTenant) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl glass-panel border border-emerald-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Tenant Active & Provisioned
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              {deployedTenant.name || deployedTenant.rawPayload?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
              Isolated database partition created. The initial administrator account has been seeded and is ready to sign in.
            </p>
          </div>

          {/* Credentials Card */}
          <div className="max-w-xl mx-auto p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-3 font-mono text-xs">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-sky-400 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Access & Routing Summary</span>
              <span className="text-emerald-400 font-mono">Status: Active</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Tenant Slug:</span>
              <span className="text-white font-semibold">{deployedTenant.slug || deployedTenant.rawPayload?.slug}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Subdomain Route:</span>
              <span className="text-sky-400">
                https://{deployedTenant.slug || deployedTenant.rawPayload?.slug}.medpath.org
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Initial Admin Name:</span>
              <span className="text-white">{deployedTenant.rawPayload?.adminUser?.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Admin Phone (Login):</span>
              <span className="text-emerald-400 font-bold">{deployedTenant.rawPayload?.adminUser?.phone}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Temporary Password:</span>
              <span className="text-amber-400 font-bold">{deployedTenant.rawPayload?.adminUser?.password}</span>
            </div>
          </div>

          {/* Action Navigation */}
          {/* Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDeployedTenant(null);
                form.resetFields();
                setPreviewName('');
                setPreviewSlug('');
                setPreviewAdminName('');
                setPreviewAdminPhone('');
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Onboard Another Organization</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Page Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="text-slate-400">SuperAdmin</span>
            <span>/</span>
            <span className="text-sky-400 font-medium">Onboard New Tenant Organization</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Onboard New Tenant Organization
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Dedicated infrastructure provisioning with automated schema isolation and initial administrator credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Clear/Reset Action */}
        <button
          onClick={() => {
            form.resetFields();
            setPreviewName('');
            setPreviewSlug('');
            setPreviewAdminName('');
            setPreviewAdminPhone('');
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          title="Reset input fields"
        >
          <span>Reset Form</span>
        </button>
      </div>

      {/* Main Grid: Form + Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Comprehensive Onboarding Form */}
        <div className="lg:col-span-7 space-y-6">
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
            className="space-y-6"
          >
            {/* Step 1: Organization & Subdomain */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Shield className="w-4 h-4" />
                <span>1. Organization Identity & Subdomain</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label={<span className="text-slate-300 text-xs font-semibold">Official Organization Name</span>}
                  rules={[{ required: true, message: 'Please enter organization name' }]}
                >
                  <Input
                    placeholder="e.g. St. Jude Medical Academy"
                    onChange={handleNameChange}
                    className="bg-slate-900 border-slate-700 text-white text-xs h-10"
                  />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label={
                    <span className="text-slate-300 text-xs font-semibold flex items-center justify-between">
                      <span>Subdomain Slug</span>
                      <span className="text-[10px] text-slate-500 font-mono">auto-formatted</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter unique tenant slug' }]}
                >
                  <Input
                    placeholder="e.g. st-jude-academy"
                    onChange={handleSlugChange}
                    className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-10"
                  />
                </Form.Item>
              </div>

              {/* Subdomain Preview Banner */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Public Route:</span>
                </div>
                <span className="text-sky-300 font-semibold truncate">
                  https://{previewSlug}.medpath.org
                </span>
              </div>
            </div>

            {/* Step 2: Plan & User Capacity */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Layers className="w-4 h-4" />
                <span>2. Subscription Tier & Quotas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="plan"
                  label={<span className="text-slate-300 text-xs font-semibold">Subscription Tier</span>}
                  rules={[{ required: true }]}
                >
                  <Select
                    className="w-full text-xs h-10"
                    onChange={(val) => setPreviewPlan(val)}
                    options={[
                      { value: 'starter', label: 'Starter Tier ($199/mo - max 500 users)' },
                      { value: 'growth', label: 'Growth Tier ($499/mo - max 2,500 users)' },
                      { value: 'enterprise', label: 'Enterprise Tier ($1,299/mo - Custom users)' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="maxUsers"
                  label={
                    <span className="text-slate-300 text-xs font-semibold flex items-center justify-between">
                      <span>Max Learner Limit</span>
                      <span className="text-[10px] text-sky-400 font-bold">{previewMaxUsers} Users</span>
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={50}
                    max={50000}
                    onChange={(val) => setPreviewMaxUsers(val || 1000)}
                    className="w-full bg-slate-900 border-slate-700 text-white h-10 text-xs"
                  />
                </Form.Item>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Open Self-Registration</div>
                  <div className="text-[11px] text-slate-400">Allow students and faculty to self-register with invitation domain.</div>
                </div>
                <Form.Item name="allowSelfRegistration" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </div>

            {/* Step 3: Initial Tenant Admin Credentials */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>3. Initial Tenant Administrator (Root Admin)</span>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>Generate Password</span>
                </button>
              </div>

              <Form.Item
                name="adminName"
                label={<span className="text-slate-300 text-xs font-semibold">Administrator Full Name</span>}
                rules={[{ required: true, message: 'Please enter initial admin name' }]}
              >
                <Input
                  placeholder="e.g. Dr. Robert Chase"
                  onChange={(e) => setPreviewAdminName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-xs h-10"
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="adminPhone"
                  label={<span className="text-slate-300 text-xs font-semibold">Admin Phone Number (E.164)</span>}
                  rules={[{ required: true, message: 'Please enter admin phone number' }]}
                >
                  <Input
                    placeholder="+919876543210"
                    onChange={(e) => setPreviewAdminPhone(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-10"
                  />
                </Form.Item>

                <Form.Item
                  name="adminPassword"
                  label={<span className="text-slate-300 text-xs font-semibold">Temporary Admin Password</span>}
                  rules={[{ required: true, min: 8, message: 'Min 8 characters' }]}
                >
                  <Input.Password
                    placeholder="AdminPass123!"
                    className="bg-slate-900 border-slate-700 text-white text-xs h-10"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Step 4: Modules & Branding Customization */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Palette className="w-4 h-4" />
                <span>4. Feature Modules & Branding Customization</span>
              </div>

              {/* Module Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 text-xs font-medium block">Live Lectures</span>
                    <span className="text-slate-400 text-[10px]">Virtual classrooms</span>
                  </div>
                  <Form.Item name="featureLiveClasses" valuePropName="checked" noStyle>
                    <Switch onChange={(c) => setFeatureLive(c)} />
                  </Form.Item>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 text-xs font-medium block">AI Quizzes</span>
                    <span className="text-slate-400 text-[10px]">Automated tests</span>
                  </div>
                  <Form.Item name="featureAiQuizzes" valuePropName="checked" noStyle>
                    <Switch onChange={(c) => setFeatureAi(c)} />
                  </Form.Item>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 text-xs font-medium block">Certificates</span>
                    <span className="text-slate-400 text-[10px]">CME verification</span>
                  </div>
                  <Form.Item name="featureCertificates" valuePropName="checked" noStyle>
                    <Switch onChange={(c) => setFeatureCert(c)} />
                  </Form.Item>
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewPrimaryColor}
                      onChange={(e) => {
                        setPreviewPrimaryColor(e.target.value);
                        form.setFieldsValue({ primaryColor: e.target.value });
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <Form.Item name="primaryColor" noStyle>
                      <Input
                        value={previewPrimaryColor}
                        onChange={(e) => setPreviewPrimaryColor(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-10"
                      />
                    </Form.Item>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                    Accent Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewAccentColor}
                      onChange={(e) => {
                        setPreviewAccentColor(e.target.value);
                        form.setFieldsValue({ accentColor: e.target.value });
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <Form.Item name="accentColor" noStyle>
                      <Input
                        value={previewAccentColor}
                        onChange={(e) => setPreviewAccentColor(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-10"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  form.resetFields();
                  setPreviewName('');
                  setPreviewSlug('');
                  setPreviewAdminName('');
                  setPreviewAdminPhone('');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Provisioning Tenant...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Deploy Tenant Organization</span>
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>

        {/* Right Column: Live Interactive Tenant Preview Card */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Real-Time Tenant Preview</span>
            </span>
            <span className="text-[11px] text-sky-400 font-mono">Live Sync</span>
          </div>

          {/* Interactive Card */}
          <div className="rounded-2xl glass-panel p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
            {/* Top Color Accent Line */}
            <div
              className="absolute top-0 inset-x-0 h-1.5"
              style={{ backgroundColor: previewPrimaryColor }}
            />

            {/* Tenant Header */}
            <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-800">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg shrink-0 transition-colors"
                style={{
                  backgroundColor: previewPrimaryColor,
                  boxShadow: `0 10px 25px -5px ${previewPrimaryColor}40`,
                }}
              >
                {previewName ? previewName.substring(0, 2).toUpperCase() : 'MP'}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-base font-bold text-white truncate">
                  {previewName || 'Organization Name'}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono mt-0.5 truncate">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>https://{previewSlug}.medpath.org</span>
                </div>
              </div>
            </div>

            {/* Preview Specs */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Subscription Tier</span>
                <span className="font-bold uppercase text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {previewPlan}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Learner User Limit</span>
                <span className="text-slate-200 font-semibold font-mono">
                  Up to {previewMaxUsers.toLocaleString()} users
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Root Administrator</span>
                <span className="text-white font-medium">{previewAdminName || 'Not configured yet'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Admin Login Phone</span>
                <span className="text-emerald-400 font-mono">{previewAdminPhone || '—'}</span>
              </div>

              <div className="py-2">
                <span className="text-slate-400 block mb-2">Active Modules:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      featureLive
                        ? 'bg-sky-950/60 text-sky-400 border-sky-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    Live Classroom {featureLive ? '✓' : '✗'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      featureAi
                        ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    AI Quizzes {featureAi ? '✓' : '✗'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      featureCert
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    Certificates {featureCert ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {/* Data Isolation Badge */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compound MongoDB partition auto-provisioned upon deployment.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
