import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  UserPlus,
  UserX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MoreVertical,
  Send,
  Filter,
  Search,
  Download,
  FileText,
  CreditCard,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Settings,
  Plus,
  Copy,
  Share2,
  Archive,
  Flag,
  Video,
  Image as ImageIcon,
  Paperclip,
  Timer,
} from "lucide-react";

interface Staff {
  id: string;
  name: string;
  role: string;
  status: 'assigned' | 'confirmed' | 'checked-in' | 'working' | 'completed' | 'no-show';
  hourlyRate: number;
  rating: number;
  phone: string;
  email: string;
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
  performanceRating?: number;
  feedback?: string;
}

interface Payment {
  id: string;
  amount: number;
  type: 'deposit' | 'partial' | 'final';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
  method: string;
  reference?: string;
}

interface EventFeedback {
  id: string;
  from: string;
  role: 'client' | 'manager' | 'staff';
  rating: number;
  comment: string;
  date: string;
  category: string;
}

interface ComprehensiveEventManagementProps {
  eventId?: string;
  onBack?: () => void;
}

export function ComprehensiveEventManagement({ eventId, onBack }: ComprehensiveEventManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showAssignStaff, setShowAssignStaff] = useState(false);
  const [showFindReplacement, setShowFindReplacement] = useState(false);
  const [showPaymentVerification, setShowPaymentVerification] = useState(false);
  const [showAdjustTimings, setShowAdjustTimings] = useState(false);
  const [showStaffRating, setShowStaffRating] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // Mock event data
  const event = {
    id: 'evt-001',
    name: 'Corporate Annual Gala 2025',
    client: {
      name: 'TechCorp Industries',
      email: 'events@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Industries',
      rating: 4.8,
    },
    manager: {
      id: 'mgr-001',
      name: 'Michael Chen',
      phone: '+1 (555) 234-5678',
      email: 'michael.chen@xtreme.com',
    },
    status: 'in-progress',
    date: '2025-10-15',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Grand Hotel Ballroom',
    address: '123 Main Street, Downtown, CA 90210',
    type: 'Corporate',
    attendees: 250,
    description: 'Annual corporate gala with awards ceremony, formal dinner, and entertainment.',
    totalBudget: 25000,
    paidAmount: 15000,
    pendingAmount: 10000,
    staffRequired: 20,
    staffAssigned: 18,
    staffCheckedIn: 15,
    createdDate: '2025-09-01',
    lastModified: '2025-10-10',
  };

  const staffMembers: Staff[] = [
    {
      id: 's1',
      name: 'Sarah Martinez',
      role: 'Head Bartender',
      status: 'checked-in',
      hourlyRate: 32,
      rating: 4.9,
      phone: '+1 (555) 111-2222',
      email: 'sarah.m@xtreme.com',
      checkInTime: '17:45',
      hoursWorked: 5.25,
      performanceRating: 5,
    },
    {
      id: 's2',
      name: 'James Rodriguez',
      role: 'Server',
      status: 'working',
      hourlyRate: 28,
      rating: 4.7,
      phone: '+1 (555) 222-3333',
      email: 'james.r@xtreme.com',
      checkInTime: '17:50',
      hoursWorked: 5.15,
    },
    {
      id: 's3',
      name: 'Emma Williams',
      role: 'Server',
      status: 'no-show',
      hourlyRate: 28,
      rating: 4.5,
      phone: '+1 (555) 333-4444',
      email: 'emma.w@xtreme.com',
    },
  ];

  const payments: Payment[] = [
    {
      id: 'pay-001',
      amount: 10000,
      type: 'deposit',
      status: 'completed',
      date: '2025-09-05',
      method: 'Bank Transfer',
      reference: 'TXN-12345',
    },
    {
      id: 'pay-002',
      amount: 5000,
      type: 'partial',
      status: 'completed',
      date: '2025-10-01',
      method: 'Credit Card',
      reference: 'TXN-12346',
    },
    {
      id: 'pay-003',
      amount: 10000,
      type: 'final',
      status: 'pending',
      date: '2025-10-16',
      method: 'Bank Transfer',
    },
  ];

  const feedbacks: EventFeedback[] = [
    {
      id: 'fb-001',
      from: 'TechCorp Industries',
      role: 'client',
      rating: 5,
      comment: 'Excellent service! Staff was professional and attentive.',
      date: '2025-10-16',
      category: 'Overall Service',
    },
    {
      id: 'fb-002',
      from: 'Michael Chen',
      role: 'manager',
      rating: 4,
      comment: 'Event went smoothly, minor delay at start.',
      date: '2025-10-15',
      category: 'Event Management',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'confirmed':
        return 'bg-purple-100 text-purple-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
      case 'working':
        return 'bg-green-100 text-green-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'assigned':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'no-show':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl text-slate-900">{event.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={getStatusColor(event.status)}>
                  {event.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-slate-600">ID: {event.id}</span>
                <span className="text-sm text-slate-600">•</span>
                <span className="text-sm text-slate-600">Created: {event.createdDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditEvent(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export Details
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">{event.staffCheckedIn}/{event.staffAssigned}</div>
            <div className="text-xs text-slate-600">Staff Checked In</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">${event.paidAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-600">Paid Amount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">${event.pendingAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-600">Pending Payment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">{event.attendees}</div>
            <div className="text-xs text-slate-600">Expected Guests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">5.0</div>
            <div className="text-xs text-slate-600">Event Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">On Time</div>
            <div className="text-xs text-slate-600">Event Status</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6">
          <TabsList className="bg-transparent">
            <TabsTrigger value="overview" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Overview
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Payments
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Feedback & Ratings
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Communication
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-sangria/10 data-[state=active]:text-sangria">
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 space-y-6 m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-sangria mt-0.5" />
                      <div>
                        <div className="text-sm text-slate-600">Date</div>
                        <div className="font-medium">{event.date}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-sangria mt-0.5" />
                      <div>
                        <div className="text-sm text-slate-600">Time</div>
                        <div className="font-medium">{event.startTime} - {event.endTime}</div>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-sangria text-xs"
                          onClick={() => setShowAdjustTimings(true)}
                        >
                          Adjust Timings
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-sangria mt-0.5" />
                      <div>
                        <div className="text-sm text-slate-600">Location</div>
                        <div className="font-medium">{event.location}</div>
                        <div className="text-sm text-slate-500">{event.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-sangria mt-0.5" />
                      <div>
                        <div className="text-sm text-slate-600">Attendees</div>
                        <div className="font-medium">{event.attendees} guests</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Description</div>
                    <p className="text-sm text-slate-700">{event.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Event Type</div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Client & Manager Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-sangria text-white">
                          {event.client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{event.client.name}</div>
                        <div className="text-sm text-slate-600">{event.client.company}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{event.client.rating}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{event.client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{event.client.phone}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Client
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Event Manager</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {event.manager.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{event.manager.name}</div>
                        <div className="text-sm text-slate-600">On-site Manager</div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{event.manager.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{event.manager.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-sangria hover:bg-merlot">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Budget Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Total Budget</span>
                    <span className="text-xl font-semibold">${event.totalBudget.toLocaleString()}</span>
                  </div>
                  <Progress value={(event.paidAmount / event.totalBudget) * 100} className="h-3" />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Paid</div>
                      <div className="text-lg font-semibold text-green-600">${event.paidAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Pending</div>
                      <div className="text-lg font-semibold text-red-600">${event.pendingAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Payment Status</div>
                      <Badge className={getPaymentStatusColor('pending')}>Partial Payment</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="p-6 space-y-6 m-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Staff Management</h2>
                <p className="text-sm text-slate-600">
                  {event.staffAssigned} of {event.staffRequired} staff assigned • {event.staffCheckedIn} checked in
                </p>
              </div>
              <Button onClick={() => setShowAssignStaff(true)} className="bg-sangria hover:bg-merlot">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Staff
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {staffMembers.map((staff) => (
                <Card key={staff.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-sangria text-white text-lg">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900">{staff.name}</h3>
                          <Badge className={getStaffStatusColor(staff.status)}>
                            {staff.status.replace('-', ' ')}
                          </Badge>
                          {staff.status === 'no-show' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowFindReplacement(true)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Find Replacement
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{staff.role}</span>
                          <span>•</span>
                          <span>${staff.hourlyRate}/hr</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{staff.rating}</span>
                          </div>
                          {staff.checkInTime && (
                            <>
                              <span>•</span>
                              <span>Checked in: {staff.checkInTime}</span>
                            </>
                          )}
                          {staff.hoursWorked && (
                            <>
                              <span>•</span>
                              <span>{staff.hoursWorked} hrs worked</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        {(staff.status === 'completed' || staff.status === 'working') && (
                          <Button 
                            size="sm" 
                            className="bg-sangria hover:bg-merlot"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setShowStaffRating(true);
                            }}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Assignment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Replace Staff
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="w-4 h-4 mr-2" />
                              Remove from Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Staff Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Head Bartender</span>
                    <Badge className="bg-green-100 text-green-700">2/2 Assigned</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Bartenders</span>
                    <Badge className="bg-green-100 text-green-700">4/4 Assigned</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Servers</span>
                    <Badge className="bg-yellow-100 text-yellow-700">10/12 Assigned</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Event Coordinators</span>
                    <Badge className="bg-green-100 text-green-700">2/2 Assigned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="p-6 space-y-6 m-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Payment Management</h2>
                <p className="text-sm text-slate-600">Track and verify all event payments</p>
              </div>
              <Button 
                onClick={() => setShowPaymentVerification(true)}
                className="bg-sangria hover:bg-merlot"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Payment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-1">Total Budget</div>
                  <div className="text-2xl font-semibold text-slate-900">
                    ${event.totalBudget.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-1">Paid Amount</div>
                  <div className="text-2xl font-semibold text-green-600">
                    ${event.paidAmount.toLocaleString()}
                  </div>
                  <Progress value={(event.paidAmount / event.totalBudget) * 100} className="mt-2 h-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-1">Pending</div>
                  <div className="text-2xl font-semibold text-red-600">
                    ${event.pendingAmount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Due: Oct 16, 2025</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-sangria/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-sangria" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} Payment
                          </div>
                          <div className="text-sm text-slate-600">
                            {payment.date} • {payment.method}
                            {payment.reference && ` • ${payment.reference}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            ${payment.amount.toLocaleString()}
                          </div>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        {payment.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="p-6 space-y-6 m-0">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Event Timeline</h2>
              <p className="text-sm text-slate-600">Complete history of event activities and changes</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-slate-900">Staff Check-in</div>
                  <div className="text-sm text-slate-600 mb-2">Sarah Martinez checked in</div>
                  <div className="text-xs text-slate-500">Today, 5:45 PM</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-slate-900">Staff No-Show Alert</div>
                  <div className="text-sm text-slate-600 mb-2">Emma Williams marked as no-show</div>
                  <div className="text-xs text-slate-500">Today, 6:15 PM</div>
                  <Button size="sm" variant="outline" className="mt-2">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Find Replacement
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-slate-900">Payment Received</div>
                  <div className="text-sm text-slate-600 mb-2">$5,000 partial payment confirmed</div>
                  <div className="text-xs text-slate-500">Oct 1, 2025</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                </div>
                <div className="flex-1 pb-8">
                  <div className="font-medium text-slate-900">Staff Assigned</div>
                  <div className="text-sm text-slate-600 mb-2">18 staff members assigned to event</div>
                  <div className="text-xs text-slate-500">Sep 15, 2025</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Event Created</div>
                  <div className="text-sm text-slate-600 mb-2">Event booked by TechCorp Industries</div>
                  <div className="text-xs text-slate-500">Sep 1, 2025</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Feedback & Ratings Tab */}
          <TabsContent value="feedback" className="p-6 space-y-6 m-0">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Feedback & Ratings</h2>
              <p className="text-sm text-slate-600">Client and staff feedback for this event</p>
            </div>

            {/* Overall Rating */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Overall Event Rating</div>
                    <div className="flex items-center gap-2">
                      <div className="text-4xl font-semibold text-slate-900">5.0</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Based on 2 reviews</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-2">Rating Breakdown</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-16 text-slate-600">Service</span>
                        <Progress value={100} className="h-2 w-24" />
                        <span className="text-slate-900">5.0</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-16 text-slate-600">Quality</span>
                        <Progress value={100} className="h-2 w-24" />
                        <span className="text-slate-900">5.0</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-16 text-slate-600">Value</span>
                        <Progress value={90} className="h-2 w-24" />
                        <span className="text-slate-900">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={
                          feedback.role === 'client' ? 'bg-purple-600 text-white' :
                          feedback.role === 'manager' ? 'bg-blue-600 text-white' :
                          'bg-green-600 text-white'
                        }>
                          {feedback.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium text-slate-900">{feedback.from}</div>
                          <Badge variant="outline" className="capitalize">{feedback.role}</Badge>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${
                                  star <= feedback.rating 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">{feedback.date}</span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">{feedback.category}</div>
                        <p className="text-slate-700">{feedback.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Staff Ratings Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Staff Performance Ratings</CardTitle>
                  <Button size="sm" className="bg-sangria hover:bg-merlot">
                    <Star className="w-4 h-4 mr-2" />
                    Rate All Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staffMembers.filter(s => s.status === 'completed' || s.status === 'working').map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-sangria text-white">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{staff.name}</div>
                          <div className="text-sm text-slate-600">{staff.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {staff.performanceRating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${
                                    star <= staff.performanceRating! 
                                      ? 'text-yellow-500 fill-yellow-500' 
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setShowStaffRating(true);
                            }}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate Performance
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="p-6 space-y-6 m-0">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Event Communication</h2>
              <p className="text-sm text-slate-600">Direct communication with manager and staff</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-sangria hover:bg-merlot">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Event Manager
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Event Manager
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Video Call Manager
                  </Button>
                  <Separator />
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Message All Staff
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Client
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-600 text-white">MC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">Michael Chen</div>
                          <div className="text-xs text-slate-500">2 min ago</div>
                        </div>
                        <p className="text-sm text-slate-700">Staff check-in is going smoothly. All bartenders are here.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-600 text-white">TC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">TechCorp</div>
                          <div className="text-xs text-slate-500">1 hour ago</div>
                        </div>
                        <p className="text-sm text-slate-700">Can we add 2 more servers? Guest count increased.</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="link" className="w-full mt-3 text-sangria">
                    View All Messages →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Live Event Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Live Event Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-green-900">Event Started On Time</div>
                      <div className="text-sm text-green-700">All systems operational. 15/18 staff checked in.</div>
                      <div className="text-xs text-green-600 mt-1">6:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-yellow-900">Staff No-Show Alert</div>
                      <div className="text-sm text-yellow-700">Emma Williams did not check in. Replacement needed.</div>
                      <div className="text-xs text-yellow-600 mt-1">6:15 PM</div>
                      <Button size="sm" variant="outline" className="mt-2">
                        Find Replacement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-6 space-y-6 m-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Event Documents</h2>
                <p className="text-sm text-slate-600">Contracts, invoices, and event materials</p>
              </div>
              <Button className="bg-sangria hover:bg-merlot">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Event Contract.pdf', type: 'Contract', size: '2.4 MB', date: 'Sep 1, 2025' },
                { name: 'Deposit Invoice.pdf', type: 'Invoice', size: '156 KB', date: 'Sep 5, 2025' },
                { name: 'Staff Schedule.xlsx', type: 'Schedule', size: '89 KB', date: 'Sep 15, 2025' },
                { name: 'Event Floor Plan.pdf', type: 'Layout', size: '3.1 MB', date: 'Sep 20, 2025' },
                { name: 'Menu Details.pdf', type: 'Catering', size: '245 KB', date: 'Sep 25, 2025' },
                { name: 'Payment Receipt.pdf', type: 'Receipt', size: '112 KB', date: 'Oct 1, 2025' },
              ].map((doc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-sangria/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-sangria" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{doc.name}</div>
                        <div className="text-sm text-slate-600">{doc.type}</div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Dialogs */}
      
      {/* Adjust Timings Dialog */}
      <Dialog open={showAdjustTimings} onOpenChange={setShowAdjustTimings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Event Timings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Start Time</Label>
              <Input type="time" defaultValue={event.startTime} className="mt-1" />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" defaultValue={event.endTime} className="mt-1" />
            </div>
            <div>
              <Label>Reason for Change</Label>
              <Textarea 
                placeholder="Explain why the timing is being adjusted..."
                className="mt-1"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">Impact of Time Change</div>
                  <ul className="text-xs space-y-1">
                    <li>• All assigned staff will be notified</li>
                    <li>• Client will receive update email</li>
                    <li>• Budget may need adjustment for overtime</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAdjustTimings(false)}>
                Cancel
              </Button>
              <Button className="bg-sangria hover:bg-merlot">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Staff Rating Dialog */}
      <Dialog open={showStaffRating} onOpenChange={setShowStaffRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Staff Performance</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-sangria text-white">
                    {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedStaff.name}</div>
                  <div className="text-sm text-slate-600">{selectedStaff.role}</div>
                </div>
              </div>
              <Separator />
              <div>
                <Label>Performance Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="w-12 h-12 rounded-lg border-2 border-slate-200 hover:border-sangria transition-colors flex items-center justify-center"
                    >
                      <Star className="w-6 h-6 text-slate-400 hover:text-yellow-500 hover:fill-yellow-500" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Feedback (Optional)</Label>
                <Textarea 
                  placeholder="Share your feedback on this staff member's performance..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="punctual" className="rounded" />
                    <label htmlFor="punctual" className="text-sm">Punctual</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="professional" className="rounded" />
                    <label htmlFor="professional" className="text-sm">Professional</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="skillful" className="rounded" />
                    <label htmlFor="skillful" className="text-sm">Skillful</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="teamwork" className="rounded" />
                    <label htmlFor="teamwork" className="text-sm">Team Player</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowStaffRating(false)}>
                  Cancel
                </Button>
                <Button className="bg-sangria hover:bg-merlot">
                  Submit Rating
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Find Replacement Dialog */}
      <Dialog open={showFindReplacement} onOpenChange={setShowFindReplacement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find Staff Replacement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-red-900">Staff No-Show</div>
                  <div className="text-sm text-red-700">Emma Williams (Server) did not check in</div>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Search Available Staff</Label>
              <Input 
                placeholder="Search by name, role, or skills..."
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <Label>Available Replacements (3)</Label>
              {[
                { name: 'Alex Johnson', role: 'Server', rating: 4.8, distance: '2.1 mi' },
                { name: 'Maria Garcia', role: 'Server', rating: 4.9, distance: '3.5 mi' },
                { name: 'David Kim', role: 'Server', rating: 4.7, distance: '4.2 mi' },
              ].map((replacement, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-sangria text-white">
                        {replacement.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{replacement.name}</div>
                      <div className="text-sm text-slate-600">{replacement.role} • {replacement.distance} away</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{replacement.rating}</span>
                    </div>
                    <Button size="sm" className="bg-sangria hover:bg-merlot">
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignStaff} onOpenChange={setShowAssignStaff}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Staff to Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Role</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bartender">Bartender</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="coordinator">Event Coordinator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience Level</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Level</SelectItem>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rating</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Input placeholder="Search staff by name or skills..." />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {[
                  { name: 'Jennifer Lee', role: 'Head Bartender', rating: 4.9, hourlyRate: 32, available: true },
                  { name: 'Robert Taylor', role: 'Bartender', rating: 4.8, hourlyRate: 28, available: true },
                  { name: 'Lisa Anderson', role: 'Server', rating: 4.7, hourlyRate: 26, available: false },
                  { name: 'Kevin Martinez', role: 'Server', rating: 4.9, hourlyRate: 28, available: true },
                  { name: 'Amanda White', role: 'Event Coordinator', rating: 5.0, hourlyRate: 35, available: true },
                ].map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        disabled={!staff.available}
                      />
                      <Avatar>
                        <AvatarFallback className="bg-sangria text-white">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {staff.name}
                          {!staff.available && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          {staff.role} • ${staff.hourlyRate}/hr
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{staff.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-slate-600">
                3 staff members selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAssignStaff(false)}>
                  Cancel
                </Button>
                <Button className="bg-sangria hover:bg-merlot">
                  Assign Selected Staff
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Verification Dialog */}
      <Dialog open={showPaymentVerification} onOpenChange={setShowPaymentVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Type</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="final">Final Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction Reference</Label>
              <Input placeholder="TXN-12345" className="mt-1" />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" className="mt-1" />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea 
                placeholder="Add any additional notes about this payment..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPaymentVerification(false)}>
                Cancel
              </Button>
              <Button className="bg-sangria hover:bg-merlot">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
