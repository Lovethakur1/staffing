import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  DollarSign,
  XCircle,
  Users,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShirtIcon,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { staffService } from "../services/staff.service";

interface EquipmentInventoryProps {
  userRole: string;
  userId: string;
}

type Category = 'uniform' | 'equipment' | 'supplies';
type ItemStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
type AssignStatus = 'checked-out' | 'returned' | 'damaged' | 'lost';

interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  sku: string;
  quantity: number;
  minStock: number;
  unit: string;
  cost: number;
  location: string;
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
  status: AssignStatus;
  notes?: string;
}

const LS_ITEMS = 'eq_inventory_items';
const LS_ASSIGNS = 'eq_inventory_assignments';

function loadItems(): InventoryItem[] {
  try { return JSON.parse(localStorage.getItem(LS_ITEMS) || '[]'); } catch { return []; }
}
function saveItems(items: InventoryItem[]) {
  localStorage.setItem(LS_ITEMS, JSON.stringify(items));
}
function loadAssigns(): Assignment[] {
  try { return JSON.parse(localStorage.getItem(LS_ASSIGNS) || '[]'); } catch { return []; }
}
function saveAssigns(a: Assignment[]) {
  localStorage.setItem(LS_ASSIGNS, JSON.stringify(a));
}
function genId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function getItemStatus(item: InventoryItem): ItemStatus {
  if (item.quantity === 0) return 'out-of-stock';
  if (item.quantity <= item.minStock) return 'low-stock';
  return 'in-stock';
}

const BLANK_ITEM: Omit<InventoryItem, 'id'> = {
  name: '', category: 'supplies', sku: '', quantity: 0, minStock: 0,
  unit: 'pieces', cost: 0, location: '', lastRestocked: new Date().toISOString().split('T')[0], notes: '',
};

export function EquipmentInventory({ userRole }: EquipmentInventoryProps) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const [inventory, setInventory] = useState<InventoryItem[]>(loadItems);
  const [assignments, setAssignments] = useState<Assignment[]>(loadAssigns);
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

  // Dialogs
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [itemForm, setItemForm] = useState<Omit<InventoryItem, 'id'>>(BLANK_ITEM);
  const [assignForm, setAssignForm] = useState({ itemId: '', staffId: '', quantity: 1, notes: '' });
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    staffService.getStaffList({ take: 200 }).then(res => {
      const list = Array.isArray(res) ? res : (res?.data || []);
      setStaffList(list.map((s: any) => ({
        id: s.id,
        name: s.name || s.user?.name || s.user?.email || s.id,
      })));
    }).catch(() => {});
  }, []);

  // Persist on every change
  useEffect(() => { saveItems(inventory); }, [inventory]);
  useEffect(() => { saveAssigns(assignments); }, [assignments]);

  // â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const stats = useMemo(() => {
    const withStatus = inventory.map(i => ({ ...i, status: getItemStatus(i) }));
    return {
      total: inventory.length,
      totalValue: inventory.reduce((s, i) => s + i.quantity * i.cost, 0),
      lowStock: withStatus.filter(i => i.status === 'low-stock').length,
      outOfStock: withStatus.filter(i => i.status === 'out-of-stock').length,
      checkedOut: assignments.filter(a => a.status === 'checked-out').length,
      uniforms: inventory.filter(i => i.category === 'uniform').length,
      equipment: inventory.filter(i => i.category === 'equipment').length,
      supplies: inventory.filter(i => i.category === 'supplies').length,
    };
  }, [inventory, assignments]);

  // â”€â”€ Filtered inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return inventory.filter(item => {
      const status = getItemStatus(item);
      const matchQ = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchSt = statusFilter === 'all' || status === statusFilter;
      return matchQ && matchCat && matchSt;
    });
  }, [inventory, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getStatusBadge = (status: ItemStatus | AssignStatus) => {
    switch (status) {
      case 'in-stock': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />In Stock</Badge>;
      case 'low-stock': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><TrendingDown className="h-3 w-3 mr-1" />Low Stock</Badge>;
      case 'out-of-stock': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Out of Stock</Badge>;
      case 'checked-out': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />Checked Out</Badge>;
      case 'returned': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Returned</Badge>;
      case 'damaged': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><AlertTriangle className="h-3 w-3 mr-1" />Damaged</Badge>;
      case 'lost': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Lost</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: Category) => {
    switch (category) {
      case 'uniform': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><ShirtIcon className="h-3 w-3 mr-1" />Uniform</Badge>;
      case 'equipment': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Wrench className="h-3 w-3 mr-1" />Equipment</Badge>;
      case 'supplies': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Package className="h-3 w-3 mr-1" />Supplies</Badge>;
    }
  };

  // â”€â”€ CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openAdd = () => { setEditingItem(null); setItemForm(BLANK_ITEM); setShowItemDialog(true); };
  const openEdit = (item: InventoryItem) => { setEditingItem(item); setItemForm({ ...item }); setShowItemDialog(true); };

  const handleSaveItem = () => {
    if (!itemForm.name.trim()) { toast.error('Item name is required'); return; }
    if (editingItem) {
      setInventory(prev => prev.map(i => i.id === editingItem.id ? { ...itemForm, id: editingItem.id } : i));
      toast.success('Item updated');
    } else {
      const sku = itemForm.sku || `${itemForm.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-5)}`;
      setInventory(prev => [...prev, { ...itemForm, id: genId(), sku }]);
      toast.success('Item added to inventory');
    }
    setShowItemDialog(false);
  };

  const handleDeleteItem = () => {
    if (!deletingItem) return;
    setInventory(prev => prev.filter(i => i.id !== deletingItem.id));
    setAssignments(prev => prev.filter(a => a.itemId !== deletingItem.id));
    toast.success('Item removed from inventory');
    setShowDeleteDialog(false);
  };

  const handleAssign = () => {
    const item = inventory.find(i => i.id === assignForm.itemId);
    const staff = staffList.find(s => s.id === assignForm.staffId);
    if (!item || !staff) { toast.error('Select an item and staff member'); return; }
    if (assignForm.quantity <= 0) { toast.error('Quantity must be at least 1'); return; }
    if (assignForm.quantity > item.quantity) { toast.error(`Only ${item.quantity} ${item.unit} available`); return; }
    const newAssign: Assignment = {
      id: genId(),
      itemId: item.id,
      itemName: item.name,
      staffId: staff.id,
      staffName: staff.name,
      quantity: assignForm.quantity,
      assignedDate: new Date().toISOString(),
      status: 'checked-out',
      notes: assignForm.notes,
    };
    setAssignments(prev => [...prev, newAssign]);
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - assignForm.quantity } : i));
    toast.success(`${item.name} assigned to ${staff.name}`);
    setShowAssignDialog(false);
    setAssignForm({ itemId: '', staffId: '', quantity: 1, notes: '' });
  };

  const handleReturnAssignment = (assignment: Assignment, newStatus: AssignStatus) => {
    setAssignments(prev => prev.map(a => a.id === assignment.id
      ? { ...a, status: newStatus, returnDate: new Date().toISOString() }
      : a
    ));
    if (newStatus === 'returned') {
      setInventory(prev => prev.map(i => i.id === assignment.itemId
        ? { ...i, quantity: i.quantity + assignment.quantity }
        : i
      ));
    }
    toast.success(`Assignment marked as ${newStatus}`);
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold">Equipment & Inventory</h1>
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
          <Button variant="outline" size="sm" onClick={() => setShowAssignDialog(true)} disabled={inventory.length === 0}>
            <Users className="h-4 w-4 mr-2" />
            Assign to Staff
          </Button>
          <Button className="bg-sangria hover:bg-merlot" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-semibold">{stats.total}</p>
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
              <p className="text-sm text-muted-foreground">Low / Out of Stock</p>
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

      {/* Stock alert */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Stock Alert</p>
              <p className="text-sm text-orange-700 mt-1">
                {stats.outOfStock > 0 && `${stats.outOfStock} item(s) out of stock. `}
                {stats.lowStock > 0 && `${stats.lowStock} item(s) running low. `}
                Review and reorder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments
            {stats.checkedOut > 0 && (
              <Badge className="ml-1.5 bg-blue-500 text-white h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                {stats.checkedOut}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            Low Stock
            {(stats.lowStock + stats.outOfStock) > 0 && (
              <Badge className="ml-1.5 bg-orange-500 text-white h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                {stats.lowStock + stats.outOfStock}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* â”€â”€ INVENTORY TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="inventory" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>{filtered.length} of {inventory.length} items</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search name, SKU, locationâ€¦" value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setPage(1); }} className="pl-9 w-[220px]" />
                  </div>
                  <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="uniform">Uniforms</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
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
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Qty / Min</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16">
                          <Package className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
                          <p className="font-semibold text-muted-foreground">No inventory items yet</p>
                          <p className="text-sm text-muted-foreground mt-1 mb-4">Add uniforms, equipment, and supplies to start tracking stock</p>
                          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First Item</Button>
                        </TableCell>
                      </TableRow>
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          No items match your filters
                        </TableCell>
                      </TableRow>
                    ) : paginated.map(item => {
                      const status = getItemStatus(item);
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{item.notes}</p>}
                            </div>
                          </TableCell>
                          <TableCell>{getCategoryBadge(item.category)}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{item.sku || 'â€”'}</TableCell>
                          <TableCell>
                            <span className={item.quantity <= item.minStock ? 'text-orange-600 font-semibold' : 'font-medium'}>
                              {item.quantity}
                            </span>
                            <span className="text-muted-foreground text-xs"> / {item.minStock} {item.unit}</span>
                          </TableCell>
                          <TableCell className="font-medium">${item.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.location || 'â€”'}</TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setViewItem(item); setShowDetailDialog(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"
                                onClick={() => { setDeletingItem(item); setShowDeleteDialog(true); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {(page - 1) * itemsPerPage + 1}â€“{Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* â”€â”€ ASSIGNMENTS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="assignments" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipment Assignments</CardTitle>
                  <CardDescription>{assignments.length} total records â€” {stats.checkedOut} currently checked out</CardDescription>
                </div>
                <Button onClick={() => setShowAssignDialog(true)} disabled={inventory.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />Assign Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Item</TableHead>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Returned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground font-medium">No assignments yet</p>
                          <p className="text-sm text-muted-foreground mt-1">Use "Assign Item" to check out equipment to staff</p>
                        </TableCell>
                      </TableRow>
                    ) : assignments.map(a => (
                      <TableRow key={a.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{a.itemName}</TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{a.staffName}</p>
                          {a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}
                        </TableCell>
                        <TableCell>{a.quantity}</TableCell>
                        <TableCell className="text-sm">{new Date(a.assignedDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">
                          {a.returnDate ? new Date(a.returnDate).toLocaleDateString() : 'â€”'}
                        </TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                        <TableCell className="text-right">
                          {a.status === 'checked-out' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 text-xs"
                                onClick={() => handleReturnAssignment(a, 'returned')}>Return</Button>
                              <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-700 text-xs"
                                onClick={() => handleReturnAssignment(a, 'damaged')}>Damaged</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => handleReturnAssignment(a, 'lost')}>Lost</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* â”€â”€ LOW STOCK TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="low-stock" className="space-y-4 mt-6">
          {(stats.lowStock + stats.outOfStock) === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="h-14 w-14 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-1">All Stock Levels Healthy</h3>
                <p className="text-muted-foreground text-sm">No items are running low or out of stock</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Reorder Required ({stats.lowStock + stats.outOfStock} items)
                </CardTitle>
                <CardDescription>Items that need restocking to maintain minimum inventory levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Min Required</TableHead>
                        <TableHead>To Order</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Est. Reorder Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory
                        .filter(i => getItemStatus(i) !== 'in-stock')
                        .sort((a, b) => getItemStatus(a) === 'out-of-stock' ? -1 : 1)
                        .map(item => {
                          const toOrder = Math.max(0, item.minStock * 2 - item.quantity);
                          return (
                            <TableRow key={item.id} className="hover:bg-muted/30">
                              <TableCell>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.location}</p>
                              </TableCell>
                              <TableCell>{getCategoryBadge(item.category)}</TableCell>
                              <TableCell className="text-orange-600 font-semibold">{item.quantity} {item.unit}</TableCell>
                              <TableCell className="text-muted-foreground">{item.minStock} {item.unit}</TableCell>
                              <TableCell className="font-semibold">{toOrder} {item.unit}</TableCell>
                              <TableCell>${item.cost.toFixed(2)}</TableCell>
                              <TableCell className="font-semibold text-primary">${(toOrder * item.cost).toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(getItemStatus(item))}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-orange-900">Total Estimated Reorder Cost</p>
                    <p className="text-sm text-orange-700 mt-0.5">Based on minimum restock levels Ã— 2</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-800">
                    ${inventory
                      .filter(i => getItemStatus(i) !== 'in-stock')
                      .reduce((sum, i) => sum + Math.max(0, i.minStock * 2 - i.quantity) * i.cost, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* â”€â”€ ANALYTICS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShirtIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uniforms</p>
                    <p className="text-2xl font-semibold">{stats.uniforms}</p>
                  </div>
                </div>
                <Progress value={stats.total ? (stats.uniforms / stats.total) * 100 : 0} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Equipment</p>
                    <p className="text-2xl font-semibold">{stats.equipment}</p>
                  </div>
                </div>
                <Progress value={stats.total ? (stats.equipment / stats.total) * 100 : 0} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplies</p>
                    <p className="text-2xl font-semibold">{stats.supplies}</p>
                  </div>
                </div>
                <Progress value={stats.total ? (stats.supplies / stats.total) * 100 : 0} className="h-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Value by category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Inventory Value by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No items yet</p>
                ) : (
                  (['uniform', 'equipment', 'supplies'] as Category[]).map(cat => {
                    const catItems = inventory.filter(i => i.category === cat);
                    const val = catItems.reduce((s, i) => s + i.quantity * i.cost, 0);
                    const pct = stats.totalValue > 0 ? (val / stats.totalValue) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{cat}s</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{catItems.length} items</span>
                            <span className="text-sm font-semibold">${val.toLocaleString()}</span>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2.5" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Assignment breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Assignment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No assignments yet</p>
                ) : (
                  (['checked-out', 'returned', 'damaged', 'lost'] as AssignStatus[]).map(s => {
                    const count = assignments.filter(a => a.status === s).length;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className="w-28 flex-shrink-0">{getStatusBadge(s)}</div>
                        <div className="flex-1">
                          <Progress value={assignments.length ? (count / assignments.length) * 100 : 0} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Most assigned items */}
          {assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Frequently Assigned Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    assignments.reduce((acc, a) => {
                      acc[a.itemName] = (acc[a.itemName] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{name}</span>
                        <Badge variant="secondary">{count} assignment{count !== 1 ? 's' : ''}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* â”€â”€ ADD / EDIT ITEM DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update inventory item details.' : 'Add a new uniform, equipment, or supply item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-2">
              <Label>Item Name *</Label>
              <Input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Black Polo Shirt" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={itemForm.category} onValueChange={v => setItemForm(f => ({ ...f, category: v as Category }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>SKU (auto if blank)</Label>
              <Input value={itemForm.sku} onChange={e => setItemForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. UNI-001" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={0} value={itemForm.quantity}
                onChange={e => setItemForm(f => ({ ...f, quantity: Math.max(0, +e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Min Stock Level</Label>
              <Input type="number" min={0} value={itemForm.minStock}
                onChange={e => setItemForm(f => ({ ...f, minStock: Math.max(0, +e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} placeholder="pieces" />
            </div>
            <div className="space-y-2">
              <Label>Unit Cost ($)</Label>
              <Input type="number" min={0} step={0.01} value={itemForm.cost}
                onChange={e => setItemForm(f => ({ ...f, cost: Math.max(0, +e.target.value) }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Storage Location</Label>
              <Input value={itemForm.location} onChange={e => setItemForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Warehouse A, Shelf 3" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea value={itemForm.notes || ''} onChange={e => setItemForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional notesâ€¦" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} className="bg-sangria hover:bg-merlot">
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ DELETE CONFIRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Remove <span className="font-semibold">"{deletingItem?.name}"</span> from inventory? This will also remove all related assignment records. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ ASSIGN TO STAFF DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Item to Staff</DialogTitle>
            <DialogDescription>Check out inventory to a staff member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Item *</Label>
              <Select value={assignForm.itemId} onValueChange={v => setAssignForm(f => ({ ...f, itemId: v, quantity: 1 }))}>
                <SelectTrigger><SelectValue placeholder="Select itemâ€¦" /></SelectTrigger>
                <SelectContent>
                  {inventory.filter(i => i.quantity > 0).map(i => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} ({i.quantity} {i.unit} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Staff Member *</Label>
              <Select value={assignForm.staffId} onValueChange={v => setAssignForm(f => ({ ...f, staffId: v }))}>
                <SelectTrigger><SelectValue placeholder={staffList.length ? 'Select staffâ€¦' : 'Loading staffâ€¦'} /></SelectTrigger>
                <SelectContent>
                  {staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={1}
                max={inventory.find(i => i.id === assignForm.itemId)?.quantity || 1}
                value={assignForm.quantity}
                onChange={e => setAssignForm(f => ({ ...f, quantity: Math.max(1, +e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea rows={2} value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this assignmentâ€¦" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssign} className="bg-sangria hover:bg-merlot">
              <Users className="h-4 w-4 mr-2" />Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ ITEM DETAIL DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewItem?.name}</DialogTitle>
            <DialogDescription>{viewItem && getCategoryBadge(viewItem.category)}</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">SKU</p><p className="font-mono font-medium">{viewItem.sku || 'â€”'}</p></div>
                <div><p className="text-muted-foreground">Status</p>{getStatusBadge(getItemStatus(viewItem))}</div>
                <div><p className="text-muted-foreground">Quantity</p><p className="font-semibold">{viewItem.quantity} {viewItem.unit}</p></div>
                <div><p className="text-muted-foreground">Min Stock</p><p className="font-medium">{viewItem.minStock} {viewItem.unit}</p></div>
                <div><p className="text-muted-foreground">Unit Cost</p><p className="font-semibold">${viewItem.cost.toFixed(2)}</p></div>
                <div><p className="text-muted-foreground">Total Value</p><p className="font-semibold">${(viewItem.quantity * viewItem.cost).toFixed(2)}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Location</p><p className="font-medium">{viewItem.location || 'â€”'}</p></div>
                {viewItem.notes && <div className="col-span-2"><p className="text-muted-foreground">Notes</p><p>{viewItem.notes}</p></div>}
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-2">Active Assignments</p>
                {assignments.filter(a => a.itemId === viewItem.id && a.status === 'checked-out').length === 0
                  ? <p className="text-muted-foreground text-xs">None</p>
                  : assignments.filter(a => a.itemId === viewItem.id && a.status === 'checked-out').map(a => (
                    <div key={a.id} className="flex items-center justify-between py-1">
                      <span className="font-medium">{a.staffName}</span>
                      <span className="text-muted-foreground">{a.quantity} {viewItem.unit} Â· {new Date(a.assignedDate).toLocaleDateString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
            <Button onClick={() => { setShowDetailDialog(false); openEdit(viewItem!); }}>
              <Edit className="h-4 w-4 mr-2" />Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
