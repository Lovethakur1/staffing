import api from './api';

export interface Integration {
  key: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  id: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  hasConfig: boolean;
}

export const integrationService = {
  list: async (): Promise<Integration[]> => {
    const response = await api.get('/integrations');
    return response.data;
  },
  connect: async (key: string, config?: Record<string, string>): Promise<void> => {
    await api.post(`/integrations/${key}/connect`, { config });
  },
  disconnect: async (key: string): Promise<void> => {
    await api.post(`/integrations/${key}/disconnect`);
  },
  updateConfig: async (key: string, config: Record<string, string>): Promise<void> => {
    await api.put(`/integrations/${key}/config`, { config });
  },
  sync: async (key: string): Promise<void> => {
    await api.post(`/integrations/${key}/sync`);
  },
};
