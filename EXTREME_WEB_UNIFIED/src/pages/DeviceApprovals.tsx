import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../components/ui/dialog";
import {
  Smartphone, Search, CheckCircle, XCircle, RefreshCw, AlertTriangle,
  Clock, User, Shield, Monitor, Phone, Mail, Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import api from "../services/api";

interface DeviceApprovals {
  userRole: string;
  userId: string;
}

interface DeviceRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  staffPhone?: string;
  staffAvatar?: string;
  currentDevice: {
    id?: string;
    name?: string;
    model?: string;
    brand?: string;
    os?: string;
    lockedAt?: string;
  };
  reason?: string;
  requestedAt: string;
}

export function DeviceApprovals({ userRole, userId }: DeviceApprovals) {
  const { setCurrentPage } = useNavigation();
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DeviceRequest | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/shifts/device/pending');
      setRequests(res.data?.data || []);
    } catch (err: any) {
      toast.error("Failed to load device change requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (request: DeviceRequest) => {
    try {
      setApproving(request.id);
      await api.post(`/shifts/device/approve-change/${request.id}`);
      toast.success(`Device cleared for ${request.staffName}. They can now register a new device.`);
      setRequests(prev => prev.filter(r => r.id !== request.id));
      setShowConfirmDialog(false);
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to approve device change");
    } finally {
      setApproving(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.staffName.toLowerCase().includes(query) ||
      r.staffEmail.toLowerCase().includes(query) ||
      r.currentDevice.name?.toLowerCase().includes(query) ||
      r.currentDevice.model?.toLowerCase().includes(query)
    );
  });

  const getDeviceDisplay = (device: DeviceRequest['currentDevice']) => {
    if (device.name) return device.name;
    if (device.model && device.brand) return `${device.brand} ${device.model}`;
    if (device.model) return device.model;
    return 'Unknown Device';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Device Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff device change requests. When approved, the staff member can register a new device.
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">Pending Requests</p>
              <p className="text-3xl font-bold text-amber-900">{requests.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Device Change Requests</CardTitle>
              <CardDescription>
                Staff members requesting to change their registered device
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff or device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Pending Requests</h3>
              <p className="text-muted-foreground">All device change requests have been processed.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Current Device</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.staffAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {request.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.staffName}</p>
                            <p className="text-sm text-muted-foreground">{request.staffEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{getDeviceDisplay(request.currentDevice)}</p>
                            {request.currentDevice.os && (
                              <p className="text-sm text-muted-foreground">{request.currentDevice.os}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-[200px] truncate" title={request.reason}>
                          {request.reason || 'No reason provided'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(request.requestedAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowConfirmDialog(true);
                            }}
                            disabled={approving === request.id}
                          >
                            {approving === request.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Device Change</DialogTitle>
            <DialogDescription>
              This will clear the registered device for this staff member. They will need to register a new device on their next check-in.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.staffAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedRequest.staffName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.staffEmail}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Current Device</h4>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{getDeviceDisplay(selectedRequest.currentDevice)}</p>
                    {selectedRequest.currentDevice.os && (
                      <p className="text-sm text-muted-foreground">{selectedRequest.currentDevice.os}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedRequest.reason && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Reason for Change</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedRequest && handleApprove(selectedRequest)}
              disabled={approving !== null}
            >
              {approving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DeviceApprovals;
