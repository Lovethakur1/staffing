import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DollarSign,
  Clock,
  Percent,
  Edit,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Settings
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ContractorPaymentSettingsProps {
  userRole: string;
}

interface RateConfig {
  id: string;
  role: string;
  hourlyRate: number;
  minimumHours: number;
  active: boolean;
}

interface FeeConfig {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
  description: string;
  active: boolean;
}

export function ContractorPaymentSettings({ userRole }: ContractorPaymentSettingsProps) {
  const [editingRate, setEditingRate] = useState<RateConfig | null>(null);
  const [editingFee, setEditingFee] = useState<FeeConfig | null>(null);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [travelRate, setTravelRate] = useState(15.00);
  const [isTravelActive, setIsTravelActive] = useState(true);

  // Contractor rate configurations
  const [rateConfigs, setRateConfigs] = useState<RateConfig[]>([
    {
      id: "RATE-001",
      role: "Bartender",
      hourlyRate: 35.00,
      minimumHours: 4,
      active: true
    },
    {
      id: "RATE-002",
      role: "Server",
      hourlyRate: 28.00,
      minimumHours: 4,
      active: true
    },
    {
      id: "RATE-003",
      role: "Event Coordinator",
      hourlyRate: 45.00,
      minimumHours: 5,
      active: true
    },
    {
      id: "RATE-004",
      role: "Security",
      hourlyRate: 32.00,
      minimumHours: 6,
      active: true
    },
    {
      id: "RATE-005",
      role: "Kitchen Staff",
      hourlyRate: 30.00,
      minimumHours: 4,
      active: true
    }
  ]);

  // Fee/deduction configurations
  const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>([
    {
      id: "FEE-001",
      name: "Administrative Fee",
      type: "percentage",
      amount: 5.0,
      description: "Platform and administrative service fee",
      active: true
    },
    {
      id: "FEE-002",
      name: "Processing Fee",
      type: "fixed",
      amount: 2.50,
      description: "Payment processing fee per transaction",
      active: true
    },
    {
      id: "FEE-003",
      name: "Insurance Fee",
      type: "percentage",
      amount: 2.5,
      description: "Liability insurance coverage",
      active: true
    }
  ]);

  const handleSaveRate = () => {
    if (!editingRate) return;

    if (editingRate.hourlyRate <= 0 || editingRate.minimumHours <= 0) {
      toast.error("Please enter valid rate and minimum hours");
      return;
    }

    if (editingRate.id.startsWith("NEW")) {
      // Add new rate
      const newRate = {
        ...editingRate,
        id: `RATE-${String(rateConfigs.length + 1).padStart(3, '0')}`
      };
      setRateConfigs([...rateConfigs, newRate]);
      toast.success(`Rate configuration added for ${editingRate.role}`);
    } else {
      // Update existing rate
      setRateConfigs(rateConfigs.map(r => r.id === editingRate.id ? editingRate : r));
      toast.success(`Rate configuration updated for ${editingRate.role}`);
    }

    setShowRateDialog(false);
    setEditingRate(null);
  };

  const handleSaveFee = () => {
    if (!editingFee) return;

    if (editingFee.amount <= 0) {
      toast.error("Please enter a valid fee amount");
      return;
    }

    if (editingFee.id.startsWith("NEW")) {
      // Add new fee
      const newFee = {
        ...editingFee,
        id: `FEE-${String(feeConfigs.length + 1).padStart(3, '0')}`
      };
      setFeeConfigs([...feeConfigs, newFee]);
      toast.success(`Fee configuration added: ${editingFee.name}`);
    } else {
      // Update existing fee
      setFeeConfigs(feeConfigs.map(f => f.id === editingFee.id ? editingFee : f));
      toast.success(`Fee configuration updated: ${editingFee.name}`);
    }

    setShowFeeDialog(false);
    setEditingFee(null);
  };

  const handleAddNewRate = () => {
    setEditingRate({
      id: "NEW-RATE",
      role: "",
      hourlyRate: 0,
      minimumHours: 4,
      active: true
    });
    setShowRateDialog(true);
  };

  const handleAddNewFee = () => {
    setEditingFee({
      id: "NEW-FEE",
      name: "",
      type: "percentage",
      amount: 0,
      description: "",
      active: true
    });
    setShowFeeDialog(true);
  };

  const handleEditRate = (rate: RateConfig) => {
    setEditingRate({ ...rate });
    setShowRateDialog(true);
  };

  const handleEditFee = (fee: FeeConfig) => {
    setEditingFee({ ...fee });
    setShowFeeDialog(true);
  };

  const handleToggleRateStatus = (rateId: string) => {
    setRateConfigs(rateConfigs.map(r => 
      r.id === rateId ? { ...r, active: !r.active } : r
    ));
    toast.success("Rate status updated");
  };

  const handleToggleFeeStatus = (feeId: string) => {
    setFeeConfigs(feeConfigs.map(f => 
      f.id === feeId ? { ...f, active: !f.active } : f
    ));
    toast.success("Fee status updated");
  };

  const handleDeleteRate = (rateId: string) => {
    setRateConfigs(rateConfigs.filter(r => r.id !== rateId));
    toast.success("Rate configuration deleted");
  };

  const handleDeleteFee = (feeId: string) => {
    setFeeConfigs(feeConfigs.filter(f => f.id !== feeId));
    toast.success("Fee configuration deleted");
  };

  const handleSaveTravel = () => {
    toast.success("Travel configuration saved");
  };

  // Calculate example payment breakdown
  const calculateExamplePayment = () => {
    const exampleHours = 8;
    const exampleRate = 35.00;
    const travelPay = isTravelActive ? travelRate * 2 : 0; // Simulate to + from
    const grossPay = (exampleHours * exampleRate) + travelPay;
    
    let totalFees = 0;
    const feeBreakdown: { name: string; amount: number }[] = [];

    feeConfigs.filter(f => f.active).forEach(fee => {
      let feeAmount = 0;
      if (fee.type === 'percentage') {
        feeAmount = grossPay * (fee.amount / 100);
      } else {
        feeAmount = fee.amount;
      }
      totalFees += feeAmount;
      feeBreakdown.push({ name: fee.name, amount: feeAmount });
    });

    const netPay = grossPay - totalFees;

    return {
      grossPay,
      feeBreakdown,
      totalFees,
      netPay
    };
  };

  const examplePayment = calculateExamplePayment();

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Contractor Payment Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure hourly rates, minimum hours, and fee deductions for 1099 contractors
          </p>
        </div>
        <Badge className="bg-[#5E1916] text-white w-fit">
          <AlertCircle className="h-3 w-3 mr-1" />
          1099 Contractor System
        </Badge>
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Independent Contractor System</h3>
              <p className="text-sm text-blue-800 mt-1">
                All staff are classified as 1099 independent contractors. Overtime pay does not apply.
                All fees and deductions will be transparently displayed on contractor invoices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Rates Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#5E1916]" />
                Hourly Rates by Role
              </CardTitle>
              <CardDescription className="mt-1">
                Set hourly rates and minimum hours for each contractor role
              </CardDescription>
            </div>
            <Button onClick={handleAddNewRate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Minimum Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateConfigs.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.role}</TableCell>
                  <TableCell>
                    <span className="text-lg font-semibold">${rate.hourlyRate.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {rate.minimumHours}h minimum
                    </div>
                  </TableCell>
                  <TableCell>
                    {rate.active ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRate(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleRateStatus(rate.id)}
                      >
                        {rate.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRate(rate.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Travel Stipend Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#5E1916]" />
                Travel Stipend Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Configure travel reimbursements for travel to and from venues
              </CardDescription>
            </div>
            <Button onClick={handleSaveTravel}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
             <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="travel-active" className="text-base font-semibold">Enable Travel Stipends</Label>
                    <p className="text-sm text-muted-foreground">Allow contractors to claim travel stipends per trip</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="travel-active"
                      className="h-5 w-5 accent-[#5E1916]"
                      checked={isTravelActive}
                      onChange={(e) => setIsTravelActive(e.target.checked)}
                    />
                  </div>
                </div>
                
                <div className={!isTravelActive ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="travel-rate">Stipend Per Trip ($)</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input 
                      id="travel-rate"
                      type="number" 
                      value={travelRate}
                      onChange={(e) => setTravelRate(parseFloat(e.target.value) || 0)}
                      className="max-w-[150px]"
                    />
                    <span className="text-sm text-muted-foreground">Applied separately for "To Venue" and "From Venue"</span>
                  </div>
                </div>
             </div>
             <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
                <p className="text-sm text-blue-800 mb-2">
                  When enabled, staff can toggle "Travel to Venue" and "Travel from Venue" on their timesheets.
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Current Rate: <strong>${travelRate.toFixed(2)}</strong> per one-way trip</li>
                  <li>Max Daily Travel: <strong>${(travelRate * 2).toFixed(2)}</strong> (Round trip)</li>
                  <li>This amount is added to Gross Pay before fee deductions</li>
                </ul>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee/Deduction Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-[#5E1916]" />
                Fee & Deduction Configuration
              </CardTitle>
              <CardDescription className="mt-1">
                Manage administrative fees and deductions applied to contractor payments
              </CardDescription>
            </div>
            <Button onClick={handleAddNewFee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeConfigs.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {fee.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {fee.type === 'percentage' ? `${fee.amount}%` : `$${fee.amount.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fee.description}
                  </TableCell>
                  <TableCell>
                    {fee.active ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditFee(fee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFeeStatus(fee.id)}
                      >
                        {fee.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFee(fee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Example Payment Breakdown */}
      <Card className="border-[#5E1916]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#5E1916]" />
            Example Payment Breakdown
          </CardTitle>
          <CardDescription>
            Preview how fees will appear on contractor invoices (based on 8 hours @ $35/hr)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Gross Pay</span>
              <span className="text-xl font-bold">${examplePayment.grossPay.toFixed(2)}</span>
            </div>

            {examplePayment.feeBreakdown.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Deductions:</h4>
                {examplePayment.feeBreakdown.map((fee, index) => (
                  <div key={index} className="flex justify-between items-center px-4 py-2 bg-red-50 rounded">
                    <span className="text-sm">{fee.name}</span>
                    <span className="text-sm font-medium text-red-600">-${fee.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t-2 border-[#5E1916] pt-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-bold text-lg">Net Pay</span>
                <span className="text-2xl font-bold text-green-600">
                  ${examplePayment.netPay.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              This breakdown will be visible to contractors on their payment invoices
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Rate Dialog */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRate?.id.startsWith("NEW") ? "Add New Rate" : "Edit Rate Configuration"}
            </DialogTitle>
            <DialogDescription>
              Configure hourly rate and minimum hours for this contractor role
            </DialogDescription>
          </DialogHeader>

          {editingRate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={editingRate.role}
                  onChange={(e) => setEditingRate({ ...editingRate, role: e.target.value })}
                  placeholder="e.g., Bartender"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingRate.hourlyRate}
                  onChange={(e) => setEditingRate({ ...editingRate, hourlyRate: parseFloat(e.target.value) || 0 })}
                  placeholder="35.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumHours">Minimum Hours per Shift</Label>
                <Input
                  id="minimumHours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={editingRate.minimumHours}
                  onChange={(e) => setEditingRate({ ...editingRate, minimumHours: parseFloat(e.target.value) || 0 })}
                  placeholder="4"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate}>
              <Save className="h-4 w-4 mr-2" />
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Dialog */}
      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFee?.id.startsWith("NEW") ? "Add New Fee" : "Edit Fee Configuration"}
            </DialogTitle>
            <DialogDescription>
              Configure fee or deduction details
            </DialogDescription>
          </DialogHeader>

          {editingFee && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="feeName">Fee Name</Label>
                <Input
                  id="feeName"
                  value={editingFee.name}
                  onChange={(e) => setEditingFee({ ...editingFee, name: e.target.value })}
                  placeholder="e.g., Administrative Fee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editingFee.type === 'percentage'}
                      onChange={() => setEditingFee({ ...editingFee, type: 'percentage' })}
                      className="h-4 w-4"
                    />
                    <span>Percentage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={editingFee.type === 'fixed'}
                      onChange={() => setEditingFee({ ...editingFee, type: 'fixed' })}
                      className="h-4 w-4"
                    />
                    <span>Fixed Amount</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeAmount">
                  {editingFee.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </Label>
                <Input
                  id="feeAmount"
                  type="number"
                  step={editingFee.type === 'percentage' ? '0.1' : '0.01'}
                  min="0"
                  value={editingFee.amount}
                  onChange={(e) => setEditingFee({ ...editingFee, amount: parseFloat(e.target.value) || 0 })}
                  placeholder={editingFee.type === 'percentage' ? '5.0' : '2.50'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeDescription">Description</Label>
                <Input
                  id="feeDescription"
                  value={editingFee.description}
                  onChange={(e) => setEditingFee({ ...editingFee, description: e.target.value })}
                  placeholder="Brief description of the fee"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFee}>
              <Save className="h-4 w-4 mr-2" />
              Save Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}