import { Monitor, Smartphone, ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { XtremeLogo } from "../XtremeLogo";

export function DesktopOnlyRestriction({ role, onLogout }: { role: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <XtremeLogo size="lg" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Desktop Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Monitor className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-base text-gray-600">
              The <span className="font-semibold capitalize">{role} Portal</span> is optimized for desktop use only.
            </p>
            <p className="text-sm text-gray-500">
              Our advanced features like the Scheduler, Analytics, and Admin Controls require a larger screen for the best experience.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 text-left">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-semibold block mb-1">Mobile Access Restricted</span>
              Please log in from a desktop to access Admin tools, or use a Manager/Staff account to view the mobile app.
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={onLogout}
          >
            Log Out & Return to Login
          </Button>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-gray-400">
            Figma Make Event Management System
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
