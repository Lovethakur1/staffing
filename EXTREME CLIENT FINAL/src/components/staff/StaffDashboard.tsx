import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, Clock, MapPin, DollarSign, FileText, Upload, Check, X, Star } from "lucide-react";
import { mockShifts, mockPayrollRecords, mockRatings, mockEvents, getShiftsByStaff, getPayrollByStaff, getRatingsByStaff } from "../../data/mockData";
import { TimesheetForm } from "./TimesheetForm";

interface StaffDashboardProps {
  staffId: string;
}

export function StaffDashboard({ staffId }: StaffDashboardProps) {
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  const staffShifts = getShiftsByStaff(staffId);
  const staffPayroll = getPayrollByStaff(staffId);
  const staffRatings = getRatingsByStaff(staffId);
  
  const upcomingShifts = staffShifts.filter(shift => new Date(shift.date) >= new Date());
  const completedShifts = staffShifts.filter(shift => shift.status === 'completed');
  
  const totalEarnings = staffPayroll.reduce((sum, record) => sum + record.netPay, 0);
  const averageRating = staffRatings.length > 0 
    ? staffRatings.reduce((sum, rating) => sum + rating.overall, 0) / staffRatings.length 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTitle = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  const handleShiftResponse = (shiftId: string, response: 'confirmed' | 'rejected') => {
    console.log(`Shift ${shiftId} ${response}`);
    // Here you would update the shift status
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingShifts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedShifts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shifts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shifts">My Shifts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4">
          <h3 className="text-lg font-medium">Your Shifts</h3>
          
          <div className="grid gap-4">
            {staffShifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{getEventTitle(shift.eventId)}</CardTitle>
                      <CardDescription>{shift.role}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(shift.status)}>
                      {shift.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Rate: ${shift.hourlyRate}/hour
                      </span>
                      {shift.totalPay && (
                        <span className="text-sm text-muted-foreground">
                          Total: ${shift.totalPay}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {shift.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShiftResponse(shift.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleShiftResponse(shift.id, 'confirmed')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </>
                      )}
                      
                      {shift.status === 'completed' && !shift.clockOut && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedShift(shift);
                            setShowTimesheetForm(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Submit Timesheet
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <h3 className="text-lg font-medium">Shift Calendar</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Calendar view coming soon</p>
                <p className="text-sm">View your shifts in a calendar format</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <h3 className="text-lg font-medium">Payroll History</h3>
          <div className="grid gap-4">
            {staffPayroll.map((record) => (
              <Card key={record.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Pay Period: {record.period}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.totalHours} hours worked
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Gross Pay: ${record.grossPay}</p>
                        {Object.entries(record.deductions).map(([type, amount]) => 
                          amount && (
                            <p key={type} className="text-sm text-muted-foreground">
                              {type}: -${amount}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${record.netPay}</p>
                      <Badge className={record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {record.status}
                      </Badge>
                      {record.payDate && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Paid: {record.payDate}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <h3 className="text-lg font-medium">Documents</h3>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Documents</CardTitle>
                <CardDescription>Upload and manage your required documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'ID', status: 'approved', required: true },
                  { type: 'Food Handler License', status: 'approved', required: true },
                  { type: 'Background Check', status: 'pending', required: true },
                  { type: 'W-4 Form', status: 'missing', required: true },
                ].map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.required ? 'Required' : 'Optional'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {doc.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4">
          <h3 className="text-lg font-medium">Your Ratings</h3>
          <div className="grid gap-4">
            {staffRatings.map((rating) => (
              <Card key={rating.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{getEventTitle(rating.eventId)}</h4>
                      <p className="text-sm text-muted-foreground">{rating.date}</p>
                      
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Punctuality</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.punctuality 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Professionalism</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.professionalism 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Quality of Work</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.qualityOfWork 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {rating.comments && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">Comments:</p>
                          <p className="text-sm">{rating.comments}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{rating.overall}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showTimesheetForm && selectedShift && (
        <TimesheetForm
          isOpen={showTimesheetForm}
          onClose={() => {
            setShowTimesheetForm(false);
            setSelectedShift(null);
          }}
          shift={selectedShift}
        />
      )}
    </div>
  );
}