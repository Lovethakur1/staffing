import { UnifiedChatSystem } from "../communication/UnifiedChatSystem";

interface CommunicationCenterProps {
  userId?: string;
  userName?: string;
  managerId?: string;
  events?: any[];
}

export function CommunicationCenter({ userId, managerId, userName = "Manager User" }: CommunicationCenterProps) {
  return (
    <div className="h-[calc(100vh-200px)]">
      <UnifiedChatSystem 
        userRole="manager" 
        userId={userId || managerId || ''}
        userName={userName}
      />
    </div>
  );
}
