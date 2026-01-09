import apiClient, { ApiResponse, PaginatedResponse } from '../client';

// Investment types
export interface Share {
  id: number;
  name: string;
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  price_per_share: string; // Backend returns as formatted string
  available_shares: number;
  total_shares: number;
  sold_shares: number;
  percentage_sold: number;
  minimum_investment: string; // Backend returns as formatted string
  category_id?: number;
  risk_level?: string;
  expected_roi_percentage?: string; // Backend returns as formatted string
  investment_duration_months?: number;
  is_featured: boolean;
  is_active: boolean;
  is_sold_out: boolean;
  logo_url?: string;
  launched_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  share_id: number;
  reference: string;
  quantity: number;
  price_per_share: string;
  amount_invested: string;
  current_value: string;
  total_returns: string;
  expected_roi_percentage: string;
  investment_duration_months: number;
  status: 'active' | 'matured' | 'completed' | 'cancelled';
  risk_level: string;
  invested_at: string;
  maturity_date?: string;
  completed_at?: string;
  metadata?: any;
  share?: Share;
  created_at: string;
  updated_at: string;
}

export interface InvestmentSummary {
  total_investments: number;
  active_investments: number;
  total_invested: number;
  current_value: number;
  total_returns: number;
  total_quantity: number;
  roi_percentage: number;
}

export interface BuyShareRequest {
  share_id: number;
  quantity: number;
}

// Investment service
class InvestmentService {
  /**
   * Get available shares
   */
  async getShares(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      category_id?: number;
      risk_level?: string;
      is_featured?: boolean;
      min_price?: number;
      max_price?: number;
      search?: string;
    }
  ): Promise<PaginatedResponse<Share>> {
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

    const response = await apiClient.get<PaginatedResponse<Share>>(
      `/v1/shares?${params}`
    );
    return response.data;
  }

  /**
   * Get single share details
   */
  async getShare(id: number): Promise<ApiResponse<Share>> {
    const response = await apiClient.get<ApiResponse<Share>>(`/v1/shares/${id}`);
    return response.data;
  }

  /**
   * Get user's investments
   */
  async getInvestments(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      status?: string;
      from_date?: string;
      to_date?: string;
    }
  ): Promise<PaginatedResponse<Investment>> {
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

    const response = await apiClient.get<PaginatedResponse<Investment>>(
      `/v1/investments?${params}`
    );
    return response.data;
  }

  /**
   * Get single investment details
   */
  async getInvestment(id: number): Promise<ApiResponse<Investment>> {
    const response = await apiClient.get<ApiResponse<Investment>>(
      `/v1/investments/${id}`
    );
    return response.data;
  }

  /**
   * Get investment summary/statistics
   */
  async getSummary(): Promise<ApiResponse<InvestmentSummary>> {
    const response = await apiClient.get<ApiResponse<InvestmentSummary>>(
      '/v1/investments/statistics'
    );
    return response.data;
  }

  /**
   * Buy shares (create investment)
   */
  async buyShares(data: BuyShareRequest): Promise<ApiResponse<Investment>> {
    const response = await apiClient.post<ApiResponse<Investment>>(
      '/v1/investments',
      data
    );
    return response.data;
  }

  /**
   * Calculate total investment amount
   */
  calculateTotalAmount(price: number, quantity: number): number {
    return price * quantity;
  }

  /**
   * Calculate ROI percentage
   */
  calculateROI(invested: number, currentValue: number): number {
    if (invested === 0) return 0;
    return ((currentValue - invested) / invested) * 100;
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'blue',
      matured: 'green',
      completed: 'gray',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  }

  /**
   * Get risk level badge color
   */
  getRiskColor(risk: string): string {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      'very-high': 'red',
    };
    return colors[risk] || 'gray';
  }

  /**
   * Check if investment is maturing soon (within 7 days)
   */
  isMaturingSoon(maturityDate: string): boolean {
    const maturity = new Date(maturityDate);
    const now = new Date();
    const diffDays = Math.ceil((maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }

  /**
   * Check if investment has matured
   */
  hasMatured(maturityDate: string): boolean {
    const maturity = new Date(maturityDate);
    const now = new Date();
    return now >= maturity;
  }

  // ===========================
  // Admin Methods
  // ===========================

  /**
   * Create new share (admin only)
   */
  async createShare(data: {
    name: string;
    company_name: string;
    description?: string;
    price_per_share: number;
    total_shares: number;
    ticker_symbol?: string;
    category_id?: number;
    risk_level?: 'low' | 'medium' | 'high';
    expected_roi_percentage?: number;
    investment_duration_months?: number;
    minimum_investment?: number;
    logo_url?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<ApiResponse<Share>> {
    const response = await apiClient.post<ApiResponse<Share>>(
      '/v1/admin/shares',
      data
    );
    return response.data;
  }

  /**
   * Update share (admin only)
   */
  async updateShare(id: number, data: Partial<{
    name: string;
    company_name: string;
    description?: string;
    price_per_share: number;
    total_shares: number;
    ticker_symbol?: string;
    category_id?: number;
    risk_level?: 'low' | 'medium' | 'high';
    expected_roi_percentage?: number;
    investment_duration_months?: number;
    minimum_investment?: number;
    logo_url?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }>): Promise<ApiResponse<Share>> {
    const response = await apiClient.put<ApiResponse<Share>>(
      `/v1/admin/shares/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete share (admin only)
   */
  async deleteShare(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/v1/admin/shares/${id}`
    );
    return response.data;
  }

  /**
   * Toggle share active status (admin only)
   */
  async toggleShareStatus(id: number): Promise<ApiResponse<Share>> {
    const response = await apiClient.post<ApiResponse<Share>>(
      `/v1/admin/shares/${id}/toggle-status`
    );
    return response.data;
  }

  /**
   * Toggle share featured status (admin only)
   */
  async toggleShareFeatured(id: number): Promise<ApiResponse<Share>> {
    const response = await apiClient.post<ApiResponse<Share>>(
      `/v1/admin/shares/${id}/toggle-featured`
    );
    return response.data;
  }

  /**
   * Update share price (admin only)
   */
  async updateSharePrice(id: number, price: number): Promise<ApiResponse<Share>> {
    const response = await apiClient.post<ApiResponse<Share>>(
      `/v1/admin/shares/${id}/update-price`,
      { price }
    );
    return response.data;
  }

  /**
   * Update share inventory (admin only)
   */
  async updateShareInventory(id: number, quantity: number): Promise<ApiResponse<Share>> {
    const response = await apiClient.post<ApiResponse<Share>>(
      `/v1/admin/shares/${id}/update-inventory`,
      { quantity }
    );
    return response.data;
  }

  /**
   * Create a manual investment (admin only)
   */
  async createManualInvestment(data: {
    user_id: number;
    share_id: number;
    quantity: number;
    purchase_date?: string;
    price_per_share?: number;
  }): Promise<ApiResponse<Investment>> {
    const response = await apiClient.post<ApiResponse<Investment>>(
      '/v1/admin/investments/manual',
      data
    );
    return response.data;
  }
}

// Export singleton instance
const investmentService = new InvestmentService();
export default investmentService;
