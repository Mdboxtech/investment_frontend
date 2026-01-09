import apiClient, { ApiResponse } from '../client';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  wallet?: {
    id: number;
    balance: string;
    total_deposits: string;
    total_withdrawals: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

class ProfileService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await apiClient.get<ApiResponse<{ user: UserProfile }>>(
      '/v1/profile'
    );
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await apiClient.put<ApiResponse<{ user: UserProfile }>>(
      '/v1/profile',
      data
    );
    return response.data;
  }

  /**
   * Update password
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(
      '/v1/profile/password',
      data
    );
    return response.data;
  }
}

export default new ProfileService();
