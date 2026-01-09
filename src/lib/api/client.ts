import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getWebViewInfo } from '@/lib/webview';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
  // Disable credentials/cookies for WebView compatibility
  withCredentials: false,
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (token-based auth, no cookies)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add WebView indicator header for backend analytics
    const webViewInfo = getWebViewInfo();
    if (webViewInfo.isWebView && config.headers) {
      config.headers['X-Client-Source'] = webViewInfo.source;
      config.headers['X-WebView'] = 'true';
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const webViewInfo = getWebViewInfo();

    // Handle network errors (important for WebView)
    if (!error.response) {
      const networkError = {
        ...error,
        isNetworkError: true,
        userMessage: 'Network connection error. Please check your internet connection and try again.',
      };

      // Dispatch custom event for WebView to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-network-error', {
          detail: { error: networkError }
        }));
      }

      return Promise.reject(networkError);
    }

    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Dispatch auth expired event (for WebView and app handling)
        window.dispatchEvent(new CustomEvent('auth-token-expired'));

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          // Use hard redirect to ensure proper navigation
          window.location.href = '/login?session=expired';
        }
      }
    }

    // Handle 403 - Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Access denied: Insufficient permissions');
    }

    // Handle 422 - Validation errors
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data);
    }

    // Handle 500 - Server errors
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);

      // Dispatch custom event for global error handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-server-error', {
          detail: { status: 500, data: error.response.data }
        }));
      }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

// Export configured client
export default apiClient;
