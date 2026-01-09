import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import { formatCurrency as utilsFormatCurrency } from '@/lib/utils';

// Profit types
export interface MonthlyProfit {
  id: number;
  type: 'profit' | 'loss';
  title: string;
  description: string | null;
  total_amount: string;
  distributed_amount: string;
  remaining_amount: string;
  distribution_type: 'fixed' | 'proportional';
  status: 'pending' | 'distributing' | 'completed' | 'cancelled';
  distribution_progress: number;
  is_fully_distributed: boolean;
  beneficiaries_count: number;
  distribution_date: string | null;
  completed_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface UserProfit {
  id: number;
  user_id: number;
  monthly_profit_id: number;
  share_count: number;
  profit_amount: number;
  tax_amount: number;
  net_profit: number;
  amount?: number; // Fallback field from backend
  status: 'pending' | 'distributed' | 'completed';
  distributed_at?: string;
  monthly_profit?: MonthlyProfit;
  created_at: string;
  updated_at: string;
}

export interface ProfitSummary {
  total_earnings: number;
  total_tax: number;
  net_earnings: number;
  pending_profits: number;
  distributed_profits: number;
  total_months: number;
  average_monthly_profit: number;
}

// Profit service
class ProfitService {
  /**
   * Get user's profit history
   */
  async getUserProfits(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: string;
      year?: number;
      from_date?: string;
      to_date?: string;
    }
  ): Promise<PaginatedResponse<UserProfit>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<UserProfit>>(
      `/v1/profits?${params}`
    );
    return response.data;
  }

  // Note: Single profit detail endpoint not implemented in backend
  // Use getUserProfits with filters if needed
  /**
   * Get single user profit details
   */
  // async getUserProfit(id: number): Promise<ApiResponse<UserProfit>> {
  //   const response = await apiClient.get<ApiResponse<UserProfit>>(
  //     `/v1/profits/${id}`
  //   );
  //   return response.data;
  // }

  /**
   * Get user profit summary/statistics
   */
  async getSummary(): Promise<ApiResponse<ProfitSummary>> {
    const response = await apiClient.get<ApiResponse<ProfitSummary>>(
      '/v1/profits/statistics'
    );
    return response.data;
  }

  /**
   * Get monthly profits (admin view - all profit pools)
   */
  async getMonthlyProfits(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: string;
      distribution_type?: string;
      search?: string;
    }
  ): Promise<PaginatedResponse<MonthlyProfit>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<MonthlyProfit>>(
      `/v1/admin/profits?${params}`
    );
    return response.data;
  }

  /**
   * Get single profit pool details (admin)
   */
  async getMonthlyProfit(id: number): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.get<ApiResponse<MonthlyProfit>>(
      `/v1/admin/profits/${id}`
    );
    return response.data;
  }

  /**
   * Alias for getMonthlyProfit - Get single profit pool details (admin)
   */
  async getProfitById(id: number): Promise<ApiResponse<MonthlyProfit>> {
    return this.getMonthlyProfit(id);
  }

  /**
   * Get profit distributions for a specific profit pool (admin)
   */
  async getProfitDistributions(profitId: number): Promise<ApiResponse<UserProfit[]>> {
    const response = await apiClient.get<ApiResponse<UserProfit[]>>(
      `/v1/admin/profits/${profitId}/distributions`
    );
    return response.data;
  }

  /**
   * Create new profit pool (admin)
   */
  async createProfit(data: {
    type?: 'profit' | 'loss';
    title: string;
    description?: string;
    total_amount: string;
    distribution_type: 'fixed' | 'proportional';
    distribution_date?: string;
  }): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.post<ApiResponse<MonthlyProfit>>(
      '/v1/admin/profits',
      data
    );
    return response.data;
  }

  /**
   * Update profit pool (admin)
   */
  async updateProfit(id: number, data: {
    title?: string;
    description?: string;
    total_amount?: string;
    distribution_type?: 'fixed' | 'proportional';
    distribution_date?: string;
  }): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.put<ApiResponse<MonthlyProfit>>(
      `/v1/admin/profits/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Distribute profit proportionally to all eligible investors (admin)
   * This auto-calculates based on share ownership
   */
  async distributeProfit(id: number): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.post<ApiResponse<MonthlyProfit>>(
      `/v1/admin/profits/${id}/distribute-proportionally`
    );
    return response.data;
  }

  /**
   * Distribute profit with fixed amounts to specific users (admin)
   * Requires specifying each user's distribution amount
   */
  async distributeFixedProfit(
    id: number,
    distributions: Array<{ user_id: number; amount: number; description?: string }>
  ): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.post<ApiResponse<MonthlyProfit>>(
      `/v1/admin/profits/${id}/distribute-fixed`,
      { distributions }
    );
    return response.data;
  }

  /**
   * Cancel a pending profit pool (admin)
   */
  async cancelProfit(id: number): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.post<ApiResponse<MonthlyProfit>>(
      `/v1/admin/profits/${id}/cancel`
    );
    return response.data;
  }

  /**
   * Activate a cancelled profit pool (admin)
   */
  async activateProfit(id: number): Promise<ApiResponse<MonthlyProfit>> {
    const response = await apiClient.post<ApiResponse<MonthlyProfit>>(
      `/v1/admin/profits/${id}/activate`
    );
    return response.data;
  }

  /**
   * Calculate tax amount based on profit
   */
  calculateTax(profitAmount: number, taxRate: number = 0.1): number {
    return profitAmount * taxRate;
  }

  /**
   * Calculate net profit after tax
   */
  calculateNetProfit(profitAmount: number, taxAmount: number): number {
    return profitAmount - taxAmount;
  }

  /**
   * Format currency - uses cached settings from @/lib/utils
   */
  formatCurrency(amount: number): string {
    return utilsFormatCurrency(amount);
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'yellow',
      distributed: 'blue',
      completed: 'green',
    };
    return colors[status] || 'gray';
  }

  /**
   * Format month-year display
   */
  formatMonthYear(month: string, year: number): string {
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Check if profit is recent (within 30 days)
   */
  isRecent(distributedAt: string): boolean {
    if (!distributedAt) return false;
    const distributed = new Date(distributedAt);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - distributed.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }

  /**
   * Calculate average monthly profit
   */
  calculateAverageMonthlyProfit(totalEarnings: number, totalMonths: number): number {
    if (totalMonths === 0) return 0;
    return totalEarnings / totalMonths;
  }

  /**
   * Get growth percentage
   */
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Format growth percentage
   */
  formatGrowth(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }
}

// Export singleton instance
const profitService = new ProfitService();
export default profitService;
