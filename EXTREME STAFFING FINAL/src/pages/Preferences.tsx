import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Slider } from "../components/ui/slider";
import { 
  Settings,
  Bell,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  Globe,
  Save,
  RotateCcw
} from "lucide-react";

interface PreferencesProps {
  userRole: string;
  userId: string;
}

export function Preferences({ userRole }: PreferencesProps) {
  const [preferences, setPreferences] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    shiftReminders: true,
    paymentAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    reminderTime: 60, // minutes before shift
    
    // Display Settings
    theme: 'system', // light, dark, system
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12', // 12 or 24 hour
    
    // Sound Settings
    soundEnabled: true,
    soundVolume: 75,
    notificationSound: 'default',
    
    // Privacy Settings
    profileVisibility: 'team', // public, team, private
    showOnlineStatus: true,
    allowDirectMessages: true,
    
    // Work Preferences
    autoAcceptShifts: false,
    preferredShiftTypes: ['bartending', 'serving'],
    maxShiftsPerWeek: 5,
    minimumHoursBetweenShifts: 8,
    travelRadius: 25, // miles
    
    // Calendar Settings
    calendarSync: false,
    showDeclinedShifts: false,
    defaultCalendarView: 'week'
  });

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    // In real app, this would save to backend
  };

  const handleReset = () => {
    // Reset to default values
    console.log('Resetting preferences to defaults');
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Preferences</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Customize your experience and notification settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex lg:grid grid-cols-2 lg:grid-cols-5 w-full min-w-max lg:min-w-0">
            <TabsTrigger value="notifications" className="whitespace-nowrap">Notifications</TabsTrigger>
            <TabsTrigger value="display" className="whitespace-nowrap">Display</TabsTrigger>
            <TabsTrigger value="sound" className="whitespace-nowrap">Sound</TabsTrigger>
            <TabsTrigger value="privacy" className="whitespace-nowrap">Privacy</TabsTrigger>
            <TabsTrigger value="work" className="whitespace-nowrap">Work</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Notifications
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure which email notifications you receive
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Enable email notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="shiftReminders">Shift reminders</Label>
                  <Switch
                    id="shiftReminders"
                    checked={preferences.shiftReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('shiftReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="paymentAlerts">Payment alerts</Label>
                  <Switch
                    id="paymentAlerts"
                    checked={preferences.paymentAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange('paymentAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="systemUpdates">System updates</Label>
                  <Switch
                    id="systemUpdates"
                    checked={preferences.systemUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('systemUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketingEmails">Marketing emails</Label>
                  <Switch
                    id="marketingEmails"
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Push & SMS Notifications
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mobile and SMS notification settings
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push notifications</Label>
                  <Switch
                    id="pushNotifications"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotifications">SMS notifications</Label>
                  <Switch
                    id="smsNotifications"
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Shift reminder time</Label>
                  <Select
                    value={preferences.reminderTime.toString()}
                    onValueChange={(value) => handlePreferenceChange('reminderTime', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="240">4 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Theme & Appearance
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => handlePreferenceChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Regional Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Date, time, and timezone preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => handlePreferenceChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value) => handlePreferenceChange('timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sound" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sound Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure notification sounds and volume
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="soundEnabled">Enable sounds</Label>
                <Switch
                  id="soundEnabled"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
                />
              </div>
              
              {preferences.soundEnabled && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="soundVolume">Notification volume</Label>
                    <div className="flex items-center gap-4">
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        id="soundVolume"
                        min={0}
                        max={100}
                        step={5}
                        value={[preferences.soundVolume]}
                        onValueChange={(value) => handlePreferenceChange('soundVolume', value[0])}
                        className="flex-1"
                      />
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground w-12">{preferences.soundVolume}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notificationSound">Notification sound</Label>
                    <Select
                      value={preferences.notificationSound}
                      onValueChange={(value) => handlePreferenceChange('notificationSound', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="bell">Bell</SelectItem>
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="ping">Ping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control your privacy and visibility settings
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Profile visibility</Label>
                <Select
                  value={preferences.profileVisibility}
                  onValueChange={(value) => handlePreferenceChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showOnlineStatus">Show online status</Label>
                <Switch
                  id="showOnlineStatus"
                  checked={preferences.showOnlineStatus}
                  onCheckedChange={(checked) => handlePreferenceChange('showOnlineStatus', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="allowDirectMessages">Allow direct messages</Label>
                <Switch
                  id="allowDirectMessages"
                  checked={preferences.allowDirectMessages}
                  onCheckedChange={(checked) => handlePreferenceChange('allowDirectMessages', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="space-y-6">
          {userRole === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Preferences</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure your work and shift preferences
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoAcceptShifts">Auto-accept shifts</Label>
                    <Switch
                      id="autoAcceptShifts"
                      checked={preferences.autoAcceptShifts}
                      onCheckedChange={(checked) => handlePreferenceChange('autoAcceptShifts', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxShiftsPerWeek">Maximum shifts per week</Label>
                    <Input
                      id="maxShiftsPerWeek"
                      type="number"
                      min="1"
                      max="7"
                      value={preferences.maxShiftsPerWeek}
                      onChange={(e) => handlePreferenceChange('maxShiftsPerWeek', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minimumHoursBetweenShifts">Minimum hours between shifts</Label>
                    <Input
                      id="minimumHoursBetweenShifts"
                      type="number"
                      min="1"
                      max="24"
                      value={preferences.minimumHoursBetweenShifts}
                      onChange={(e) => handlePreferenceChange('minimumHoursBetweenShifts', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calendar Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customize your calendar and schedule view
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="calendarSync">Sync with external calendar</Label>
                    <Switch
                      id="calendarSync"
                      checked={preferences.calendarSync}
                      onCheckedChange={(checked) => handlePreferenceChange('calendarSync', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDeclinedShifts">Show declined shifts</Label>
                    <Switch
                      id="showDeclinedShifts"
                      checked={preferences.showDeclinedShifts}
                      onCheckedChange={(checked) => handlePreferenceChange('showDeclinedShifts', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultCalendarView">Default calendar view</Label>
                    <Select
                      value={preferences.defaultCalendarView}
                      onValueChange={(value) => handlePreferenceChange('defaultCalendarView', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}