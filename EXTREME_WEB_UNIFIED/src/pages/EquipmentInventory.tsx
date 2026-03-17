import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { 
  Package,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Calendar,
  DollarSign,
  XCircle
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import api from "../services/api";

interface EquipmentInventoryProps {
  userRole: string;
  userId: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'uniform' | 'equipment' | 'supplies';
  sku: string;
  quantity: number;
  minStock: number;
  unit: string;
  cost: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  location: string;
  assignedTo?: string[];
  lastRestocked: string;
  notes?: string;
}

interface Assignment {
  id: string;
  itemId: string;
  itemName: string;
  staffId: string;
  staffName: string;
  quantity: number;
  assignedDate: string;
  returnDate?: string;
  status: 'checked-out' | 'returned' | 'damaged' | 'lost';
  condition?: string;
  notes?: string;
}

export function EquipmentInventory({ userRole, userId }: EquipmentInventoryProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/inventory');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setInventory(data.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          category: (item.category || 'supplies').toLowerCase() as InventoryItem['category'],
          sku: item.sku || '',
          quantity: item.quantity || 0,
          minStock: item.minStock || 0,
          unit: item.unit || 'pieces',
          cost: item.cost || 0,
          status: (item.status || 'in-stock').toLowerCase() as InventoryItem['status'],
          location: item.location || '',
          assignedTo: item.assignedTo || [],
          lastRestocked: item.lastRestocked || '',
          notes: item.notes || undefined,
        })));
      } catch { /* No inventory endpoint yet */ }
      try {
        const res = await api.get('/inventory/assignments');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAssignments(data.map((a: any) => ({
          id: a.id,
          itemId: a.itemId || '',
          itemName: a.item?.name || a.itemName || '',
          staffId: a.staffId || '',
          staffName: a.staff?.user?.name || a.staffName || '',
          quantity: a.quantity || 0,
          assignedDate: a.assignedDate || a.createdAt || '',
          returnDate: a.returnDate || undefined,
          status: (a.status || 'checked-out').toLowerCase() as Assignment['status'],
          condition: a.condition || undefined,
          notes: a.notes || undefined,
        })));
      } catch { /* No assignments endpoint yet */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Summary stats
  const stats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
    lowStock: inventory.filter(i => i.status === 'low-stock').length,
    outOfStock: inventory.filter(i => i.status === 'out-of-stock').length,
    checkedOut: assignments.filter(a => a.status === 'checked-out').length,
    damaged: assignments.filter(a => a.status === 'damaged').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />In Stock</Badge>;
      case "low-stock":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><TrendingDown className="h-3 w-3 mr-1" />Low Stock</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Out of Stock</Badge>;
      case "checked-out":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />Checked Out</Badge>;
      case "returned":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Returned</Badge>;
      case "damaged":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><AlertTriangle className="h-3 w-3 mr-1" />Damaged</Badge>;
      case "lost":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "uniform":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Uniform</Badge>;
      case "equipment":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Equipment</Badge>;
      case "supplies":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Supplies</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Equipment & Inventory</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {userRole === 'sub-admin' ? 'Sub-Admin' : 'Admin'}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Track uniforms, equipment, and supplies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-sangria hover:bg-merlot">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-semibold">{stats.totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-semibold">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low/Out Stock</p>
              <p className="text-xl font-semibold">{stats.lowStock + stats.outOfStock}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Checked Out</p>
              <p className="text-xl font-semibold">{stats.checkedOut}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Banners */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900">Stock Alert</h4>
              <p className="text-sm text-orange-700 mt-1">
                {stats.outOfStock > 0 && `${stats.outOfStock} item(s) out of stock. `}
                {stats.lowStock > 0 && `${stats.lowStock} item(s) running low. `}
                Review and reorder immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments
            {stats.checkedOut > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.checkedOut}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            Low/Out Stock
            {(stats.lowStock + stats.outOfStock) > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.lowStock + stats.outOfStock}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="uniform">Uniforms</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Item Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">SKU</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold">Min Stock</TableHead>
                      <TableHead className="font-semibold">Unit Cost</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInventory.length > 0 ? (
                      paginatedInventory.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getCategoryBadge(item.category)}</TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>
                            <span className={item.quantity <= item.minStock ? "text-orange-600 font-semibold" : "font-medium"}>
                              {item.quantity} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.minStock}</TableCell>
                          <TableCell className="font-medium">${item.cost.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No items found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length} items
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="font-semibold">Staff Member</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold">Assigned Date</TableHead>
                      <TableHead className="font-semibold">Return Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{assignment.itemName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.staffName}</p>
                            <p className="text-xs text-muted-foreground">{assignment.staffId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.quantity}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(assignment.assignedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low & Out of Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Item Name</TableHead>
                      <TableHead className="font-semibold">Current Stock</TableHead>
                      <TableHead className="font-semibold">Min Stock</TableHead>
                      <TableHead className="font-semibold">Need to Order</TableHead>
                      <TableHead className="font-semibold">Est. Cost</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').map((item) => {
                      const needToOrder = Math.max(0, item.minStock * 2 - item.quantity);
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-orange-600 font-semibold">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>{item.minStock} {item.unit}</TableCell>
                          <TableCell className="font-semibold">{needToOrder} {item.unit}</TableCell>
                          <TableCell className="font-medium">
                            ${(needToOrder * item.cost).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
