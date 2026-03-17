import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Users,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Star,
  Award
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface ShiftMarketplaceProps {
  userRole: string;
  userId: string;
}

interface ShiftListing {
  id: string;
  originalStaffId: string;
  originalStaffName: string;
  originalStaffRating: number;
  eventId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  location: string;
  pay: number;
  isUrgent: boolean;
  postedDate: string;
  reason: string;
  requirements: string[];
  status: 'available' | 'pending' | 'filled' | 'cancelled';
  interestedStaff?: { id: string; name: string; rating: number }[];
  approvedBy?: string;
  bonusIncentive?: number;
}

export function ShiftMarketplace({ userRole, userId }: ShiftMarketplaceProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftListing | null>(null);

  // Mock shift listings
  const shiftListings: ShiftListing[] = [
    {
      id: "SH-001",
      originalStaffId: "ST-103",
      originalStaffName: "David Martinez",
      originalStaffRating: 4.5,
      eventId: "EVT-1240",
      eventName: "Holiday Corporate Party",
      date: "2024-12-15",
      startTime: "18:00",
      endTime: "23:00",
      role: "Server",
      location: "Downtown Convention Center",
      pay: 175.00,
      isUrgent: false,
      postedDate: "2024-10-10",
      reason: "Family emergency - need to be out of town",
      requirements: ["Food Handler Certification", "2+ years experience"],
      status: "available",
      interestedStaff: [
        { id: "ST-110", name: "Amanda White", rating: 4.8 },
        { id: "ST-111", name: "Kevin Brown", rating: 4.2 }
      ]
    },
    {
      id: "SH-002",
      originalStaffId: "ST-105",
      originalStaffName: "James Wilson",
      originalStaffRating: 3.8,
      eventId: "EVT-1241",
      eventName: "Wedding Reception",
      date: "2024-10-25",
      startTime: "17:00",
      endTime: "22:00",
      role: "Setup Crew",
      location: "Riverside Venue",
      pay: 150.00,
      isUrgent: true,
      postedDate: "2024-10-11",
      reason: "Medical appointment - cannot reschedule",
      requirements: ["Physical labor capability", "Reliable transportation"],
      status: "available",
      bonusIncentive: 25.00
    },
    {
      id: "SH-003",
      originalStaffId: "ST-102",
      originalStaffName: "Sarah Johnson",
      originalStaffRating: 4.9,
      eventId: "EVT-1242",
      eventName: "Product Launch Event",
      date: "2024-11-05",
      startTime: "15:00",
      endTime: "20:00",
      role: "Bartender",
      location: "Tech Hub Arena",
      pay: 225.00,
      isUrgent: false,
      postedDate: "2024-10-09",
      reason: "Accepted another higher-paying opportunity",
      requirements: ["TIPS Certification required", "Mixology experience preferred"],
      status: "pending",
      interestedStaff: [
        { id: "ST-112", name: "Rachel Green", rating: 4.7 }
      ],
      approvedBy: "Manager pending review"
    },
    {
      id: "SH-004",
      originalStaffId: "ST-107",
      originalStaffName: "Robert Taylor",
      originalStaffRating: 4.6,
      eventId: "EVT-1243",
      eventName: "Conference Setup",
      date: "2024-10-30",
      startTime: "08:00",
      endTime: "16:00",
      role: "AV Technician",
      location: "Business Convention Center",
      pay: 320.00,
      isUrgent: true,
      postedDate: "2024-10-11",
      reason: "Last minute family obligation",
      requirements: ["AV equipment experience", "Problem-solving skills", "Early morning availability"],
      status: "available",
      bonusIncentive: 50.00,
      interestedStaff: [
        { id: "ST-113", name: "Chris Evans", rating: 4.5 },
        { id: "ST-114", name: "Mark Wilson", rating: 4.3 }
      ]
    },
    {
      id: "SH-005",
      originalStaffId: "ST-104",
      originalStaffName: "Emma Davis",
      originalStaffRating: 4.4,
      eventId: "EVT-1244",
      eventName: "Charity Gala",
      date: "2024-11-12",
      startTime: "18:30",
      endTime: "23:30",
      role: "Server",
      location: "Luxury Hotel Ballroom",
      pay: 187.50,
      isUrgent: false,
      postedDate: "2024-10-08",
      reason: "Scheduling conflict with another commitment",
      requirements: ["Formal service experience", "Professional appearance"],
      status: "filled",
      interestedStaff: [
        { id: "ST-115", name: "Lisa Chen", rating: 4.9 }
      ],
      approvedBy: "Sarah Mitchell (Manager)"
    }
  ];

  // User's posted shifts (if they're staff)
  const myPostedShifts = shiftListings.filter(s => s.originalStaffId === userId);
  
  // Shifts user is interested in
  const myInterestedShifts = shiftListings.filter(s => 
    s.interestedStaff?.some(staff => staff.id === userId)
  );

  // Summary stats
  const stats = {
    available: shiftListings.filter(s => s.status === 'available').length,
    urgent: shiftListings.filter(s => s.isUrgent && s.status === 'available').length,
    totalValue: shiftListings.filter(s => s.status === 'available').reduce((sum, s) => sum + s.pay, 0),
    avgPay: shiftListings.filter(s => s.status === 'available').length > 0 
      ? (shiftListings.filter(s => s.status === 'available').reduce((sum, s) => sum + s.pay, 0) / 
         shiftListings.filter(s => s.status === 'available').length).toFixed(0)
      : 0
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "filled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><CheckCircle className="h-3 w-3 mr-1" />Filled</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Server': 'bg-purple-50 text-purple-700 border-purple-200',
      'Bartender': 'bg-blue-50 text-blue-700 border-blue-200',
      'Setup Crew': 'bg-orange-50 text-orange-700 border-orange-200',
      'AV Technician': 'bg-green-50 text-green-700 border-green-200',
      'Security': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter shifts
  const filteredShifts = shiftListings.filter(shift => {
    const matchesSearch = shift.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || shift.role === roleFilter;
    const matchesTab = selectedTab === "all" ||
                      (selectedTab === "available" && shift.status === 'available') ||
                      (selectedTab === "urgent" && shift.isUrgent && shift.status === 'available') ||
                      (selectedTab === "my-posted" && shift.originalStaffId === userId) ||
                      (selectedTab === "my-claims" && shift.interestedStaff?.some(s => s.id === userId));
    return matchesSearch && matchesRole && matchesTab;
  });

  const roles = Array.from(new Set(shiftListings.map(s => s.role)));

  const handleClaimShift = (shift: ShiftListing) => {
    setSelectedShift(shift);
    setShowClaimDialog(true);
  };

  const confirmClaimShift = () => {
    toast.success(`Claim submitted for ${selectedShift?.eventName}. Pending manager approval.`);
    setShowClaimDialog(false);
    setSelectedShift(null);
  };

  const handlePostShift = () => {
    toast.success("Shift posted to marketplace successfully!");
    setShowPostDialog(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Shift Marketplace</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Trade shifts with qualified team members
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userRole === 'staff' && (
            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
              <DialogTrigger asChild>
                <Button className="bg-sangria hover:bg-merlot">
                  <Plus className="h-4 w-4 mr-2" />
                  Post My Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Post Shift to Marketplace</DialogTitle>
                  <DialogDescription>Let other qualified staff claim your shift</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Shift to Post</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose from your upcoming shifts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sh1">Server - Holiday Party (Dec 15, 6:00 PM)</SelectItem>
                        <SelectItem value="sh2">Bartender - Wedding (Oct 25, 5:00 PM)</SelectItem>
                        <SelectItem value="sh3">Setup Crew - Conference (Nov 1, 8:00 AM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Trading</Label>
                    <Textarea 
                      placeholder="Brief explanation (visible to managers only)..."
                      rows={3}
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-900">
                      ℹ️ Manager approval required before shift can be claimed. Last-minute posts (within 48 hours) may incur a fee.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
                  <Button className="bg-sangria hover:bg-merlot" onClick={handlePostShift}>
                    Post to Marketplace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-xl font-semibold">{stats.available}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-xl font-semibold">{stats.urgent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-semibold">${stats.totalValue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Pay</p>
              <p className="text-xl font-semibold">${stats.avgPay}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="available">Available Shifts</TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent
            {stats.urgent > 0 && (
              <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.urgent}
              </Badge>
            )}
          </TabsTrigger>
          {userRole === 'staff' && (
            <>
              <TabsTrigger value="my-posted">My Posted</TabsTrigger>
              <TabsTrigger value="my-claims">My Claims</TabsTrigger>
            </>
          )}
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Shift Listings</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search shifts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <div key={shift.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    {shift.isUrgent && (
                      <div className="mb-3 flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-semibold text-sm">URGENT - Bonus ${shift.bonusIncentive} available!</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getRoleColor(shift.role)}>{shift.role}</Badge>
                          {getStatusBadge(shift.status)}
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{shift.eventName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(shift.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{shift.startTime} - {shift.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{shift.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600 text-lg">${shift.pay.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Posted by {shift.originalStaffName}</span>
                            {renderStarRating(shift.originalStaffRating)}
                          </div>
                        </div>
                        {shift.requirements.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {shift.requirements.map((req, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {shift.interestedStaff && shift.interestedStaff.length > 0 && (
                      <div className="mb-3 p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">
                          {shift.interestedStaff.length} staff interested
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {shift.interestedStaff.map((staff) => (
                            <div key={staff.id} className="flex items-center gap-1 text-xs">
                              <span>{staff.name}</span>
                              {renderStarRating(staff.rating)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      {shift.status === 'available' && userRole === 'staff' && shift.originalStaffId !== userId && (
                        <Button 
                          className="bg-sangria hover:bg-merlot"
                          size="sm"
                          onClick={() => handleClaimShift(shift)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Claim Shift
                        </Button>
                      )}
                      {userRole === 'admin' || userRole === 'manager' && (
                        <Button variant="outline" size="sm">
                          Approve Candidate
                        </Button>
                      )}
                      {shift.originalStaffId === userId && shift.status === 'available' && (
                        <Button variant="outline" size="sm">
                          Cancel Posting
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No shifts found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Claim Shift Dialog */}
      {selectedShift && (
        <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim Shift</DialogTitle>
              <DialogDescription>Confirm you want to claim this shift</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-semibold">{selectedShift.eventName}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(selectedShift.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedShift.startTime} - {selectedShift.endTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedShift.role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pay</p>
                    <p className="font-semibold text-green-600">${selectedShift.pay.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ Your claim will be reviewed by the manager. You'll be notified of approval within 24 hours.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClaimDialog(false)}>Cancel</Button>
              <Button className="bg-sangria hover:bg-merlot" onClick={confirmClaimShift}>
                Confirm Claim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
