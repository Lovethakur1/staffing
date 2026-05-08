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

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})/;
const TIME_RE = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i;

const parseTimeToMinutes = (time?: string | null): number | null => {
  if (!time) return null;

  const match = TIME_RE.exec(time.trim());
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const timeRangesOverlap = (
  recordStartTime?: string,
  recordEndTime?: string,
  shiftStartTime?: string,
  shiftEndTime?: string
): boolean => {
  if (!shiftStartTime || !shiftEndTime) return true;
  if (!recordStartTime || !recordEndTime) return true;

  const recordStart = parseTimeToMinutes(recordStartTime);
  let recordEnd = parseTimeToMinutes(recordEndTime);
  const shiftStart = parseTimeToMinutes(shiftStartTime);
  let shiftEnd = parseTimeToMinutes(shiftEndTime);

  if (recordStart === null || recordEnd === null || shiftStart === null || shiftEnd === null) {
    return true;
  }

  if (recordEnd <= recordStart) recordEnd += 24 * 60;
  if (shiftEnd <= shiftStart) shiftEnd += 24 * 60;

  return recordStart < shiftEnd && recordEnd > shiftStart;
};

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
   * Normalize a date to a YYYY-MM-DD calendar key without shifting API ISO dates.
   */
  normalizeDate: (date: Date | string): string => {
    if (typeof date === 'string') {
      const match = DATE_KEY_RE.exec(date);
      if (match) return match[0];
    }

    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Check if an unavailability record overlaps a date and optional shift window.
   */
  overlapsDateTime: (
    record: UnavailabilityRecord,
    dateToCheck: Date | string,
    shiftStartTime?: string,
    shiftEndTime?: string
  ): boolean => {
    const checkDateStr = unavailabilityService.normalizeDate(dateToCheck);
    const startDateStr = unavailabilityService.normalizeDate(record.startDate);
    const endDateStr = unavailabilityService.normalizeDate(record.endDate);

    if (checkDateStr < startDateStr || checkDateStr > endDateStr) return false;
    if (!shiftStartTime || !shiftEndTime) return true;

    if (checkDateStr > startDateStr && checkDateStr < endDateStr) return true;

    let blockedStartTime = record.startTime || '00:00';
    let blockedEndTime = record.endTime || '23:59';

    if (checkDateStr > startDateStr) blockedStartTime = '00:00';
    if (checkDateStr < endDateStr) blockedEndTime = '23:59';

    return timeRangesOverlap(blockedStartTime, blockedEndTime, shiftStartTime, shiftEndTime);
  },

  /**
   * Check if a staff member is unavailable on a specific date
   */
  isStaffUnavailableOnDate: (
    unavailabilityRecords: UnavailabilityRecord[],
    staffId: string,
    dateToCheck: Date | string,
    shiftStartTime?: string,
    shiftEndTime?: string
  ): boolean => {
    return unavailabilityRecords.some(record => {
      // Match by staffId or staffProfileId
      const matchesStaff = record.staffId === staffId || record.staffProfileId === staffId;
      if (!matchesStaff) return false;

      return unavailabilityService.overlapsDateTime(record, dateToCheck, shiftStartTime, shiftEndTime);
    });
  },

  /**
   * Get staff IDs that are unavailable on a specific date
   */
  getUnavailableStaffIds: (
    unavailabilityRecords: UnavailabilityRecord[],
    dateToCheck: Date | string,
    shiftStartTime?: string,
    shiftEndTime?: string
  ): Set<string> => {
    const unavailableIds = new Set<string>();

    unavailabilityRecords.forEach(record => {
      if (unavailabilityService.overlapsDateTime(record, dateToCheck, shiftStartTime, shiftEndTime)) {
        if (record.staffId) unavailableIds.add(record.staffId);
        if (record.staffProfileId) unavailableIds.add(record.staffProfileId);
      }
    });

    return unavailableIds;
  },
};
