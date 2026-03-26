import api from './api';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionNotes?: string;
  resolvedById?: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string; role: string };
  resolvedBy?: { name: string; role: string };
}

export const supportService = {
  submitTicket: async (data: { subject: string; category: string; message: string }): Promise<SupportTicket> => {
    const response = await api.post('/support', data);
    return response.data;
  },

  getMyTickets: async (): Promise<SupportTicket[]> => {
    const response = await api.get('/support/my');
    return response.data;
  },

  getAllTickets: async (): Promise<SupportTicket[]> => {
    const response = await api.get('/support/all');
    return response.data;
  },

  resolveTicket: async (id: string, resolutionNotes: string): Promise<SupportTicket> => {
    const response = await api.put(`/support/${id}/resolve`, { resolutionNotes });
    return response.data;
  },

  startChat: async (id: string): Promise<{ conversationId: string }> => {
    const response = await api.post(`/support/${id}/chat`);
    return response.data;
  }
};
