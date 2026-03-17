import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Calendar,
  MapPin,
  Truck,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

// Mock rates data since we can't import from non-existent data file yet
const contractorRates = [
  { role: "Bartender", hourlyRate: 35.00 },
  { role: "Server", hourlyRate: 28.00 },
  { role: "Event Coordinator", hourlyRate: 45.00 },
  { role: "Security", hourlyRate: 32.00 },
  { role: "Kitchen Staff", hourlyRate: 30.00 }
];

const travelConfig = {
  amount: 15.00,
  active: true
};

export function ShiftSubmission() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("02:00");
  const [role, setRole] = useState("Bartender");
  const [location, setLocation] = useState("Downtown Event Center");
  const [travelTo, setTravelTo] = useState(false);
  const [travelFrom, setTravelFrom] = useState(false);
  
  // Calculated state
  const [estimatedPay, setEstimatedPay] = useState<any>(null);
  const [hoursWorked, setHoursWorked] = useState(0);

  useEffect(() => {
    // Calculate hours
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);
    
    // Handle overnight shifts
    if (end < start) {
      end = new Date(`2000-01-02T${endTime}`);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    setHoursWorked(hours);

    // Calculate pay
    if (role) {
      const rate = contractorRates.find(r => r.role === role)?.hourlyRate || 0;
      const hourlyPay = hours * rate;
      
      let travelPay = 0;
      if (travelTo) travelPay += travelConfig.amount;
      if (travelFrom) travelPay += travelConfig.amount;
      
      const grossPay = hourlyPay + travelPay;
      
      // Mock fee calculation (5% admin + 2.50 processing)
      const fees = (grossPay * 0.05) + 2.50;
      const netPay = grossPay - fees;

      setEstimatedPay({
        grossPay,
        travelPay,
        totalFees: fees,
        netPay
      });
    }
  }, [startTime, endTime, role, travelTo, travelFrom]);

  const handleSubmit = () => {
    toast.success("Shift submitted successfully", {
      description: `Total estimated net pay: $${estimatedPay?.netPay.toFixed(2)}`
    });
    // In a real app, this would save to the backend
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Submit Shift</h1>
        <p className="text-muted-foreground">
          Enter your shift details below. Travel stipends will be applied automatically if selected.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#5E1916]" />
            Shift Details
          </CardTitle>
          <CardDescription>
            Enter the time and location for your shift
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {contractorRates.map(r => (
                    <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
                placeholder="Event Venue Name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#5E1916]" />
            Travel Reimbursement
          </CardTitle>
          <CardDescription>
            Select applicable travel options for this shift
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setTravelTo(!travelTo)}>
            <div className="space-y-0.5">
              <Label htmlFor="travel-to" className="text-base cursor-pointer">Travel to Venue</Label>
              <p className="text-sm text-muted-foreground">
                Reimbursement for travel from home/base to the event location
              </p>
            </div>
            <Checkbox 
              id="travel-to" 
              checked={travelTo}
              onCheckedChange={(c) => setTravelTo(!!c)}
              className="h-6 w-6 data-[state=checked]:bg-[#5E1916] data-[state=checked]:border-[#5E1916]"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setTravelFrom(!travelFrom)}>
            <div className="space-y-0.5">
              <Label htmlFor="travel-from" className="text-base cursor-pointer">Travel from Venue</Label>
              <p className="text-sm text-muted-foreground">
                Reimbursement for travel from event location back to home/base
              </p>
            </div>
            <Checkbox 
              id="travel-from" 
              checked={travelFrom}
              onCheckedChange={(c) => setTravelFrom(!!c)}
              className="h-6 w-6 data-[state=checked]:bg-[#5E1916] data-[state=checked]:border-[#5E1916]"
            />
          </div>
        </CardContent>
      </Card>

      {estimatedPay && (
        <Card className="bg-[#5E1916]/5 border-[#5E1916]">
          <CardHeader>
            <CardTitle className="text-lg">Estimated Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Hours Worked:</span>
              <span className="font-medium">{hoursWorked.toFixed(1)} hours</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span>Hourly Pay ({estimatedPay.grossPay - estimatedPay.travelPay > 0 ? (estimatedPay.grossPay - estimatedPay.travelPay).toFixed(2) : "0.00"}):</span>
              <span className="font-medium">${(estimatedPay.grossPay - estimatedPay.travelPay).toFixed(2)}</span>
            </div>

            {estimatedPay.travelPay > 0 && (
              <div className="flex justify-between items-center text-sm text-blue-700">
                <span>Travel Stipend:</span>
                <span className="font-medium">+${estimatedPay.travelPay.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-red-600">
              <span>Fees & Deductions:</span>
              <span className="font-medium">-${estimatedPay.totalFees.toFixed(2)}</span>
            </div>

            <div className="pt-4 border-t border-[#5E1916]/20 flex justify-between items-center">
              <span className="font-bold text-lg">Estimated Net Pay</span>
              <span className="font-bold text-2xl text-[#5E1916]">${estimatedPay.netPay.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-[#5E1916] hover:bg-[#4a1210]" onClick={handleSubmit}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Shift for Approval
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
