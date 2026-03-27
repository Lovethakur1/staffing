import { useState, useEffect } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Pagination } from "../components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Star,
  Download,
  Eye,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import { clientService, ClientProfile, CreateClientData } from "../services/client.service";
import { invoiceService } from "../services/invoice.service";

interface ClientsProps {
  userRole: string;
  userId: string;
}

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  eventName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

export function Clients({ userRole }: ClientsProps) {
  const { setCurrentPage, setPageParams } = useNavigation();
  const [activeTab, setActiveTab] = useState("directory");

  // Client Directory filters and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPageState] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Invoice filters and pagination
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [invoiceItemsPerPage, setInvoiceItemsPerPage] = useState(10);

  const [allClients, setAllClients] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    type: "",
    paymentTerms: "",
    notes: ""
  });

  const handleAddClient = async () => {
    if (!newClientForm.name || !newClientForm.email || !newClientForm.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await clientService.createClient({
        name: newClientForm.name,
        email: newClientForm.email,
        phone: newClientForm.phone,
        company: newClientForm.company,
        address: newClientForm.address,
        type: newClientForm.type,
        paymentTerms: newClientForm.paymentTerms,
        notes: newClientForm.notes
      });
      
      // Add to local state
      const newClient = {
        id: result.id,
        name: newClientForm.name,
        company: newClientForm.company || 'N/A',
        email: newClientForm.email,
        phone: newClientForm.phone,
        location: newClientForm.address,
        totalEvents: 0,
        totalSpent: 0,
        averageRating: 0,
        status: newClientForm.type || 'regular',
        joinDate: new Date().toISOString(),
        lastEvent: null,
        outstandingBalance: 0,
        lifetimeValue: 0,
        upcomingEvents: 0,
        accountManager: 'Unassigned',
      };
      
      setAllClients(prev => [newClient, ...prev]);
      toast.success("New client added successfully!");
      setShowAddClientDialog(false);
      
      // Reset form
      setNewClientForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        type: "",
        paymentTerms: "",
        notes: ""
      });
    } catch (error: any) {
      console.error('Failed to add client:', error);
      toast.error(error.response?.data?.error || "Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const res = await clientService.getClients({ page: 1, limit: 1000 });
        const mappedClients = res.data.map((c: any) => ({
          id: c.id,
          name: c.user?.name || 'Unknown',
          company: c.company || 'Unknown',
          email: c.user?.email || '',
          phone: c.user?.phone || '',
          location: c.address || '',
          totalEvents: c.totalEvents || 0,
          totalSpent: c.totalSpent || 0,
          averageRating: c.rating || 0,
          status: c.type || 'active',
          joinDate: c.user?.createdAt || new Date().toISOString(),
          lastEvent: new Date().toISOString(), // Mock for now if not joined
          outstandingBalance: 0,
          lifetimeValue: c.totalSpent || 0,
          upcomingEvents: 0,
          accountManager: 'Unassigned',
        }));
        setAllClients(mappedClients);
      } catch (error) {
        toast.error('Failed to load clients');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
    const fetchInvoices = async () => {
      try {
        const invoices = await invoiceService.getInvoices();
        setAllInvoices((invoices || []).map((inv: any) => ({
          id: inv.invoiceNumber || inv.id,
          clientId: inv.clientId || '',
          clientName: inv.client?.user?.name || inv.client?.companyName || '',
          eventName: inv.event?.title || '',
          amount: inv.amount || 0,
          status: (inv.status || 'pending').toLowerCase() as Invoice['status'],
          issueDate: inv.createdAt || '',
          dueDate: inv.dueDate || '',
          paidDate: inv.paidDate || undefined,
        })));
      } catch { /* invoices optional */ }
    };
    fetchInvoices();
  }, []);

  // Compute outstanding balance per client from invoices
  useEffect(() => {
    if (allInvoices.length === 0 || allClients.length === 0) return;
    const outstandingByClient: Record<string, number> = {};
    allInvoices.forEach((inv) => {
      if (inv.status === 'pending' || inv.status === 'overdue') {
        outstandingByClient[inv.clientId] = (outstandingByClient[inv.clientId] || 0) + inv.amount;
      }
    });
    setAllClients(prev => prev.map(client => ({
      ...client,
      outstandingBalance: outstandingByClient[client.id] || 0,
    })));
  }, [allInvoices]);

  // Filter clients
  const filteredClients = allClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "company":
        return a.company.localeCompare(b.company);
      case "totalSpent":
        return b.totalSpent - a.totalSpent;
      case "totalEvents":
        return b.totalEvents - a.totalEvents;
      case "rating":
        return b.averageRating - a.averageRating;
      case "joinDate":
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      default:
        return 0;
    }
  });

  // Paginate clients
  const totalClients = sortedClients.length;
  const totalPages = Math.ceil(totalClients / itemsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter invoices
  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.eventName.toLowerCase().includes(invoiceSearch.toLowerCase());

    const matchesStatus = invoiceStatusFilter === "all" || invoice.status === invoiceStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate invoices
  const totalInvoices = filteredInvoices.length;
  const invoiceTotalPages = Math.ceil(totalInvoices / invoiceItemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (invoiceCurrentPage - 1) * invoiceItemsPerPage,
    invoiceCurrentPage * invoiceItemsPerPage
  );

  // Calculate statistics
  const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidRevenue = allInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingRevenue = allInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueRevenue = allInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const totalOutstanding = allClients.reduce((sum, client) => sum + client.outstandingBalance, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "platinum":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Platinum</Badge>;
      case "gold":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Gold</Badge>;
      case "silver":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Silver</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewClient = (clientId: string) => {
    setCurrentPage("client-detail", { clientId });
  };

  const handleViewInvoice = (invoiceId: string) => {
    setCurrentPage("invoice-detail", { invoiceId });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-1">Client Directory</h1>
              <p className="text-muted-foreground">
                Manage clients, invoices, and business relationships
              </p>
            </div>
            <Button onClick={() => setShowAddClientDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-semibold mt-1">{allClients.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {allClients.filter(c => c.upcomingEvents > 0).length} with upcoming events
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold mt-1">${(totalRevenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      ${(paidRevenue / 1000).toFixed(0)}K paid
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-semibold mt-1">${(totalOutstanding / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {allInvoices.filter(inv => inv.status === 'pending').length} pending invoices
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue Amount</p>
                    <p className="text-2xl font-semibold mt-1">${(overdueRevenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {allInvoices.filter(inv => inv.status === 'overdue').length} overdue invoices
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="directory">
              <Users className="h-4 w-4 mr-2" />
              Client Directory
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="h-4 w-4 mr-2" />
              Invoices
              {allInvoices.filter(inv => inv.status === 'overdue').length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white h-5 px-1.5">
                  {allInvoices.filter(inv => inv.status === 'overdue').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Client Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>
                      {totalClients} total clients found
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 sm:w-[300px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPageState(1);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPageState(1);
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px]">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="totalSpent">Total Spent</SelectItem>
                        <SelectItem value="totalEvents">Total Events</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="joinDate">Join Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total Events</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Outstanding</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead>Last Event</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No clients found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedClients.map((client) => (
                          <TableRow key={client.id} className="cursor-pointer hover:bg-slate-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-[#5E1916] text-white">
                                    {client.name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{client.name}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {client.company}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{client.email}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{client.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(client.status)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {client.totalEvents}
                              {client.upcomingEvents > 0 && (
                                <div className="text-xs text-blue-600 mt-0.5">
                                  +{client.upcomingEvents} upcoming
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${client.totalSpent.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {client.outstandingBalance > 0 ? (
                                <span className="font-medium text-yellow-700">
                                  ${client.outstandingBalance.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-green-600">$0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{client.averageRating}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(client.lastEvent).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewClient(client.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalClients > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalClients}
                    onPageChange={setCurrentPageState}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(value);
                      setCurrentPageState(1);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            {/* Invoice Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-2xl font-semibold mt-1 text-green-700">
                        ${(paidRevenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {allInvoices.filter(inv => inv.status === 'paid').length} invoices
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-semibold mt-1 text-yellow-700">
                        ${(pendingRevenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {allInvoices.filter(inv => inv.status === 'pending').length} invoices
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-semibold mt-1 text-red-700">
                        ${(overdueRevenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {allInvoices.filter(inv => inv.status === 'overdue').length} invoices
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Invoices</CardTitle>
                    <CardDescription>
                      {totalInvoices} total invoices found
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 sm:w-[300px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search invoices..."
                        value={invoiceSearch}
                        onChange={(e) => {
                          setInvoiceSearch(e.target.value);
                          setInvoiceCurrentPage(1);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={invoiceStatusFilter} onValueChange={(value) => {
                      setInvoiceStatusFilter(value);
                      setInvoiceCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No invoices found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>
                              <button
                                onClick={() => handleViewClient(invoice.clientId)}
                                className="text-blue-600 hover:underline text-left"
                              >
                                {invoice.clientName}
                              </button>
                            </TableCell>
                            <TableCell>{invoice.eventName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(invoice.issueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${invoice.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewInvoice(invoice.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalInvoices > 0 && (
                  <Pagination
                    currentPage={invoiceCurrentPage}
                    totalPages={invoiceTotalPages}
                    itemsPerPage={invoiceItemsPerPage}
                    totalItems={totalInvoices}
                    onPageChange={setInvoiceCurrentPage}
                    onItemsPerPageChange={(value) => {
                      setInvoiceItemsPerPage(value);
                      setInvoiceCurrentPage(1);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Client Dialog */}
        <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the details of the new client to add them to your directory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name *</Label>
                  <Input 
                    placeholder="John Smith" 
                    value={newClientForm.name}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    placeholder="Acme Corp" 
                    value={newClientForm.company}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email" 
                    placeholder="john@acme.com" 
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input 
                    placeholder="+1 (555) 123-4567" 
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                  placeholder="123 Main St, New York, NY" 
                  value={newClientForm.address}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select 
                    value={newClientForm.type}
                    onValueChange={(value) => setNewClientForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select 
                    value={newClientForm.paymentTerms}
                    onValueChange={(value) => setNewClientForm(prev => ({ ...prev, paymentTerms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-15">Net 15</SelectItem>
                      <SelectItem value="net-30">Net 30</SelectItem>
                      <SelectItem value="net-45">Net 45</SelectItem>
                      <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Additional notes about this client..." 
                  rows={3}
                  value={newClientForm.notes}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddClientDialog(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddClient} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
