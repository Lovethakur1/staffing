import { UnifiedChatSystem } from "../communication/UnifiedChatSystem";

interface CommunicationCenterProps {
  userId?: string;
  userName?: string;
  clientId?: string;
}

export function CommunicationCenter({ userId, clientId, userName = "Client User" }: CommunicationCenterProps) {
  return (
    <div className="h-[calc(100vh-200px)]">
      <UnifiedChatSystem 
        userRole="client" 
        userId={userId || clientId || ''}
        userName={userName}
      />
    </div>
  );
}
