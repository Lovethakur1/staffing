import api from './api';

export type ContentSection = 'RESOURCE' | 'DOCUMENTATION' | 'TRAINING';
export type ContentKind = 'LINK' | 'GUIDE' | 'VIDEO' | 'POLICY' | 'COURSE';

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  body?: string | null;
  section: ContentSection;
  kind: ContentKind;
  category: string;
  icon?: string | null;
  color?: string | null;
  actionLabel?: string | null;
  url?: string | null;
  pages?: number | null;
  durationMinutes?: number | null;
  modules?: number | null;
  required: boolean;
  instructor?: string | null;
  audiences: string[];
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ContentListResponse {
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getPublishedContent(section: ContentSection) {
  const response = await api.get('/content/mobile', { params: { section } });
  return Array.isArray(response.data) ? response.data as ContentItem[] : [];
}

export async function getAdminContent(section?: ContentSection) {
  const response = await api.get('/content/admin', { params: { section, limit: 100 } });
  return response.data as ContentListResponse;
}

export async function createContentItem(payload: Partial<ContentItem>) {
  const response = await api.post('/content/admin', payload);
  return response.data as ContentItem;
}

export async function updateContentItem(id: string, payload: Partial<ContentItem>) {
  const response = await api.put(`/content/admin/${id}`, payload);
  return response.data as ContentItem;
}

export async function deleteContentItem(id: string) {
  await api.delete(`/content/admin/${id}`);
}