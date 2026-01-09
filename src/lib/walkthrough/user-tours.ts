import { WalkthroughConfig } from '@/types/walkthrough'

// User Dashboard Walkthrough - Complete Guide
export const userDashboardTour: WalkthroughConfig = {
  id: 'user-dashboard-tour',
  role: 'user',
  name: 'Dashboard Guide',
  description: 'Learn how to use your investment dashboard',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Your Investment Dashboard! 🎉',
      content: 'This quick tour will show you how to navigate your dashboard, track investments, and monitor your profits. Let\'s get started!',
      placement: 'center',
      route: '/dashboard',
    },
    {
      id: 'sidebar-nav',
      title: 'Navigation Sidebar',
      content: 'Use the sidebar to navigate between different sections of your dashboard. You can collapse it for more screen space.',
      target: 'sidebar-nav',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'stats-overview',
      title: 'Your Investment Summary',
      content: 'These cards show your key metrics at a glance: total investment, current portfolio value, profits earned, and pending distributions.',
      target: 'stats-grid',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'profit-chart',
      title: 'Profit Trends',
      content: 'These charts visualize your monthly profit trends and cumulative earnings. Hover over data points to see detailed information for each month.',
      target: 'profit-chart',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🚀',
      content: 'You now know the basics of your dashboard. Explore the detailed tours for Investments and Buy Shares from the Help menu to learn more!',
      placement: 'center',
    },
  ],
}

// My Investments Page - Detailed Tour
export const myInvestmentsTour: WalkthroughConfig = {
  id: 'my-investments-tour',
  role: 'user',
  name: 'My Investments Guide',
  description: 'Learn how to track and manage your investments',
  steps: [
    {
      id: 'investments-intro',
      title: 'Welcome to My Investments 📊',
      content: 'This page shows all your share investments. Here you can track performance, view returns, and monitor your portfolio growth.',
      placement: 'center',
      route: '/dashboard/investments',
    },
    {
      id: 'investments-summary',
      title: 'Portfolio Summary',
      content: 'These cards show your portfolio overview:\n\n• Total Shares - Number of shares you own\n• Total Invested - Your principal amount\n• Current Value - Today\'s portfolio value\n• Total ROI - Your return on investment percentage',
      target: 'investments-summary',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'investments-tabs',
      title: 'Investment Tabs',
      content: 'Switch between "Active Investments" to see currently earning shares, or "All Investments" to view your complete investment history.',
      target: 'investments-tabs',
      placement: 'bottom',
      spotlightPadding: 8,
    },
    {
      id: 'investment-card',
      title: 'Investment Details',
      content: 'Each investment card shows:\n\n• Share name and type\n• Number of shares owned\n• Purchase date\n• Amount invested\n• Current value with profit/loss\n• ROI percentage',
      target: 'investment-card',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'investment-performance',
      title: 'Understanding Performance',
      content: 'Green indicators show profits, red shows losses. The percentage tells you how much your investment has grown or declined since purchase.',
      target: 'investment-card',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'investments-complete',
      title: 'Track Your Growth! 📈',
      content: 'Check this page regularly to monitor your investment performance. Profits are distributed monthly and will be reflected in your current value.',
      placement: 'center',
    },
  ],
}

// Buy Shares Page - Detailed Tour
export const buySharesTour: WalkthroughConfig = {
  id: 'buy-shares-tour',
  role: 'user',
  name: 'Buy Shares Guide',
  description: 'Learn how to purchase company shares',
  steps: [
    {
      id: 'shares-intro',
      title: 'Welcome to Buy Shares 🛒',
      content: 'This is where you can browse available company shares and make investments. Each share type offers different returns and availability.',
      placement: 'center',
      route: '/dashboard/shares',
    },
    {
      id: 'shares-grid',
      title: 'Available Shares',
      content: 'Browse all available share offerings. Each card represents a different investment fund with its own characteristics and expected returns.',
      target: 'shares-grid',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'share-card-status',
      title: 'Share Status',
      content: 'The badge shows the share status:\n\n• Active (Green) - Available for purchase\n• Sold Out - No shares remaining\n• Coming Soon - Not yet available',
      target: 'share-card',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'share-card-price',
      title: 'Share Price',
      content: 'This is the cost per share. Your total investment will be: Price × Number of Shares you purchase.',
      target: 'share-card',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'share-availability',
      title: 'Share Availability',
      content: 'The progress bar shows how many shares are sold. Available/Total shows remaining shares. Act fast if availability is low!',
      target: 'share-card',
      placement: 'left',
      spotlightPadding: 12,
    },
    {
      id: 'share-limits',
      title: 'Purchase Limits',
      content: 'Each share has minimum and maximum purchase limits:\n\n• Min Purchase - Smallest amount you can buy\n• Max Purchase - Largest amount per transaction',
      target: 'share-card',
      placement: 'top',
      spotlightPadding: 12,
    },
    {
      id: 'buy-button',
      title: 'Making a Purchase',
      content: 'Click "Buy Shares" to open the purchase dialog. You\'ll be able to select quantity and confirm before completing the transaction.',
      target: 'share-card',
      placement: 'bottom',
      spotlightPadding: 12,
    },
    {
      id: 'purchase-process',
      title: 'Purchase Process',
      content: 'When buying shares:\n\n1. Select number of shares\n2. Review total cost\n3. Confirm purchase\n4. Funds deducted from wallet\n5. Shares added to portfolio',
      placement: 'center',
    },
    {
      id: 'shares-complete',
      title: 'Start Investing! 💰',
      content: 'You\'re ready to make your first investment! Choose a share type that matches your goals and start earning monthly profits.',
      placement: 'center',
    },
  ],
}

// User Quick Tour - Abbreviated version
export const userQuickTour: WalkthroughConfig = {
  id: 'user-quick-tour',
  role: 'user',
  name: 'Quick Overview',
  description: 'A brief overview of your dashboard',
  steps: [
    {
      id: 'quick-stats',
      title: 'Your Investment Stats',
      content: 'These cards show your key metrics at a glance: wallet balance, total investment, profits earned, and ROI.',
      target: 'stats-grid',
      placement: 'bottom',
      spotlightPadding: 12,
      route: '/dashboard',
    },
    {
      id: 'quick-nav',
      title: 'Quick Navigation',
      content: 'Use the sidebar to access your investments, buy shares, view profits, and check transactions.',
      target: 'sidebar-nav',
      placement: 'right',
      spotlightPadding: 12,
    },
    {
      id: 'quick-complete',
      title: 'Ready to Invest!',
      content: 'That\'s the basics! For detailed guides, select "My Investments Guide" or "Buy Shares Guide" from the Help menu.',
      placement: 'center',
    },
  ],
}

// All user tours
export const userTours: WalkthroughConfig[] = [
  userDashboardTour,
  myInvestmentsTour,
  buySharesTour,
  userQuickTour,
]
