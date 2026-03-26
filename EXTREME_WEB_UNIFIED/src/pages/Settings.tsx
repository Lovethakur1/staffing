import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  User, Bell, Shield, Globe, Database, Users,
  Save, AlertTriangle, Eye, EyeOff, Camera, Building2,
  DollarSign, Clock, MapPin, Lock, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import settingsService, {
  UserProfile, NotificationPrefs, SystemPrefs, CompanySettings,
} from "../services/settings.service";

interface SettingsProps {
  userRole: string;
  userId: string;
}

const TIMEZONES = [
  { value: "EST", label: "Eastern (EST)" },
  { value: "CST", label: "Central (CST)" },
  { value: "MST", label: "Mountain (MST)" },
  { value: "PST", label: "Pacific (PST)" },
  { value: "UTC", label: "UTC" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

export function Settings({ userRole }: SettingsProps) {
  const isAdmin = userRole === "admin" || userRole === "ADMIN";

  //  Profile state 
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", bio: "", hourlyRate: 0, skills: "", location: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  //  Password state 
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
  const [isSavingPw, setIsSavingPw] = useState(false);

  //  Preferences state 
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    email: true, sms: false, push: true, marketing: false,
    newShifts: true, scheduleChanges: true, paymentConfirmations: true,
    clientMessages: true, performanceReviews: false,
  });
  const [sysPrefs, setSysPrefs] = useState<SystemPrefs>({
    language: "en", timezone: "EST", currency: "USD",
    autoClockOut: true, geoLocation: true, twoFactor: false, darkMode: false,
  });
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  //  Company state (admin) 
  const [company, setCompany] = useState<CompanySettings>({
    name: "", address: "", city: "", state: "", zip: "", phone: "",
    email: "", website: "", minRate: 15, maxRate: 50, commission: 20,
    autoBilling: true, maintenanceWindow: "",
  });
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  //  Load profile 
  useEffect(() => {
    setIsLoadingProfile(true);
    settingsService.getProfile()
      .then(p => {
        setProfile(p);
        setProfileForm({
          name: p.name || "",
          phone: p.phone || "",
          bio: p.bio || "",
          hourlyRate: p.staffProfile?.hourlyRate ?? 0,
          skills: p.staffProfile?.skills?.join(", ") || "",
          location: p.staffProfile?.location || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setIsLoadingProfile(false));
  }, []);

  //  Load preferences 
  useEffect(() => {
    setIsLoadingPrefs(true);
    settingsService.getPreferences()
      .then(({ notificationPrefs, systemPrefs }) => {
        setNotifPrefs(prev => ({ ...prev, ...notificationPrefs }));
        setSysPrefs(prev => ({ ...prev, ...systemPrefs }));
      })
      .catch(() => toast.error("Failed to load preferences"))
      .finally(() => setIsLoadingPrefs(false));
  }, []);

  //  Load company (admin) 
  useEffect(() => {
    if (!isAdmin) return;
    setIsLoadingCompany(true);
    settingsService.getCompanySettings()
      .then(c => setCompany(c))
      .catch(() => toast.error("Failed to load company settings"))
      .finally(() => setIsLoadingCompany(false));
  }, [isAdmin]);

  //  Handlers 
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const skillsArray = profileForm.skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const updated = await settingsService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio,
        hourlyRate: profileForm.hourlyRate,
        skills: skillsArray,
        location: profileForm.location,
      });
      setProfile(prev => prev ? { ...prev, ...updated } : prev);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPw !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsSavingPw(true);
    try {
      await settingsService.changePassword(passwords.current, passwords.newPw);
      setPasswords({ current: "", newPw: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to change password");
    } finally {
      setIsSavingPw(false);
    }
  };

  const handleSaveNotifPrefs = async () => {
    setIsSavingPrefs(true);
    try {
      await settingsService.updateNotificationPrefs(notifPrefs);
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSaveSysPrefs = async () => {
    setIsSavingPrefs(true);
    try {
      await settingsService.updateSystemPrefs(sysPrefs);
      toast.success("System preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    try {
      const updated = await settingsService.updateCompanySettings(company);
      setCompany(updated);
      toast.success("Company settings saved");
    } catch {
      toast.error("Failed to save company settings");
    } finally {
      setIsSavingCompany(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  //  Render 
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="responsive-text-3xl font-bold tracking-tight">Settings</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {isAdmin ? "Admin" : userRole}
          </Badge>
        </div>
        <p className="responsive-text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            System
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        {/*  Profile Tab  */}
        <TabsContent value="profile">
          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E1916]" />
                <span className="text-sm">Loading profile</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your display name, contact details, and bio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      {profile?.avatar && <AvatarImage src={profile.avatar} />}
                      <AvatarFallback className="text-lg bg-[#5E1916] text-white">
                        {profile ? getInitials(profile.name) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={() => toast.info("Avatar upload coming soon")}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Camera className="h-3 w-3 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG. 1 MB max.</p>
                    </div>
                    <div className="ml-auto text-right text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{profile?.email}</p>
                      <p>{profile?.role?.replace("_", " ")}</p>
                      {profile?.lastLogin && (
                        <p className="text-xs">Last login: {new Date(profile.lastLogin).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+1-555-0100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell us a bit about yourself"
                    />
                  </div>

                  {(userRole === "staff" || userRole === "STAFF") && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={profileForm.location}
                            onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                            placeholder="City, State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            Hourly Rate ($)
                          </Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            min={0}
                            value={profileForm.hourlyRate}
                            onChange={e => setProfileForm(p => ({ ...p, hourlyRate: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          value={profileForm.skills}
                          onChange={e => setProfileForm(p => ({ ...p, skills: e.target.value }))}
                          placeholder="Bartending, Event Setup, Customer Service"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSavingProfile ? "Saving" : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password and two-factor authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        value={passwords.current}
                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <Button
                        variant="ghost" size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowCurrent(v => !v)}
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNew ? "text" : "password"}
                          value={passwords.newPw}
                          onChange={e => setPasswords(p => ({ ...p, newPw: e.target.value }))}
                          placeholder="Min. 8 characters"
                        />
                        <Button
                          variant="ghost" size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowNew(v => !v)}
                        >
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showNew ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  {passwords.newPw && passwords.confirm && passwords.newPw !== passwords.confirm && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Passwords do not match
                    </p>
                  )}
                  {passwords.newPw && passwords.confirm && passwords.newPw === passwords.confirm && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </p>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch
                      checked={sysPrefs.twoFactor}
                      onCheckedChange={checked =>
                        setSysPrefs(p => ({ ...p, twoFactor: checked }))
                      }
                      className="data-[state=checked]:bg-[#5E1916]"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isSavingPw || !passwords.current || !passwords.newPw || passwords.newPw !== passwords.confirm}
                    variant="outline"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isSavingPw ? "Updating" : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/*  Notifications Tab  */}
        <TabsContent value="notifications">
          {isLoadingPrefs ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E1916]" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Channels */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Channels</h3>
                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                    { key: "sms", label: "SMS Notifications", desc: "Receive notifications via text message" },
                    { key: "push", label: "Push Notifications", desc: "Receive push notifications in your browser" },
                    { key: "marketing", label: "Marketing Communications", desc: "Updates about new features and promotions" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={notifPrefs[key as keyof NotificationPrefs] as boolean}
                        onCheckedChange={checked =>
                          setNotifPrefs(p => ({ ...p, [key]: checked }))
                        }
                        className="data-[state=checked]:bg-[#5E1916]"
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Event types */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notification Types</h3>
                  {[
                    { key: "newShifts", label: "New shift assignments" },
                    { key: "scheduleChanges", label: "Schedule changes" },
                    { key: "paymentConfirmations", label: "Payment confirmations" },
                    { key: "clientMessages", label: "Client messages" },
                    { key: "performanceReviews", label: "Performance reviews" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={notifPrefs[key as keyof NotificationPrefs] as boolean}
                        onCheckedChange={checked =>
                          setNotifPrefs(p => ({ ...p, [key]: checked }))
                        }
                        className="data-[state=checked]:bg-[#5E1916]"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSaveNotifPrefs}
                  disabled={isSavingPrefs}
                  className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingPrefs ? "Saving" : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/*  System Tab  */}
        <TabsContent value="system">
          {isLoadingPrefs ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E1916]" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Configure language, timezone, and operational settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={sysPrefs.language} onValueChange={v => setSysPrefs(p => ({ ...p, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={sysPrefs.timezone} onValueChange={v => setSysPrefs(p => ({ ...p, timezone: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={sysPrefs.currency} onValueChange={v => setSysPrefs(p => ({ ...p, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR ()</SelectItem>
                        <SelectItem value="GBP">GBP ()</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {[
                  { key: "autoClockOut", icon: Clock, label: "Auto Clock-Out", desc: "Automatically clock out after shift ends" },
                  { key: "geoLocation", icon: MapPin, label: "Location Tracking", desc: "Enable GPS tracking for attendance verification" },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <Label>{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={sysPrefs[key as keyof SystemPrefs] as boolean}
                      onCheckedChange={checked => setSysPrefs(p => ({ ...p, [key]: checked }))}
                      className="data-[state=checked]:bg-[#5E1916]"
                    />
                  </div>
                ))}

                <Button
                  onClick={handleSaveSysPrefs}
                  disabled={isSavingPrefs}
                  className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingPrefs ? "Saving" : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/*  Admin Tab  */}
        {isAdmin && (
          <TabsContent value="admin">
            {isLoadingCompany ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E1916]" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Company Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Settings
                    </CardTitle>
                    <CardDescription>Update your company profile and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input value={company.city} onChange={e => setCompany(c => ({ ...c, city: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input value={company.state} onChange={e => setCompany(c => ({ ...c, state: e.target.value }))} placeholder="NY" />
                      </div>
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input value={company.zip} onChange={e => setCompany(c => ({ ...c, zip: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} placeholder="https://extremestaffing.com" />
                    </div>
                  </CardContent>
                </Card>

                {/* Billing & Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Billing & Rates
                    </CardTitle>
                    <CardDescription>Configure staffing rates, commissions, and billing automation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Min Hourly Rate ($)</Label>
                        <Input type="number" min={0} value={company.minRate} onChange={e => setCompany(c => ({ ...c, minRate: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Hourly Rate ($)</Label>
                        <Input type="number" min={0} value={company.maxRate} onChange={e => setCompany(c => ({ ...c, maxRate: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Commission (%)</Label>
                        <Input type="number" min={0} max={100} value={company.commission} onChange={e => setCompany(c => ({ ...c, commission: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Billing</Label>
                        <p className="text-sm text-muted-foreground">Automatically generate invoices after events complete</p>
                      </div>
                      <Switch
                        checked={company.autoBilling}
                        onCheckedChange={checked => setCompany(c => ({ ...c, autoBilling: checked }))}
                        className="data-[state=checked]:bg-[#5E1916]"
                      />
                    </div>

                    <Button
                      onClick={handleSaveCompany}
                      disabled={isSavingCompany}
                      className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingCompany ? "Saving" : "Save Company Settings"}
                    </Button>
                  </CardContent>
                </Card>

                {/* System Administration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Administration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Backup Data
                      </Button>
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        User Management
                      </Button>
                    </div>

                    {company.maintenanceWindow && (
                      <div className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-orange-800 dark:text-orange-200">System Maintenance</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                              Scheduled window: {company.maintenanceWindow}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}