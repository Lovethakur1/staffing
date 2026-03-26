import api from './api';

export const analyticsService = {
  getAdminAnalytics: async () => {
    const response = await api.get('/analytics/admin');
    return response.data;
  }
};
