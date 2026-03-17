import { useNavigation } from "../contexts/NavigationContext";
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
    case "staff":
      return <StaffDashboard userId={userId} />;
    case "admin":
      return <SuperAdminCommandCenter />;
    case "manager":
      return <Manager userRole={userRole} userId={userId} />;
    default:
      return <StaffDashboard userId={userId} />;
  }
}