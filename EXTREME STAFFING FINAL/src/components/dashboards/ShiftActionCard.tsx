import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { 
  MapPin, 
  Clock, 
  Play, 
  CheckCircle, 
  Navigation, 
  Home, 
  Car,
  Bike,
  Train,
  Bus,
  Footprints,
  Coffee,
  Loader2,
  ArrowRight,
  Smartphone
} from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";
import { toast } from "sonner";
import { Shift } from "../../data/mockData";
import { RouteMap } from "../map/RouteMap";
import { cn } from "../ui/utils";

export type ShiftDetailedStatus = 
  | 'scheduled'
  | 'traveling_to'
  | 'arrived_at_event'
  | 'working'
  | 'on_break'
  | 'checked_out'
  | 'ready_to_return'
  | 'traveling_back'
  | 'completed';

interface ShiftActionCardProps {
  shift: Shift;
  onStatusUpdate?: (status: ShiftDetailedStatus, data?: any) => void;
  isTravelReimbursable?: boolean;
}

// Fixed Coordinates
const VENUE_COORDS = { lat: 40.7580, lng: -73.9855, label: "Times Square Venue" };
const DEFAULT_HOME_COORDS = { lat: 40.7829, lng: -73.9654, label: "My Home" };

export function ShiftActionCard({ shift, onStatusUpdate, isTravelReimbursable = true }: ShiftActionCardProps) {
  const { 
    currentShiftStatus, 
    currentTimer,
    startTravel,
    arrivedAtEvent,
    checkInShift,
    startBreak,
    endBreak,
    checkOutShift,
    startReturnTravel,
    arrivedHome,
    finalizeShift
  } = useAppState();

  const [locationLoading, setLocationLoading] = useState(false);
  const [showClockOutSummary, setShowClockOutSummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [transportMode, setTransportMode] = useState<'car'|'bike'|'transit'|'bus'|'walk'>('car');
  
  // Simulation State
  const [simulatedTimeDisplay, setSimulatedTimeDisplay] = useState("00:00:00");
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Device Detection
  const [isMobile, setIsMobile] = useState(false);

  // Return Preference State
  const [showReturnPrefDialog, setShowReturnPrefDialog] = useState(false);
  const [returnLocationType, setReturnLocationType] = useState<'same' | 'different'>('same');
  const [customReturnAddress, setCustomReturnAddress] = useState('');
  const [confirmedReturnCoords, setConfirmedReturnCoords] = useState(DEFAULT_HOME_COORDS);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Map context status to local display logic
  const getDisplayStatus = (): ShiftDetailedStatus => {
    switch (currentShiftStatus) {
      case 'traveling-to': return 'traveling_to';
      case 'arrived': return 'arrived_at_event';
      case 'in-progress': return 'working';
      case 'break': return 'on_break';
      case 'ready-to-return': return 'ready_to_return';
      case 'traveling-back': return 'traveling_back';
      case 'completed': return 'completed';
      default: return 'scheduled';
    }
  };

  const status = getDisplayStatus();

  // Watch for status changes
  useEffect(() => {
    if (status === 'ready_to_return') {
      setShowClockOutSummary(true);
    } else if (status === 'completed') {
      setShowFinalSummary(true);
    }
    
    // Auto-open map for travel states if logic demands it
    if ((status === 'traveling_to' || status === 'traveling_back') && !showMap) {
        setShowMap(true);
        setIsNavigating(true);
    }
  }, [status]);

  // Handle Simulation Timer
  useEffect(() => {
    if (isNavigating && !hasArrived) {
        let elapsedSeconds = 0;
        const totalDuration = 25 * 60; // 25 minutes target
        const animationDuration = 5; // 5 seconds real time
        const step = totalDuration / (animationDuration * 20); // updates per 50ms

        simulationIntervalRef.current = setInterval(() => {
            elapsedSeconds += step;
            if (elapsedSeconds >= totalDuration) elapsedSeconds = totalDuration;
            
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = Math.floor(elapsedSeconds % 60);
            setSimulatedTimeDisplay(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 50);
    } else {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    }

    return () => {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isNavigating, hasArrived]);

  // --- Handlers ---

  const handleStartTravelClick = () => {
    setIsNavigating(false);
    setShowReturnPrefDialog(true);
  };

  const confirmReturnPreference = () => {
    if (returnLocationType === 'different' && customReturnAddress) {
        setConfirmedReturnCoords({
            lat: 40.7484, 
            lng: -73.9857,
            label: customReturnAddress
        });
        toast.success(`Return location set to: ${customReturnAddress}`);
    } else {
        setConfirmedReturnCoords(DEFAULT_HOME_COORDS);
    }
    setShowReturnPrefDialog(false);
    setShowMap(true);
  };

  const startNavigation = () => {
      if (!isMobile) {
          toast.error("Please open on mobile to start navigation");
          return;
      }
      setIsNavigating(true);
      setHasArrived(false);
      setSimulatedTimeDisplay("00:00:00");
      
      if (status === 'scheduled') {
          startTravel(shift.id);
      } else if (status === 'ready_to_return') {
          startReturnTravel(shift.id);
      }
  };

  const handleActionWithLocation = (callback: () => void) => {
    setLocationLoading(true);
    setTimeout(() => {
        setLocationLoading(false);
        callback();
        setShowMap(false);
        setIsNavigating(false); 
    }, 1500);
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'traveling_to': return <Badge className="bg-blue-100 text-blue-800 animate-pulse"><Car className="w-3 h-3 mr-1"/> Traveling</Badge>;
      case 'arrived_at_event': return <Badge className="bg-purple-100 text-purple-800"><MapPin className="w-3 h-3 mr-1"/> Arrived</Badge>;
      case 'working': return <Badge className="bg-green-100 text-green-800 animate-pulse"><Activity className="w-3 h-3 mr-1"/> Working</Badge>;
      case 'on_break': return <Badge className="bg-amber-100 text-amber-800"><Coffee className="w-3 h-3 mr-1"/> On Break</Badge>;
      case 'ready_to_return': return <Badge className="bg-orange-100 text-orange-800"><Home className="w-3 h-3 mr-1"/> Returning</Badge>;
      case 'traveling_back': return <Badge className="bg-blue-100 text-blue-800 animate-pulse"><Car className="w-3 h-3 mr-1"/> Returning</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Done</Badge>;
      default: return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  let mapStart = DEFAULT_HOME_COORDS;
  let mapEnd = VENUE_COORDS;
  const isReturnTrip = status === 'ready_to_return' || status === 'traveling_back';
  if (isReturnTrip) {
      mapStart = VENUE_COORDS;
      mapEnd = confirmedReturnCoords;
  }

  return (
    <>
      <Card className="border-t-4 border-t-primary shadow-md">
        <CardHeader className="pb-3 bg-muted/20">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Shift Status
                {renderStatusBadge()}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{shift.eventTitle}</p>
            </div>
            {status !== 'scheduled' && status !== 'ready_to_return' && status !== 'completed' && (
               <div className="text-right">
                 <div className="text-2xl font-mono font-bold text-primary">{currentTimer}</div>
               </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            {status === 'scheduled' && (
              <Button className="w-full bg-[#5E1916] hover:bg-[#4a1311] text-white shadow-lg h-12 text-md" onClick={handleStartTravelClick}>
                <Car className="w-5 h-5 mr-2" /> Start Travel Flow
              </Button>
            )}
            
            {status === 'traveling_to' && !showMap && (
               <Button variant="outline" className="w-full border-primary text-primary" onClick={() => { setShowMap(true); setIsNavigating(true); }}>
                  <Navigation className="w-5 h-5 mr-2" /> Open Live Navigation
               </Button>
            )}

            {status === 'arrived_at_event' && (
               <Button className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={() => checkInShift(shift.id, shift.staffId)}>
                  <Play className="w-5 h-5 mr-2" /> Confirm Clock In
               </Button>
            )}

            {status === 'working' && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={startBreak}><Coffee className="w-4 h-4 mr-2" /> Break</Button>
                <Button variant="destructive" onClick={() => checkOutShift(shift.id, shift.staffId)}><Clock className="w-4 h-4 mr-2" /> Clock Out</Button>
              </div>
            )}

            {status === 'on_break' && <Button className="w-full bg-green-600" onClick={endBreak}>Resume Work</Button>}
            
            {status === 'ready_to_return' && (
               <Button className="w-full bg-[#5E1916]" size="lg" onClick={() => { setShowMap(true); setIsNavigating(false); }}>
                 <Home className="w-5 h-5 mr-2" /> Start Return Trip
               </Button>
            )}

            {status === 'completed' && <div className="p-3 bg-green-50 text-green-800 rounded-lg text-center font-medium">Shift Complete</div>}
          </div>
        </CardContent>
      </Card>

      {/* --- RETURN PREFERENCE DIALOG --- */}
      <Dialog open={showReturnPrefDialog} onOpenChange={setShowReturnPrefDialog}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Return Destination</DialogTitle>
             <DialogDescription>Confirm your post-shift destination for accurate reimbursement.</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
              <RadioGroup defaultValue="same" onValueChange={(v) => setReturnLocationType(v as any)} className="gap-3">
                 <div className={cn("flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50", returnLocationType === 'same' ? "border-[#5E1916] bg-[#5E1916]/5" : "border-gray-200")}>
                    <RadioGroupItem value="same" id="same" className="mt-1" />
                    <Label htmlFor="same" className="cursor-pointer w-full">
                        <div className="font-semibold text-gray-900">Start Location</div>
                        <div className="text-xs text-gray-500 mt-1">{DEFAULT_HOME_COORDS.label}</div>
                    </Label>
                 </div>
                 <div className={cn("flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50", returnLocationType === 'different' ? "border-[#5E1916] bg-[#5E1916]/5" : "border-gray-200")}>
                    <RadioGroupItem value="different" id="different" className="mt-1" />
                    <Label htmlFor="different" className="cursor-pointer w-full">
                        <div className="font-semibold text-gray-900">Different Location</div>
                        {returnLocationType === 'different' && (
                            <Input 
                                placeholder="Enter address..." 
                                value={customReturnAddress}
                                onChange={(e) => setCustomReturnAddress(e.target.value)}
                                className="mt-2 h-9 bg-white"
                                autoFocus
                            />
                        )}
                    </Label>
                 </div>
              </RadioGroup>
           </div>
           <DialogFooter>
             <Button variant="ghost" onClick={() => setShowReturnPrefDialog(false)}>Cancel</Button>
             <Button onClick={confirmReturnPreference} className="bg-[#5E1916] hover:bg-[#4a1311]">Continue</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- FULLSCREEN MAP PORTAL --- */}
      {showMap && createPortal(
        <div className="fixed inset-0 z-[99999] bg-white w-screen h-screen flex flex-col font-sans">
            
            {/* Top Navigation HUD (Custom for Mobile) */}
            {isNavigating && !hasArrived && isMobile && (
                <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none flex justify-center">
                    <div className="bg-[#1a1a1a]/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl pointer-events-auto flex items-center gap-4 animate-in slide-in-from-top-4 border border-white/10">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="font-bold tracking-wide text-sm">Navigating to Venue...</span>
                    </div>
                </div>
            )}

            {/* The Map */}
            <div className="flex-1 w-full relative">
                <RouteMap 
                    startLocation={mapStart} 
                    endLocation={mapEnd} 
                    className="w-full h-full"
                    provider="leaflet"
                    onClose={() => setShowMap(false)}
                    showControls={!isNavigating || !isMobile} // Hide controls in active nav on mobile
                    simulateNavigation={isNavigating && !hasArrived && isMobile}
                    onReachDestination={() => {
                        setHasArrived(true);
                        setSimulatedTimeDisplay("00:25:00"); // Final "accurate" time
                    }}
                />
            </div>
            
            {/* Bottom Sheet / Floating Card */}
            {isMobile ? (
                 // MOBILE VIEW
                 <div className="absolute bottom-0 left-0 right-0 z-[1001] p-4 pb-8 pointer-events-none">
                     <div className="bg-white shadow-[0_8px_40px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-12 duration-500 ease-out max-w-lg mx-auto border border-gray-100">
                        
                        {!isNavigating ? (
                            // PREVIEW MODE UI
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Choose Route</h2>
                                        <p className="text-gray-500 text-xs mt-1"> Fastest route • Traffic is light</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-[#5E1916]">25</span>
                                        <span className="text-xs text-gray-500 font-medium ml-1">min</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-2 px-2">
                                    {[
                                        { id: 'car', icon: Car, label: 'Drive', time: '25m' },
                                        { id: 'transit', icon: Train, label: 'Subway', time: '35m' },
                                        { id: 'bus', icon: Bus, label: 'Bus', time: '40m' },
                                        { id: 'bike', icon: Bike, label: 'Bike', time: '45m' },
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setTransportMode(mode.id as any)}
                                            className={cn(
                                                "snap-start flex flex-col items-center justify-center p-3 min-w-[80px] h-[80px] rounded-2xl border transition-all",
                                                transportMode === mode.id 
                                                    ? "bg-[#5E1916] text-white border-[#5E1916] shadow-lg" 
                                                    : "bg-gray-50 text-gray-600 border-transparent"
                                            )}
                                        >
                                            <mode.icon className="w-6 h-6 mb-1" />
                                            <div className="text-[10px] font-bold">{mode.time}</div>
                                        </button>
                                    ))}
                                </div>

                                <Button 
                                    className="w-full h-14 text-lg font-bold bg-[#5E1916] hover:bg-[#4a1311] rounded-2xl shadow-xl flex items-center justify-between px-6 group transition-all"
                                    onClick={startNavigation}
                                >
                                    <span>Start Navigation</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        ) : (
                            // ACTIVE NAVIGATION UI
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time Elapsed</p>
                                        <p className={cn("text-4xl font-mono font-black tracking-tight", hasArrived ? "text-purple-600" : "text-gray-900")}>
                                            {simulatedTimeDisplay}
                                        </p>
                                    </div>
                                    <div className={cn("px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider", hasArrived ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")}>
                                        {hasArrived ? 'Arrived' : 'En Route'}
                                    </div>
                                </div>
                                
                                {hasArrived ? (
                                    <Button 
                                        className="w-full h-14 text-lg font-bold bg-[#5E1916] hover:bg-[#4a1311] rounded-2xl shadow-lg animate-in zoom-in-95" 
                                        onClick={() => {
                                            handleActionWithLocation(() => {
                                                if (isReturnTrip) arrivedHome(shift.id);
                                                else arrivedAtEvent(shift.id);
                                            });
                                        }}
                                        disabled={locationLoading}
                                    >
                                        {locationLoading ? <Loader2 className="animate-spin mr-2" /> : <MapPin className="mr-2" />}
                                        {isReturnTrip ? "I've Arrived Home" : "I've Arrived at Venue"}
                                    </Button>
                                ) : (
                                    <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                                         <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                         <span className="text-sm font-medium text-gray-500">Updating location...</span>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>
                 </div>
            ) : (
                // DESKTOP VIEW (Preview Only)
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-6 border border-white/20 text-center mx-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone className="w-6 h-6 text-gray-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Mobile Navigation Required</h3>
                        <p className="text-gray-500 text-sm mt-2 mb-6 leading-relaxed">
                            To ensure accurate GPS tracking and turn-by-turn navigation, please open the Staff App on your mobile device.
                        </p>
                        
                        <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-100 text-left">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase">Est. Time</div>
                                <div className="text-lg font-bold text-gray-900">25 min</div>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase">Distance</div>
                                <div className="text-lg font-bold text-gray-900">4.2 mi</div>
                            </div>
                        </div>

                        <Button variant="outline" className="mt-6 w-full" onClick={() => setShowMap(false)}>
                            Close Map Preview
                        </Button>
                    </div>
                </div>
            )}
        </div>,
        document.body
      )}

      {/* --- UTILITY DIALOGS --- */}
      <Dialog open={showClockOutSummary} onOpenChange={setShowClockOutSummary}>
        <DialogContent>
            <DialogHeader><DialogTitle>Shift Complete</DialogTitle><DialogDescription>Great work! Prepare for your return trip.</DialogDescription></DialogHeader>
            <DialogFooter><Button onClick={() => setShowClockOutSummary(false)}>Proceed</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showFinalSummary} onOpenChange={setShowFinalSummary}>
         <DialogContent>
             <DialogHeader><DialogTitle>Trip Summary</DialogTitle><DialogDescription>Your travel has been logged.</DialogDescription></DialogHeader>
             <DialogFooter><Button onClick={() => {setShowFinalSummary(false); finalizeShift();}}>Close Session</Button></DialogFooter>
         </DialogContent>
      </Dialog>
    </>
  );
}

function Activity(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  );
}