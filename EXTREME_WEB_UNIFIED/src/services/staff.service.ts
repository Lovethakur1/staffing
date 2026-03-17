import api from './api';
// We'll use existing interfaces for now where possible

export interface CreateStaffData {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: string;
    hourlyRate?: number;
    location?: string;
    hireDate?: string;
    certifications?: string[];
    availability?: string[];
    notes?: string;
    travelStipendEnabled?: boolean;
}

export const staffService = {
    // Staff Profiles
    getStaffList: async (params?: { skip?: number; take?: number; skill?: string; availability?: string; minRating?: number; search?: string }) => {
        const response = await api.get('/staff', { params });
        return response.data; // { data: Staff[], pagination: {...} }
    },

    getStaffProfile: async (id: string) => {
        const response = await api.get(`/staff/${id}`);
        return response.data;
    },

    createStaff: async (data: CreateStaffData) => {
        // Use the admin user creation endpoint
        const response = await api.post('/users', {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password || 'TempPassword123!', // Default password
            role: 'STAFF'
        });
        
        // If additional profile data is provided, update the staff profile
        if (response.data && response.data.id && (data.hourlyRate || data.location || data.availability)) {
            await api.put(`/staff/${response.data.id}`, {
                hourlyRate: data.hourlyRate,
                location: data.location,
                hireDate: data.hireDate,
                certifications: data.certifications,
                availability: data.availability,
                notes: data.notes,
                travelStipendEnabled: data.travelStipendEnabled
            });
        }
        
        return response.data;
    },

    updateStaffProfile: async (id: string, data: any) => {
        const response = await api.put(`/staff/${id}`, data);
        return response.data;
    },

    // Applications
    getApplications: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/staff/applications', { params });
        return response.data;
    },

    createApplication: async (data: any) => {
        const response = await api.post('/staff/applications', data);
        return response.data;
    },

    updateApplication: async (id: string, data: { status?: string; notes?: string }) => {
        const response = await api.put(`/staff/applications/${id}`, data);
        return response.data;
    },

    // Interviews
    getInterviews: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/staff/interviews', { params });
        return response.data;
    },

    createInterview: async (data: any) => {
        const response = await api.post('/staff/interviews', data);
        return response.data;
    },

    updateInterview: async (id: string, data: any) => {
        const response = await api.put(`/staff/interviews/${id}`, data);
        return response.data;
    },

    // Documents
    getDocuments: async (userId: string) => {
        const response = await api.get(`/staff/${userId}/documents`);
        return response.data;
    },

    createDocument: async (data: any) => {
        const response = await api.post('/staff/documents', data);
        return response.data;
    },

    updateDocument: async (id: string, data: any) => {
        const response = await api.put(`/staff/documents/${id}`, data);
        return response.data;
    },

    // Certifications
    getCertifications: async (staffId: string) => {
        const response = await api.get(`/staff/${staffId}/certifications`);
        return response.data;
    },

    getAllCertifications: async () => {
        const response = await api.get('/staff/certifications');
        return response.data;
    },

    createCertification: async (data: any) => {
        const response = await api.post('/staff/certifications', data);
        return response.data;
    },

    verifyCertification: async (id: string, data: any) => {
        const response = await api.put(`/staff/certifications/${id}/verify`, data);
        return response.data;
    },
};
