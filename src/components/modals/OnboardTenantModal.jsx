import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, notification } from 'antd';
import { Building2, User, Phone, Lock, Sparkles, Shield, Palette } from 'lucide-react';
import { superadminApi } from '../../api/client';

export const OnboardTenantModal = ({ isOpen, onClose, onTenantCreated }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value || '';
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    form.setFieldsValue({ slug: generatedSlug });
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
        message: 'Organization Successfully Onboarded',
        description: `${payload.name} created with initial Tenant Admin (${payload.adminUser.phone}).`,
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
      width={600}
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
        {/* Section 1: Organization Details */}
        <div className="space-y-3 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Organization & Tenant Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="name"
              label={<span className="text-slate-300 text-xs">Organization Name</span>}
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
              label={<span className="text-slate-300 text-xs">Unique Tenant Slug</span>}
              rules={[{ required: true, message: 'Please enter tenant slug' }]}
            >
              <Input
                placeholder="e.g. st-jude-academy"
                className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
              />
            </Form.Item>
          </div>

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
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            {submitting ? 'Onboarding Tenant...' : 'Deploy Tenant Organization'}
          </button>
        </div>
      </Form>
    </Modal>
  );
};
