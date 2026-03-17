import { ComprehensiveAdminDashboard } from "./ComprehensiveAdminDashboard";

interface AdminDashboardProps {
  adminId: string;
}

export function AdminDashboard({ adminId }: AdminDashboardProps) {
  return <ComprehensiveAdminDashboard adminId={adminId} />;
}
