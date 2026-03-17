import { useNavigation } from "../contexts/NavigationContext";
import { ClientDashboard } from "../components/dashboards/ClientDashboard";
import { StaffDashboard } from "../components/dashboards/StaffDashboard";
import { SuperAdminCommandCenter } from "../components/admin/SuperAdminCommandCenter";
import { Manager } from "./Manager";

interface DashboardProps {
  userRole: string;
  userId: string;
}

export function Dashboard({ userRole, userId }: DashboardProps) {
  const { currentPage } = useNavigation();

  // Return the appropriate dashboard based on user role
  switch (userRole) {
    case "client":
      return <ClientDashboard userId={userId} />;
    case "staff":
      return <StaffDashboard userId={userId} />;
    case "admin":
      return <SuperAdminCommandCenter />;
    case "manager":
      return <Manager userRole={userRole} userId={userId} />;
    default:
      return <ClientDashboard userId={userId} />;
  }
}