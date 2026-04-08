import api from './api';

export interface EventPayload {
    clientId: string;
    title: string;
    description?: string;
    eventType: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    locationLat?: number;
    locationLng?: number;
    staffRequired: number;
    budget: number;
    deposit?: number;
    tips?: number;
    specialRequirements?: string;
    dressCode?: string;
    contactOnSite?: string;
    contactOnSitePhone?: string;
    staffCosts?: number;
    travelFee?: number;
    platformFee?: number;
    additionalFees?: number;
    adminNotes?: string;
    isMultiDay?: boolean;
    endDate?: string;
    eventDates?: Array<{ date: string; startTime: string; endTime: string }>;
}

export const eventService = {
    getEvents: async (params?: any) => {
        const response = await api.get('/events', { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.events || []);
    },

    getEvent: async (id: string) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    createEvent: async (data: EventPayload) => {
        const response = await api.post('/events', data);
        return response.data;
    },

    updateEvent: async (id: string, data: Partial<EventPayload> & { status?: string; managerId?: string }) => {
        const response = await api.put(`/events/${id}`, data);
        return response.data;
    },

    deleteEvent: async (id: string) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    createIncident: async (eventId: string, data: any) => {
        const response = await api.post(`/events/${eventId}/incidents`, data);
        return response.data;
    },

    updateIncident: async (incidentId: string, data: any) => {
        const response = await api.put(`/events/incidents/${incidentId}`, data);
        return response.data;
    },

    getIncidents: async (eventId?: string) => {
        const url = eventId ? `/events/${eventId}/incidents` : '/events/incidents';
        const response = await api.get(url);
        return response.data;
    }
};
