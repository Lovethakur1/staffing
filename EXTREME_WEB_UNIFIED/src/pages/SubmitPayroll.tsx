import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  Plus,
  X,
  Clock,
  DollarSign,
  Save,
  Send,
  AlertCircle,
  FileText,
  Car,
  ParkingCircle,
  Upload,
  Paperclip,
  CheckCircle
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";

interface SubmitPayrollProps {
  userRole: string;
  userId: string;
}

interface PayrollEntry {
  id: string;
  eventName: string;
  clientName: string;
  date: string;
  managerName: string;
  venue: string;
  checkInTime: string;
  checkOutTime: string;
  breakTime: number;
  totalHours: number;
  driveTime: number;
  parkingFee: number;
  parkingReceipt?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

export function SubmitPayroll({ userRole, userId }: SubmitPayrollProps) {
  const { setCurrentPage } = useNavigation();
  
  const [entries, setEntries] = useState<PayrollEntry[]>([
    {
      id: `entry-${Date.now()}`,
      eventName: "",
      clientName: "",
      date: "",
      managerName: "",
      venue: "",
      checkInTime: "",
      checkOutTime: "",
      breakTime: 0,
      totalHours: 0,
      driveTime: 0,
      parkingFee: 0
    }
  ]);

  const [importantComments, setImportantComments] = useState("");

  // Mock data for dropdowns
  const recentEvents = [
    { name: "Corporate Gala", client: "TechCorp Inc", manager: "John Smith", venue: "Grand Hotel Ballroom" },
    { name: "Wedding Reception", client: "Johnson Wedding", manager: "Sarah Wilson", venue: "Riverside Garden" },
    { name: "Birthday Party", client: "Smith Family", manager: "Mike Johnson", venue: "Community Center" },
    { name: "Fundraiser Gala", client: "Smith Foundation", manager: "Emily Davis", venue: "Convention Center" }
  ];

  const calculateHours = (checkIn: string, checkOut: string, breakTime: number) => {
    if (!checkIn || !checkOut) return 0;
    
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    let hours = outHour - inHour;
    let minutes = outMin - inMin;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    const totalHours = hours + minutes / 60 - breakTime;
    return Math.max(totalHours, 0);
  };

  const updateEntry = (id: string, field: string, value: any) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        
        // Auto-calculate total hours when times or break change
        if (field === 'checkInTime' || field === 'checkOutTime' || field === 'breakTime') {
          updated.totalHours = calculateHours(
            updated.checkInTime,
            updated.checkOutTime,
            updated.breakTime
          );
        }
        
        return updated;
      }
      return entry;
    }));
  };

  const handleFileUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG, PNG, GIF) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const receiptData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: e.target?.result as string
      };
      
      updateEntry(id, 'parkingReceipt', receiptData);
      toast.success('Parking receipt uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = (id: string) => {
    updateEntry(id, 'parkingReceipt', undefined);
    toast.success('Receipt removed');
  };

  const autofillFromEvent = (id: string, eventName: string) => {
    const event = recentEvents.find(e => e.name === eventName);
    if (event) {
      updateEntry(id, 'clientName', event.client);
      updateEntry(id, 'managerName', event.manager);
      updateEntry(id, 'venue', event.venue);
    }
  };

  const addEntry = () => {
    const newEntry: PayrollEntry = {
      id: `entry-${Date.now()}`,
      eventName: "",
      clientName: "",
      date: "",
      managerName: "",
      venue: "",
      checkInTime: "",
      checkOutTime: "",
      breakTime: 0,
      totalHours: 0,
      driveTime: 0,
      parkingFee: 0
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const removeEntry = (id: string) => {
    if (entries.length === 1) {
      toast.error("You must have at least one entry");
      return;
    }
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success("Entry removed");
  };

  const duplicateEntry = (id: string) => {
    const entryToDuplicate = entries.find(e => e.id === id);
    if (entryToDuplicate) {
      const newEntry = {
        ...entryToDuplicate,
        id: `entry-${Date.now()}`,
        date: "",
        checkInTime: "",
        checkOutTime: "",
        totalHours: 0
      };
      setEntries(prev => [...prev, newEntry]);
      toast.success("Entry duplicated");
    }
  };

  const validateEntries = () => {
    for (const entry of entries) {
      if (!entry.eventName || !entry.clientName || !entry.date || 
          !entry.managerName || !entry.venue || !entry.checkInTime || 
          !entry.checkOutTime) {
        return false;
      }
      if (entry.totalHours <= 0) {
        return false;
      }
    }
    return true;
  };

  const handleSaveDraft = () => {
    toast.success("Payroll saved as draft");
    setTimeout(() => setCurrentPage('payroll'), 1000);
  };

  const handleSubmit = () => {
    if (!validateEntries()) {
      toast.error("Please complete all required fields for each entry");
      return;
    }

    toast.success(`Payroll submitted with ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`);
    setTimeout(() => setCurrentPage('payroll'), 1500);
  };

  const getTotalHours = () => {
    return entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  };

  const getTotalDriveTime = () => {
    return entries.reduce((sum, entry) => sum + entry.driveTime, 0);
  };

  const getTotalParkingFees = () => {
    return entries.reduce((sum, entry) => sum + entry.parkingFee, 0);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage('payroll')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl">Submit Payroll</h1>
              <p className="text-muted-foreground mt-1">
                Add your work entries for payroll processing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={addEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Payroll Submission Instructions</p>
                <p className="text-sm text-blue-700 mt-1">
                  Fill in all work entries from your events. You can add multiple entries at once. 
                  Make sure to include accurate check-in/check-out times. Break time will be deducted automatically.
                  Add drive time and parking fees if applicable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Entries */}
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <Card key={entry.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      Entry #{index + 1}
                    </Badge>
                    {entry.totalHours > 0 && (
                      <Badge className="bg-green-100 text-green-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {entry.totalHours.toFixed(2)}h
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateEntry(entry.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    {entries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Event & Client Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`eventName-${entry.id}`}>Event Name *</Label>
                    <Select
                      value={entry.eventName}
                      onValueChange={(value) => {
                        updateEntry(entry.id, 'eventName', value);
                        autofillFromEvent(entry.id, value);
                      }}
                    >
                      <SelectTrigger id={`eventName-${entry.id}`}>
                        <SelectValue placeholder="Select event..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recentEvents.map(event => (
                          <SelectItem key={event.name} value={event.name}>
                            {event.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other (Type manually)</SelectItem>
                      </SelectContent>
                    </Select>
                    {entry.eventName === 'other' && (
                      <Input
                        placeholder="Enter event name"
                        value={entry.eventName === 'other' ? '' : entry.eventName}
                        onChange={(e) => updateEntry(entry.id, 'eventName', e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`clientName-${entry.id}`}>Client Name *</Label>
                    <Input
                      id={`clientName-${entry.id}`}
                      placeholder="Client name"
                      value={entry.clientName}
                      onChange={(e) => updateEntry(entry.id, 'clientName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`date-${entry.id}`}>Date Worked *</Label>
                    <Input
                      id={`date-${entry.id}`}
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`managerName-${entry.id}`}>Manager Name *</Label>
                    <Input
                      id={`managerName-${entry.id}`}
                      placeholder="Manager on duty"
                      value={entry.managerName}
                      onChange={(e) => updateEntry(entry.id, 'managerName', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor={`venue-${entry.id}`}>Venue *</Label>
                    <Input
                      id={`venue-${entry.id}`}
                      placeholder="Event venue"
                      value={entry.venue}
                      onChange={(e) => updateEntry(entry.id, 'venue', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Time Tracking */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor={`checkIn-${entry.id}`}>Check In Time *</Label>
                    <Input
                      id={`checkIn-${entry.id}`}
                      type="time"
                      value={entry.checkInTime}
                      onChange={(e) => updateEntry(entry.id, 'checkInTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`checkOut-${entry.id}`}>Check Out Time *</Label>
                    <Input
                      id={`checkOut-${entry.id}`}
                      type="time"
                      value={entry.checkOutTime}
                      onChange={(e) => updateEntry(entry.id, 'checkOutTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`breakTime-${entry.id}`}>Break Time (hours)</Label>
                    <Input
                      id={`breakTime-${entry.id}`}
                      type="number"
                      step="0.25"
                      min="0"
                      placeholder="0.5"
                      value={entry.breakTime || ""}
                      onChange={(e) => updateEntry(entry.id, 'breakTime', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Hours</Label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">
                        {entry.totalHours.toFixed(2)}h
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Expenses */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`driveTime-${entry.id}`} className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Drive Time (hours)
                    </Label>
                    <Input
                      id={`driveTime-${entry.id}`}
                      type="number"
                      step="0.25"
                      min="0"
                      placeholder="0"
                      value={entry.driveTime || ""}
                      onChange={(e) => updateEntry(entry.id, 'driveTime', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time spent driving to/from event
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`parkingFee-${entry.id}`} className="flex items-center gap-2">
                      <ParkingCircle className="h-4 w-4" />
                      Parking Fee ($)
                    </Label>
                    <Input
                      id={`parkingFee-${entry.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={entry.parkingFee || ""}
                      onChange={(e) => updateEntry(entry.id, 'parkingFee', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Parking expenses (if applicable)
                    </p>

                    {/* Parking Receipt Upload */}
                    <div className="mt-3 space-y-2">
                      {!entry.parkingReceipt ? (
                        <div>
                          <input
                            type="file"
                            id={`receipt-${entry.id}`}
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(entry.id, e)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => document.getElementById(`receipt-${entry.id}`)?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Parking Receipt
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF or PDF (max 5MB)
                          </p>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-900 truncate">
                                  {entry.parkingReceipt.name}
                                </p>
                                <p className="text-xs text-green-700">
                                  {(entry.parkingReceipt.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-700 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeReceipt(entry.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Entry Button */}
        <Card className="border-2 border-dashed cursor-pointer hover:border-primary transition-colors" onClick={addEntry}>
          <CardContent className="py-8">
            <div className="text-center">
              <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1">Add Another Entry</h3>
              <p className="text-sm text-muted-foreground">
                Add more work entries to this submission
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary & Comments */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Important Comments</CardTitle>
                <CardDescription>
                  Add any notes or special circumstances (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="E.g., Event ran overtime, additional responsibilities, special circumstances..."
                  value={importantComments}
                  onChange={(e) => setImportantComments(e.target.value)}
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Entries:</span>
                  <span className="font-medium">{entries.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Hours:</span>
                  <span className="font-medium">{getTotalHours().toFixed(2)}h</span>
                </div>
                {getTotalDriveTime() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Drive Time:</span>
                    <span className="font-medium">{getTotalDriveTime().toFixed(2)}h</span>
                  </div>
                )}
                {getTotalParkingFees() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parking Fees:</span>
                    <span className="font-medium">${getTotalParkingFees().toFixed(2)}</span>
                  </div>
                )}
                {entries.filter(e => e.parkingReceipt).length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      Receipts Uploaded:
                    </span>
                    <span className="font-medium text-green-600">
                      {entries.filter(e => e.parkingReceipt).length}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Your payroll will be reviewed by admin. You'll be notified once it's processed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage('payroll')}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} className="bg-primary">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Payroll ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
