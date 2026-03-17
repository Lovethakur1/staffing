import { UnifiedChatSystem } from "../communication/UnifiedChatSystem";

interface CommunicationCenterProps {
  userId: string;
  userName?: string;
}

export function CommunicationCenter({ userId, userName = "Client User" }: CommunicationCenterProps) {
  return (
    <div className="h-[calc(100vh-200px)]">
      <UnifiedChatSystem 
        userRole="client" 
        userId={userId}
        userName={userName}
      />
    </div>
  );
}
