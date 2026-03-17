import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner@2.0.3";
import { Event, Staff, User, Shift } from '../data/mockData';

// Define shift statistics structure
export interface ShiftStats {
  travelTo: number;      // ms
  work: number;          // ms (excluding breaks)
  break: number;         // ms
  travelReturn: number;  // ms
}

interface AppStateContextType {
  // Navigation
  navigate: (page: string) => void;
  
  // Dialogs
  openDialog: (dialogId: string, data?: any) => void;
  closeDialog: (dialogId: string) => void;
  isDialogOpen: (dialogId: string) => boolean;
  getDialogData: (dialogId: string) => any;
  setDialogData: (dialogId: string, data: any) => void;
  
  // Staff Management
  checkInShift: (shiftId: string, userId: string) => void;
  checkOutShift: (shiftId: string, userId: string) => void;
  requestTimeOff: (userId: string, dates: string[], reason: string) => void;
  submitTimesheet: (userId: string, hours: number, description: string) => void;
  
  // Travel State
  startTravel: (shiftId: string) => void;
  arrivedAtEvent: (shiftId: string) => void;
  startReturnTravel: (shiftId: string) => void;
  arrivedHome: (shiftId: string) => void;
  finalizeShift: () => void; // New function to clear shift state

  // Active Shift & Timer Management
  activeShift: Shift | null;
  setActiveShift: (shift: Shift | null) => void;
  currentTimer: string;
  setCurrentTimer: (timer: string) => void;
  timerStartTime: Date | null;
  setTimerStartTime: (time: Date | null) => void;
  isAnyShiftActive: boolean;
  setIsAnyShiftActive: (active: boolean) => void;
  startBreak: () => void;
  endBreak: () => void;
  frozenWorkTime: number; // in milliseconds
  setFrozenWorkTime: (time: number) => void;
  
  // Shift Statistics
  shiftStats: ShiftStats;
  
  // Event Management
  bookStaff: (staffId: string, eventId: string) => void;
  createEvent: (eventData: Partial<Event>) => void;
  updateEvent: (eventId: string, eventData: Partial<Event>) => void;
  cancelEvent: (eventId: string) => void;
  
  // Staff Profile Management
  updateStaffProfile: (staffId: string, profileData: Partial<Staff>) => void;
  toggleStaffAvailability: (staffId: string) => void;
  uploadDocument: (staffId: string, documentType: string, file: File) => void;
  
  // Admin Functions
  approveStaff: (staffId: string) => void;
  rejectStaff: (staffId: string) => void;
  assignStaffToEvent: (staffId: string, eventId: string) => void;
  generateReport: (reportType: string, dateRange: { start: string; end: string }) => void;
  
  // Messaging
  sendMessage: (recipientId: string, message: string) => void;
  markMessageAsRead: (messageId: string) => void;
  
  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Settings
  updateSettings: (section: string, settings: any) => void;
  
  // Form Management
  submitForm: (formType: string, formData: any) => void;
  
  // General Actions
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  
  // State
  dialogs: Record<string, { isOpen: boolean; data?: any }>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentShiftStatus: string;
  setCurrentShiftStatus: (status: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ 
  children, 
  setCurrentPage 
}: { 
  children: ReactNode;
  setCurrentPage: (page: string) => void;
}) {
  const [dialogs, setDialogs] = useState<Record<string, { isOpen: boolean; data?: any }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentShiftStatus, setCurrentShiftStatus] = useState('not-started');
  
  // Active shift and timer state
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [currentTimer, setCurrentTimer] = useState('00:00:00');
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [isAnyShiftActive, setIsAnyShiftActive] = useState(false);
  const [frozenWorkTime, setFrozenWorkTime] = useState(0);
  
  // New State for Detailed Statistics
  const [shiftStats, setShiftStats] = useState<ShiftStats>({
    travelTo: 0,
    work: 0,
    break: 0,
    travelReturn: 0
  });
  
  // Helper to get duration of current segment
  const getSegmentDuration = () => {
    if (!timerStartTime) return 0;
    return new Date().getTime() - timerStartTime.getTime();
  };

  // Travel Actions
  const startTravel = (shiftId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentShiftStatus('traveling-to');
      // Set active shift if not already (mock)
      if (!activeShift) {
        // Find shift logic would go here. For now, mock setting a shift
        const mockShift = { id: shiftId, eventId: 'temp', staffId: 'temp', date: '', startTime: '', endTime: '', status: 'ongoing' as const, location: 'Event Location', role: 'Staff', hourlyRate: 20 };
        setActiveShift(mockShift);
      }
      
      // Reset stats for new journey
      setShiftStats({
        travelTo: 0,
        work: 0,
        break: 0,
        travelReturn: 0
      });
      
      setTimerStartTime(new Date()); // Start timer for travel tracking
      toast.success("Travel tracking started. Drive safely!");
    }, 1000);
  };

  const arrivedAtEvent = (shiftId: string) => {
    setIsLoading(true);
    const duration = getSegmentDuration();
    
    setTimeout(() => {
      setIsLoading(false);
      setShiftStats(prev => ({ ...prev, travelTo: duration }));
      setTimerStartTime(null); // Stop timer until check-in
      setCurrentTimer('00:00:00');
      setCurrentShiftStatus('arrived');
      toast.success("Arrived at venue. Ready to clock in.");
    }, 1000);
  };

  const startReturnTravel = (shiftId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentShiftStatus('traveling-back');
      setTimerStartTime(new Date()); // Start timer for return travel
      toast.success("Return travel tracking started.");
    }, 1000);
  };

  const arrivedHome = (shiftId: string) => {
    setIsLoading(true);
    const duration = getSegmentDuration();
    
    setTimeout(() => {
      setIsLoading(false);
      setShiftStats(prev => ({ ...prev, travelReturn: duration }));
      setCurrentShiftStatus('completed');
      setTimerStartTime(null);
      // NOTE: We do NOT set activeShift to null here anymore. 
      // The UI will show a summary dialog, and closing that dialog will call finalizeShift.
      toast.success("Welcome home! Shift and travel logs saved.");
    }, 1000);
  };

  const finalizeShift = () => {
    setActiveShift(null);
    setCurrentShiftStatus('not-started');
    setTimerStartTime(null);
    setCurrentTimer('00:00:00');
    setFrozenWorkTime(0);
    setShiftStats({ travelTo: 0, work: 0, break: 0, travelReturn: 0 });
    setIsAnyShiftActive(false);
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeShift && timerStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        let elapsed = 0;

        if (currentShiftStatus === 'break') {
          // On Break: Show current break duration
          elapsed = now.getTime() - timerStartTime.getTime();
        } else if (currentShiftStatus === 'in-progress') {
          // Working: Show total work time (previous segments + current segment)
          elapsed = frozenWorkTime + (now.getTime() - timerStartTime.getTime());
        } else {
           // Traveling or other timed states: simple elapsed
           elapsed = now.getTime() - timerStartTime.getTime();
        }
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        setCurrentTimer(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift, timerStartTime, currentShiftStatus, frozenWorkTime]);

  const startBreak = () => {
    if (timerStartTime) {
      const duration = getSegmentDuration();
      setFrozenWorkTime(prev => prev + duration); // Save work time
      setShiftStats(prev => ({ ...prev, work: prev.work + duration })); // Accumulate total work
      
      const now = new Date();
      setTimerStartTime(now);
      setCurrentShiftStatus('break');
      toast.info("Break started");
    }
  };

  const endBreak = () => {
    if (timerStartTime) {
      const duration = getSegmentDuration();
      setShiftStats(prev => ({ ...prev, break: prev.break + duration })); // Accumulate break time
      
      const now = new Date();
      setTimerStartTime(now);
      setCurrentShiftStatus('in-progress');
      toast.success("Back to work");
    }
  };

  // Navigation
  const navigate = (page: string) => {
    setCurrentPage(page);
    toast.info(`Navigating to ${page}`);
  };

  // Dialog Management
  const openDialog = (dialogId: string, data?: any) => {
    setDialogs(prev => ({
      ...prev,
      [dialogId]: { isOpen: true, data }
    }));
  };

  const closeDialog = (dialogId: string) => {
    setDialogs(prev => ({
      ...prev,
      [dialogId]: { isOpen: false, data: undefined }
    }));
  };

  const isDialogOpen = (dialogId: string) => {
    return dialogs[dialogId]?.isOpen || false;
  };

  const getDialogData = (dialogId: string) => {
    return dialogs[dialogId]?.data;
  };

  const setDialogData = (dialogId: string, data: any) => {
    setDialogs(prev => ({
      ...prev,
      [dialogId]: { ...prev[dialogId], data }
    }));
  };

  // Staff Management Functions
  const checkInShift = (shiftId: string, userId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, you'd fetch the shift data here
      const shift = { id: shiftId, eventId: 'temp', staffId: userId, date: '', startTime: '', endTime: '', status: 'ongoing' as const, location: '', role: '', hourlyRate: 0 };
      setActiveShift(shift);
      
      // Reset stats if not coming from travel (e.g. direct check-in)
      if (currentShiftStatus === 'not-started') {
        setShiftStats({ travelTo: 0, work: 0, break: 0, travelReturn: 0 });
      }

      setTimerStartTime(new Date());
      setCurrentTimer('00:00:00');
      setIsAnyShiftActive(true);
      setCurrentShiftStatus('in-progress');
      toast.success("Successfully checked in to shift!");
    }, 1000);
  };

  const checkOutShift = (shiftId: string, userId: string) => {
    setIsLoading(true);
    
    // Capture final work duration before checking out
    const duration = getSegmentDuration();
    setFrozenWorkTime(prev => prev + duration);
    setShiftStats(prev => ({ ...prev, work: prev.work + duration }));

    setTimeout(() => {
      setIsLoading(false);
      setTimerStartTime(null);
      setCurrentTimer('00:00:00');
      setCurrentShiftStatus('ready-to-return'); 
      toast.success("Successfully checked out! Ready for return travel.");
    }, 1000);
  };

  const requestTimeOff = (userId: string, dates: string[], reason: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Time off request submitted successfully!");
    }, 1000);
  };

  const submitTimesheet = (userId: string, hours: number, description: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Timesheet submitted successfully!");
    }, 1000);
  };

  // Event Management Functions
  const bookStaff = (staffId: string, eventId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Staff member booked successfully!");
    }, 1500);
  };

  const createEvent = (eventData: Partial<Event>) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Event created successfully!");
    }, 1500);
  };

  const updateEvent = (eventId: string, eventData: Partial<Event>) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Event updated successfully!");
    }, 1000);
  };

  const cancelEvent = (eventId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Event cancelled successfully!");
    }, 1000);
  };

  // Staff Profile Management
  const updateStaffProfile = (staffId: string, profileData: Partial<Staff>) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  const toggleStaffAvailability = (staffId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Availability status updated!");
    }, 800);
  };

  const uploadDocument = (staffId: string, documentType: string, file: File) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${documentType} uploaded successfully!`);
    }, 2000);
  };

  // Admin Functions
  const approveStaff = (staffId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Staff member approved!");
    }, 1000);
  };

  const rejectStaff = (staffId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.error("Staff member rejected.");
    }, 1000);
  };

  const assignStaffToEvent = (staffId: string, eventId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Staff assigned to event successfully!");
    }, 1200);
  };

  const generateReport = (reportType: string, dateRange: { start: string; end: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${reportType} report generated successfully!`);
    }, 2000);
  };

  // Messaging
  const sendMessage = (recipientId: string, message: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Message sent successfully!");
    }, 800);
  };

  const markMessageAsRead = (messageId: string) => {
    toast.info("Message marked as read");
  };

  // Notifications
  const markNotificationAsRead = (notificationId: string) => {
    toast.info("Notification marked as read");
  };

  const markAllNotificationsAsRead = () => {
    toast.success("All notifications marked as read");
  };

  // Settings
  const updateSettings = (section: string, settings: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${section} settings updated successfully!`);
    }, 1000);
  };

  // Form Management
  const submitForm = (formType: string, formData: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${formType} form submitted successfully!`);
    }, 1200);
  };

  // Toast Functions
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showInfo = (message: string) => {
    toast.info(message);
  };

  const showWarning = (message: string) => {
    toast.warning(message);
  };

  const value = {
    navigate,
    openDialog,
    closeDialog,
    isDialogOpen,
    getDialogData,
    setDialogData,
    checkInShift,
    checkOutShift,
    requestTimeOff,
    submitTimesheet,
    bookStaff,
    createEvent,
    updateEvent,
    cancelEvent,
    updateStaffProfile,
    toggleStaffAvailability,
    uploadDocument,
    approveStaff,
    rejectStaff,
    assignStaffToEvent,
    generateReport,
    sendMessage,
    markMessageAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateSettings,
    submitForm,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dialogs,
    isLoading,
    setIsLoading,
    currentShiftStatus,
    setCurrentShiftStatus,
    activeShift,
    setActiveShift,
    currentTimer,
    setCurrentTimer,
    timerStartTime,
    setTimerStartTime,
    isAnyShiftActive,
    setIsAnyShiftActive,
    startBreak,
    endBreak,
    frozenWorkTime,
    setFrozenWorkTime,
    startTravel,
    arrivedAtEvent,
    startReturnTravel,
    arrivedHome,
    finalizeShift,
    shiftStats
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}