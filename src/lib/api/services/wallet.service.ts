import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import { formatCurrency as utilsFormatCurrency } from '@/lib/utils';

// Wallet types
export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  pending_balance: number;
  available_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  user_id: number;
  wallet_id: number;
  type: 'deposit' | 'withdrawal' | 'investment' | 'profit' | 'refund';
  amount: number;
  balance_before: number;
  balance_after: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

// Wallet service
class WalletService {
  /**
   * Get user's wallet details
   */
  async getWallet(): Promise<ApiResponse<Wallet>> {
    const response = await apiClient.get<ApiResponse<Wallet>>('/v1/wallet');
    return response.data;
  }

  /**
   * Get wallet transactions with pagination
   */
  async getTransactions(
    page: number = 1,
    perPage: number = 20,
    filters?: {
      type?: string;
      status?: string;
      from_date?: string;
      to_date?: string;
    }
  ): Promise<PaginatedResponse<WalletTransaction>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...filters,
    });

    const response = await apiClient.get<PaginatedResponse<WalletTransaction>>(
      `/v1/wallet/transactions?${params}`
    );
    return response.data;
  }

  /**
   * Get single transaction details
   */
  async getTransaction(id: number): Promise<ApiResponse<WalletTransaction>> {
    const response = await apiClient.get<ApiResponse<WalletTransaction>>(
      `/v1/wallet/transactions/${id}`
    );
    return response.data;
  }

  /**
   * Deposit funds to wallet
   */
  async deposit(data: DepositRequest): Promise<ApiResponse<WalletTransaction>> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>(
      '/v1/wallet/deposit',
      data
    );
    return response.data;
  }

  /**
   * Withdraw funds from wallet
   */
  async withdraw(data: WithdrawRequest): Promise<ApiResponse<WalletTransaction>> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>(
      '/v1/wallet/withdraw',
      data
    );
    return response.data;
  }

  /**
   * Get wallet statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total_deposits: number;
    total_withdrawals: number;
    total_investments: number;
    total_profits: number;
    pending_withdrawals: number;
  }>> {
    const response = await apiClient.get('/v1/wallet/statistics');
    return response.data;
  }

  /**
   * Format amount as currency - uses cached settings from @/lib/utils
   */
  formatCurrency(amount: number): string {
    return utilsFormatCurrency(amount);
  }

  /**
   * Get transaction status badge color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'yellow',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
    };
    return colors[status] || 'gray';
  }

  /**
   * Get transaction type icon/color
   */
  getTypeInfo(type: string): { icon: string; color: string; label: string } {
    const types: Record<string, { icon: string; color: string; label: string }> = {
      deposit: { icon: '↓', color: 'green', label: 'Deposit' },
      withdrawal: { icon: '↑', color: 'red', label: 'Withdrawal' },
      investment: { icon: '→', color: 'blue', label: 'Investment' },
      profit: { icon: '+', color: 'green', label: 'Profit' },
      refund: { icon: '←', color: 'orange', label: 'Refund' },
    };
    return types[type] || { icon: '•', color: 'gray', label: 'Transaction' };
  }

  // ===========================
  // Admin Functions
  // ===========================

  /**
   * Admin: Get all user wallets
   */
  async adminGetAllWallets(
    page: number = 1,
    perPage: number = 15
  ): Promise<ApiResponse<{ wallets: (Wallet & { user: { id: number; name: string; email: string } })[]; pagination: any }>> {
    const response = await apiClient.get(
      `/v1/admin/wallets?page=${page}&per_page=${perPage}`
    );
    return response.data;
  }

  /**
   * Admin: Get specific user's wallet
   */
  async adminGetUserWallet(userId: number): Promise<ApiResponse<{
    user: { id: number; name: string; email: string };
    wallet: Wallet;
  }>> {
    const response = await apiClient.get(`/v1/admin/wallets/user/${userId}`);
    return response.data;
  }

  /**
   * Admin: Fund user's wallet manually
   */
  async adminFundWallet(data: {
    user_id: number;
    amount: number;
    description?: string;
  }): Promise<ApiResponse<WalletTransaction>> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>(
      '/v1/admin/wallets/fund',
      data
    );
    return response.data;
  }

  /**
   * Admin: Debit user's wallet manually
   */
  async adminDebitWallet(data: {
    user_id: number;
    amount: number;
    description?: string;
  }): Promise<ApiResponse<WalletTransaction>> {
    const response = await apiClient.post<ApiResponse<WalletTransaction>>(
      '/v1/admin/wallets/debit',
      data
    );
    return response.data;
  }
}

// Export singleton instance
const walletService = new WalletService();
export default walletService;
