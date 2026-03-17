import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Save,
  Trash2,
  Download,
  Lock,
  Unlock,
  Info
} from "lucide-react";

interface SecurityProps {
  userRole: string;
  userId: string;
}

export function Security({ userRole }: SecurityProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailVerification: true,
    loginNotifications: true,
    sessionTimeout: 30, // minutes
    allowMultipleSessions: true,
    requirePasswordChange: false,
    dataBackup: true
  });

  // Mock security data
  const securityData = {
    lastPasswordChange: "2024-09-15",
    activeSessions: [
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'New York, NY',
        lastActive: '2024-10-25T14:30:00Z',
        current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'New York, NY',
        lastActive: '2024-10-25T09:15:00Z',
        current: false
      },
      {
        id: '3',
        device: 'Chrome on Mac',
        location: 'New York, NY',
        lastActive: '2024-10-24T16:45:00Z',
        current: false
      }
    ],
    loginHistory: [
      {
        id: '1',
        timestamp: '2024-10-25T14:30:00Z',
        device: 'Chrome on Windows',
        location: 'New York, NY',
        ip: '192.168.1.1',
        success: true
      },
      {
        id: '2',
        timestamp: '2024-10-25T09:15:00Z',
        device: 'Safari on iPhone',
        location: 'New York, NY',
        ip: '192.168.1.2',
        success: true
      },
      {
        id: '3',
        timestamp: '2024-10-24T16:45:00Z',
        device: 'Chrome on Mac',
        location: 'New York, NY',
        ip: '192.168.1.3',
        success: true
      },
      {
        id: '4',
        timestamp: '2024-10-24T10:22:00Z',
        device: 'Unknown device',
        location: 'Los Angeles, CA',
        ip: '203.0.113.1',
        success: false
      }
    ],
    backupHistory: [
      {
        id: '1',
        date: '2024-10-20',
        type: 'Full Backup',
        size: '2.5 MB',
        status: 'completed'
      },
      {
        id: '2',
        date: '2024-10-15',
        type: 'Incremental Backup',
        size: '1.2 MB',
        status: 'completed'
      },
      {
        id: '3',
        date: '2024-10-10',
        type: 'Full Backup',
        size: '2.3 MB',
        status: 'completed'
      }
    ]
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    console.log('Changing password');
    // In real app, this would call API to change password
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTerminateSession = (sessionId: string) => {
    console.log(`Terminating session ${sessionId}`);
    // In real app, this would call API to terminate session
  };

  const handleDownloadBackup = (backupId: string) => {
    console.log(`Downloading backup ${backupId}`);
    // In real app, this would initiate backup download
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength < 2) return { score: strength, label: 'Weak', color: 'text-destructive' };
    if (strength < 4) return { score: strength, label: 'Medium', color: 'text-warning' };
    return { score: strength, label: 'Strong', color: 'text-success' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Security</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Manage your account security and privacy settings
          </p>
        </div>
        <Badge className="bg-success text-success-foreground">
          <Shield className="w-4 h-4 mr-1" />
          Account Secure
        </Badge>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex lg:grid grid-cols-2 lg:grid-cols-5 w-full min-w-max lg:min-w-0">
            <TabsTrigger value="password" className="whitespace-nowrap">Password</TabsTrigger>
            <TabsTrigger value="2fa" className="whitespace-nowrap">Two-Factor</TabsTrigger>
            <TabsTrigger value="sessions" className="whitespace-nowrap">Sessions</TabsTrigger>
            <TabsTrigger value="activity" className="whitespace-nowrap">Activity</TabsTrigger>
            <TabsTrigger value="backup" className="whitespace-nowrap">Data Backup</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="password" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly to keep your account secure
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            passwordStrength.score < 2 ? 'bg-destructive' :
                            passwordStrength.score < 4 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Password Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Password Security
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current password status and security settings
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Last Password Change</p>
                    <p className="text-xs text-muted-foreground">{new Date(securityData.lastPasswordChange).toLocaleDateString()}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requirePasswordChange">Require password change</Label>
                    <Switch
                      id="requirePasswordChange"
                      checked={securitySettings.requirePasswordChange}
                      onCheckedChange={(checked) => handleSecuritySettingChange('requirePasswordChange', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loginNotifications">Login notifications</Label>
                    <Switch
                      id="loginNotifications"
                      checked={securitySettings.loginNotifications}
                      onCheckedChange={(checked) => handleSecuritySettingChange('loginNotifications', checked)}
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="2fa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    securitySettings.twoFactorEnabled ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {securitySettings.twoFactorEnabled ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      Two-Factor Authentication {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {securitySettings.twoFactorEnabled 
                        ? 'Your account is protected with 2FA'
                        : 'Secure your account with an additional verification step'
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  variant={securitySettings.twoFactorEnabled ? "destructive" : "default"}
                  onClick={() => handleSecuritySettingChange('twoFactorEnabled', !securitySettings.twoFactorEnabled)}
                >
                  {securitySettings.twoFactorEnabled ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Disable 2FA
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </>
                  )}
                </Button>
              </div>

              {securitySettings.twoFactorEnabled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled using your mobile device. You'll receive a verification code each time you sign in.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="emailVerification">Email verification for logins</Label>
                <Switch
                  id="emailVerification"
                  checked={securitySettings.emailVerification}
                  onCheckedChange={(checked) => handleSecuritySettingChange('emailVerification', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Active Sessions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your active login sessions across different devices
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityData.activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{session.device}</h4>
                        {session.current && (
                          <Badge className="bg-success text-success-foreground text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {formatDateTime(session.lastActive)}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Terminate
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="allowMultipleSessions">Allow multiple sessions</Label>
                <Switch
                  id="allowMultipleSessions"
                  checked={securitySettings.allowMultipleSessions}
                  onCheckedChange={(checked) => handleSecuritySettingChange('allowMultipleSessions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Login Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent login attempts and security activity
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityData.loginHistory.map((login) => (
                  <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        login.success ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {login.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{login.device}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {login.location} • IP: {login.ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatDateTime(login.timestamp)}</p>
                      <Badge variant={login.success ? "outline" : "destructive"} className="text-xs">
                        {login.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Data Backup Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure automatic backup of your account data
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataBackup">Enable automatic backups</Label>
                  <Switch
                    id="dataBackup"
                    checked={securitySettings.dataBackup}
                    onCheckedChange={(checked) => handleSecuritySettingChange('dataBackup', checked)}
                  />
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Backups include your profile data, work history, and preferences. Personal documents are not included for privacy.
                  </AlertDescription>
                </Alert>
                
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Create Manual Backup
                </Button>
              </CardContent>
            </Card>

            {/* Backup History */}
            <Card>
              <CardHeader>
                <CardTitle>Backup History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent data backups and downloads
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityData.backupHistory.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium">{backup.type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(backup.date).toLocaleDateString()} • {backup.size}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success text-success-foreground text-xs">
                          {backup.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadBackup(backup.id)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}