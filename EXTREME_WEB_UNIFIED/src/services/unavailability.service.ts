import api from './api';

export interface UnavailabilityRecord {
  id: string;
  staffProfileId: string;
  staffId?: string;
  staffName?: string;
  staffEmail?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnavailabilityData {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface UnavailabilityQuery {
  staffId?: string;
  startDate?: string;
  endDate?: string;
}

export const unavailabilityService = {
  /**
   * Get unavailability for the current logged-in user (staff)
   */
  getMyUnavailability: async (): Promise<UnavailabilityRecord[]> => {
    const response = await api.get('/unavailability');
    return response.data?.data || response.data || [];
  },

  /**
   * Get all staff unavailability (for Admin, Scheduler, Manager roles)
   */
  getAllUnavailability: async (query?: UnavailabilityQuery): Promise<UnavailabilityRecord[]> => {
    const response = await api.get('/unavailability/all', { params: query });
    return response.data?.data || response.data || [];
  },

  /**
   * Create new unavailability record
   */
  createUnavailability: async (data: CreateUnavailabilityData): Promise<UnavailabilityRecord> => {
    const response = await api.post('/unavailability', data);
    return response.data;
  },

  /**
   * Delete an unavailability record
   */
  deleteUnavailability: async (id: string): Promise<void> => {
    await api.delete(`/unavailability/${id}`);
  },

  /**
   * Normalize a date to YYYY-MM-DD string in local timezone for comparison
   */
  normalizeDate: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    // Use local date components to avoid timezone issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Check if a staff member is unavailable on a specific date
   */
  isStaffUnavailableOnDate: (
    unavailabilityRecords: UnavailabilityRecord[],
    staffId: string,
    dateToCheck: Date | string
  ): boolean => {
    const checkDateStr = unavailabilityService.normalizeDate(dateToCheck);

    return unavailabilityRecords.some(record => {
      // Match by staffId or staffProfileId
      const matchesStaff = record.staffId === staffId || record.staffProfileId === staffId;
      if (!matchesStaff) return false;

      const startDateStr = unavailabilityService.normalizeDate(record.startDate);
      const endDateStr = unavailabilityService.normalizeDate(record.endDate);

      return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
  },

  /**
   * Get staff IDs that are unavailable on a specific date
   */
  getUnavailableStaffIds: (
    unavailabilityRecords: UnavailabilityRecord[],
    dateToCheck: Date | string
  ): Set<string> => {
    const checkDateStr = unavailabilityService.normalizeDate(dateToCheck);

    const unavailableIds = new Set<string>();

    unavailabilityRecords.forEach(record => {
      const startDateStr = unavailabilityService.normalizeDate(record.startDate);
      const endDateStr = unavailabilityService.normalizeDate(record.endDate);

      if (checkDateStr >= startDateStr && checkDateStr <= endDateStr) {
        if (record.staffId) unavailableIds.add(record.staffId);
        if (record.staffProfileId) unavailableIds.add(record.staffProfileId);
      }
    });

    return unavailableIds;
  },
};
