import api from './api';

export const surveyService = {
  getSurveys: async (params?: any) => {
    const response = await api.get('/surveys', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  getSurvey: async (id: string) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  createSurvey: async (data: any) => {
    const response = await api.post('/surveys', data);
    return response.data;
  },

  updateSurvey: async (id: string, data: any) => {
    const response = await api.put(`/surveys/${id}`, data);
    return response.data;
  },
};
