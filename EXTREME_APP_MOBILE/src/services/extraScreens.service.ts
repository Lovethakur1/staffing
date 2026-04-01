/**
 * Shared API service for the new drawer screens.
 * Mirrors financeService, staffService, supportService, analyticsService from the web app.
 */
import api from '../config/api';

// ─── TIMESHEETS ──────────────────────────────────────────────────────────────

export interface Timesheet {
  id: string;
  weekEnding: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected';
  totalHours: number;
  regularHours: number;
  grossPay: number;
  staffName: string;
  eventName: string;
}

export async function getTimesheets(): Promise<Timesheet[]> {
  const res = await api.get('/finance/timesheets');
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((ts: any) => ({
    id: ts.id,
    weekEnding: ts.shift?.date || (ts.clockInTime ? ts.clockInTime.split('T')[0] : ''),
    status: (ts.status || 'draft').toLowerCase() as Timesheet['status'],
    totalHours: ts.totalHours || 0,
    regularHours: ts.regularHours || 0,
    grossPay: ts.grossPay || 0,
    staffName: ts.staff?.name || '',
    eventName: ts.shift?.event?.title || '',
  }));
}

export async function updateTimesheetStatus(id: string, status: string): Promise<void> {
  await api.patch(`/finance/timesheets/${id}`, { status });
}

// ─── PAYROLL RUNS ─────────────────────────────────────────────────────────────

export interface PayrollRun {
  id: string;
  period: string;
  staffCount: number;
  totalAmount: number;
  processedBy: string;
  status: string;
  createdAt: string;
}

export async function getPayrollRuns(): Promise<PayrollRun[]> {
  const res = await api.get('/finance/payroll-runs');
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((r: any) => ({
    id: r.id,
    period: `${r.periodStart?.split('T')[0] ?? '—'} → ${r.periodEnd?.split('T')[0] ?? '—'}`,
    staffCount: r._count?.items ?? 0,
    totalAmount: r.totalAmount ?? 0,
    processedBy: r.processor?.name || '—',
    status: (r.status || 'draft').toLowerCase(),
    createdAt: r.createdAt?.split('T')[0] || '',
  }));
}

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────

export interface Certification {
  id: string;
  staffId: string;
  staffName: string;
  certType: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired' | 'pending-verification';
  daysUntilExpiry: number;
  documentUrl?: string;
}

export async function getCertifications(): Promise<Certification[]> {
  const res = await api.get('/staff/certifications');
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((c: any) => {
    const expiry = c.expiryDate ? new Date(c.expiryDate) : null;
    const now = new Date();
    const daysUntil = expiry
      ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    let status: Certification['status'] = 'valid';
    if (!c.verifiedDate && !c.verifiedBy) status = 'pending-verification';
    else if (daysUntil < 0) status = 'expired';
    else if (daysUntil < 60) status = 'expiring-soon';
    return {
      id: c.id,
      staffId: c.staffId || '',
      staffName: c.staff?.user?.name || c.staffName || '',
      certType: c.type || c.certType || '',
      certNumber: c.certNumber || c.number || '',
      issueDate: c.issueDate || c.createdAt || '',
      expiryDate: c.expiryDate || '',
      status: (c.status || status) as Certification['status'],
      daysUntilExpiry: daysUntil,
      documentUrl: c.documentUrl || c.fileUrl || undefined,
    };
  });
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

export interface StaffDocument {
  id: string;
  name: string;
  type: string;
  fileName: string;
  uploadDate: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  expiryDate: string | null;
  required: boolean;
  description: string;
  rejectionReason?: string;
}

export async function getMyDocuments(userId: string): Promise<StaffDocument[]> {
  const res = await api.get(`/staff/documents?userId=${userId}`);
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((d: any) => ({
    id: d.id,
    name: d.name || d.title || 'Document',
    type: d.type || 'other',
    fileName: d.fileName || d.fileUrl || '',
    uploadDate: d.uploadDate || d.createdAt || '',
    status: (d.status || 'pending').toLowerCase() as StaffDocument['status'],
    expiryDate: d.expiryDate || null,
    required: d.required ?? false,
    description: d.description || '',
    rejectionReason: d.rejectionReason || undefined,
  }));
}

// ─── STAFF REVIEWS ────────────────────────────────────────────────────────────

export interface StaffReview {
  id: string;
  rating: number;
  review: string;
  clientName: string;
  eventName: string;
  date: string;
  punctuality?: number;
  professionalism?: number;
  qualityOfWork?: number;
  communication?: number;
}

export async function getMyReviews(userId: string): Promise<StaffReview[]> {
  const res = await api.get(`/staff/${userId}/reviews`);
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((r: any) => ({
    id: r.id,
    rating: r.rating || 0,
    review: r.review || r.comment || '',
    clientName: r.client?.user?.name || r.clientName || '',
    eventName: r.event?.title || r.eventName || '',
    date: r.date || r.createdAt || '',
    punctuality: r.punctuality,
    professionalism: r.professionalism,
    qualityOfWork: r.qualityOfWork,
    communication: r.communication,
  }));
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export interface StaffAnalyticsSummary {
  totalShifts: number;
  totalHours: number;
  totalEarnings: number;
  avgRating: number;
  punctualityRate: number;
  completionRate: number;
}

export async function getStaffAnalytics(): Promise<StaffAnalyticsSummary | null> {
  try {
    const res = await api.get('/analytics/dashboard');
    const d = res.data;
    return {
      totalShifts: d.totalShifts ?? d.totalEvents ?? 0,
      totalHours: d.totalHours ?? 0,
      totalEarnings: d.totalEarnings ?? d.totalPay ?? 0,
      avgRating: d.avgRating ?? d.rating ?? 0,
      punctualityRate: d.punctualityRate ?? 0,
      completionRate: d.completionRate ?? 0,
    };
  } catch {
    return null;
  }
}

// ─── SUPPORT TICKETS ─────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
  resolutionNotes?: string;
}

export async function getMyTickets(): Promise<SupportTicket[]> {
  const res = await api.get('/support/my');
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((t: any) => ({
    id: t.id,
    subject: t.subject || '',
    category: t.category || '',
    message: t.message || '',
    status: t.status || 'OPEN',
    createdAt: t.createdAt || '',
    resolutionNotes: t.resolutionNotes || undefined,
  }));
}

export async function submitTicket(data: {
  subject: string;
  category: string;
  message: string;
}): Promise<void> {
  await api.post('/support', data);
}
