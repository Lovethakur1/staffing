import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Star,
  Heart,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Calendar,
  XCircle,
} from "lucide-react";
import { mockStaff, mockEvents, Staff, Client } from "../../data/mockData";

// Staff Tier Definitions
export const STAFF_TIERS = {
  JUNIOR: {
    name: "Budget Tier",
    description: "Junior staff, great for basic service",
    rateRange: { min: 28, max: 35 },
    avgRate: 32,
    icon: "🥉",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  STANDARD: {
    name: "Standard Tier",
    description: "Experienced professionals, most popular",
    rateRange: { min: 38, max: 45 },
    avgRate: 41,
    icon: "🥈",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    recommended: true,
  },
  PREMIUM: {
    name: "Premium Tier",
    description: "Highly skilled veterans for upscale events",
    rateRange: { min: 48, max: 58 },
    avgRate: 53,
    icon: "🥇",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  ELITE: {
    name: "Elite Tier",
    description: "Top-tier experts for luxury events only",
    rateRange: { min: 60, max: 75 },
    avgRate: 68,
    icon: "💎",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
};

// Tier definitions by role (different rates for different positions)
export const ROLE_TIER_RATES = {
  Bartender: {
    JUNIOR: 32,
    STANDARD: 41,
    PREMIUM: 53,
    ELITE: 68,
  },
  "Server (Plated)": {
    JUNIOR: 28,
    STANDARD: 35,
    PREMIUM: 45,
    ELITE: 58,
  },
  "Server (Cocktail)": {
    JUNIOR: 28,
    STANDARD: 35,
    PREMIUM: 45,
    ELITE: 58,
  },
  "Server (Buffet)": {
    JUNIOR: 28,
    STANDARD: 35,
    PREMIUM: 45,
    ELITE: 58,
  },
  "Event Coordinator": {
    JUNIOR: 45,
    STANDARD: 55,
    PREMIUM: 68,
    ELITE: 85,
  },
  "Security Guard": {
    JUNIOR: 40,
    STANDARD: 52,
    PREMIUM: 65,
    ELITE: 80,
  },
  "Catering Manager": {
    JUNIOR: 50,
    STANDARD: 65,
    PREMIUM: 80,
    ELITE: 100,
  },
  Busser: {
    JUNIOR: 25,
    STANDARD: 32,
    PREMIUM: 40,
    ELITE: 50,
  },
  "Host/Hostess": {
    JUNIOR: 28,
    STANDARD: 35,
    PREMIUM: 45,
    ELITE: 58,
  },
  "Valet Attendant": {
    JUNIOR: 30,
    STANDARD: 38,
    PREMIUM: 48,
    ELITE: 60,
  },
  // Default rates for other roles
  DEFAULT: {
    JUNIOR: 30,
    STANDARD: 40,
    PREMIUM: 55,
    ELITE: 70,
  },
};

export interface StaffRequirement {
  role: string;
  quantity: number;
  selectedFavorites: string[];
  selectedTier: keyof typeof STAFF_TIERS;
}

interface SmartStaffSelectorProps {
  currentClient: Client;
  eventDate: Date | undefined;
  onChange: (requirements: StaffRequirement[]) => void;
  value: StaffRequirement[];
}

export function SmartStaffSelector({
  currentClient,
  eventDate,
  onChange,
  value,
}: SmartStaffSelectorProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState<Record<string, boolean>>({});

  // Get tier rate for specific role
  const getTierRateForRole = (role: string, tier: keyof typeof STAFF_TIERS): number => {
    const roleRates = ROLE_TIER_RATES[role as keyof typeof ROLE_TIER_RATES] || ROLE_TIER_RATES.DEFAULT;
    return roleRates[tier];
  };

  // Get events where client worked with a specific staff member
  const getEventsWithStaff = (staffId: string): { eventTitle: string; eventDate: string }[] => {
    const clientEvents = mockEvents.filter(event => 
      event.clientId === currentClient.id && 
      event.assignedStaff.includes(staffId)
    );
    
    return clientEvents.map(event => ({
      eventTitle: event.title,
      eventDate: event.date,
    }));
  };

  // Get available staff count for a specific tier and role
  const getAvailableStaffCount = (role: string, tier: keyof typeof STAFF_TIERS): number => {
    const tierRange = STAFF_TIERS[tier].rateRange;
    
    return mockStaff.filter(staff => {
      const matchesRole = staff.skills.includes(role);
      const matchesTier = staff.hourlyRate >= tierRange.min && staff.hourlyRate <= tierRange.max;
      const isAvailable = staff.availabilityStatus === 'available';
      return matchesRole && matchesTier && isAvailable;
    }).length;
  };

  // Get client's favorite staff for specific role (from preferredStaff list)
  const getFavoriteStaffForRole = (role: string): Staff[] => {
    if (!currentClient?.preferredStaff || currentClient.preferredStaff.length === 0) return [];
    
    // Get staff from preferredStaff list
    return mockStaff.filter(staff => 
      currentClient.preferredStaff.includes(staff.id) && 
      staff.skills.includes(role) &&
      staff.availabilityStatus === 'available' // Only show available favorites
    );
  };

  // Check if staff is available on event date
  const isStaffAvailable = (staffId: string): boolean => {
    const staff = mockStaff.find(s => s.id === staffId);
    if (!staff || !eventDate) return false;
    
    // Check availability (simplified - in real app would check against bookings)
    return staff.availabilityStatus === 'available';
  };

  // Add a new role
  const addRole = (role: string) => {
    const existingRole = value.find(r => r.role === role);
    if (existingRole) return;

    onChange([
      ...value,
      {
        role,
        quantity: 1,
        selectedFavorites: [],
        selectedTier: 'STANDARD',
      },
    ]);
    setExpandedRoles(new Set([...expandedRoles, role]));
    setShowFavorites({ ...showFavorites, [role]: true });
  };

  // Update role requirement
  const updateRole = (role: string, updates: Partial<StaffRequirement>) => {
    onChange(
      value.map(req =>
        req.role === role ? { ...req, ...updates } : req
      )
    );
  };

  // Remove role
  const removeRole = (role: string) => {
    onChange(value.filter(req => req.role !== role));
    const newExpanded = new Set(expandedRoles);
    newExpanded.delete(role);
    setExpandedRoles(newExpanded);
  };

  // Toggle favorite staff selection
  const toggleFavoriteStaff = (role: string, staffId: string) => {
    const requirement = value.find(r => r.role === role);
    if (!requirement) return;

    const isFavoriteSelected = requirement.selectedFavorites.includes(staffId);
    const newFavorites = isFavoriteSelected
      ? requirement.selectedFavorites.filter(id => id !== staffId)
      : [...requirement.selectedFavorites, staffId];

    updateRole(role, { selectedFavorites: newFavorites });
  };

  // Calculate cost for a role
  const calculateRoleCost = (requirement: StaffRequirement, duration: number = 5): {
    favoritesCost: number;
    tierCost: number;
    totalCost: number;
    avgRate: number;
  } => {
    let favoritesCost = 0;
    let tierStaffCount = requirement.quantity - requirement.selectedFavorites.length;

    // Calculate favorites cost
    requirement.selectedFavorites.forEach(staffId => {
      const staff = mockStaff.find(s => s.id === staffId);
      if (staff) {
        favoritesCost += staff.hourlyRate * duration;
      }
    });

    // Calculate tier cost
    const tierRate = getTierRateForRole(requirement.role, requirement.selectedTier);
    const tierCost = tierRate * tierStaffCount * duration;

    const totalCost = favoritesCost + tierCost;
    const avgRate = requirement.quantity > 0 ? totalCost / (requirement.quantity * duration) : 0;

    return { favoritesCost, tierCost, totalCost, avgRate };
  };

  // Toggle role expansion
  const toggleRoleExpansion = (role: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Role Requirements List */}
      {value.map((requirement) => {
        const favoriteStaff = getFavoriteStaffForRole(requirement.role);
        const isExpanded = expandedRoles.has(requirement.role);
        const costs = calculateRoleCost(requirement);
        const tierRate = getTierRateForRole(requirement.role, requirement.selectedTier);
        const tierInfo = STAFF_TIERS[requirement.selectedTier];

        return (
          <Card key={requirement.role} className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{requirement.role}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {requirement.quantity} staff needed • ${costs.avgRate.toFixed(2)}/hr avg
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    ${costs.totalCost.toLocaleString()} total
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRoleExpansion(requirement.role)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isExpanded ? 'Collapse' : 'Expand'} staff options</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRole(requirement.role)}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove this role</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How many {requirement.role}s do you need?
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={requirement.quantity}
                    onChange={(e) => updateRole(requirement.role, { quantity: parseInt(e.target.value) || 1 })}
                    className="w-32"
                  />
                </div>

                <Separator />

                {/* Favorites Section */}
                {favoriteStaff.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary fill-primary" />
                        <h4 className="font-medium">Your Favorite {requirement.role}s ({favoriteStaff.length} available)</h4>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowFavorites(prev => ({ ...prev, [requirement.role]: !prev[requirement.role] }))}
                          >
                            {showFavorites[requirement.role] ? 'Hide' : 'Show'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle your favorite staff members</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {showFavorites[requirement.role] && (
                      <div className="space-y-2 pl-2">
                        {favoriteStaff.map((staff) => {
                          const isSelected = requirement.selectedFavorites.includes(staff.id);
                          const tierDiff = staff.hourlyRate - tierRate;
                          const eventsWorked = getEventsWithStaff(staff.id);
                          
                          return (
                            <div
                              key={staff.id}
                              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleFavoriteStaff(requirement.role, staff.id)}
                                disabled={requirement.selectedFavorites.length >= requirement.quantity && !isSelected}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{staff.name}</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium">{staff.rating.toFixed(1)}</span>
                                  </div>
                                  {isStaffAvailable(staff.id) && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Available
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2">
                                  {staff.totalEvents} events completed • {staff.location}
                                </p>

                                {/* Events worked together */}
                                {eventsWorked.length > 0 && (
                                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1.5 mb-2">
                                    <div className="flex items-start gap-1.5">
                                      <Calendar className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs text-blue-900">
                                        <p className="font-medium mb-1">Worked together at {eventsWorked.length} event{eventsWorked.length > 1 ? 's' : ''}:</p>
                                        <ul className="space-y-0.5">
                                          {eventsWorked.slice(0, 2).map((event, idx) => (
                                            <li key={idx} className="truncate">
                                              • {event.eventTitle} ({new Date(event.eventDate).toLocaleDateString()})
                                            </li>
                                          ))}
                                          {eventsWorked.length > 2 && (
                                            <li className="text-blue-700">+ {eventsWorked.length - 2} more</li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-lg">${staff.hourlyRate}/hr</span>
                                  {tierDiff !== 0 && (
                                    <span className={`text-xs font-medium ${tierDiff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {tierDiff > 0 ? `+$${tierDiff}` : `-$${Math.abs(tierDiff)}`}/hr vs {tierInfo.name.toLowerCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {requirement.selectedFavorites.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 mt-3">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-900">
                              {requirement.selectedFavorites.length} favorite{requirement.selectedFavorites.length > 1 ? 's' : ''} selected.
                              {requirement.quantity - requirement.selectedFavorites.length > 0 &&
                                ` We'll auto-fill the remaining ${requirement.quantity - requirement.selectedFavorites.length} from your selected tier.`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                    <Heart className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No favorite {requirement.role}s in your list yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Work with staff and mark them as favorites to see them here
                    </p>
                  </div>
                )}

                <Separator />

                {/* Tier Selection for Remaining Staff */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">
                      Auto-Fill {requirement.quantity - requirement.selectedFavorites.length > 0 
                        ? `Remaining ${requirement.quantity - requirement.selectedFavorites.length} Staff` 
                        : requirement.selectedFavorites.length === 0 ? 'All Staff' : ''}
                    </h4>
                  </div>

                  {requirement.quantity - requirement.selectedFavorites.length > 0 && (
                    <div className="space-y-2">
                      {(Object.keys(STAFF_TIERS) as Array<keyof typeof STAFF_TIERS>).map((tierKey) => {
                        const tier = STAFF_TIERS[tierKey];
                        const isSelected = requirement.selectedTier === tierKey;
                        const availableCount = getAvailableStaffCount(requirement.role, tierKey);
                        const tierRateForRole = getTierRateForRole(requirement.role, tierKey);
                        const remainingStaffNeeded = requirement.quantity - requirement.selectedFavorites.length;

                        return (
                          <div
                            key={tierKey}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? `${tier.borderColor} ${tier.bgColor}`
                                : 'border-border hover:border-primary/30'
                            }`}
                            onClick={() => updateRole(requirement.role, { selectedTier: tierKey })}
                          >
                            {tier.recommended && (
                              <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                                ⭐ Popular
                              </Badge>
                            )}
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{tier.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className={`font-semibold ${tier.color}`}>{tier.name}</h5>
                                  <span className="font-bold">${tierRateForRole}/hr</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {tier.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    {availableCount >= remainingStaffNeeded ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <AlertCircle className="h-3 w-3 text-orange-600" />
                                    )}
                                    <span className={availableCount >= remainingStaffNeeded ? 'text-green-600' : 'text-orange-600'}>
                                      {availableCount} available
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <Badge variant="outline" className="text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cost Breakdown (5 hours)
                  </h5>
                  {requirement.selectedFavorites.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Favorites ({requirement.selectedFavorites.length} staff):
                      </span>
                      <span className="font-medium">${costs.favoritesCost.toLocaleString()}</span>
                    </div>
                  )}
                  {requirement.quantity - requirement.selectedFavorites.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {tierInfo.name} ({requirement.quantity - requirement.selectedFavorites.length} staff):
                      </span>
                      <span className="font-medium">${costs.tierCost.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total {requirement.role}s:</span>
                    <span className="text-primary">${costs.totalCost.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average: ${costs.avgRate.toFixed(2)}/hr per {requirement.role.toLowerCase()}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Add Role Button */}
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors">
        <CardContent className="pt-6">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-primary opacity-50" />
            <h4 className="font-medium mb-2">Add Staff Role</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select the type of staff you need for your event
            </p>
            <Select onValueChange={addRole}>
              <SelectTrigger className="max-w-xs mx-auto">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bartender">Bartender</SelectItem>
                <SelectItem value="Server (Plated)">Server (Plated)</SelectItem>
                <SelectItem value="Server (Cocktail)">Server (Cocktail)</SelectItem>
                <SelectItem value="Server (Buffet)">Server (Buffet)</SelectItem>
                <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                <SelectItem value="Catering Manager">Catering Manager</SelectItem>
                <SelectItem value="Security Guard">Security Guard</SelectItem>
                <SelectItem value="Host/Hostess">Host/Hostess</SelectItem>
                <SelectItem value="Busser">Busser</SelectItem>
                <SelectItem value="Valet Attendant">Valet Attendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
