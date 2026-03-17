import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Shield,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  Settings,
  Percent,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";

interface PricingConfigurationProps {
  userRole: string;
  userId: string;
}

interface TierRate {
  role: string;
  junior: number;
  standard: number;
  premium: number;
  elite: number;
}

interface MultiplierRule {
  id: string;
  name: string;
  type: 'weekend' | 'holiday' | 'rush' | 'custom';
  percentage: number;
  enabled: boolean;
  description: string;
}

interface TravelFeeRule {
  minMiles: number;
  maxMiles: number;
  fee: number;
}

// Mock pricing configuration data
const mockTierRates: TierRate[] = [
  { role: "Bartender", junior: 32, standard: 41, premium: 53, elite: 68 },
  { role: "Server", junior: 28, standard: 35, premium: 45, elite: 58 },
  { role: "Event Coordinator", junior: 38, standard: 48, premium: 62, elite: 80 },
  { role: "Manager", junior: 45, standard: 58, premium: 75, elite: 95 },
  { role: "Security", junior: 35, standard: 45, premium: 58, elite: 75 },
  { role: "Valet", junior: 25, standard: 32, premium: 41, elite: 53 }
];

const mockMultiplierRules: MultiplierRule[] = [
  {
    id: "mult-001",
    name: "Weekend Premium",
    type: "weekend",
    percentage: 20,
    enabled: true,
    description: "Applied to Friday, Saturday, and Sunday events"
  },
  {
    id: "mult-002",
    name: "Holiday Premium",
    type: "holiday",
    percentage: 30,
    enabled: true,
    description: "Applied to major holidays (New Year's, Christmas, etc.)"
  },
  {
    id: "mult-003",
    name: "Rush Booking Fee",
    type: "rush",
    percentage: 25,
    enabled: true,
    description: "Applied when event is booked less than 7 days in advance"
  }
];

const mockTravelFeeRules: TravelFeeRule[] = [
  { minMiles: 0, maxMiles: 10, fee: 0 },
  { minMiles: 11, maxMiles: 25, fee: 75 },
  { minMiles: 26, maxMiles: 50, fee: 150 },
  { minMiles: 51, maxMiles: 999, fee: 250 }
];

export function PricingConfiguration({ userRole, userId }: PricingConfigurationProps) {
  const { setCurrentPage } = useNavigation();
  const [tierRates, setTierRates] = useState<TierRate[]>(mockTierRates);
  const [multiplierRules, setMultiplierRules] = useState<MultiplierRule[]>(mockMultiplierRules);
  const [travelFeeRules, setTravelFeeRules] = useState<TravelFeeRule[]>(mockTravelFeeRules);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(15);
  const [minimumHours, setMinimumHours] = useState(5);
  
  // Edit mode state - SINGLE BUTTON CONTROL
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Store original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    tierRates: mockTierRates,
    multiplierRules: mockMultiplierRules,
    travelFeeRules: mockTravelFeeRules,
    platformFeePercentage: 15,
    minimumHours: 5
  });

  const handleEnterEditMode = () => {
    // Save current state before editing
    setOriginalValues({
      tierRates: [...tierRates],
      multiplierRules: [...multiplierRules],
      travelFeeRules: [...travelFeeRules],
      platformFeePercentage,
      minimumHours
    });
    setIsEditMode(true);
    toast.info("Edit mode enabled. Make your changes.");
  };

  const handleCancelEdit = () => {
    // Restore original values
    setTierRates(originalValues.tierRates);
    setMultiplierRules(originalValues.multiplierRules);
    setTravelFeeRules(originalValues.travelFeeRules);
    setPlatformFeePercentage(originalValues.platformFeePercentage);
    setMinimumHours(originalValues.minimumHours);
    
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    toast.info("Changes discarded");
  };

  const handleUpdateTierRate = (role: string, tier: keyof Omit<TierRate, 'role'>, value: number) => {
    setTierRates(prev =>
      prev.map(r => r.role === role ? { ...r, [tier]: value } : r)
    );
    setHasUnsavedChanges(true);
  };

  const handleToggleMultiplier = (id: string) => {
    setMultiplierRules(prev =>
      prev.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateMultiplierPercentage = (id: string, percentage: number) => {
    setMultiplierRules(prev =>
      prev.map(rule => 
        rule.id === id ? { ...rule, percentage } : rule
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateTravelFee = (index: number, fee: number) => {
    setTravelFeeRules(prev =>
      prev.map((rule, i) => i === index ? { ...rule, fee } : rule)
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveConfiguration = () => {
    // Simulate API call to save configuration
    setOriginalValues({
      tierRates: [...tierRates],
      multiplierRules: [...multiplierRules],
      travelFeeRules: [...travelFeeRules],
      platformFeePercentage,
      minimumHours
    });
    
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    toast.success("Pricing configuration saved successfully!");
  };

  const handleResetToDefaults = () => {
    if (confirm("Are you sure you want to reset all pricing to default values? This cannot be undone.")) {
      setTierRates(mockTierRates);
      setMultiplierRules(mockMultiplierRules);
      setTravelFeeRules(mockTravelFeeRules);
      setPlatformFeePercentage(15);
      setMinimumHours(5);
      setHasUnsavedChanges(true);
      toast.success("Configuration reset to defaults");
    }
  };

  const calculateSampleCost = () => {
    // Sample: 10 Standard Bartenders for 5 hours on a weekend
    const baseRate = tierRates.find(r => r.role === "Bartender")?.standard || 41;
    const baseCost = baseRate * 10 * 5;
    const weekendMultiplier = multiplierRules.find(r => r.type === "weekend")?.enabled ? 
      (multiplierRules.find(r => r.type === "weekend")?.percentage || 0) / 100 : 0;
    const weekendCost = baseCost * weekendMultiplier;
    const travelFee = 75; // 15 miles
    const platformFee = (baseCost + weekendCost + travelFee) * (platformFeePercentage / 100);
    const total = baseCost + weekendCost + travelFee + platformFee;
    
    return {
      baseCost,
      weekendCost,
      travelFee,
      platformFee,
      total
    };
  };

  const sampleCost = calculateSampleCost();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#5E1916]">Pricing Configuration</h1>
          <p className="text-gray-500">Manage tier rates, multipliers, and fee structures</p>
        </div>
        <div className="flex gap-3">
          {!isEditMode ? (
            <TooltipWrapper content="Enable edit mode to modify pricing configuration">
              <Button 
                className="bg-[#5E1916] hover:bg-[#4E0707]"
                onClick={handleEnterEditMode}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Configuration
              </Button>
            </TooltipWrapper>
          ) : (
            <>
              <TooltipWrapper content="Discard all changes and exit edit mode">
                <Button 
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content="Reset all pricing to default values">
                <Button 
                  variant="outline"
                  onClick={handleResetToDefaults}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content="Save changes and exit edit mode">
                <Button 
                  className="bg-[#5E1916] hover:bg-[#4E0707]"
                  onClick={handleSaveConfiguration}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </TooltipWrapper>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Alert */}
      {isEditMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Unlock className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  Edit Mode Active - All fields are now editable
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Make your changes below and click "Save Changes" when done, or "Cancel" to discard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasUnsavedChanges && isEditMode && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-900">
                You have unsaved changes. Click "Save Changes" to apply these changes to all new bookings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEditMode && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-700">
                Viewing mode - Click "Edit Configuration" to make changes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tier Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#5E1916]" />
                Tier Hourly Rates
                {!isEditMode && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
              </CardTitle>
              <CardDescription>
                Configure hourly rates for each staff role across all tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">🥉 Junior</TableHead>
                    <TableHead className="text-right">🥈 Standard</TableHead>
                    <TableHead className="text-right">🥇 Premium</TableHead>
                    <TableHead className="text-right">💎 Elite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tierRates.map((rate) => (
                    <TableRow key={rate.role}>
                      <TableCell className="font-medium">{rate.role}</TableCell>
                      <TableCell className="text-right">
                        {isEditMode ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={rate.junior}
                              onChange={(e) => handleUpdateTierRate(rate.role, 'junior', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                            <span className="text-gray-600 text-sm">/hr</span>
                          </div>
                        ) : (
                          <span>${rate.junior}/hr</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditMode ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={rate.standard}
                              onChange={(e) => handleUpdateTierRate(rate.role, 'standard', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right font-medium"
                            />
                            <span className="text-gray-600 text-sm">/hr</span>
                          </div>
                        ) : (
                          <span className="font-medium">${rate.standard}/hr</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditMode ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={rate.premium}
                              onChange={(e) => handleUpdateTierRate(rate.role, 'premium', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                            <span className="text-gray-600 text-sm">/hr</span>
                          </div>
                        ) : (
                          <span>${rate.premium}/hr</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditMode ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={rate.elite}
                              onChange={(e) => handleUpdateTierRate(rate.role, 'elite', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                            <span className="text-gray-600 text-sm">/hr</span>
                          </div>
                        ) : (
                          <span>${rate.elite}/hr</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Multiplier Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#5E1916]" />
                Dynamic Pricing Multipliers
                {!isEditMode && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
              </CardTitle>
              <CardDescription>
                Configure automatic price adjustments based on event conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {multiplierRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {rule.type.toUpperCase()}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleToggleMultiplier(rule.id)}
                          disabled={!isEditMode}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`mult-${rule.id}`} className="text-sm">Percentage Increase</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id={`mult-${rule.id}`}
                          type="number"
                          value={rule.percentage}
                          onChange={(e) => handleUpdateMultiplierPercentage(rule.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                          disabled={!rule.enabled || !isEditMode}
                        />
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Label className="text-sm">Example Impact</Label>
                      <p className="text-sm mt-1">
                        {rule.enabled ? (
                          <span className="text-[#5E1916] font-medium">
                            $1,000 → ${(1000 * (1 + rule.percentage / 100)).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Disabled</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Travel Fee Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#5E1916]" />
                Travel Fee Structure
                {!isEditMode && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
              </CardTitle>
              <CardDescription>
                Configure fees based on distance from your office
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distance Range</TableHead>
                    <TableHead className="text-right">Travel Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelFeeRules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {rule.minMiles}-{rule.maxMiles === 999 ? '∞' : rule.maxMiles} miles
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditMode ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-gray-600">$</span>
                            <Input
                              type="number"
                              value={rule.fee}
                              onChange={(e) => handleUpdateTravelFee(index, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                            />
                          </div>
                        ) : (
                          <span>${rule.fee}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Platform & Minimum Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#5E1916]" />
                Platform Settings
                {!isEditMode && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
              </CardTitle>
              <CardDescription>
                Global platform fees and minimums
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="platform-fee"
                      type="number"
                      value={platformFeePercentage}
                      onChange={(e) => {
                        setPlatformFeePercentage(parseFloat(e.target.value) || 0);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-24"
                      disabled={!isEditMode}
                    />
                    <Percent className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Applied to all bookings after base costs and multipliers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-hours">Minimum Event Hours</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="min-hours"
                      type="number"
                      value={minimumHours}
                      onChange={(e) => {
                        setMinimumHours(parseFloat(e.target.value) || 0);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-24"
                      disabled={!isEditMode}
                    />
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Events shorter than this will be billed at minimum
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Live Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#5E1916]" />
                Live Pricing Preview
              </CardTitle>
              <CardDescription>
                Sample calculation with current settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-gray-900">Sample Event:</p>
                <ul className="text-gray-600 space-y-1 text-xs">
                  <li>• 10 Standard Bartenders</li>
                  <li>• 5 hours (weekend event)</li>
                  <li>• 15 miles from office</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Cost:</span>
                  <span className="font-medium">${sampleCost.baseCost.toFixed(2)}</span>
                </div>
                
                {multiplierRules.find(r => r.type === "weekend")?.enabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Weekend (+{multiplierRules.find(r => r.type === "weekend")?.percentage}%):
                    </span>
                    <span className="font-medium">+${sampleCost.weekendCost.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Travel Fee:</span>
                  <span className="font-medium">+${sampleCost.travelFee}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform ({platformFeePercentage}%):</span>
                  <span className="font-medium">+${sampleCost.platformFee.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between pt-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-xl text-[#5E1916]">
                  ${sampleCost.total.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  This reflects your current pricing configuration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Roles Configured:</span>
                <span className="font-medium">{tierRates.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Multipliers:</span>
                <span className="font-medium">
                  {multiplierRules.filter(r => r.enabled).length} of {multiplierRules.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Travel Tiers:</span>
                <span className="font-medium">{travelFeeRules.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">{platformFeePercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Minimum Hours:</span>
                <span className="font-medium">{minimumHours}h</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
