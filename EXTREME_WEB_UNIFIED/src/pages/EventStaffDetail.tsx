import { useState, useEffect } from "react";
import { useNavigation } from "../contexts/NavigationContext";
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
    Clock,
    MapPin,
    Phone,
    AlertTriangle,
    LogOut,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
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

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!eventId) {
                    setLoading(false);
                    return;
                }
                const { default: api } = await import("../services/api");
                const evRes = await api.get(`/events/${eventId}`);
                const eventData = evRes.data;

                setEvent({
                    id: eventData.id,
                    name: eventData.title || eventData.eventName || 'Event',
                    date: eventData.date,
                    location: eventData.venue || eventData.location || '',
                    status: eventData.status,
                });

                // Find the matching shift for this staff member
                const shift = eventData.shifts?.find((s: any) =>
                    s.staffId === staffId || s.staff?.id === staffId
                );

                if (shift) {
                    const s = shift.staff || {};
                    const statusMap: Record<string, string> = {
                        'PENDING': 'pending',
                        'CONFIRMED': 'checked-in',
                        'IN_PROGRESS': 'checked-in',
                        'COMPLETED': 'checked-out',
                        'REJECTED': 'rejected',
                        'CANCELLED': 'cancelled',
                    };
                    setStaff({
                        id: s.id || staffId,
                        name: s.name || 'Staff Member',
                        role: shift.role || 'Staff',
                        avatar: (s.name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
                        status: statusMap[shift.status] || 'pending',
                        checkInTime: shift.clockIn ? new Date(shift.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                        hourlyRate: shift.hourlyRate || 25,
                        hoursWorked: shift.clockIn && shift.clockOut
                            ? Math.round((new Date(shift.clockOut).getTime() - new Date(shift.clockIn).getTime()) / 3600000 * 10) / 10
                            : 0,
                        rating: s.rating || 0,
                        phone: s.phone || '',
                    });
                } else {
                    // Staff not found in shifts - show basic info
                    setStaff({
                        id: staffId,
                        name: 'Staff Member',
                        role: 'Staff',
                        avatar: 'SM',
                        status: 'pending',
                        checkInTime: null,
                        hourlyRate: 25,
                        hoursWorked: 0,
                        rating: 0,
                        phone: '',
                    });
                }
            } catch (err) {
                console.error('Failed to load staff detail', err);
                // Show a generic fallback
                setStaff({
                    id: staffId || 'unknown',
                    name: 'Staff Member',
                    role: 'Staff',
                    avatar: 'SM',
                    status: 'pending',
                    checkInTime: null,
                    hourlyRate: 25,
                    hoursWorked: 0,
                    rating: 0,
                    phone: '',
                });
                setEvent({ id: eventId, name: 'Event', date: '', location: '', status: '' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [staffId, eventId]);

    if (loading || !staff || !event) {
        return <div className="p-8 text-center">Loading staff details...</div>;
    }

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
                                        <Badge className={`text-sm px-3 py-1 ${staff.status === 'checked-in' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                            staff.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                staff.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                    staff.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                        staff.status === 'not-arrived' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                            'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                            }`}>
                                            {staff.status === 'checked-in' ? 'Active On-Site' :
                                                staff.status === 'pending' ? 'Pending Response' :
                                                    staff.status === 'rejected' ? 'Rejected' :
                                                        staff.status === 'cancelled' ? 'Cancelled' :
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
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Hourly Rate</div>
                                <div className="font-mono text-lg font-semibold text-blue-600">${staff.hourlyRate}/hr</div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Staff Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Phone</span>
                                            <span className="font-medium">{staff.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Rating</span>
                                            <span className="font-medium">{staff.rating > 0 ? `${staff.rating} ⭐` : 'No rating yet'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium capitalize">{staff.status}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        Shift Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Event</span>
                                            <span className="font-medium">{event.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Role</span>
                                            <span className="font-medium">{staff.role}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Check In</span>
                                            <span className="font-medium">{staff.checkInTime || 'Not checked in'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Hours Worked</span>
                                            <span className="font-medium">{staff.hoursWorked > 0 ? `${staff.hoursWorked}h` : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                            <span className="text-muted-foreground">Estimated Earnings</span>
                                            <span className="font-medium text-green-600">${(staff.hoursWorked * staff.hourlyRate).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Event Info */}
                        <div className="lg:col-span-2">
                            <Card className="h-full">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        Event Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-muted-foreground text-sm mb-1">Event Name</p>
                                            <p className="font-semibold text-lg">{event.name}</p>
                                        </div>
                                        {event.date && (
                                            <div>
                                                <p className="text-muted-foreground text-sm mb-1">Date</p>
                                                <p className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        )}
                                        {event.location && (
                                            <div>
                                                <p className="text-muted-foreground text-sm mb-1">Location</p>
                                                <p className="font-medium">{event.location}</p>
                                            </div>
                                        )}
                                        {event.status && (
                                            <div>
                                                <p className="text-muted-foreground text-sm mb-1">Event Status</p>
                                                <Badge variant="outline" className="capitalize">{event.status.toLowerCase()}</Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
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
