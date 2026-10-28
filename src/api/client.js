import axios from 'axios';

// Get base API URL from local storage or environment or fallback to relative/default
export const getBaseApiUrl = () => {
  return   'https://medpathapi.smartschoolnepal.com/api/v1';
};
const baseApiUrl = "https://medpathapi.smartschoolnepal.com/api/v1";
export const apiClient = axios.create({
  baseURL: baseApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Always update baseURL dynamically in case user changes it in settings
apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseApiUrl();
  const token = localStorage.getItem('superAdminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SuperAdmin API Services
export const superadminApi = {
  // 1. Authentication & Profile
  login: async (email, password) => {
    const res = await apiClient.post('/superadmin/login', { email, password });
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/superadmin/me');
    return res.data;
  },

  registerSuperAdmin: async (data) => {
    const res = await apiClient.post('/superadmin/register', data);
    return res.data;
  },

  // 2. Tenant Management
  listTenants: async (params = {}) => {
    const res = await apiClient.get('/superadmin/tenants', { params });
    return res.data;
  },

  getTenantById: async (tenantId) => {
    const res = await apiClient.get(`/superadmin/tenants/${tenantId}`);
    return res.data;
  },

  createTenant: async (tenantData) => {
    const res = await apiClient.post('/superadmin/tenants', tenantData);
    return res.data;
  },

  updateTenant: async (tenantId, updateData) => {
    const res = await apiClient.patch(`/superadmin/tenants/${tenantId}`, updateData);
    return res.data;
  },

  deleteTenant: async (tenantId) => {
    const res = await apiClient.delete(`/superadmin/tenants/${tenantId}`);
    return res.data;
  },

  // 3. Cross-Tenant User Management (SuperAdmin bypasses tenant filter)
  listUsers: async (params = {}) => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },

  getUserById: async (userId) => {
    const res = await apiClient.get(`/users/${userId}`);
    return res.data;
  },

  updateUserStatus: async (userId, status) => {
    const res = await apiClient.patch(`/users/${userId}/status`, { status });
    return res.data;
  },

  updateUserRole: async (userId, role) => {
    const res = await apiClient.patch(`/users/${userId}/role`, { role });
    return res.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const res = await apiClient.patch(`/users/${userId}/reset-password`, { newPassword });
    return res.data;
  },

  deleteUser: async (userId) => {
    const res = await apiClient.delete(`/users/${userId}`);
    return res.data;
  },

  // 4. Infrastructure Health Check
  getHealth: async () => {
    // Health endpoint is mounted at root /health on the Express server
    const currentBase = getBaseApiUrl();
    const healthUrl = currentBase.replace(/\/api(\/v1)?\/?$/, '/health');
    const res = await axios.get(healthUrl, { timeout: 5000 });
    return res.data;
  },
};
