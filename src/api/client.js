import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2; for iOS/real device, configure server IP
const DEFAULT_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';

const client = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error fetching token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error extraction
client.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = 'An unexpected error occurred. Please try again.';
    if (error.response && error.response.data && error.response.data.message) {
      customError = error.response.data.message;
    } else if (error.message === 'Network Error' || !error.response) {
      customError = 'No internet connection. Please check your network.';
    }
    return Promise.reject(new Error(customError));
  }
);

export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  getMe: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/profile', data),
  changePassword: (data) => client.post('/auth/change-password', data),

  // Transactions
  getTransactions: (params) => client.get('/transactions', { params }),
  getTransactionById: (id) => client.get(`/transactions/${id}`),
  createTransaction: (data) => client.post('/transactions', data),
  updateTransaction: (id, data) => client.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => client.delete(`/transactions/${id}`),

  // Dashboard
  getMonthlyDashboard: (month, year) =>
    client.get('/dashboard/monthly', { params: { month, year } }),
  getYearlySummary: (year) =>
    client.get('/dashboard/yearly', { params: { year } }),
  getCalendarSummary: (month, year) =>
    client.get('/dashboard/calendar', { params: { month, year } }),

  // Budgets
  getBudgets: (month, year) => client.get('/budgets', { params: { month, year } }),
  setBudget: (data) => client.post('/budgets', data),
  deleteBudget: (id) => client.delete(`/budgets/${id}`),
};

export default client;
