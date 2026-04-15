import api from './api';

export const equipmentService = {
  // Items
  getItems: async (params?: any) => {
    const response = await api.get('/equipment', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  getItem: async (id: string) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  createItem: async (data: any) => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  updateItem: async (id: string, data: any) => {
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: string) => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  },

  // Assignments
  getAssignments: async (params?: any) => {
    const response = await api.get('/equipment/assignments', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  createAssignment: async (data: any) => {
    const response = await api.post('/equipment/assignments', data);
    return response.data;
  },

  updateAssignment: async (id: string, data: any) => {
    const response = await api.put(`/equipment/assignments/${id}`, data);
    return response.data;
  },
};
