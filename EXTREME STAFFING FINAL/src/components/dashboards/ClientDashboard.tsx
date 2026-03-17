import { SimplifiedClientDashboard } from "../client/SimplifiedClientDashboard";

interface ClientDashboardProps {
  userId: string;
}

export function ClientDashboard({ userId }: ClientDashboardProps) {
  return <SimplifiedClientDashboard clientId={userId} />;
}