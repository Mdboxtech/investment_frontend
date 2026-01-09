// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatarUrl?: string
  balance: number
  createdAt: string
  isActive: boolean
}

// Share Types
export interface Share {
  id: string
  name: string
  description: string
  pricePerShare: number
  totalShares: number
  availableShares: number
  minPurchase: number
  maxPurchase: number
  status: 'active' | 'inactive' | 'sold_out'
  createdAt: string
  updatedAt: string
}

// Investment Types
export interface Investment {
  id: string
  userId: string
  shareId: string
  shareName: string
  numberOfShares: number
  pricePerShare: number
  totalInvested: number
  currentValue: number
  purchasedAt: string
  status: 'active' | 'sold'
}

// Investment Pool Types
export interface InvestmentPool {
  id: string
  totalInvested: number
  totalProfit: number
  availableBalance: number
  totalShares: number
  activeInvestors: number
  lastUpdated: string
}

// Monthly Profit Types
export interface MonthlyProfit {
  id: string
  month: number
  year: number
  totalProfit: number
  profitPercentage: number
  status: 'draft' | 'published' | 'locked'
  notes?: string
  createdBy: string
  createdAt: string
  publishedAt?: string
  lockedAt?: string
}

// User Profit Types
export interface UserProfit {
  id: string
  userId: string
  userName: string
  monthlyProfitId: string
  month: number
  year: number
  sharesOwned: number
  profitAmount: number
  percentage: number
  status: 'pending' | 'paid'
  creditedAt?: string
}

// Dashboard Summary Types
export interface UserDashboardSummary {
  totalShares: number
  totalInvested: number
  currentValue: number
  totalProfitEarned: number
  roiPercentage: number
  pendingProfits: number
  activeInvestments: number
  walletBalance: number
}

export interface AdminDashboardSummary {
  totalInvestedCapital: number
  totalSharesSold: number
  activeInvestorsCount: number
  availablePoolBalance: number
  totalProfitGenerated: number
  totalProfitDistributed: number
  pendingDistributions: number
}

// Chart Data Types
export interface ProfitChartData {
  month: string
  profit: number
  percentage: number
  cumulative: number
}

export interface InvestmentChartData {
  month: string
  invested: number
  value: number
}

// Transaction Types
export interface Transaction {
  id: string
  userId: string
  type: 'purchase' | 'profit_credit' | 'withdrawal' | 'deposit'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface CreateShareForm {
  name: string
  description: string
  pricePerShare: number
  totalShares: number
  minPurchase: number
  maxPurchase: number
}

export interface CreateMonthlyProfitForm {
  month: number
  year: number
  totalProfit: number
  profitPercentage: number
  notes?: string
}

export interface PurchaseShareForm {
  shareId: string
  numberOfShares: number
}

// Settings Types
export interface PlatformSettings {
  autoCrediting: boolean
  calculationMethod: 'share_based' | 'investment_based'
  minInvestment: number
  maxInvestment: number
  platformFeePercentage: number
}
