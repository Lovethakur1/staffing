import api from './api';

export interface ClientProfile {
    id: string;
    userId: string;
    type: string;
    company: string;
    address: string;
    creditLimit: number;
    paymentTerms: string;
    totalEvents: number;
    totalSpent: number;
    rating: number;
    isActive: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
    };
    events?: any[];
    invoices?: any[];
}

export interface FavoriteStaff {
    id: string;
    clientId: string;
    staffId: string;
    notes: string;
    staff: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        staffProfile: {
            skills: string[];
            hourlyRate: number;
            rating: number;
            availabilityStatus: string;
        };
    };
}

export interface CreateClientData {
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    type?: string;
    paymentTerms?: string;
    creditLimit?: number;
    notes?: string;
}

export const clientService = {
    // Get paginated clients
    getClients: async (params?: { page?: number; limit?: number; search?: string; type?: string }) => {
        const response = await api.get('/clients', { params });
        return response.data;
    },

    // Get a single client with relations
    getClient: async (id: string) => {
        const response = await api.get(`/clients/${id}`);
        return response.data as ClientProfile;
    },

    // Create a new client
    createClient: async (data: CreateClientData) => {
        // Use the admin user creation endpoint with role CLIENT
        const response = await api.post('/users', {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: 'TempPassword123!', // Default password
            role: 'CLIENT'
        });
        
        // If additional profile data is provided, update the client profile
        if (response.data && response.data.id && (data.company || data.address || data.paymentTerms)) {
            // TODO: Update client profile after creation if endpoint available
        }
        
        return response.data;
    },

    // Update a client profile
    updateClient: async (id: string, data: Partial<ClientProfile>) => {
        const response = await api.put(`/clients/${id}`, data);
        return response.data as ClientProfile;
    },

    // Favorite Staff List
    getFavoriteStaff: async () => {
        const response = await api.get('/clients/favorites');
        return response.data as FavoriteStaff[];
    },

    // Add Favorite Staff
    addFavoriteStaff: async (staffId: string, notes?: string) => {
        const response = await api.post('/clients/favorites', { staffId, notes });
        return response.data;
    },

    // Remove Favorite Staff
    removeFavoriteStaff: async (staffId: string) => {
        const response = await api.delete(`/clients/favorites/${staffId}`);
        return response.data;
    }
};
