import apiClient, { ApiResponse } from '../client'

// ===========================
// Type Definitions
// ===========================

export interface BankAccount {
    id: number
    user_id: number
    bank_code: string | null
    bank_name: string
    account_number: string
    account_name: string
    account_type: 'nigerian' | 'international'
    swift_code: string | null
    routing_number: string | null
    iban: string | null
    country: string | null
    currency: string
    recipient_code: string | null
    is_default: boolean
    is_verified: boolean
    verified_at: string | null
    created_at: string
    updated_at: string
    // Computed
    masked_account_number?: string
}

export interface Bank {
    id: number
    name: string
    slug: string
    code: string
    longcode: string
    gateway: string | null
    pay_with_bank: boolean
    active: boolean
    is_deleted: boolean
    country: string
    currency: string
    type: string
}

export interface VerifyAccountResponse {
    account_name: string
    account_number: string
    bank_id: number | null
}

export interface AddBankAccountRequest {
    account_type: 'nigerian' | 'international'
    bank_name: string
    account_number: string
    account_name: string
    bank_code?: string
    swift_code?: string
    routing_number?: string
    iban?: string
    country?: string
    currency?: string
    is_default?: boolean
}

export interface TransferRequest {
    amount: number
    bank_account_id: number
    reason?: string
}

export interface TransferResponse {
    reference: string
    transfer_code: string | null
    status: string
    amount: number
    bank_name: string
    account_name: string
}

// ===========================
// API Service Class
// ===========================

class BankAccountService {
    /**
     * Get list of Nigerian banks from Paystack
     */
    async getBanks(): Promise<ApiResponse<{ banks: Bank[] }>> {
        const response = await apiClient.get<ApiResponse<{ banks: Bank[] }>>('/v1/banks')
        return response.data
    }

    /**
     * Get user's saved bank accounts
     */
    async getAccounts(): Promise<ApiResponse<{ accounts: BankAccount[] }>> {
        const response = await apiClient.get<ApiResponse<{ accounts: BankAccount[] }>>('/v1/bank-accounts')
        return response.data
    }

    /**
     * Verify a Nigerian bank account number
     */
    async verifyAccount(accountNumber: string, bankCode: string): Promise<ApiResponse<VerifyAccountResponse>> {
        const response = await apiClient.post<ApiResponse<VerifyAccountResponse>>('/v1/bank-accounts/verify', {
            account_number: accountNumber,
            bank_code: bankCode,
        })
        return response.data
    }

    /**
     * Add a new bank account
     */
    async addAccount(data: AddBankAccountRequest): Promise<ApiResponse<{ account: BankAccount }>> {
        const response = await apiClient.post<ApiResponse<{ account: BankAccount }>>('/v1/bank-accounts', data)
        return response.data
    }

    /**
     * Set a bank account as default
     */
    async setDefault(accountId: number): Promise<ApiResponse<{ account: BankAccount }>> {
        const response = await apiClient.put<ApiResponse<{ account: BankAccount }>>(`/v1/bank-accounts/${accountId}/default`)
        return response.data
    }

    /**
     * Delete a bank account
     */
    async deleteAccount(accountId: number): Promise<ApiResponse<null>> {
        const response = await apiClient.delete<ApiResponse<null>>(`/v1/bank-accounts/${accountId}`)
        return response.data
    }

    /**
     * Initiate a withdrawal transfer via Paystack
     */
    async initiateTransfer(data: TransferRequest): Promise<ApiResponse<TransferResponse>> {
        const response = await apiClient.post<ApiResponse<TransferResponse>>('/v1/paystack/transfer', data)
        return response.data
    }

    /**
     * Format account number with mask
     */
    getMaskedNumber(accountNumber: string): string {
        if (accountNumber.length <= 4) return accountNumber
        return '****' + accountNumber.slice(-4)
    }
}

const bankAccountService = new BankAccountService()
export default bankAccountService
