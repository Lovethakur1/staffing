import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import type { User } from "../data/mockData";
import api from "../services/api";
import { XtremeLogo } from "./XtremeLogo";
import { ArrowRight, Lock, Shield, AlertCircle, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ensure light theme on login page
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      // Store JWT token for subsequent requests
      localStorage.setItem('token', token);

      // Map backend role enum (e.g. 'ADMIN') to frontend role string (e.g. 'admin')
      const mappedUser = {
        ...user,
        role: user.role.toLowerCase()
      };

      onLogin(mappedUser);
      toast.success(`Welcome back, ${user.name}`);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };



  const fillDemoCredentials = (role: string) => {
    // These reflect realistic seed data; user can modify email if their seeds differ
    let defaultEmail = "";
    if (role === 'admin') defaultEmail = "admin@extremestaffing.com";
    if (role === 'manager') defaultEmail = "manager@extremestaffing.com";
    if (role === 'staff') defaultEmail = "staff@extremestaffing.com";
    if (role === 'client') defaultEmail = "client@company.com";
    if (role === 'scheduler') defaultEmail = "scheduler@extremestaffing.com";

    setEmail(defaultEmail);
    setPassword("password");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 md:p-6">
      {/* Logo Section */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center mb-4">
          <XtremeLogo size="lg" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Staff Management Portal
        </h1>
        <p className="text-slate-500">
          Secure access for Staff, Managers, and Administrators
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1 px-6 pt-6 pb-4">
          <CardTitle className="text-xl text-center text-slate-800">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 border-slate-200 focus:border-sangria focus:ring-sangria/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <a href="#" className="text-xs text-sangria hover:text-merlot hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11 border-slate-200 focus:border-sangria focus:ring-sangria/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-slate-300 text-sangria focus:ring-sangria/20"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-sangria hover:bg-merlot text-white text-base font-medium shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Login for Demo */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-muted-foreground mb-4 uppercase tracking-wider font-semibold">
              Quick Login (Demo Access)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => fillDemoCredentials('admin')}>
                Login as Admin
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => fillDemoCredentials('manager')}>
                Login as Manager
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => fillDemoCredentials('staff')}>
                Login as Staff
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => fillDemoCredentials('scheduler')}>
                Login as Scheduler
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => fillDemoCredentials('client')}>
                Login as Client
              </Button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Pre-fills credentials for testing. Password is 'password'.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-3 h-3" />
          <span>256-bit SSL Encrypted Connection</span>
        </div>
        <p>© 2026 Extreme Staffing. All rights reserved.</p>
      </footer>
    </div>
  );
}
