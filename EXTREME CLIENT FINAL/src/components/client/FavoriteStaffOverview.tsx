import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
  Heart,
  Star,
  Briefcase,
  DollarSign,
  UserPlus,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { mockStaff, Staff, Client } from "../../data/mockData";
import { toast } from "sonner@2.0.3";

interface FavoriteStaffOverviewProps {
  currentClient: Client;
  onStaffSelect?: (staffIds: string[]) => void;
}

export function FavoriteStaffOverview({
  currentClient,
  onStaffSelect,
}: FavoriteStaffOverviewProps) {
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // Safety check for currentClient
  if (!currentClient || !currentClient.preferredStaff) {
    return null;
  }

  // Get all favorite staff members
  const favoriteStaff = mockStaff.filter((staff) =>
    currentClient.preferredStaff.includes(staff.id)
  );

  // Get all unique roles from favorite staff
  const allRoles = [...new Set(favoriteStaff.flatMap((staff) => staff.skills))];

  // Filter staff by role
  const filteredStaff =
    filterRole === "all"
      ? favoriteStaff
      : favoriteStaff.filter((staff) => staff.skills.includes(filterRole));

  // Filter by availability
  const availableStaff = filteredStaff.filter(
    (staff) => staff.availabilityStatus === "available"
  );

  // Handle checkbox toggle
  const handleToggleStaff = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStaffIds.length === availableStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(availableStaff.map((staff) => staff.id));
    }
  };

  // Handle add selected staff
  const handleAddSelected = () => {
    if (selectedStaffIds.length === 0) {
      toast.error("No staff selected", {
        description: "Please select at least one staff member to add",
      });
      return;
    }

    const selectedNames = mockStaff
      .filter((s) => selectedStaffIds.includes(s.id))
      .map((s) => s.name);

    toast.success(`Added ${selectedStaffIds.length} staff members`, {
      description: selectedNames.slice(0, 3).join(", ") + 
        (selectedNames.length > 3 ? ` +${selectedNames.length - 3} more` : ""),
    });

    if (onStaffSelect) {
      onStaffSelect(selectedStaffIds);
    }

    // Clear selection
    setSelectedStaffIds([]);
  };

  if (favoriteStaff.length === 0) {
    return (
      <Card className="border-0 shadow-lg border-l-4 border-l-primary/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">No Favorite Staff Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              As you work with staff members and have great experiences, you can
              mark them as favorites to easily book them again for future events.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            Your Favorite Staff ({favoriteStaff.length})
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Select your favorite staff members to add them to your event
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Filter by Role:</label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    All Roles ({favoriteStaff.length})
                  </div>
                </SelectItem>
                <Separator className="my-1" />
                {allRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role} (
                    {
                      favoriteStaff.filter((s) => s.skills.includes(role))
                        .length
                    }
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedStaffIds.length} selected
            </Badge>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddSelected}
              disabled={selectedStaffIds.length === 0}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Selected ({selectedStaffIds.length})
            </Button>
          </div>
        </div>

        <Separator />

        {/* Available Staff List */}
        {availableStaff.length > 0 ? (
          <div className="space-y-3">
            {/* Header with Select All */}
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg">
              <Checkbox
                id="select-all"
                checked={
                  availableStaff.length > 0 &&
                  selectedStaffIds.length === availableStaff.length
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Select All Available ({availableStaff.length})
              </label>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                <div className="w-32">Role</div>
                <div className="w-20 text-right">Rate/hr</div>
                <div className="w-16 text-right">Rating</div>
                <div className="w-20 text-right">Experience</div>
              </div>
            </div>

            {/* Staff List */}
            <div className="space-y-1">
              {availableStaff.map((staff) => {
                const isSelected = selectedStaffIds.includes(staff.id);
                const primaryRole = staff.skills[0] || "Staff";

                return (
                  <div
                    key={staff.id}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "bg-primary/5 border-primary hover:bg-primary/10"
                          : "bg-background border-transparent hover:bg-muted/50 hover:border-muted"
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      id={`staff-${staff.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleStaff(staff.id)}
                    />

                    {/* Staff Name */}
                    <div
                      className="font-medium cursor-pointer flex-1 min-w-0"
                      onClick={() => handleToggleStaff(staff.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{staff.name}</span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-2.5 w-2.5 mr-1" />
                          Available
                        </Badge>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="w-32">
                      <Badge variant="secondary" className="text-xs">
                        {primaryRole}
                      </Badge>
                    </div>

                    {/* Rate */}
                    <div className="w-20 text-right font-bold text-primary">
                      ${staff.hourlyRate}
                    </div>

                    {/* Rating */}
                    <div className="w-16 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {staff.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="w-20 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {staff.totalEvents}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {filterRole === "all"
                ? "No favorite staff available at the moment"
                : `No favorite ${filterRole}s available`}
            </p>
          </div>
        )}

        {/* Unavailable Staff Count */}
        {filteredStaff.length > availableStaff.length && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-orange-900">
              <span className="font-medium">
                {filteredStaff.length - availableStaff.length} favorite staff
              </span>{" "}
              currently unavailable for this date
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg text-primary">
                {favoriteStaff.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Favorites
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg text-green-600">
                {availableStaff.length}
              </div>
              <div className="text-xs text-muted-foreground">Available Now</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 text-center">
              <div className="font-bold text-lg text-blue-600">
                {selectedStaffIds.length}
              </div>
              <div className="text-xs text-muted-foreground">Selected</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}