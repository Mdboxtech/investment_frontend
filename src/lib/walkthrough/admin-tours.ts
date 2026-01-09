import { WalkthroughConfig } from '@/types/walkthrough'

// Admin Dashboard Complete Tour
export const adminDashboardTour: WalkthroughConfig = {
  id: 'admin-dashboard-tour',
  role: 'admin',
  name: 'Admin Guide',
  description: 'Complete guide to managing the investment platform',
  steps: [
    {
      id: 'admin-welcome',
      title: 'Welcome to the Admin Dashboard! 👋',
      content: 'This tour will guide you through all the features available to manage the investment platform. Let\'s explore your powerful admin tools!',
      placement: 'center',
      route: '/admin',
    },
    {
      id: 'admin-sidebar',
      title: 'Admin Navigation',
      content: 'The sidebar provides quick access to all management sections. You can collapse it for a wider workspace.',
      target: 'sidebar-nav',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'admin-stats',
      title: 'Platform Overview',
      content: 'These key metrics show your platform\'s health: total investors, capital raised, profits distributed, and pending distributions.',
      target: 'admin-stats-grid',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'pending-distributions',
      title: 'Pending Distributions',
      content: 'This section shows profits that need to be distributed to investors. Stay on top of these to maintain investor trust.',
      target: 'pending-distributions',
      placement: 'top',
      spotlightPadding: 8,
    },
    {
      id: 'admin-complete',
      title: 'Explore More! 🎯',
      content: 'For detailed guides on specific features, check out the "Investment Pool Guide" and "Manage Shares Guide" from the Help menu.',
      placement: 'center',
    },
  ],
}

// Investment Pool Management - Detailed Tour
export const investmentPoolTour: WalkthroughConfig = {
  id: 'investment-pool-tour',
  role: 'admin',
  name: 'Investment Pool Guide',
  description: 'Learn how to manage the investment pool',
  steps: [
    {
      id: 'pool-intro',
      title: 'Investment Pool Management 💰',
      content: 'The Investment Pool is the heart of your platform. It contains all investor funds that are used for business operations to generate profits.',
      placement: 'center',
      route: '/admin/pool',
    },
    {
      id: 'pool-overview',
      title: 'Pool Overview Cards',
      content: 'These cards show critical pool metrics:\n\n• Total Pool - All invested capital\n• Available Balance - Funds ready for use\n• Total Profit - Generated returns\n• Total Shares - Shares in circulation',
      target: 'pool-overview',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'pool-total',
      title: 'Total Pool Value',
      content: 'This is the sum of all investor contributions. It grows when investors purchase shares and represents your total capital under management.',
      target: 'pool-total-card',
      placement: 'right',
      spotlightPadding: 8,
    },
    {
      id: 'pool-available',
      title: 'Available Balance',
      content: 'This is the capital available for business operations. Use these funds wisely to generate profits for your investors.',
      target: 'pool-available-card',
      placement: 'left',
      spotlightPadding: 8,
    },
    {
      id: 'pool-utilization',
      title: 'Fund Utilization',
      content: 'This section shows how pool funds are being used across different business activities. A healthy utilization rate shows active capital deployment.',
      target: 'pool-utilization',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'pool-breakdown',
      title: 'Fund Breakdown by Share Type',
      content: 'See how much capital comes from each share type. This helps you understand which investment products are most popular.',
      target: 'pool-breakdown',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'pool-activity',
      title: 'Recent Activity',
      content: 'Track recent pool movements including new investments, profit distributions, and withdrawals. Monitor cash flow in real-time.',
      target: 'pool-activity',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'pool-best-practices',
      title: 'Best Practices 📋',
      content: 'For a healthy pool:\n\n• Keep 20-30% as available balance\n• Distribute profits consistently\n• Monitor utilization rate\n• Track investor sentiment',
      placement: 'center',
    },
    {
      id: 'pool-complete',
      title: 'Pool Management Complete! ✅',
      content: 'You now understand how to monitor and manage the investment pool. Regular monitoring ensures healthy capital management.',
      placement: 'center',
    },
  ],
}

// Manage Shares - Detailed Tour
export const manageSharesTour: WalkthroughConfig = {
  id: 'manage-shares-tour',
  role: 'admin',
  name: 'Manage Shares Guide',
  description: 'Learn how to create and manage investment shares',
  steps: [
    {
      id: 'shares-intro',
      title: 'Share Management 📈',
      content: 'This is where you create and manage investment shares. Shares are the investment products that users purchase to earn profits.',
      placement: 'center',
      route: '/admin/shares',
    },
    {
      id: 'shares-summary',
      title: 'Shares Overview',
      content: 'Quick overview of your share offerings:\n\n• Total Funds - Number of share types\n• Total Shares - All shares created\n• Available - Remaining for purchase\n• Active - Currently selling',
      target: 'shares-summary',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'create-share-btn',
      title: 'Create New Share',
      content: 'Click here to create a new share offering. You\'ll set the name, description, price, quantity, and purchase limits.',
      target: 'create-share-btn',
      placement: 'bottom',
      spotlightPadding: 8,
    },
    {
      id: 'share-list',
      title: 'Share Listings',
      content: 'All your share offerings are listed here. Each card shows the share details, sales progress, and management actions.',
      target: 'share-list',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'share-details',
      title: 'Share Information',
      content: 'Each share displays:\n\n• Name & Description\n• Status (Active/Sold Out/Inactive)\n• Price per share\n• Sales progress bar\n• Total value raised',
      target: 'share-card',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'share-progress',
      title: 'Sales Progress',
      content: 'The progress bar shows how many shares are sold. Monitor this to know when a share is selling well or approaching sold out status.',
      target: 'share-card',
      placement: 'left',
      spotlightPadding: 12,
    },
    {
      id: 'share-actions',
      title: 'Share Actions',
      content: 'Use the Edit button to modify share details, or change status to pause/resume sales. Be careful with changes on active shares.',
      target: 'share-card',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'create-share-form',
      title: 'Creating a Share',
      content: 'When creating a share, consider:\n\n• Attractive name & clear description\n• Competitive price point\n• Reasonable min/max limits\n• Total shares available',
      placement: 'center',
    },
    {
      id: 'share-pricing',
      title: 'Pricing Strategy 💡',
      content: 'Tips for pricing:\n\n• Lower price = more accessible\n• Higher price = premium feel\n• Consider your target investors\n• Balance supply and demand',
      placement: 'center',
    },
    {
      id: 'shares-complete',
      title: 'Share Management Complete! ✅',
      content: 'You now know how to create and manage shares. Create diverse offerings to attract different types of investors.',
      placement: 'center',
    },
  ],
}

// Admin Quick Tour
export const adminQuickTour: WalkthroughConfig = {
  id: 'admin-quick-tour',
  role: 'admin',
  name: 'Quick Overview',
  description: 'A brief overview of admin features',
  steps: [
    {
      id: 'quick-overview',
      title: 'Admin Dashboard Overview',
      content: 'Your dashboard shows key platform metrics and pending actions at a glance.',
      target: 'admin-stats-grid',
      placement: 'bottom',
      spotlightPadding: 12,
      route: '/admin',
    },
    {
      id: 'quick-key-actions',
      title: 'Key Admin Actions',
      content: 'Use the sidebar to manage: Investment Pool, Monthly Profits, Shares, Investors, Reports, and Settings.',
      target: 'sidebar-nav',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'quick-done',
      title: 'Ready to Go!',
      content: 'For detailed guides, explore "Investment Pool Guide", "Manage Shares Guide", and "Profit Distribution Tutorial" from the Help menu.',
      placement: 'center',
    },
  ],
}

// Profit Distribution Tutorial
export const profitDistributionTour: WalkthroughConfig = {
  id: 'profit-distribution-tour',
  role: 'admin',
  name: 'Profit Distribution Tutorial',
  description: 'Learn how to record and distribute monthly profits',
  steps: [
    {
      id: 'profit-intro',
      title: 'Profit Distribution Guide 💰',
      content: 'This tutorial will teach you how to record monthly profits and distribute them to investors. This is a critical process for maintaining trust.',
      placement: 'center',
      route: '/admin/profits',
    },
    {
      id: 'profit-summary',
      title: 'Profit Overview',
      content: 'These cards show:\n\n• Total Generated - All profits recorded\n• Distributed - Paid to investors\n• Pending - Awaiting distribution\n• Active Investors - Eligible recipients',
      target: 'profit-summary',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'create-profit',
      title: 'Step 1: Create Profit Record',
      content: 'Click "Record Monthly Profit" to create a new profit record. Enter the month, total profit amount, and ROI percentage.',
      target: 'add-profit-button',
      placement: 'bottom',
      spotlightPadding: 8,
    },
    {
      id: 'profit-tabs',
      title: 'Profit Status Tabs',
      content: 'Filter records by status:\n\n• Draft - Being prepared\n• Published - Ready for distribution\n• Locked - Finalized and immutable',
      target: 'profits-table',
      placement: 'top',
      spotlightPadding: 8,
    },
    {
      id: 'review-profits',
      title: 'Step 2: Review Calculations',
      content: 'The system automatically calculates each investor\'s share based on their holdings. Review the breakdown before distribution.',
      target: 'profits-table',
      placement: 'top',
      spotlightPadding: 8,
    },
    {
      id: 'distribute',
      title: 'Step 3: Distribute Profits',
      content: 'Click "Distribute" on a profit record to credit profits to all investors\' accounts. This action is logged for audit purposes.',
      target: 'profits-table',
      placement: 'top',
      spotlightPadding: 8,
    },
    {
      id: 'lock-record',
      title: 'Step 4: Lock Record',
      content: 'After distribution, lock the record to prevent modifications. Locked records provide transparency and audit compliance.',
      target: 'profits-table',
      placement: 'top',
      spotlightPadding: 8,
    },
    {
      id: 'profit-formula',
      title: 'Profit Calculation Formula',
      content: 'User Profit = (User Shares ÷ Total Shares) × Monthly Profit\n\nExample: 10 shares ÷ 1000 total × $50,000 profit = $500',
      placement: 'center',
    },
    {
      id: 'profit-complete',
      title: 'Distribution Complete! ✅',
      content: 'You\'ve learned the profit distribution workflow. Remember to distribute profits promptly and lock records for transparency.',
      placement: 'center',
    },
  ],
}

// All admin tours
export const adminTours: WalkthroughConfig[] = [
  adminDashboardTour,
  investmentPoolTour,
  manageSharesTour,
  adminQuickTour,
  profitDistributionTour,
]
