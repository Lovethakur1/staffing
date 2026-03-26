import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  staffProfile?: { hourlyRate: number; skills: string[]; location: string | null } | null;
}

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  newShifts: boolean;
  scheduleChanges: boolean;
  paymentConfirmations: boolean;
  clientMessages: boolean;
  performanceReviews: boolean;
}

export interface SystemPrefs {
  language: string;
  timezone: string;
  currency: string;
  autoClockOut: boolean;
  geoLocation: boolean;
  twoFactor: boolean;
  darkMode: boolean;
}

export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  minRate: number;
  maxRate: number;
  commission: number;
  autoBilling: boolean;
  maintenanceWindow: string;
}

const settingsService = {
  getProfile: (): Promise<UserProfile> =>
    api.get('/settings/profile').then(r => r.data),

  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'phone' | 'bio' | 'avatar'> & {
    hourlyRate?: number; skills?: string[]; location?: string;
  }>): Promise<UserProfile> =>
    api.put('/settings/profile', data).then(r => r.data),

  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    api.put('/settings/password', { currentPassword, newPassword }).then(r => r.data),

  getPreferences: (): Promise<{ notificationPrefs: NotificationPrefs; systemPrefs: SystemPrefs }> =>
    api.get('/settings/preferences').then(r => r.data),

  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>): Promise<void> =>
    api.put('/settings/preferences', { notificationPrefs: prefs }).then(r => r.data),

  updateSystemPrefs: (prefs: Partial<SystemPrefs>): Promise<void> =>
    api.put('/settings/preferences', { systemPrefs: prefs }).then(r => r.data),

  getCompanySettings: (): Promise<CompanySettings> =>
    api.get('/settings/company').then(r => r.data),

  updateCompanySettings: (data: Partial<CompanySettings>): Promise<CompanySettings> =>
    api.put('/settings/company', data).then(r => r.data),
};

export default settingsService;
