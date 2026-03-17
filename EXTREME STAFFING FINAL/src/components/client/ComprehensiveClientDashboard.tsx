import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Calendar, Clock, MapPin, Users, DollarSign, Star, Plus, Search, Filter, MessageSquare, Heart, CreditCard, FileText, TrendingUp, Bell } from "lucide-react";
import { mockEvents, mockStaff, mockClients, mockInvoices, Event, Staff, Invoice } from "../../data/mockData";
import { EnhancedBookingForm } from "./EnhancedBookingForm";
import { StaffDirectoryRatings } from "./StaffDirectoryRatings";
import { FinancialManagement } from "./FinancialManagement";
import { CommunicationCenter } from "./CommunicationCenter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DataTable } from "../ui/data-table";

interface ComprehensiveClientDashboardProps {
  clientId: string;
}

export function ComprehensiveClientDashboard({ clientId }: ComprehensiveClientDashboardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get client data
  const client = mockClients.find(c => c.id === clientId);
  const clientEvents = mockEvents.filter(event => event.clientId === clientId);
  const upcomingEvents = clientEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = clientEvents.filter(event => new Date(event.date) < new Date());
  const clientInvoices = mockInvoices.filter(invoice => invoice.clientId === clientId);

  // Filter events based on search and status
  const filteredEvents = clientEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalInvestment = clientEvents.reduce((sum, event) => sum + event.budget, 0);
  const totalStaffHired = clientEvents.reduce((sum, event) => sum + event.assignedStaff.length, 0);
  const averageEventBudget = clientEvents.length > 0 ? totalInvestment / clientEvents.length : 0;
  const pendingPayments = clientInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getUrgencyColor = (status: string, date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (status === 'pending' && daysUntil <= 7 && daysUntil > 0) {
      return 'border-l-4 border-l-warning';
    }
    if (status === 'pending' && daysUntil <= 3 && daysUntil > 0) {
      return 'border-l-4 border-l-destructive';
    }
    return '';
  };

  // Define columns for the bookings table
  const bookingColumns = [
    {
      accessorKey: "title",
      header: "Event",
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-muted-foreground">{row.original.eventType}</p>
        </div>
      )
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.date}</p>
          <p className="text-sm text-muted-foreground">{row.original.startTime} - {row.original.endTime}</p>
        </div>
      )
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.location}</span>
        </div>
      )
    },
    {
      accessorKey: "staffRequired",
      header: "Staff",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.assignedStaff.length}/{row.original.staffRequired}</span>
        </div>
      )
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">${row.original.budget.toLocaleString()}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      )
    }
  ];

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="desktop-first-header mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome back, {client?.name || 'Client'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your events, staff, and bookings all in one place
          </p>
        </div>
        <Button onClick={() => setShowBookingForm(true)} size="lg" className="shadow-lg">
          <Plus className="mr-2 h-5 w-5" />
          Book New Event
        </Button>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="desktop-stats-grid mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Events</CardTitle>
            <Calendar className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientEvents.length}</div>
            <p className="text-xs opacity-80 mt-1">
              {upcomingEvents.length} upcoming
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-success to-success/90 text-success-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Investment</CardTitle>
            <DollarSign className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalInvestment.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">
              ${averageEventBudget.toLocaleString()} avg per event
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-info to-info/90 text-info-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Staff Hired</CardTitle>
            <Users className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStaffHired}</div>
            <p className="text-xs opacity-80 mt-1">
              Professional staff members
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-warning to-warning/90 text-warning-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Pending Payments</CardTitle>
            <CreditCard className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${pendingPayments.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">
              Outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {clientEvents.length > 0 ? Math.round((clientEvents.filter(e => e.status === 'completed').length / clientEvents.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Events completed successfully
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {upcomingEvents.filter(e => e.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex lg:grid w-full lg:grid-cols-6 lg:w-fit bg-muted/50 rounded-lg p-1 min-w-max lg:min-w-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
              Staff Directory
            </TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
              Financials
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
              Messages
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
              Favorites
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity and Upcoming Events */}
          <div className="desktop-first-2-col">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events</p>
                    <Button onClick={() => setShowBookingForm(true)} className="mt-4">
                      Book Your First Event
                    </Button>
                  </div>
                ) : (
                  upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className={`p-4 rounded-lg border bg-card ${getUrgencyColor(event.status, event.date)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {event.date} at {event.startTime}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4" />
                            {event.assignedStaff.length}/{event.staffRequired} staff
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-4 w-4" />
                            ${event.budget.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setShowBookingForm(true)} className="w-full justify-start" size="lg">
                  <Plus className="mr-3 h-5 w-5" />
                  Book New Event
                </Button>
                <Button onClick={() => setActiveTab("staff")} variant="outline" className="w-full justify-start" size="lg">
                  <Heart className="mr-3 h-5 w-5" />
                  Browse Staff Directory
                </Button>
                <Button onClick={() => setActiveTab("financials")} variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="mr-3 h-5 w-5" />
                  View Invoices
                </Button>
                <Button onClick={() => setActiveTab("messages")} variant="outline" className="w-full justify-start" size="lg">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Message Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Booking Management</h3>
              <p className="text-muted-foreground">View and manage all your event bookings</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            columns={bookingColumns}
            data={filteredEvents}
            searchKey="title"
            className="border-0 shadow-lg"
          />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <StaffDirectoryRatings clientId={clientId} />
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <FinancialManagement clientId={clientId} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <CommunicationCenter clientId={clientId} />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold">Favorite Staff</h3>
            <p className="text-muted-foreground">Your most trusted and preferred staff members</p>
          </div>
          <div className="responsive-grid-2">
            {mockStaff.filter(staff => staff.rating >= 4.5).map((staff) => (
              <Card key={staff.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">{staff.name}</h4>
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{staff.rating}</span>
                        <span className="text-sm text-muted-foreground">({staff.totalEvents} events)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">${staff.hourlyRate}/hr</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {staff.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {staff.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{staff.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Book Again
                    </Button>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Booking Form */}
      {showBookingForm && (
        <EnhancedBookingForm
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          clientId={clientId}
        />
      )}
    </div>
  );
}