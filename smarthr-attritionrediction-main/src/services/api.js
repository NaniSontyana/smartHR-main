import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication expiration
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Authentication Services ---
export const login = async (credentials) => {
  const response = await api.post('/auth/signin', credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const sendOtp = async (email, type = "login") => {
  const response = await api.post('/auth/send-otp', { email, type });
  return response.data;
};

export const verifyOtp = async (email, otp, type = "login", signupData = null) => {
  const response = await api.post('/auth/verify-otp', { email, otp, type, signupData });
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/me', userData);
  return response.data;
};

// --- Employee Management Services ---
export const getEmployees = async (params = {}) => {
  const { page = 1, limit = 50, department, jobRole, attritionRisk, search } = params;
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('limit', limit);
  if (department && department !== 'All') query.append('department', department);
  if (jobRole && jobRole !== 'All') query.append('jobRole', jobRole);
  if (attritionRisk && attritionRisk !== 'All') query.append('attritionRisk', attritionRisk);
  if (search) query.append('search', search);

  const response = await api.get(`/employees?${query.toString()}`);
  return response.data;
};

export const addEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const bulkAddEmployees = async (employees) => {
  const response = await api.post('/employees/bulk', { employees });
  return response.data;
};

// --- Prediction Services ---
export const predictAttrition = async (employeeData) => {
  const response = await api.post('/predict', employeeData);
  return response.data;
};

export const runBatchPredictions = async () => {
  const response = await api.post('/predict/batch');
  return response.data;
};

// --- Analytics & Dashboard Services ---
export const getDashboardStats = async (period = 'monthly') => {
  try {
    const response = await api.get(`/dashboard?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Dashboard Stats Fetch Error:", error);
    return {
      dashboardStats: { totalEmployees: 0, attritionRate: 0, employeeSatisfaction: 0 },
      attritionTrendData: [],
      departmentPieData: [],
      highRiskEmployees: [],
      highRiskFactors: []
    };
  }
};

export const getHighRiskEmployees = async () => {
  try {
    const response = await api.get('/dashboard/high-risk');
    return response.data || [];
  } catch (error) {
    console.error("High Risk Employees Fetch Error:", error);
    return [];
  }
};

export const getReportsData = async () => {
  try {
    const response = await api.get('/reports');
    return response.data;
  } catch (error) {
    console.error("Reports Fetch Error:", error);
    return {
      reportSummary: { totalEmployees: 0, totalHighRisk: 0, overallRiskRate: 0, avgTenure: 0 },
      attritionByDept: [],
      attritionByOvertime: [],
      salaryDistribution: []
    };
  }
};

// --- Email Notifications ---
export const sendReviewEmail = async (emailData) => {
  const response = await api.post("/email/send", emailData);
  return response.data;
};

// --- Notification Feed ---
export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
};

export const createNotification = async (notificationData) => {
  const response = await api.post("/notifications", notificationData);
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// --- Action Logs & Auditing ---
export const getActionLogs = async (employeeId = null) => {
  try {
    const url = employeeId ? `/actions?employeeId=${employeeId}` : "/actions";
    const response = await api.get(url);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch action logs:", error);
    return [];
  }
};

export const createActionLog = async (logData) => {
  const response = await api.post("/actions", logData);
  return response.data;
};

// --- Prescriptive Recommendations & What-If Simulation ---
export const simulateIntervention = async (employee, interventions) => {
  const response = await api.post('/predict/simulate', { employee, interventions });
  return response.data;
};

export const getRetentionPlaybook = async (employeeId) => {
  const response = await api.get(`/recommendations/playbook/${employeeId}`);
  return response.data;
};

export const getRecommendations = async () => {
  try {
    const response = await api.get("/recommendations");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
};

export default api;
