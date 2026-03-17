import api from './api';

export const financeService = {
    // ── Timesheets ──────────────────────────────────────────────────────────
    getTimesheets: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/finance/timesheets', { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.timesheets || []);
    },

    getTimesheet: async (id: string) => {
        const response = await api.get(`/finance/timesheets/${id}`);
        const data = response.data;
        return data?.data || data?.timesheet || data;
    },

    updateTimesheet: async (id: string, payload: { status?: string; notes?: string; approvedHours?: number }) => {
        const response = await api.put(`/finance/timesheets/${id}`, payload);
        return response.data;
    },

    // ── Payroll ─────────────────────────────────────────────────────────────
    getPayrollRuns: async (params?: { skip?: number; take?: number }) => {
        const response = await api.get('/finance/payroll', { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.runs || []);
    },

    getPayrollRun: async (id: string) => {
        const response = await api.get(`/finance/payroll/${id}`);
        const data = response.data;
        return data?.data || data?.run || data;
    },

    createPayrollRun: async (payload: { weekEnding: string; staffIds?: string[] }) => {
        const response = await api.post('/finance/payroll', payload);
        return response.data;
    },

    updatePayrollRun: async (id: string, payload: { status?: string }) => {
        const response = await api.put(`/finance/payroll/${id}`, payload);
        return response.data;
    },
};
