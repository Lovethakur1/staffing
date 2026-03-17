import api from './api';

export interface ShiftData {
    eventId: string;
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    hourlyRate: number;
    guaranteedHours: number;
    status?: string;
}

export const shiftService = {
    getShifts: async (params?: any) => {
        const response = await api.get('/shifts', { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.shifts || []);
    },

    getShift: async (id: string) => {
        const response = await api.get(`/shifts/${id}`);
        const data = response.data;
        return data?.data || data?.shift || data;
    },

    createShift: async (data: ShiftData) => {
        const response = await api.post('/shifts', data);
        return response.data;
    },

    updateShift: async (id: string, data: Partial<ShiftData>) => {
        const response = await api.put(`/shifts/${id}`, data);
        return response.data;
    },

    updateShiftStatus: async (id: string, status: string) => {
        const response = await api.put(`/shifts/${id}/status`, { status });
        return response.data;
    },

    deleteShift: async (id: string) => {
        const response = await api.delete(`/shifts/${id}`);
        return response.data;
    },

    // Staff Travel/Clock Actions
    startTravel: async (id: string) => {
        const response = await api.post(`/shifts/${id}/start-travel`);
        return response.data;
    },

    arriveAtVenue: async (id: string) => {
        const response = await api.post(`/shifts/${id}/arrive`);
        return response.data;
    },

    clockIn: async (id: string) => {
        const response = await api.post(`/shifts/${id}/clock-in`);
        return response.data;
    },

    clockOut: async (id: string) => {
        const response = await api.post(`/shifts/${id}/clock-out`);
        return response.data;
    },

    startBreak: async (id: string) => {
        const response = await api.post(`/shifts/${id}/break-in`);
        return response.data;
    },

    endBreak: async (id: string) => {
        const response = await api.post(`/shifts/${id}/break-out`);
        return response.data;
    },

    startTravelHome: async (id: string) => {
        const response = await api.post(`/shifts/${id}/travel-home`);
        return response.data;
    },

    endTravelHome: async (id: string) => {
        const response = await api.post(`/shifts/${id}/end-travel`);
        return response.data;
    },

    updateLocation: async (id: string, lat: number, lng: number) => {
        const response = await api.post(`/shifts/${id}/update-location`, { lat, lng });
        return response.data;
    }
};
