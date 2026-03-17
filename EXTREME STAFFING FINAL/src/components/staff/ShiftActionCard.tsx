import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  MapPin, 
  Clock, 
  Play, 
  CheckCircle, 
  Coffee, 
  Car, 
  Loader2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { cn } from "../ui/utils";
import { RouteMap } from "../map/RouteMap";

export type ShiftDetailedStatus = 
  | 'idle' 
  | 'traveling_to' 
  | 'arrived_venue' 
  | 'working' 
  | 'on_break' 
  | 'checked_out' 
  | 'traveling_home' 
  | 'completed';

interface ShiftActionCardProps {
  shift: any; 
  onStatusUpdate: (status: ShiftDetailedStatus, data?: any) => void;
  isTravelReimbursable?: boolean;
}

const MOCK_VENUE_COORDS = { lat: 40.7580, lng: -73.9855, label: "Event Venue" };
const MOCK_START_COORDS = { lat: 40.7829, lng: -73.9654, label: "My Location" };

export function ShiftActionCard({ 
  shift, 
  onStatusUpdate, 
  isTravelReimbursable = true
}: ShiftActionCardProps) {
  // State
  const [status, setStatus] = useState<ShiftDetailedStatus>(shift?.status || 'idle');
  
  // View Control
  // IMPORTANT: 'active_map' triggers the full screen overlay
  const [showMap, setShowMap] = useState(false);
  
  const [timers, setTimers] = useState({
    travelTo: shift?.travelTime || 0,
    work: shift?.workTime || 0,
    break: shift?.breakTime || 0,
    travelHome: shift?.travelHomeTime || 0
  });

  // Effects
  useEffect(() => {
    // Auto-open map if in travel state on mount or status change
    if (status === 'traveling_to' || status === 'traveling_home') {
      setShowMap(true);
    }
  }, [status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'traveling_to' || status === 'working' || status === 'on_break' || status === 'traveling_home') {
        const key = status === 'traveling_to' ? 'travelTo' : 
                   status === 'working' ? 'work' : 
                   status === 'on_break' ? 'break' : 'travelHome';
        
        interval = setInterval(() => {
            setTimers(t => ({ ...t, [key]: t[key] + 1 }));
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleStartTravelClick = () => {
    // Instant Map Open
    setShowMap(true);
    // Optional: Only change status if not already traveling?
    // For demo flow: changing status starts the timer
    setStatus('traveling_to');
    onStatusUpdate('traveling_to');
    toast.success("Travel started");
  };

  const checkIn = () => {
    setStatus('working');
    setShowMap(false);
    onStatusUpdate('working');
    toast.success("Clocked in!");
  };

  // Render Helpers
  const renderStatusBadge = () => {
     // (Same logic as before, simplified for brevity)
     return <Badge>{status}</Badge>; 
  };

  // The Overlay Component
  const MapOverlay = () => (
    <div className="fixed inset-0 z-[99999] bg-white">
        {/* The RouteMap component takes over the whole screen */}
        <RouteMap 
            startLocation={MOCK_START_COORDS} 
            endLocation={MOCK_VENUE_COORDS} 
            className="w-full h-full"
            // We can pass an onClose handler if we want a way to exit manually
        />
        
        {/* Floating Action Button (FAB) for simulation controls */}
        {/* We place this *on top* of the map UI */}
        <div className="absolute bottom-8 left-0 right-0 z-[100001] flex justify-center pointer-events-none">
             <div className="bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-4 w-[90%] max-w-md pointer-events-auto border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {status === 'traveling_to' ? 'Travel Time' : 'Return Trip'}
                    </p>
                    <p className="text-3xl font-mono font-bold text-slate-800">
                      {formatTime(status === 'traveling_to' ? timers.travelTo : timers.travelHome)}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                     <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                {status === 'traveling_to' && (
                   <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg font-bold shadow-md" onClick={() => {
                       setStatus('arrived_venue');
                       setShowMap(false);
                       onStatusUpdate('arrived_venue', { travelTime: timers.travelTo });
                   }}>
                     <MapPin className="w-5 h-5 mr-2" />
                     Arrived at Venue
                   </Button>
                )}
                
                {status === 'traveling_home' && (
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-md" onClick={() => {
                        setStatus('completed');
                        setShowMap(false);
                        onStatusUpdate('completed', { travelHomeTime: timers.travelHome });
                    }}>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Finish Shift
                    </Button>
                )}
             </div>
        </div>
    </div>
  );

  return (
    <>
      <Card className="border-l-4 border-l-[#5E1916] shadow-md overflow-hidden relative">
        <CardHeader className="pb-3 bg-slate-50/50">
          <div className="flex justify-between items-center">
             <CardTitle className="text-lg">{shift.eventTitle || "Current Event"}</CardTitle>
             {renderStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
           {/* Simple Status Display when not in map */}
           {status !== 'idle' && (
               <div className="text-center p-4 bg-slate-50 rounded-lg">
                   <p className="text-sm text-muted-foreground uppercase">Current Timer</p>
                   <p className="text-2xl font-mono font-bold">
                       {formatTime(
                           status === 'traveling_to' ? timers.travelTo :
                           status === 'working' ? timers.work :
                           status === 'on_break' ? timers.break :
                           timers.travelHome
                       )}
                   </p>
               </div>
           )}

           {/* Buttons */}
           {status === 'idle' && (
             <div className="space-y-2">
               <Button className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700" onClick={handleStartTravelClick}>
                 <Navigation className="w-5 h-5 mr-2" />
                 Start Travel
               </Button>
               <Button variant="outline" className="w-full" onClick={checkIn}>
                 Skip Travel & Clock In
               </Button>
             </div>
           )}
           
           {status === 'arrived_venue' && (
               <Button className="w-full h-14 text-lg bg-[#5E1916]" onClick={checkIn}>
                   Clock In Now
               </Button>
           )}

           {status === 'working' && (
               <Button variant="destructive" className="w-full h-14" onClick={() => {
                   setStatus('checked_out');
                   onStatusUpdate('checked_out');
               }}>
                   Clock Out
               </Button>
           )}
           
           {status === 'checked_out' && (
               <Button className="w-full h-14 bg-blue-600" onClick={() => {
                   setStatus('traveling_home');
                   setShowMap(true);
                   onStatusUpdate('traveling_home');
               }}>
                   Start Travel Home
               </Button>
           )}
           
           {status === 'completed' && (
               <div className="text-center text-green-600 font-bold p-4">Shift Completed!</div>
           )}

        </CardContent>
      </Card>
      
      {/* PORTAL FOR MAP */}
      {showMap && createPortal(<MapOverlay />, document.body)}
    </>
  );
}