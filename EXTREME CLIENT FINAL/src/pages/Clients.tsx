import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { 
  Search, 
  Plus, 
  Filter,
  Users,
  Calendar,
  DollarSign,
  Star,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Send,
  Download,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Building2,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ClientsProps {
  userRole: string;
  userId: string;
}

interface Invoice {
  id: string;
  eventName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  method?: string;
}

interface Booking {
  id: string;
  eventName: string;
  date: string;
  venue: string;
  staffCount: number;
  totalCost: number;
  status: 'completed' | 'upcoming' | 'cancelled';
  rating?: number;
  feedback?: string;
}

interface ClientData {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  totalEvents: number;
  totalSpent: number;
  averageRating: number;
  status: string;
  joinDate: string;
  lastEvent: string;
  eventTypes: string[];
  preferredStaff: string[];
  invoices: Invoice[];
  bookingHistory: Booking[];
  outstandingBalance: number;
  lifetimeValue: number;
}

export function Clients({ userRole }: ClientsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);

  // Mock clients data with comprehensive information
  const clients: ClientData[] = [
    {
      id: "client-1",
      name: "Sarah Johnson",
      company: "EventCorp Inc.",
      email: "sarah@eventcorp.com",
      phone: "+1-555-0123",
      location: "New York, NY",
      totalEvents: 12,
      totalSpent: 48200,
      averageRating: 4.8,
      status: "active",
      joinDate: "2024-01-15",
      lastEvent: "2024-10-15",
      eventTypes: ["Corporate", "Gala", "Meetings"],
      preferredStaff: ["Emma Williams", "James Rodriguez"],
      outstandingBalance: 5200,
      lifetimeValue: 53400,
      invoices: [
        { id: 'inv-001', eventName: 'Annual Gala 2024', amount: 8500, status: 'paid', dueDate: '2024-10-15', paidDate: '2024-10-14', method: 'Credit Card' },
        { id: 'inv-002', eventName: 'Q3 Board Meeting', amount: 2300, status: 'paid', dueDate: '2024-09-20', paidDate: '2024-09-18', method: 'Bank Transfer' },
        { id: 'inv-003', eventName: 'Holiday Party', amount: 5200, status: 'pending', dueDate: '2024-11-01' }
      ],
      bookingHistory: [
        { id: 'book-001', eventName: 'Annual Gala 2024', date: '2024-10-15', venue: 'Grand Ballroom', staffCount: 12, totalCost: 8500, status: 'completed', rating: 5, feedback: 'Excellent service, staff was professional and attentive.' },
        { id: 'book-002', eventName: 'Q3 Board Meeting', date: '2024-09-20', venue: 'Conference Center', staffCount: 4, totalCost: 2300, status: 'completed', rating: 5, feedback: 'Perfect execution, very pleased with the team.' },
        { id: 'book-003', eventName: 'Holiday Party', date: '2024-12-15', venue: 'Rooftop Lounge', staffCount: 8, totalCost: 5200, status: 'upcoming' }
      ]
    },
    {
      id: "client-2",
      name: "Michael Chen",
      company: "Luxury Events Ltd.",
      email: "michael@luxuryevents.com",
      phone: "+1-555-0124",
      location: "Los Angeles, CA",
      totalEvents: 8,
      totalSpent: 32400,
      averageRating: 4.9,
      status: "active",
      joinDate: "2024-02-20",
      lastEvent: "2024-10-20",
      eventTypes: ["Wedding", "Private"],
      preferredStaff: ["Emma Williams", "David Kim"],
      outstandingBalance: 0,
      lifetimeValue: 32400,
      invoices: [
        { id: 'inv-004', eventName: 'Smith Wedding', amount: 12500, status: 'paid', dueDate: '2024-10-20', paidDate: '2024-10-19', method: 'Check' },
        { id: 'inv-005', eventName: 'Corporate Mixer', amount: 3800, status: 'paid', dueDate: '2024-09-15', paidDate: '2024-09-14', method: 'Credit Card' }
      ],
      bookingHistory: [
        { id: 'book-004', eventName: 'Smith Wedding', date: '2024-10-20', venue: 'Riverside Gardens', staffCount: 15, totalCost: 12500, status: 'completed', rating: 5, feedback: 'Outstanding work! The event was flawless.' },
        { id: 'book-005', eventName: 'Corporate Mixer', date: '2024-09-15', venue: 'Downtown Loft', staffCount: 6, totalCost: 3800, status: 'completed', rating: 5 }
      ]
    },
    {
      id: "client-3",
      name: "Jennifer Davis",
      company: "Tech Innovations",
      email: "jennifer@techinnovations.com",
      phone: "+1-555-0125",
      location: "San Francisco, CA",
      totalEvents: 6,
      totalSpent: 18700,
      averageRating: 4.6,
      status: "active",
      joinDate: "2024-03-10",
      lastEvent: "2024-09-28",
      eventTypes: ["Corporate", "Product Launch"],
      preferredStaff: ["Sophie Brown", "James Rodriguez"],
      outstandingBalance: 2800,
      lifetimeValue: 21500,
      invoices: [
        { id: 'inv-006', eventName: 'Product Launch Q3', amount: 2800, status: 'overdue', dueDate: '2024-10-01' },
        { id: 'inv-007', eventName: 'Tech Summit', amount: 4200, status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-14', method: 'Bank Transfer' }
      ],
      bookingHistory: [
        { id: 'book-006', eventName: 'Product Launch Q3', date: '2024-09-28', venue: 'Innovation Center', staffCount: 8, totalCost: 2800, status: 'completed', rating: 4 },
        { id: 'book-007', eventName: 'Tech Summit', date: '2024-08-15', venue: 'Convention Hall', staffCount: 10, totalCost: 4200, status: 'completed', rating: 5 }
      ]
    },
    {
      id: "client-4",
      name: "Robert Wilson",
      company: "Global Corp",
      email: "robert@globalcorp.com",
      phone: "+1-555-0126",
      location: "Chicago, IL",
      totalEvents: 15,
      totalSpent: 62300,
      averageRating: 4.7,
      status: "vip",
      joinDate: "2023-11-05",
      lastEvent: "2024-10-12",
      eventTypes: ["Corporate", "Gala", "Conference"],
      preferredStaff: ["Emma Williams", "Maria Garcia", "Sophie Brown"],
      outstandingBalance: 0,
      lifetimeValue: 75000,
      invoices: [
        { id: 'inv-008', eventName: 'Annual Conference', amount: 18500, status: 'paid', dueDate: '2024-10-12', paidDate: '2024-10-10', method: 'Wire Transfer' },
        { id: 'inv-009', eventName: 'Board Dinner', amount: 6200, status: 'paid', dueDate: '2024-09-05', paidDate: '2024-09-03', method: 'Credit Card' }
      ],
      bookingHistory: [
        { id: 'book-008', eventName: 'Annual Conference', date: '2024-10-12', venue: 'McCormick Center', staffCount: 25, totalCost: 18500, status: 'completed', rating: 5, feedback: 'Exceptional service as always!' },
        { id: 'book-009', eventName: 'Board Dinner', date: '2024-09-05', venue: 'Executive Club', staffCount: 8, totalCost: 6200, status: 'completed', rating: 5 }
      ]
    },
    {
      id: "client-5",
      name: "Lisa Thompson",
      company: "Creative Studios",
      email: "lisa@creativestudios.com",
      phone: "+1-555-0127",
      location: "Miami, FL",
      totalEvents: 4,
      totalSpent: 12800,
      averageRating: 4.3,
      status: "inactive",
      joinDate: "2024-04-22",
      lastEvent: "2024-07-15",
      eventTypes: ["Private", "Art Show"],
      preferredStaff: ["David Kim"],
      outstandingBalance: 0,
      lifetimeValue: 12800,
      invoices: [
        { id: 'inv-010', eventName: 'Art Gallery Opening', amount: 4500, status: 'paid', dueDate: '2024-07-15', paidDate: '2024-07-12', method: 'Credit Card' }
      ],
      bookingHistory: [
        { id: 'book-010', eventName: 'Art Gallery Opening', date: '2024-07-15', venue: 'Wynwood Arts District', staffCount: 6, totalCost: 4500, status: 'completed', rating: 4 }
      ]
    }
  ];

  const clientStats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === "active").length,
    vipClients: clients.filter(c => c.status === "vip").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    averageRating: clients.reduce((sum, c) => sum + c.averageRating, 0) / clients.length,
    outstandingInvoices: clients.reduce((sum, c) => sum + c.outstandingBalance, 0),
    lifetimeValue: clients.reduce((sum, c) => sum + c.lifetimeValue, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "vip":
        return <Badge className="bg-purple-100 text-purple-700">VIP</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topClients = [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  const viewClientDetails = (client: ClientData) => {
    setSelectedClient(client);
    setShowClientDialog(true);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="desktop-text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="desktop-text-sm text-muted-foreground">
            Manage client relationships, payments, and booking history
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="desktop-stats-grid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Clients</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.vipClients}</div>
            <p className="text-xs text-muted-foreground">Premium tier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${clientStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Client satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${clientStats.outstandingInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="vip">VIP</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="wide-content-grid">
            {/* Client List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Client Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.company}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{client.totalEvents}</TableCell>
                        <TableCell>${client.totalSpent.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {client.averageRating}
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.outstandingBalance > 0 ? (
                            <span className="text-red-600 font-medium">
                              ${client.outstandingBalance.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-green-600">$0</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => viewClientDetails(client)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Clients Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={client.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{client.name}</p>
                        <p className="text-sm text-muted-foreground">${client.totalSpent.toLocaleString()}</p>
                      </div>
                      {getStatusBadge(client.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="adaptive-content-grid">
                {clients.filter(c => c.status === "active").map((client) => (
                  <div key={client.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.company}</p>
                        </div>
                      </div>
                      {getStatusBadge(client.status)}
                    </div>
                    <div className="wide-content-grid text-sm">
                      <div>
                        <p className="text-muted-foreground">Events</p>
                        <p className="font-medium">{client.totalEvents}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">${client.totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{client.averageRating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Event</p>
                        <p className="font-medium">{client.lastEvent}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Event Types:</p>
                      <div className="flex gap-1 flex-wrap">
                        {client.eventTypes.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => viewClientDetails(client)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
          <Card>
            <CardHeader>
              <CardTitle>VIP Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.filter(c => c.status === "vip").map((client) => (
                  <div key={client.id} className="p-6 border-2 border-purple-200 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold">{client.name}</h3>
                          <p className="text-muted-foreground">{client.company}</p>
                        </div>
                      </div>
                      {getStatusBadge(client.status)}
                    </div>
                    <div className="adaptive-stats-grid text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Events</p>
                        <p className="text-lg font-bold">{client.totalEvents}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Revenue</p>
                        <p className="text-lg font-bold">${client.totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lifetime Value</p>
                        <p className="text-lg font-bold">${client.lifetimeValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Average Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-bold">{client.averageRating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Preferred Staff:</p>
                      <div className="flex gap-2 flex-wrap">
                        {client.preferredStaff.map((staff, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-700">
                            {staff}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices & Payments Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment & Invoice Management</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track all client invoices, payments, and outstanding balances
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.flatMap(client =>
                    client.invoices.map(invoice => ({
                      ...invoice,
                      clientName: client.name,
                      clientCompany: client.company
                    }))
                  ).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.clientName}</p>
                          <p className="text-sm text-muted-foreground">{invoice.clientCompany}</p>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.eventName}</TableCell>
                      <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.method ? (
                          <Badge variant="outline">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {invoice.method}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.info('Viewing invoice details...')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast.success('Invoice downloaded!')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toast.success('Invoice reminder sent!')}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedClient?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedClient?.name}
                  {selectedClient && getStatusBadge(selectedClient.status)}
                </div>
                <p className="text-sm font-normal text-muted-foreground">{selectedClient?.company}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Complete client profile with booking history, invoices, and feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.company}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Events</p>
                          <p className="text-2xl font-bold">{selectedClient.totalEvents}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold">${selectedClient.totalSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                          <p className={`text-2xl font-bold ${selectedClient.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${selectedClient.outstandingBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preferred Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {selectedClient.preferredStaff.map((staff, index) => (
                        <Badge key={index} variant="secondary">
                          {staff}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <div className="space-y-3">
                  {selectedClient.bookingHistory.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{booking.eventName}</h4>
                              <Badge variant={
                                booking.status === 'completed' ? 'default' :
                                booking.status === 'upcoming' ? 'secondary' : 'outline'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(booking.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.venue}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.staffCount} staff members</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>${booking.totalCost.toLocaleString()}</span>
                              </div>
                            </div>
                            {booking.rating && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < booking.rating!
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {booking.rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClient.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.eventName}</TableCell>
                        <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <div className="space-y-4">
                  {selectedClient.bookingHistory
                    .filter(booking => booking.feedback)
                    .map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{booking.eventName}</CardTitle>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (booking.rating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{booking.feedback}</p>
                        </CardContent>
                      </Card>
                    ))}
                  {selectedClient.bookingHistory.filter(b => b.feedback).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No feedback available yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
