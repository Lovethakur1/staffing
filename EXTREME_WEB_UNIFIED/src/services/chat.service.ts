import api from './api';

export const chatService = {
    // List all conversations for the current user
    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.conversations || []);
    },

    // Search users for new conversations
    searchUsers: async (query: string) => {
        const response = await api.get(`/chat/users/search`, { params: { q: query } });
        return response.data || [];
    },

    // Get messages for a specific conversation
    getMessages: async (conversationId: string, params?: { skip?: number; take?: number }) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.data || data?.messages || []);
    },

    // Create a new conversation
    createConversation: async (payload: {
        participantIds: string[];
        isGroup?: boolean;
        name?: string;
    }) => {
        const response = await api.post('/chat/conversations', payload);
        const data = response.data;
        return data?.data || data?.conversation || data;
    },

    // Send a message (via REST as fallback until WebSocket is wired)
    sendMessage: async (conversationId: string, payload: {
        content: string;
        type?: 'text' | 'file' | 'image';
        fileUrl?: string;
        fileName?: string;
    }) => {
        // The backend uses socket.io for real-time, but we can POST to conversations endpoint
        // as a message. If no dedicated message POST route, we'll use a workaround.
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, payload);
        const data = response.data;
        return data?.data || data?.message || data;
    },

    // Add participant to group conversation
    addParticipant: async (conversationId: string, userId: string) => {
        const response = await api.post(`/chat/conversations/${conversationId}/participants`, { userId });
        return response.data;
    },

    // Remove participant from group conversation
    removeParticipant: async (conversationId: string, userId: string) => {
        const response = await api.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
        return response.data;
    },
};
