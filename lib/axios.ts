import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Optional: add a timeout for requests
});

import CryptoJS from 'crypto-js';

const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET || 'bluebuff-secure-key-2024';

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    // We only have access to localStorage on the client-side
    if (typeof window !== 'undefined') {
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Generate HMAC Payload Signature
      const timestamp = Date.now().toString();
      
      let payloadStr = '';
      if (config.data) {
        payloadStr = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      }
      
      const dataToSign = `${payloadStr}:${timestamp}`;
      const secret = token ? `${APP_SECRET}_${token.substring(0, 20)}` : APP_SECRET;
      
      const signature = CryptoJS.HmacSHA256(dataToSign, secret).toString(CryptoJS.enc.Hex);
      
      config.headers['X-App-Timestamp'] = timestamp;
      config.headers['X-App-Signature'] = signature;
      
      // Detect PWA / Standalone vs Web Browser
      const isPwa =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as { standalone?: boolean }).standalone === true;
      config.headers['X-Client-Platform'] = isPwa ? 'pwa' : 'web';

      const adminPin = sessionStorage.getItem('adminPin');
      if (adminPin) {
        config.headers['x-admin-pin'] = adminPin;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => {
    // You can modify the response data here before it reaches the component
    // e.g., returning response.data directly so you don't have to destructure it everywhere
    return response;
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      const status = error.response.status;
      
      const isJwtExpired = error.response.data && error.response.data.message === "jwt expired";

      // Handle Unauthorized (401) globally
      if (status === 401 || isJwtExpired) {
        console.warn('Unauthorized access or expired token. Clearing session.');
        if (typeof window !== 'undefined') {
          // Clean up auth state on client side if token expires
          useAuthStore.getState().logout();
          localStorage.removeItem('token');
          // Optional: redirect to login
          window.location.href = '/login';
        }
      }

      // Handle forbidden (403)
      if (status === 403) {
        console.warn('Access Forbidden.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }

    // Always reject the promise so the component can handle specific errors if needed
    return Promise.reject(error);
  }
);

export default api;
