import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DataTable } from "../ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar as CalendarIcon,
  Users,
  Phone,
  Mail,
  FileText
} from "lucide-react";

interface Shift {
  id: string;
  title: string;
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: string;
  role: string;
  hourlyRate: number;
  duration: number;
  requirements?: string;
  description?: string;
}

interface ShiftsListProps {
  shifts: Shift[];
  onShiftResponse?: (shiftId: string, response: 'confirmed' | 'rejected') => void;
}

export function ShiftsList({ shifts, onShiftResponse }: ShiftsListProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Categorize shifts
  const categorizedShifts = useMemo(() => {
    const now = new Date();
    
    const upcoming = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= now && (shift.status === 'confirmed' || shift.status === 'pending');
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pending = shifts.filter(shift => shift.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const completed = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate < now || shift.status === 'completed';
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const all = shifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcoming, pending, completed, all };
  }, [shifts]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      case 'cancelled':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Common columns for all tables
  const getColumns = (showActions = false) => [
    {
      key: "title",
      title: "Event",
      sortable: true,
      render: (value: string, row: Shift) => (
        <div className="min-w-0">
          <p className="font-medium truncate">{value}</p>
          <p className="text-sm text-muted-foreground">{row.role}</p>
        </div>
      )
    },
    {
      key: "date",
      title: "Date",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="font-medium">{new Date(value).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>
      )
    },
    {
      key: "startTime",
      title: "Time",
      sortable: true,
      render: (value: string, row: Shift) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value} - {row.endTime}</span>
        </div>
      )
    },
    {
      key: "location",
      title: "Location",
      sortable: true,
      render: (value: string, row: Shift) => (
        <div className="min-w-0">
          <p className="font-medium truncate">{value}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{row.address}</p>
        </div>
      )
    },
    {
      key: "duration",
      title: "Duration",
      sortable: true,
      render: (value: number) => `${value}h`
    },
    {
      key: "hourlyRate",
      title: "Earnings",
      sortable: true,
      render: (value: number, row: Shift) => (
        <div>
          <p className="font-medium">{formatCurrency(value * row.duration)}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(value)}/hr</p>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "actions",
      title: "Actions",
      sortable: false,
      render: (value: any, shift: Shift) => (
        <div className="flex items-center gap-1">
          {/* View Details Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Shift Details</DialogTitle>
                <DialogDescription>
                  Complete information about this shift
                </DialogDescription>
              </DialogHeader>
              <ShiftDetailsContent shift={shift} />
            </DialogContent>
          </Dialog>

          {/* Response Actions for Pending Shifts */}
          {shift.status === 'pending' && onShiftResponse && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShiftResponse(shift.id, 'confirmed')}
                className="h-8 text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShiftResponse(shift.id, 'rejected')}
                className="h-8 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Decline
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Shift Management</h3>
        <p className="text-sm text-muted-foreground">
          View and manage all your shifts across different time periods
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Upcoming ({categorizedShifts.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({categorizedShifts.pending.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({categorizedShifts.completed.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All ({categorizedShifts.all.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <DataTable
            data={categorizedShifts.upcoming}
            columns={getColumns(true)}
            title="Upcoming Shifts"
            subtitle={`${categorizedShifts.upcoming.length} confirmed and pending shifts coming up`}
            searchable={true}
            searchPlaceholder="Search upcoming shifts..."
            exportable={true}
            pageSize={10}
            emptyMessage="No upcoming shifts scheduled."
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-yellow-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700">
                You have {categorizedShifts.pending.length} shift{categorizedShifts.pending.length !== 1 ? 's' : ''} awaiting your response. 
                Please accept or decline these shifts as soon as possible.
              </p>
            </CardContent>
          </Card>

          <DataTable
            data={categorizedShifts.pending}
            columns={getColumns(true)}
            title="Pending Shifts"
            subtitle="Shifts awaiting your response"
            searchable={true}
            searchPlaceholder="Search pending shifts..."
            exportable={true}
            pageSize={10}
            emptyMessage="No pending shifts! You're all caught up."
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <DataTable
            data={categorizedShifts.completed}
            columns={getColumns(true)}
            title="Completed Shifts"
            subtitle="Your shift history and completed work"
            searchable={true}
            searchPlaceholder="Search completed shifts..."
            exportable={true}
            pageSize={15}
            emptyMessage="No completed shifts yet."
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <DataTable
            data={categorizedShifts.all}
            columns={getColumns(true)}
            title="All Shifts"
            subtitle="Complete history of all your shifts"
            searchable={true}
            searchPlaceholder="Search all shifts..."
            exportable={true}
            pageSize={15}
            emptyMessage="No shifts found."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Extracted shift details component for reusability
function ShiftDetailsContent({ shift }: { shift: Shift }) {
  return (
    <div className="space-y-6">
      {/* Event Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Event Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Event Name</label>
            <p className="text-sm">{shift.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Client</label>
            <p className="text-sm">{shift.client}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <p className="text-sm">{shift.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <p className="text-sm capitalize">{shift.type}</p>
          </div>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Schedule Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Date</label>
            <p className="text-sm">{new Date(shift.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Time</label>
            <p className="text-sm">{shift.startTime} - {shift.endTime}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Duration</label>
            <p className="text-sm">{shift.duration} hours</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              {(() => {
                switch (shift.status) {
                  case 'completed':
                    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
                  case 'confirmed':
                    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
                  case 'pending':
                    return <Badge variant="secondary">Pending</Badge>;
                  case 'cancelled':
                    return <Badge variant="destructive">Cancelled</Badge>;
                  default:
                    return <Badge variant="secondary">{shift.status}</Badge>;
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Location</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Venue</label>
            <p className="text-sm">{shift.location}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-sm">{shift.address}</p>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Financial Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
            <p className="text-sm">${shift.hourlyRate}/hour</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Total Earnings</label>
            <p className="text-sm font-medium">${shift.hourlyRate * shift.duration}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shift.clientPhone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {shift.clientPhone}
              </p>
            </div>
          )}
          {shift.clientEmail && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {shift.clientEmail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {(shift.requirements || shift.description) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Additional Information</h3>
          </div>
          <div className="space-y-3">
            {shift.requirements && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                <p className="text-sm">{shift.requirements}</p>
              </div>
            )}
            {shift.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{shift.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}