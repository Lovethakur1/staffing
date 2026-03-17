import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BookOpen,
  Camera,
  Bell,
  FileText,
  MessageSquare,
  Settings,
  Download,
} from "lucide-react";

interface ResourcesProps {
  userRole: string;
  userId: string;
}

export function Resources({ userRole, userId }: ResourcesProps) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">Resources</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {userRole === 'manager' ? 'Manager' : 'Staff'}
          </Badge>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Training materials, tutorials, and helpful links
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="w-5 h-5" />
              Training Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Bartending Techniques
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Fine Dining Service
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Event Setup Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Customer Service Tips
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Camera className="w-5 h-5" />
              Video Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-2" />
                Professional Bartending
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-2" />
                Wine Service Basics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-2" />
                Event Etiquette
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Camera className="w-4 h-4 mr-2" />
                Emergency Procedures
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="w-5 h-5" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                App Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Mobile App
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Policy Handbook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
