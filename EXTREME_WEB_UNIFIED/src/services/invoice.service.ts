import api from './api';

export const invoiceService = {
    // ── Invoices ────────────────────────────────────────────────────────────
    getInvoices: async (params?: { skip?: number; take?: number; status?: string; clientId?: string }) => {
        const response = await api.get('/invoices', { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.invoices || []);
    },

    getInvoice: async (id: string) => {
        const response = await api.get(`/invoices/${id}`);
        const data = response.data;
        return data?.data || data?.invoice || data;
    },

    createInvoice: async (payload: {
        eventId: string;
        clientId: string;
        paymentTerms?: string;
        notes?: string;
    }) => {
        const response = await api.post('/invoices', payload);
        return response.data;
    },

    updateInvoice: async (id: string, payload: { status?: string; notes?: string; dueDate?: string }) => {
        const response = await api.put(`/invoices/${id}`, payload);
        return response.data;
    },

    sendInvoice: async (id: string) => {
        const response = await api.put(`/invoices/${id}`, { status: 'SENT' });
        return response.data;
    },

    // ── Line Items ──────────────────────────────────────────────────────────
    addLineItem: async (invoiceId: string, item: { description: string; quantity: number; unitPrice: number }) => {
        const response = await api.post(`/invoices/${invoiceId}/line-items`, item);
        return response.data;
    },

    removeLineItem: async (invoiceId: string, itemId: string) => {
        const response = await api.delete(`/invoices/${invoiceId}/line-items/${itemId}`);
        return response.data;
    },
};
