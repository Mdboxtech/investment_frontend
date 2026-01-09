import apiClient, { ApiResponse } from '../client';

// Settings types
export interface SettingItem {
  value: string | number | boolean;
  type: 'string' | 'boolean' | 'integer' | 'json';
  label: string;
  description: string;
  is_public: boolean;
}

export interface SettingsGrouped {
  profit?: Record<string, SettingItem>;
  investment?: Record<string, SettingItem>;
  notification?: Record<string, SettingItem>;
  security?: Record<string, SettingItem>;
  general?: Record<string, SettingItem>;
  theme?: Record<string, SettingItem>;
}

export interface PlatformSettings {
  // Profit settings
  profit_calculation_method: 'share_based' | 'investment_based';
  profit_auto_crediting: boolean;
  platform_fee_percentage: number;
  // Investment settings
  min_investment_amount: number;
  max_investment_amount: number;
  // Notification settings
  notify_profit_distribution: boolean;
  notify_new_shares: boolean;
  send_monthly_reports: boolean;
  // Security settings
  lock_past_records: boolean;
  audit_trail_enabled: boolean;
  require_2fa_admin: boolean;
  idempotent_distribution: boolean;
  // General settings
  platform_name: string;
  platform_tagline: string;
  platform_logo: string;
  platform_favicon: string;
  support_email: string;
  support_phone: string;
  currency_code: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  registration_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  // Theme settings
  theme_mode: 'light' | 'dark' | 'system';
  primary_color: string;
  secondary_color: string;
  success_color: string;
  warning_color: string;
  danger_color: string;
  border_radius: string;
  font_family: string;
}

// Preset theme options
export const themePresets = {
  default: {
    name: 'Default Blue',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    success_color: '#22c55e',
    warning_color: '#eab308',
    danger_color: '#ef4444',
  },
  emerald: {
    name: 'Emerald Green',
    primary_color: '#10b981',
    secondary_color: '#6b7280',
    success_color: '#22c55e',
    warning_color: '#f59e0b',
    danger_color: '#ef4444',
  },
  purple: {
    name: 'Royal Purple',
    primary_color: '#8b5cf6',
    secondary_color: '#71717a',
    success_color: '#22c55e',
    warning_color: '#eab308',
    danger_color: '#ef4444',
  },
  rose: {
    name: 'Rose Pink',
    primary_color: '#f43f5e',
    secondary_color: '#64748b',
    success_color: '#22c55e',
    warning_color: '#f59e0b',
    danger_color: '#dc2626',
  },
  orange: {
    name: 'Sunset Orange',
    primary_color: '#f97316',
    secondary_color: '#78716c',
    success_color: '#22c55e',
    warning_color: '#eab308',
    danger_color: '#ef4444',
  },
  teal: {
    name: 'Teal Cyan',
    primary_color: '#14b8a6',
    secondary_color: '#64748b',
    success_color: '#22c55e',
    warning_color: '#f59e0b',
    danger_color: '#ef4444',
  },
}

// Settings service
class SettingsService {
  /**
   * Get all settings (admin only)
   */
  async getAll(): Promise<ApiResponse<SettingsGrouped>> {
    const response = await apiClient.get('/v1/admin/settings');
    return response.data;
  }

  /**
   * Get settings by group
   */
  async getByGroup(group: string): Promise<ApiResponse<Record<string, SettingItem>>> {
    const response = await apiClient.get(`/v1/admin/settings/group/${group}`);
    return response.data;
  }

  /**
   * Get a single setting
   */
  async getSetting(key: string): Promise<ApiResponse<SettingItem>> {
    const response = await apiClient.get(`/v1/admin/settings/${key}`);
    return response.data;
  }

  /**
   * Update a single setting
   */
  async updateSetting(key: string, value: string | number | boolean): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/v1/admin/settings/${key}`, { value });
    return response.data;
  }

  /**
   * Update multiple settings at once
   */
  async updateBatch(settings: Record<string, string | number | boolean>): Promise<ApiResponse<{
    updated: string[];
    failed: string[];
  }>> {
    const response = await apiClient.post('/v1/admin/settings/batch', { settings });
    return response.data;
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(group?: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/v1/admin/settings/reset', { group });
    return response.data;
  }

  /**
   * Get public settings (no auth required)
   */
  async getPublicSettings(): Promise<ApiResponse<Record<string, string | number | boolean>>> {
    const response = await apiClient.get('/v1/settings/public');
    return response.data;
  }

  /**
   * Helper to flatten grouped settings into a flat object
   */
  flattenSettings(grouped: SettingsGrouped): Partial<PlatformSettings> {
    const flat: Record<string, any> = {};

    for (const [, groupSettings] of Object.entries(grouped)) {
      if (groupSettings) {
        for (const [key, item] of Object.entries(groupSettings) as [string, SettingItem][]) {
          flat[key] = item.value;
        }
      }
    }

    return flat as Partial<PlatformSettings>;
  }

  /**
   * Get theme preset by name
   */
  getThemePreset(name: keyof typeof themePresets) {
    return themePresets[name];
  }

  /**
   * Get all theme presets
   */
  getAllThemePresets() {
    return themePresets;
  }
}

const settingsService = new SettingsService();
export default settingsService;
