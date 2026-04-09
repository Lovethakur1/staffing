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
            try {
                // The PUT /staff/:id endpoint requires the staffProfile.id, not the user.id.
                // Fetch the staff profile we just created (which was auto-created by the backend).
                const staffRes = await api.get('/staff', { params: { search: data.email } });
                const staffList = staffRes.data?.data || [];
                const staffProfile = staffList.find((s: any) => s.user?.email === data.email);
                
                if (staffProfile && staffProfile.id) {
                    await api.put(`/staff/${staffProfile.id}`, {
                        hourlyRate: data.hourlyRate,
                        location: data.location,
                        hireDate: data.hireDate,
                        certifications: data.certifications,
                        availability: data.availability,
                        notes: data.notes,
                        travelStipendEnabled: data.travelStipendEnabled
                    });
                }
            } catch (err) {
                console.error('Failed to update extra profile data for new staff member', err);
            }
        }
        
        return response.data;
    },

    updateStaffProfile: async (id: string, data: any) => {
        const response = await api.put(`/staff/${id}`, data);
        return response.data;
    },

    // Applications
    getApplications: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/staff/hr/applications', { params });
        return response.data;
    },

    createApplication: async (data: any) => {
        const response = await api.post('/staff/hr/applications', data);
        return response.data;
    },

    updateApplication: async (id: string, data: { status?: string; notes?: string }) => {
        const response = await api.put(`/staff/hr/applications/${id}`, data);
        return response.data;
    },

    // Interviews
    getInterviews: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/staff/hr/interviews', { params });
        return response.data;
    },

    createInterview: async (data: any) => {
        const response = await api.post('/staff/hr/interviews', data);
        return response.data;
    },

    updateInterview: async (id: string, data: any) => {
        const response = await api.put(`/staff/hr/interviews/${id}`, data);
        return response.data;
    },

    // Documents
    getDocuments: async (userId: string) => {
        const response = await api.get(`/staff/${userId}/documents`);
        return response.data;
    },

    getAllDocuments: async (params?: { category?: string }) => {
        const response = await api.get('/staff/hr/documents', { params });
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
        const response = await api.get('/staff/all-certifications');
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

    // Job Postings
    getJobPostings: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/staff/hr/jobs', { params });
        return response.data;
    },

    getJobPosting: async (id: string) => {
        const response = await api.get(`/staff/hr/jobs/${id}`);
        return response.data;
    },

    createJobPosting: async (data: any) => {
        const response = await api.post('/staff/hr/jobs', data);
        return response.data;
    },

    updateJobPosting: async (id: string, data: any) => {
        const response = await api.put(`/staff/hr/jobs/${id}`, data);
        return response.data;
    },

    deleteJobPosting: async (id: string) => {
        const response = await api.delete(`/staff/hr/jobs/${id}`);
        return response.data;
    },

    // Assessments
    getAssessments: async (params?: { skip?: number; take?: number; status?: string }) => {
        const response = await api.get('/staff/hr/assessments', { params });
        return response.data;
    },

    getAssessment: async (id: string) => {
        const response = await api.get(`/staff/hr/assessments/${id}`);
        return response.data;
    },

    createAssessment: async (data: any) => {
        const response = await api.post('/staff/hr/assessments', data);
        return response.data;
    },

    updateAssessment: async (id: string, data: any) => {
        const response = await api.put(`/staff/hr/assessments/${id}`, data);
        return response.data;
    },
};
