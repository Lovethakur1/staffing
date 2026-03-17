import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  MapPin,
  RefreshCw,
  UserX,
  X,
  Check,
  Search,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ShiftConflictsProps {
  userRole: string;
  userId: string;
}

interface Conflict {
  id: string;
  staffId: string;
  staffName: string;
  type: 'double-booking' | 'unavailable' | 'overtime' | 'time-gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  events: {
    id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    client: string;
  }[];
  description: string;
  detectedAt: string;
  status: 'unresolved' | 'in-progress' | 'resolved';
  resolution?: string;
}

interface SwapRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  swapWith: string;
  swapWithName: string;
  event: {
    id: string;
    name: string;
    date: string;
    time: string;
    venue: string;
  };
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export function ShiftConflicts({ userRole, userId }: ShiftConflictsProps) {
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<SwapRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock conflicts
  const conflicts: Conflict[] = [
    {
      id: "conf-001",
      staffId: "staff-004",
      staffName: "David Kim",
      type: "double-booking",
      severity: "critical",
      events: [
        {
          id: "evt-001",
          name: "Corporate Gala - Tech Summit 2025",
          date: "2025-10-10",
          startTime: "18:00",
          endTime: "23:00",
          venue: "Grand Ballroom",
          client: "Innovate Corp"
        },
        {
          id: "evt-004",
          name: "Private Birthday Party",
          date: "2025-10-10",
          startTime: "19:00",
          endTime: "22:00",
          venue: "Lakeside Pavilion",
          client: "Johnson Family"
        }
      ],
      description: "Staff member is assigned to two overlapping events on the same day",
      detectedAt: "2025-10-09T14:30:00",
      status: "unresolved"
    },
    {
      id: "conf-002",
      staffId: "staff-007",
      staffName: "Lisa Anderson",
      type: "unavailable",
      severity: "high",
      events: [
        {
          id: "evt-002",
          name: "Wedding Reception - Johnson & Smith",
          date: "2025-10-10",
          startTime: "17:30",
          endTime: "22:30",
          venue: "Riverside Gardens",
          client: "Emily Johnson"
        }
      ],
      description: "Staff member marked unavailable for this date in their schedule",
      detectedAt: "2025-10-09T16:15:00",
      status: "in-progress"
    },
    {
      id: "conf-003",
      staffId: "staff-002",
      staffName: "James Rodriguez",
      type: "overtime",
      severity: "medium",
      events: [
        {
          id: "evt-003",
          name: "Product Launch - XYZ Innovation",
          date: "2025-10-11",
          startTime: "19:00",
          endTime: "22:00",
          venue: "Convention Center",
          client: "XYZ Technologies"
        }
      ],
      description: "This shift would push staff member over 40 hours for the week",
      detectedAt: "2025-10-09T10:00:00",
      status: "unresolved"
    },
    {
      id: "conf-004",
      staffId: "staff-005",
      staffName: "Sophie Brown",
      type: "time-gap",
      severity: "low",
      events: [
        {
          id: "evt-005",
          name: "Lunch Event",
          date: "2025-10-12",
          startTime: "12:00",
          endTime: "15:00",
          venue: "Downtown Hotel",
          client: "ABC Corp"
        },
        {
          id: "evt-006",
          name: "Evening Reception",
          date: "2025-10-12",
          startTime: "18:00",
          endTime: "21:00",
          venue: "Uptown Gallery",
          client: "Art Museum"
        }
      ],
      description: "Less than 2 hours between shifts - insufficient rest time",
      detectedAt: "2025-10-10T09:00:00",
      status: "resolved",
      resolution: "First event reassigned to alternate staff member"
    }
  ];

  // Mock swap requests
  const swapRequests: SwapRequest[] = [
    {
      id: "swap-001",
      requestedBy: "staff-004",
      requestedByName: "David Kim",
      swapWith: "staff-008",
      swapWithName: "Alex Chen",
      event: {
        id: "evt-001",
        name: "Corporate Gala - Tech Summit 2025",
        date: "2025-10-10",
        time: "18:00 - 23:00",
        venue: "Grand Ballroom"
      },
      reason: "Family emergency - need to travel out of state",
      requestedAt: "2025-10-09T14:45:00",
      status: "pending"
    },
    {
      id: "swap-002",
      requestedBy: "staff-007",
      requestedByName: "Lisa Anderson",
      swapWith: "staff-003",
      swapWithName: "Maria Garcia",
      event: {
        id: "evt-002",
        name: "Wedding Reception - Johnson & Smith",
        date: "2025-10-10",
        time: "17:30 - 22:30",
        venue: "Riverside Gardens"
      },
      reason: "Doctor's appointment that cannot be rescheduled",
      requestedAt: "2025-10-09T16:30:00",
      status: "approved",
      approvedBy: "Admin Team",
      approvedAt: "2025-10-09T17:00:00"
    },
    {
      id: "swap-003",
      requestedBy: "staff-009",
      requestedByName: "Rachel Green",
      swapWith: "staff-006",
      swapWithName: "Tom Wilson",
      event: {
        id: "evt-007",
        name: "Corporate Conference",
        date: "2025-10-13",
        time: "09:00 - 17:00",
        venue: "Convention Center"
      },
      reason: "Pre-planned vacation - forgot to block out calendar",
      requestedAt: "2025-10-08T11:20:00",
      status: "rejected"
    }
  ];

  const unresolvedConflicts = conflicts.filter(c => c.status === 'unresolved').length;
  const pendingSwaps = swapRequests.filter(s => s.status === 'pending').length;
  const criticalConflicts = conflicts.filter(c => c.severity === 'critical' && c.status === 'unresolved').length;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700"><AlertCircle className="h-3 w-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-700">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getConflictTypeBadge = (type: string) => {
    switch (type) {
      case 'double-booking':
        return <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Double Booking</Badge>;
      case 'unavailable':
        return <Badge variant="outline"><UserX className="h-3 w-3 mr-1" />Unavailable</Badge>;
      case 'overtime':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Overtime</Badge>;
      case 'time-gap':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Time Gap</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'unresolved':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />Unresolved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-700"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const resolveConflict = () => {
    toast.success(`Conflict resolved for ${selectedConflict?.staffName}`);
    setShowResolveDialog(false);
  };

  const approveSwap = (swapId: string) => {
    toast.success("Shift swap approved!");
  };

  const rejectSwap = (swapId: string) => {
    toast.error("Shift swap rejected");
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Shift Conflict Management</h1>
        <p className="text-muted-foreground">
          Detect and resolve scheduling conflicts automatically
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unresolvedConflicts}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{criticalConflicts}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Swaps</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSwaps}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {conflicts.filter(c => c.status === 'resolved').length}
            </div>
            <p className="text-xs text-success">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by staff name, event, or conflict type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Active Conflicts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Scheduling Conflicts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Automatically detected conflicts requiring resolution
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conflicts.filter(c => c.status !== 'resolved').map((conflict) => (
              <div
                key={conflict.id}
                className={`p-4 border-l-4 rounded-lg ${
                  conflict.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                  conflict.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                  'border-l-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conflict.staffName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{conflict.staffName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getConflictTypeBadge(conflict.type)}
                        {getSeverityBadge(conflict.severity)}
                        {getStatusBadge(conflict.status)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedConflict(conflict);
                      setShowResolveDialog(true);
                    }}
                  >
                    Resolve
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{conflict.description}</p>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Conflicting Events:</p>
                  {conflict.events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Detected: {new Date(conflict.detectedAt).toLocaleString()}
                </p>
              </div>
            ))}

            {conflicts.filter(c => c.status !== 'resolved').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No active conflicts! All schedules are clear.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shift Swap Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Shift Swap Requests
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Staff-initiated shift swaps requiring manager approval
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested By</TableHead>
                <TableHead>Swap With</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swapRequests.map((swap) => (
                <TableRow key={swap.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {swap.requestedByName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{swap.requestedByName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(swap.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {swap.swapWithName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm">{swap.swapWithName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{swap.event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(swap.event.date).toLocaleDateString()} • {swap.event.time}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-xs">{swap.reason}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(swap.status)}</TableCell>
                  <TableCell>
                    {swap.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveSwap(swap.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectSwap(swap.id)}>
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {swap.status === 'approved' && swap.approvedBy && (
                      <p className="text-xs text-muted-foreground">
                        Approved by {swap.approvedBy}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resolved Conflicts History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Resolved Conflicts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conflicts.filter(c => c.status === 'resolved').map((conflict) => (
              <div key={conflict.id} className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{conflict.staffName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getConflictTypeBadge(conflict.type)}
                      {getStatusBadge(conflict.status)}
                    </div>
                    {conflict.resolution && (
                      <p className="text-sm text-green-800 mt-2">
                        <strong>Resolution:</strong> {conflict.resolution}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resolve Conflict Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Scheduling Conflict</DialogTitle>
            <DialogDescription>
              {selectedConflict?.staffName} - {selectedConflict?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Conflict Details:</p>
              <p className="text-sm text-muted-foreground">{selectedConflict?.description}</p>
            </div>

            <div className="space-y-2">
              <Label>Resolution Action *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                <option value="">Select action...</option>
                <option value="reassign">Reassign to different staff</option>
                <option value="remove">Remove from one event</option>
                <option value="adjust">Adjust event times</option>
                <option value="override">Override (with approval)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Replacement Staff (if reassigning)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                <option value="">Select staff member...</option>
                <option value="staff-008">Alex Chen - Event Server</option>
                <option value="staff-009">Rachel Green - Bartender</option>
                <option value="staff-010">Tom Wilson - Event Coordinator</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe how this conflict was resolved..."
                rows={4}
              />
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-900">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Staff member will be notified of any schedule changes
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResolveDialog(false)}>Cancel</Button>
              <Button onClick={resolveConflict}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Conflict
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
