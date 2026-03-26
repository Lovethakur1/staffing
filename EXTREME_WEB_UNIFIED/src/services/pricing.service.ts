import api from './api';

export const pricingService = {
    getPricingConfig: async () => {
        const response = await api.get('/pricing-config');
        return response.data;
    },

    updatePricingConfig: async (id: string, payload: any) => {
        const response = await api.put(`/pricing-config`, { id, ...payload });
        return response.data;
    }
};
