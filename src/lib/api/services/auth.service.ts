import apiClient, { ApiResponse } from '../client';

// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified_at?: string | null;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}




export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Auth service
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/v1/auth/login',
      credentials
    );

    // Store token and user in localStorage
    if (response.data.success && response.data.data) {
      this.setAuthData(response.data.data.token, response.data.data.user);
    }

    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/v1/auth/register',
      data
    );

    // Store token and user in localStorage
    if (response.data.success && response.data.data) {
      this.setAuthData(response.data.data.token, response.data.data.user);
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/v1/auth/me');
    return response.data;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      '/v1/auth/refresh'
    );

    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
    }

    return response.data;
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/v1/auth/email/send-verification');
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Set authentication data
   */
  private setAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  /**
   * Set token only
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  /**
   * Check if user is regular user
   */
  isUser(): boolean {
    const user = this.getUser();
    return user?.role === 'user';
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
