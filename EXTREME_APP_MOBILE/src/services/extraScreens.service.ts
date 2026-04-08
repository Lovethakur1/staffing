/**
 * Shared API service for the new drawer screens.
 * Mirrors financeService, staffService, supportService, analyticsService from the web app.
 */
import api from '../config/api';

// ─── TIMESHEETS ──────────────────────────────────────────────────────────────

export interface Timesheet {
  id: string;
  weekEnding: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected' | 'pending';
  totalHours: number;
  regularHours: number;
  grossPay: number;
  staffName: string;
  eventName: string;
}

export async function getTimesheets(): Promise<Timesheet[]> {
  const res = await api.get('/finance/timesheets');
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((ts: any) => {
    const hours = ts.totalHours || 0;
    const rate = ts.shift?.hourlyRate || 0;
    return {
      id: ts.id,
      weekEnding: ts.shift?.date ? new Date(ts.shift.date).toLocaleDateString() : (ts.clockInTime ? ts.clockInTime.split('T')[0] : ''),
      status: (ts.status || 'draft').toLowerCase() as Timesheet['status'],
      totalHours: hours,
      regularHours: ts.regularHours || hours,
      grossPay: ts.grossPay || (hours * rate),
      staffName: ts.staff?.name || '',
      eventName: ts.shift?.event?.title || '',
    };
  });
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
  const res = await api.get('/staff/me/payroll');
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((r: any) => ({
    id: r.id || r.payrollRunId || '',
    period: r.period || `${r.periodStart?.split('T')[0] ?? '—'} → ${r.periodEnd?.split('T')[0] ?? '—'}`,
    staffCount: 1,
    totalAmount: r.netPay ?? r.grossPay ?? r.totalAmount ?? 0,
    processedBy: r.processor?.name || r.processedBy || 'Payroll',
    status: (r.status || 'draft').toLowerCase(),
    createdAt: r.createdAt?.split('T')[0] || r.periodEnd?.split('T')[0] || '',
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

export async function getCertifications(userId?: string): Promise<Certification[]> {
  let raw: any[];
  if (userId) {
    const res = await api.get(`/staff/${userId}/certifications`);
    raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  } else {
    // Fall back to dashboard which always includes certifications for the current user
    const res = await api.get('/staff/me/dashboard');
    raw = res.data?.certifications || [];
  }
  return raw.map((c: any) => {
    const expiry = c.expiryDate ? new Date(c.expiryDate) : null;
    const now = new Date();
    const daysUntil = expiry
      ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    let status: Certification['status'] = 'valid';
    if (!c.verified) status = 'pending-verification';
    else if (daysUntil < 0) status = 'expired';
    else if (daysUntil < 60) status = 'expiring-soon';
    return {
      id: c.id,
      staffId: c.staffId || '',
      staffName: c.staff?.user?.name || c.staffName || '',
      certType: c.name || c.type || c.certType || '',
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
  fileUrl: string;
  uploadDate: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  expiryDate: string | null;
  required: boolean;
  description: string;
  rejectionReason?: string;
}

export async function getMyDocuments(userId: string): Promise<StaffDocument[]> {
  const res = await api.get(`/staff/${userId}/documents`);
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((d: any) => ({
    id: d.id,
    name: d.name || d.title || 'Document',
    type: (d.category || d.type || 'other').toLowerCase(),
    fileName: d.fileName || d.fileUrl?.split('/').pop() || '',
    fileUrl: d.fileUrl || '',
    uploadDate: d.uploadDate || d.createdAt || '',
    status: (d.status || 'pending').toLowerCase() as StaffDocument['status'],
    expiryDate: d.expiryDate || d.expiresAt || null,
    required: d.required ?? false,
    description: d.description || d.notes || '',
    rejectionReason: d.rejectionReason || (d.notes && d.status === 'REJECTED' ? d.notes : undefined),
  }));
}

/**
 * Step 1: Upload the raw file to the server.
 * Returns the fileUrl, size, and mimeType from the server.
 */
export async function uploadFileToServer(file: {
  uri: string;
  name: string;
  mimeType?: string;
}): Promise<{ url: string; size: number; mimeType: string }> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as any);

  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { url, originalName, filename, size, mimeType }
}

/**
 * Step 2: Create a document record linked to the uploaded file.
 */
export async function createDocumentRecord(data: {
  name: string;
  category: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<void> {
  await api.post('/staff/documents', data);
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
  const res = await api.get(`/reviews/staff/${userId}`);
  const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
  return raw.map((r: any) => ({
    id: r.id,
    rating: r.rating || 0,
    review: r.feedback || r.review || r.comment || '',
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
  skills: string[];
  certTotal: number;
  certValid: number;
}

export async function getStaffAnalytics(): Promise<StaffAnalyticsSummary | null> {
  try {
    // Use staff dashboard endpoint which contains all stats for the current user
    const res = await api.get('/staff/me/dashboard');
    const d = res.data;
    const stats = d?.stats || {};
    const shifts = d?.shifts || {};
    const completedShifts = shifts.recent?.filter((s: any) => s.status === 'COMPLETED') || [];
    const totalHours = completedShifts.reduce((sum: number, s: any) => sum + (s.totalHours || 0), 0);
    const certs = Array.isArray(d?.certifications) ? d.certifications : [];
    const certValid = certs.filter((c: any) => c.verified && (!c.expiryDate || new Date(c.expiryDate) > new Date())).length;
    return {
      totalShifts: stats.completedShifts ?? stats.totalEvents ?? 0,
      totalHours: totalHours,
      totalEarnings: stats.totalEarnings ?? 0,
      avgRating: stats.rating ?? 0,
      punctualityRate: stats.completedShifts > 0 ? Math.round((stats.completedShifts / Math.max(stats.completedShifts + stats.pendingRequests, 1)) * 100) : 0,
      completionRate: stats.completedShifts > 0 ? Math.round((stats.completedShifts / Math.max(stats.completedShifts + stats.pendingRequests, 1)) * 100) : 0,
      skills: d?.profile?.skills || [],
      certTotal: certs.length,
      certValid,
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
