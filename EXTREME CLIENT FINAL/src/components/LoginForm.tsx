import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User } from "../data/mockData";
import { XtremeLogo } from "./XtremeLogo";
import { ArrowRight, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<string>("new");
  
  // New User Fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [selectedService, setSelectedService] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Existing User Fields
  const [existingName, setExistingName] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [existingPassword, setExistingPassword] = useState("");
  const [showExistingPassword, setShowExistingPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ensure light theme on login page
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create new user (demo purposes - always logs in as client-1)
    const user: User = {
      id: 'client-1',
      name: newName,
      email: newEmail,
      phone: `${countryCode}${newPhone}`,
      role: 'client',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    onLogin(user);
    setIsLoading(false);
  };

  const handleExistingUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Log in existing user (demo purposes - always logs in as client-1)
    const user: User = {
      id: 'client-1',
      name: existingName || 'Sarah Johnson',
      email: existingEmail || 'sarah@eventcorp.com',
      phone: '+1-555-0123',
      role: 'client',
      createdAt: '2024-01-15'
    };
    
    onLogin(user);
    setIsLoading(false);
  };

  const services = [
    { value: "corporate-events", label: "Corporate Events" },
    { value: "weddings", label: "Weddings & Private Events" },
    { value: "festivals", label: "Festivals & Concerts" },
    { value: "trade-shows", label: "Trade Shows & Exhibitions" },
    { value: "sports-events", label: "Sports Events" },
    { value: "hospitality", label: "Hospitality Services" },
    { value: "promotional", label: "Promotional Staffing" },
    { value: "other", label: "Other Event Services" }
  ];

  const countryCodes = [
    { code: "+1", country: "US/CA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "AU", flag: "🇦🇺" },
    { code: "+91", country: "IN", flag: "🇮🇳" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section - Compact */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <XtremeLogo size="md" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 mb-1">
            Welcome to Extreme Staffing
          </h1>
          <p className="text-sm text-slate-600">
            Professional event staffing made simple
          </p>
        </div>

        {/* Authentication Card with Tabs */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="space-y-1 px-5 py-4 pb-2">
            <CardTitle className="text-lg text-center text-slate-800">Get Started</CardTitle>
            <p className="text-xs text-center text-slate-600">Sign up or log in to continue</p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="new" className="text-sm">New User</TabsTrigger>
                <TabsTrigger value="existing" className="text-sm">Existing User</TabsTrigger>
              </TabsList>

              {/* New User Tab */}
              <TabsContent value="new" className="space-y-3 mt-0">
                <form onSubmit={handleNewUserSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-name" className="text-xs font-medium text-slate-700">Full Name</Label>
                    <Input
                      id="new-name"
                      type="text"
                      placeholder="John Doe"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus:border-sangria focus:ring-sangria/20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-email" className="text-xs font-medium text-slate-700">Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus:border-sangria focus:ring-sangria/20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-phone" className="text-xs font-medium text-slate-700">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="h-9 w-[90px] text-sm border-slate-200 focus:border-sangria focus:ring-sangria/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((item) => (
                            <SelectItem key={item.code} value={item.code} className="text-sm">
                              <span className="flex items-center gap-1.5">
                                <span>{item.flag}</span>
                                <span>{item.code}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="new-phone"
                        type="tel"
                        placeholder="555-123-4567"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="h-9 text-sm flex-1 border-slate-200 focus:border-sangria focus:ring-sangria/20"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="service" className="text-xs font-medium text-slate-700">Service Needed</Label>
                    <Select value={selectedService} onValueChange={setSelectedService} required>
                      <SelectTrigger className="h-9 text-sm border-slate-200 focus:border-sangria focus:ring-sangria/20">
                        <SelectValue placeholder="Select the type of event" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.value} value={service.value} className="text-sm">
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-xs font-medium text-slate-700">Set Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-9 text-sm pr-9 border-slate-200 focus:border-sangria focus:ring-sangria/20"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-medium text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-9 text-sm pr-9 border-slate-200 focus:border-sangria focus:ring-sangria/20"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-9 bg-sangria hover:bg-merlot text-white text-sm mt-4" 
                    disabled={!newName || !newEmail || !newPhone || !selectedService || !newPassword || !confirmPassword || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 mr-2" />
                        Create Account
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Existing User Tab */}
              <TabsContent value="existing" className="space-y-3 mt-0">
                <form onSubmit={handleExistingUserSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="existing-name" className="text-xs font-medium text-slate-700">Full Name</Label>
                    <Input
                      id="existing-name"
                      type="text"
                      placeholder="John Doe"
                      value={existingName}
                      onChange={(e) => setExistingName(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus:border-sangria focus:ring-sangria/20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="existing-email" className="text-xs font-medium text-slate-700">Email Address</Label>
                    <Input
                      id="existing-email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={existingEmail}
                      onChange={(e) => setExistingEmail(e.target.value)}
                      className="h-9 text-sm border-slate-200 focus:border-sangria focus:ring-sangria/20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="existing-password" className="text-xs font-medium text-slate-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="existing-password"
                        type={showExistingPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={existingPassword}
                        onChange={(e) => setExistingPassword(e.target.value)}
                        className="h-9 text-sm pr-9 border-slate-200 focus:border-sangria focus:ring-sangria/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowExistingPassword(!showExistingPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showExistingPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button type="button" className="text-xs text-sangria hover:text-merlot">
                      Forgot password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-9 bg-sangria hover:bg-merlot text-white text-sm mt-4" 
                    disabled={!existingName || !existingEmail || !existingPassword || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5 mr-2" />
                        Sign In
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Info Box - Compact */}
            <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer - Compact */}
        <footer className="mt-4 text-center text-xs text-slate-500">
          <p>© 2025 Extreme Staffing. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
