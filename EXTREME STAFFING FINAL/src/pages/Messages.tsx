import { UnifiedChatSystem } from "../components/communication/UnifiedChatSystem";

interface MessagesProps {
  userRole: string;
  userId: string;
}

export function Messages({ userRole, userId }: MessagesProps) {
  // Get user name based on role and ID
  const getUserName = () => {
    if (userRole === 'admin') return 'Admin User';
    if (userRole === 'manager') return 'Manager User';
    if (userRole === 'client') return 'Client User';
    if (userRole === 'staff') return 'Staff User';
    return 'User';
  };

  return (
    <div className="h-full">
      <UnifiedChatSystem 
        userRole={userRole} 
        userId={userId}
        userName={getUserName()}
      />
    </div>
  );
}
