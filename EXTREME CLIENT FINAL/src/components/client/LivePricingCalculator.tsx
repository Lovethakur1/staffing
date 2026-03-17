import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { ROLE_TIER_RATES, STAFF_TIERS } from "./SmartStaffSelector";
import { mockStaff } from "../../data/mockData";

interface StaffRequirement {
  role: string;
  quantity: number;
  selectedFavorites: string[];
  selectedTier: keyof typeof STAFF_TIERS;
}

interface LivePricingCalculatorProps {
  staffRequirements: StaffRequirement[];
  eventDate: Date | undefined;
  startTime: string;
  endTime: string;
  distance: number; // miles from your office to venue
  expectedGuests: number;
}

export function LivePricingCalculator({
  staffRequirements,
  eventDate,
  startTime,
  endTime,
  distance,
  expectedGuests,
}: LivePricingCalculatorProps) {
  
  // Don't render if there are no staff requirements yet
  if (!staffRequirements || staffRequirements.length === 0) {
    return (
      <Card className="border-0 shadow-lg sticky top-6">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Live Pricing Calculator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time accurate pricing • Final locked quote
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">Add Staff to See Pricing</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Select your favorite staff or choose from our tiered system to see live pricing calculations with all fees and discounts.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate event duration
  const calculateDuration = (): number => {
    if (!startTime || !endTime) return 5; // Default 5 hours
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Handle overnight events
    if (hours < 0) hours += 24;
    
    // Apply 5-hour minimum
    return Math.max(hours, 5);
  };

  const duration = calculateDuration();
  const actualHours = startTime && endTime ? 
    Math.max(0, (new Date(`2000-01-01 ${endTime}`).getTime() - new Date(`2000-01-01 ${startTime}`).getTime()) / (1000 * 60 * 60)) : 0;
  const minimumApplied = actualHours > 0 && actualHours < 5;

  // Check if date is weekend
  const isWeekend = (): boolean => {
    if (!eventDate) return false;
    const day = eventDate.getDay();
    return day === 5 || day === 6 || day === 0; // Friday, Saturday, Sunday
  };

  // Check if date is holiday
  const isHoliday = (): boolean => {
    if (!eventDate) return false;
    
    const holidays = [
      '12-25', // Christmas
      '12-31', // New Year's Eve
      '01-01', // New Year's Day
      '07-04', // July 4th
      '11-28', // Thanksgiving (approximate)
    ];
    
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    
    return holidays.includes(dateStr);
  };

  // Check if rush booking (less than 7 days)
  const isRushBooking = (): boolean => {
    if (!eventDate) return false;
    const today = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil < 7 && daysUntil >= 0;
  };

  // Calculate travel fee based on distance
  const calculateTravelFee = (): number => {
    if (distance <= 10) return 0;
    if (distance <= 25) return 75;
    if (distance <= 50) return 150;
    return 250;
  };

  // Get tier rate for specific role
  const getTierRateForRole = (role: string, tier: keyof typeof STAFF_TIERS): number => {
    const roleRates = ROLE_TIER_RATES[role as keyof typeof ROLE_TIER_RATES] || ROLE_TIER_RATES.DEFAULT;
    return roleRates[tier];
  };

  // Calculate staff costs
  const calculateStaffCosts = (): {
    subtotal: number;
    breakdown: { role: string; favoritesCost: number; tierCost: number; total: number }[];
  } => {
    let subtotal = 0;
    const breakdown = staffRequirements.map(requirement => {
      let favoritesCost = 0;
      
      // Calculate favorites cost
      requirement.selectedFavorites.forEach(staffId => {
        const staff = mockStaff.find(s => s.id === staffId);
        if (staff) {
          favoritesCost += staff.hourlyRate * duration;
        }
      });

      // Calculate tier cost
      const tierStaffCount = requirement.quantity - requirement.selectedFavorites.length;
      const tierRate = getTierRateForRole(requirement.role, requirement.selectedTier);
      const tierCost = tierRate * tierStaffCount * duration;

      const total = favoritesCost + tierCost;
      subtotal += total;

      return {
        role: requirement.role,
        favoritesCost,
        tierCost,
        total,
      };
    });

    return { subtotal, breakdown };
  };

  const staffCosts = calculateStaffCosts();
  let runningTotal = staffCosts.subtotal;

  // Calculate multipliers
  const weekendMultiplier = isWeekend() ? 0.20 : 0;
  const weekendFee = runningTotal * weekendMultiplier;
  runningTotal += weekendFee;

  const holidayMultiplier = isHoliday() ? 0.30 : 0;
  const holidayFee = runningTotal * holidayMultiplier;
  runningTotal += holidayFee;

  const rushMultiplier = isRushBooking() ? 0.25 : 0;
  const rushFee = runningTotal * rushMultiplier;
  runningTotal += rushFee;

  const travelFee = calculateTravelFee();
  runningTotal += travelFee;

  // Platform fee (15% of staff + fees)
  const platformFee = runningTotal * 0.15;

  // Final total
  const finalTotal = runningTotal + platformFee;

  // Payment options
  const fullPaymentDiscount = finalTotal * 0.05; // 5% discount
  const fullPaymentTotal = finalTotal - fullPaymentDiscount;
  const depositAmount = finalTotal * 0.5; // 50% deposit

  return (
    <Card className="border-0 shadow-lg sticky top-6">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Live Pricing Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time accurate pricing • Final locked quote
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        
        {/* Event Summary */}
        <div className="space-y-2 text-sm">
          {eventDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Event Date</span>
              </div>
              <span className="font-medium">{eventDate.toLocaleDateString()}</span>
            </div>
          )}
          
          {duration > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{duration} hours</span>
                {minimumApplied && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1">
                        <Badge variant="outline" className="text-xs cursor-help">
                          5hr min
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Event is {actualHours}h but billed as 5h minimum</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {distance > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Distance</span>
              </div>
              <span className="font-medium">{distance} miles</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Staff Costs Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Staff Costs
          </h4>
          
          {staffCosts.breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No staff selected yet
            </p>
          ) : (
            <div className="space-y-2">
              {staffCosts.breakdown.map((item) => (
                <div key={item.role} className="text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{item.role}</span>
                    <span>${item.total.toLocaleString()}</span>
                  </div>
                  {item.favoritesCost > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground pl-4">
                      <span>├─ Favorites</span>
                      <span>${item.favoritesCost.toLocaleString()}</span>
                    </div>
                  )}
                  {item.tierCost > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground pl-4">
                      <span>└─ Tier auto-fill</span>
                      <span>${item.tierCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Staff Subtotal</span>
                <span>${staffCosts.subtotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Multipliers & Fees */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Additional Fees</h4>
          
          {minimumApplied && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between text-sm cursor-help">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-blue-600" />
                    <span className="text-muted-foreground">5-Hour Minimum</span>
                  </div>
                  <span className="text-blue-600">Applied</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your event is {actualHours}h but we bill a 5-hour minimum</p>
              </TooltipContent>
            </Tooltip>
          )}

          {weekendFee > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between text-sm cursor-help">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-orange-600" />
                    <span className="text-muted-foreground">Weekend Premium (+20%)</span>
                  </div>
                  <span className="text-orange-600">+${weekendFee.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Friday-Sunday events include 20% premium rate</p>
              </TooltipContent>
            </Tooltip>
          )}

          {holidayFee > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between text-sm cursor-help">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-muted-foreground">Holiday Premium (+30%)</span>
                  </div>
                  <span className="text-red-600">+${holidayFee.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Major holidays include 30% premium rate</p>
              </TooltipContent>
            </Tooltip>
          )}

          {rushFee > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between text-sm cursor-help">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                    <span className="text-muted-foreground">Rush Booking (+25%)</span>
                  </div>
                  <span className="text-orange-600">+${rushFee.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bookings within 7 days include 25% rush fee</p>
              </TooltipContent>
            </Tooltip>
          )}

          {travelFee > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between text-sm cursor-help">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    <span className="text-muted-foreground">Travel Fee</span>
                  </div>
                  <span>+${travelFee.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{distance} miles: ${travelFee} travel fee</p>
              </TooltipContent>
            </Tooltip>
          )}

          {platformFee > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between text-sm cursor-help">
                  <span className="text-muted-foreground">Platform Service Fee (15%)</span>
                  <span>+${platformFee.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>15% service fee covers insurance, support, and platform</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Separator />

        {/* Final Total */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Final Total</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              ${finalTotal.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-white/50 rounded p-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Per Guest:</span>
              <span className="font-medium">
                {expectedGuests > 0 ? `$${(finalTotal / expectedGuests).toFixed(2)}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Per Hour:</span>
              <span className="font-medium">${(finalTotal / duration).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-2 pt-2">
          <h4 className="font-semibold text-sm">Payment Options</h4>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-help">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-green-900">Full Payment Upfront</span>
                  <Badge className="bg-green-600">Save 5%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-700">Pay now and save</span>
                  <span className="text-lg font-bold text-green-900">
                    ${fullPaymentTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pay full amount now and save ${fullPaymentDiscount.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">50% Deposit + 50% Before Event</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit now:</span>
                <span className="font-medium">${depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Before event:</span>
                <span className="font-medium">${depositAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Lock Guarantee */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">✅ Price Lock Guarantee</p>
            <p>This is your final quote. No hidden fees or surprises. Price locked when you submit.</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}