import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import {
  Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle,
  Clock, Monitor, Lock, Info, LogOut, Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import settingsService from "../services/settings.service";
import api from "../services/api";

interface SecurityProps {
  userRole: string;
  userId: string;
}

interface LoginLog {
  id: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

function parseDevice(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown browser", os: "Unknown OS" };
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" :
    /MSIE|Trident/.test(ua) ? "IE" : "Browser";
  const os =
    /Windows NT/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Linux/.test(ua) ? "Linux" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" : "Unknown OS";
  return { browser, os };
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  if (score < 2) return { score, label: "Weak", barColor: "bg-red-500" };
  if (score < 4) return { score, label: "Medium", barColor: "bg-yellow-500" };
  return { score, label: "Strong", barColor: "bg-green-500" };
}

export function Security({ userRole }: SecurityProps) {
  //  Password 
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [isSavingPw, setIsSavingPw] = useState(false);

  //  Security prefs (loginNotifications) from UserPreferences 
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  //  Activity 
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  //  Load preferences 
  useEffect(() => {
    settingsService.getPreferences()
      .then(({ notificationPrefs }) => {
        setLoginNotifications((notificationPrefs as any).loginNotifications ?? true);
      })
      .catch(() => {});
  }, []);

  //  Load activity 
  useEffect(() => {
    setIsLoadingActivity(true);
    api.get("/settings/activity")
      .then(r => {
        setLogs(r.data.logs || []);
        setLastLogin(r.data.lastLogin || null);
      })
      .catch(() => toast.error("Failed to load activity"))
      .finally(() => setIsLoadingActivity(false));
  }, []);

  //  Handlers 
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSavingPw(true);
    try {
      await settingsService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to change password");
    } finally {
      setIsSavingPw(false);
    }
  };

  const handleSaveLoginNotif = async (checked: boolean) => {
    setLoginNotifications(checked);
    setIsSavingPrefs(true);
    try {
      await settingsService.updateNotificationPrefs({ loginNotifications: checked } as any);
    } catch {
      toast.error("Failed to save preference");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/settings/logout-all");
      toast.success("All other devices have been signed out");
    } catch {
      toast.error("Failed to sign out other devices");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const strength = getPasswordStrength(passwordForm.newPassword);
  const successCount = logs.filter(l => l.success).length;
  const failCount = logs.filter(l => !l.success).length;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Security & Access</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {userRole}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Manage your account security and privacy settings
          </p>
        </div>
        {failCount === 0 ? (
          <Badge className="bg-green-600 text-white self-start lg:self-auto">
            <Shield className="w-4 h-4 mr-1" />
            Account Secure
          </Badge>
        ) : (
          <Badge variant="destructive" className="self-start lg:self-auto">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {failCount} Failed Login{failCount > 1 ? "s" : ""} Detected
          </Badge>
        )}
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/*  Password Tab  */}
        <TabsContent value="password" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password regularly to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrent(v => !v)}
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* New */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min. 8 characters"
                    />
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNew(v => !v)}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${strength.barColor}`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        strength.score < 2 ? "text-red-500" :
                        strength.score < 4 ? "text-yellow-600" : "text-green-600"
                      }`}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password"
                    />
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirm(v => !v)}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Passwords do not match
                    </p>
                  )}
                  {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isSavingPw ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  className="w-full bg-[#5E1916] hover:bg-[#5E1916]/90"
                >
                  {isSavingPw ? "Updating" : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Security Info + Settings */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lastLogin && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Last Login</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lastLogin).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified on new sign-ins
                      </p>
                    </div>
                    <Switch
                      checked={loginNotifications}
                      onCheckedChange={handleSaveLoginNotif}
                      disabled={isSavingPrefs}
                      className="data-[state=checked]:bg-[#5E1916]"
                    />
                  </div>

                  <Separator />

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Use a strong password with uppercase, lowercase, numbers, and special characters.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* 2FA Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">TOTP Authentication</p>
                      <p className="text-xs text-muted-foreground">Coming soon — will support authenticator apps</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">Planned</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/*  Activity Tab  */}
        <TabsContent value="activity" className="space-y-6">
          {/* Stats + Sign-out-all */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Successful Logins</p>
                    <p className="text-2xl font-semibold text-green-600">{successCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed Attempts</p>
                    <p className={`text-2xl font-semibold ${failCount > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      {failCount}
                    </p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${failCount > 0 ? "text-red-200" : "text-muted"}`} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div>
                  <p className="text-sm font-medium">Sign Out All Devices</p>
                  <p className="text-xs text-muted-foreground">Invalidates all active sessions except this one</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutAllDevices}
                  disabled={isLoggingOut}
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isLoggingOut ? "Signing out" : "Sign Out Everywhere"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Login log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Login Activity
              </CardTitle>
              <CardDescription>
                Last {logs.length} login attempt{logs.length !== 1 ? "s" : ""} on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E1916]" />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No login activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => {
                    const device = parseDevice(log.userAgent);
                    return (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            log.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {log.success
                              ? <CheckCircle className="w-4 h-4" />
                              : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                              {device.browser} on {device.os}
                            </p>
                            {log.ipAddress && (
                              <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                          <Badge
                            variant={log.success ? "outline" : "destructive"}
                            className="text-xs mt-1"
                          >
                            {log.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}