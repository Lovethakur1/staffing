import { useState, useEffect } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { eventData } from "../data/eventData";
import { 
  Button 
} from "../components/ui/button";
import { 
  Badge 
} from "../components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { 
  Avatar, 
  AvatarFallback 
} from "../components/ui/avatar";
import { 
  Separator 
} from "../components/ui/separator";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  LogOut, 
  DollarSign, 
  Navigation,
  Battery,
  Signal,
  ArrowLeft,
  Calendar,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { RouteMap } from "../components/map/RouteMap";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../components/ui/dialog";

interface EventStaffDetailProps {
  userRole?: string;
}

export function EventStaffDetail({ userRole }: EventStaffDetailProps) {
  const { pageParams, goBack } = useNavigation();
  const staffId = pageParams?.staffId;
  const eventId = pageParams?.eventId;

  const [staff, setStaff] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showForceCheckoutConfirm, setShowForceCheckoutConfirm] = useState(false);
  const [checkoutReason, setCheckoutReason] = useState("");

  // Mock fetching data
  useEffect(() => {
    // In a real app, fetch from API
    // Here we simulate finding the data from our static sets or passed params
    
    // Find event
    const foundEvent = eventData.find(e => e.id === eventId) || eventData[0];
    setEvent(foundEvent);

    // Find staff (mock logic since we don't have a global staff store easily accessible in this context without props)
    // We will rely on what we might have passed or just use the mock staff list from AdminEventDetail
    // For this demo, I will recreate the staff list or use a mock staff object if ID matches
    
    // Mock staff list from AdminEventDetail to find the user
    const mockStaffList = [
      {
        id: 's1', name: 'Sarah Martinez', role: 'Bartender', avatar: 'SM', status: 'not-arrived',
        checkInTime: null, hourlyRate: 28, hoursWorked: 0, rating: 4.9, phone: '+1 (555) 234-5678'
      },
      {
        id: 's2', name: 'Michael Chen', role: 'Head Server', avatar: 'MC', status: 'checked-in',
        checkInTime: '5:45 PM', hourlyRate: 32, hoursWorked: 2.5, rating: 4.8, phone: '+1 (555) 345-6789'
      },
      // ... simplified list for demo
    ];

    const foundStaff = mockStaffList.find(s => s.id === staffId) || {
        id: staffId || 's2',
        name: 'Michael Chen',
        role: 'Head Server',
        avatar: 'MC',
        status: 'checked-in',
        checkInTime: '5:45 PM',
        hourlyRate: 32,
        hoursWorked: 2.5,
        rating: 4.8,
        phone: '+1 (555) 345-6789'
    };
    
    setStaff(foundStaff);
    setLoading(false);
  }, [staffId, eventId]);

  if (loading || !staff || !event) {
    return <div className="p-8 text-center">Loading staff details...</div>;
  }

  // Mock Timeline Data specific to this staff member
  const staffTimeline = [
    { time: "5:45 PM", event: "Checked In", location: "Main Entrance", status: "normal" },
    { time: "6:30 PM", event: "Location Ping", location: "Bar Area", status: "normal" },
    { time: "7:15 PM", event: "Started Break", location: "Staff Room", status: "normal" },
    { time: "7:45 PM", event: "Ended Break", location: "Staff Room", status: "normal" },
    { time: "8:30 PM", event: "Location Ping", location: "VIP Section", status: "normal" },
    { time: "9:15 PM", event: "Location Ping", location: "Main Hall", status: "warning" },
  ];

  // Mock GPS Path Data
  const startLocation = { lat: 40.7580, lng: -73.9855, label: "Start" };
  const endLocation = { lat: 40.7590, lng: -73.9865, label: "Current" };

  const handleForceCheckout = () => {
    toast.success("Staff member forcefully checked out", {
        description: `Reason: ${checkoutReason || "Emergency Admin Override"}. System log updated.`
    });
    setStaff({ ...staff, status: 'checked-out' });
    setShowForceCheckoutConfirm(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
        
        {/* Header / Breadcrumb */}
        <div className="px-6 py-4 border-b bg-white flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Event
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Event Staff</span>
                <span className="font-semibold text-sm">{event.name}</span>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Staff Profile Card */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                         <div className="flex items-center gap-5">
                            <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                    {staff.avatar}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{staff.name}</h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary" className="text-sm font-medium px-3 py-1 bg-slate-100 text-slate-700">
                                        {staff.role}
                                    </Badge>
                                    <Badge className={`text-sm px-3 py-1 ${
                                        staff.status === 'checked-in' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                        staff.status === 'not-arrived' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                    }`}>
                                        {staff.status === 'checked-in' ? 'Active On-Site' :
                                         staff.status === 'not-arrived' ? 'Not Arrived' :
                                         'Checked Out'}
                                    </Badge>
                                </div>
                            </div>
                         </div>

                         <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            {staff.status === 'checked-in' && (
                                <Button 
                                    variant="destructive" 
                                    className="shadow-red-100 shadow-lg hover:bg-red-700"
                                    onClick={() => setShowForceCheckoutConfirm(true)}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Force Checkout
                                </Button>
                            )}
                            <div className="flex gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                <span className="flex items-center gap-1.5"><Battery className="w-3.5 h-3.5 text-green-600" /> 84% Battery</span>
                                <div className="w-px h-3 bg-slate-300" />
                                <span className="flex items-center gap-1.5"><Signal className="w-3.5 h-3.5 text-blue-600" /> Strong Signal</span>
                            </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-t bg-slate-50/50">
                        <div className="p-4 text-center">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Check In</div>
                            <div className="font-mono text-lg font-semibold text-slate-700">{staff.checkInTime || "--:--"}</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Duration</div>
                            <div className="font-mono text-lg font-semibold text-slate-700">{staff.hoursWorked}h</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Earnings</div>
                            <div className="font-mono text-lg font-semibold text-green-600">${(staff.hoursWorked * staff.hourlyRate).toFixed(2)}</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Travel Pay</div>
                            <div className="font-mono text-lg font-semibold text-blue-600">$12.50</div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Timeline & Device Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    Device Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3 text-sm">
                                     <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                        <span className="text-muted-foreground">Last Ping</span>
                                        <span className="font-mono font-medium">2 min ago</span>
                                     </div>
                                     <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                        <span className="text-muted-foreground">GPS Accuracy</span>
                                        <span className="font-mono font-medium text-green-600">High (~5m)</span>
                                     </div>
                                     <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                        <span className="text-muted-foreground">App Version</span>
                                        <span className="font-mono font-medium">v2.4.1</span>
                                     </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    Activity Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="relative pl-4 space-y-8 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                                     {staffTimeline.map((item, idx) => (
                                         <div key={idx} className="relative group">
                                             <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ring-2 ring-white transition-all group-hover:scale-110 ${
                                                 item.status === 'warning' ? 'bg-amber-500' : 'bg-primary'
                                             }`}></div>
                                             
                                             <div className="flex flex-col gap-1">
                                                 <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-900">{item.event}</span>
                                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">{item.time}</span>
                                                 </div>
                                                 <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                     <MapPin className="w-3 h-3" />
                                                     {item.location}
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Live Map */}
                    <div className="lg:col-span-2">
                         <Card className="h-full min-h-[500px] flex flex-col overflow-hidden border-none shadow-md ring-1 ring-slate-200">
                            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-semibold border border-white/50 text-primary flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live Location History
                            </div>
                            <div className="w-full h-full bg-slate-100">
                                <RouteMap 
                                    startLocation={startLocation}
                                    endLocation={endLocation}
                                    className="w-full h-full"
                                    provider="leaflet"
                                    showControls={true}
                                />
                            </div>
                         </Card>
                    </div>

                </div>
            </div>
        </div>

        {/* Force Checkout Dialog */}
        <Dialog open={showForceCheckoutConfirm} onOpenChange={setShowForceCheckoutConfirm}>
            <DialogContent className="sm:max-w-md border-destructive/20 shadow-destructive/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Force Checkout Confirmation
                    </DialogTitle>
                    <DialogDescription>
                        You are about to manually check out <strong>{staff.name}</strong>.
                        This action will override the staff member's device status.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 my-2">
                    <strong>Disclaimer:</strong> Only use this feature in emergencies (e.g., lost phone, battery dead, or abandoning shift). 
                    The system will log this administrative action.
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for override:</label>
                    <select 
                        className="w-full p-2 border rounded-md text-sm"
                        value={checkoutReason}
                        onChange={(e) => setCheckoutReason(e.target.value)}
                    >
                        <option value="">Select a reason...</option>
                        <option value="phone_issue">Phone Lost / Battery Dead</option>
                        <option value="abandoned">Abandoned Shift</option>
                        <option value="forgot_checkout">Forgot to Checkout</option>
                        <option value="emergency">Medical / Personal Emergency</option>
                    </select>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => setShowForceCheckoutConfirm(false)}>Cancel</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleForceCheckout}
                        disabled={!checkoutReason}
                    >
                        Confirm Checkout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}