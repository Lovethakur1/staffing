import { useState, useEffect } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService, SupportTicket } from "../services/support.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  Video,
  FileText,
  Headphones,
  Send,
  ExternalLink,
  Star,
  ThumbsUp,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

interface HelpSupportProps {
  userRole: string;
  userId: string;
}

export function HelpSupport({ userRole }: HelpSupportProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportCategory, setSupportCategory] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [activeTab, setActiveTab] = useState("faq");

  // Ticket states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      if (userRole === 'admin' || userRole === 'sub-admin') {
        const data = await supportService.getAllTickets();
        setTickets(data);
      } else {
        const data = await supportService.getMyTickets();
        setTickets(data);
      }
    } catch (err) {
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets' || activeTab === 'manage') {
      fetchTickets();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userRole]);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create my first event?",
          answer: "To create your first event, navigate to the Events page and click the 'Create Event' button. Fill in the event details including date, time, venue, and staff requirements. Once submitted, the event will be added to your schedule."
        },
        {
          question: "How do I add new staff members?",
          answer: "Go to the Workforce page and click 'Add New Staff'. Enter the staff member's details, qualifications, and role. You can also import multiple staff members using our CSV template."
        },
        {
          question: "How do I assign staff to events?",
          answer: "Open the event details page and click 'Assign Staff'. You can search for available staff members by role, skills, and availability. Select the staff and click 'Assign' to confirm."
        }
      ]
    },
    {
      category: "Scheduling & Timesheets",
      questions: [
        {
          question: "How does the shift marketplace work?",
          answer: "The shift marketplace allows staff to trade, pick up, or drop shifts. Staff can post available shifts, and other qualified staff members can request to pick them up. Managers approve all shift changes."
        },
        {
          question: "How do I submit my timesheet?",
          answer: "Navigate to the Timesheets page, select the pay period, and review your hours. You can add manual entries or edit auto-tracked hours. Click 'Submit Timesheet' when ready."
        },
        {
          question: "What is the 5-hour minimum pay rule?",
          answer: "Our system automatically enforces the 5-hour minimum pay rule. If a shift is less than 5 hours, the payroll calculation will still pay for 5 hours as per company policy."
        }
      ]
    },
    {
      category: "Payroll & Payments",
      questions: [
        {
          question: "When do I get paid?",
          answer: "Payroll is processed bi-weekly on Fridays. Direct deposits are typically available within 1-2 business days. You can view your payment schedule in the Payroll section."
        },
        {
          question: "How do I view my pay stubs?",
          answer: "Go to the Payroll page and click on 'Pay History'. You can view and download all your past pay stubs as PDF documents."
        },
        {
          question: "How do I update my banking information?",
          answer: "Navigate to Profile Settings > Payment Information. You can update your bank account details for direct deposit. Changes require verification for security."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "The app is running slow, what should I do?",
          answer: "Try clearing your browser cache and cookies. If the issue persists, try using a different browser or contact support for further assistance."
        },
        {
          question: "I forgot my password, how do I reset it?",
          answer: "Click 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          question: "How do I enable notifications?",
          answer: "Go to Settings > Notifications. You can customize which notifications you receive via email, SMS, or in-app alerts. Make sure to allow notifications in your browser settings."
        }
      ]
    }
  ];

  const supportChannels = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "24/7",
      responseTime: "< 5 minutes",
      action: "Start Chat"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      availability: "Mon-Fri, 9AM-6PM PST",
      responseTime: "Immediate",
      action: "Call Now",
      phone: "+1 (800) 555-0123"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "24/7",
      responseTime: "< 24 hours",
      action: "Send Email"
    },
    {
      icon: Headphones,
      title: "Schedule a Call",
      description: "Book a time for detailed support",
      availability: "Mon-Fri, 9AM-6PM PST",
      responseTime: "Scheduled",
      action: "Book Call"
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with Extreme Staffing",
      type: "video",
      duration: "12:30",
      thumbnail: "🎬",
      views: 1234
    },
    {
      title: "Managing Events & Bookings",
      type: "video",
      duration: "18:45",
      thumbnail: "🎬",
      views: 2156
    },
    {
      title: "Staff Scheduling Best Practices",
      type: "article",
      readTime: "8 min read",
      thumbnail: "📖",
      views: 3421
    },
    {
      title: "Payroll Processing Guide",
      type: "pdf",
      pages: "24 pages",
      thumbnail: "📄",
      views: 1876
    },
    {
      title: "Using the Mobile App",
      type: "video",
      duration: "10:15",
      thumbnail: "🎬",
      views: 2945
    },
    {
      title: "Advanced Reporting & Analytics",
      type: "article",
      readTime: "12 min read",
      thumbnail: "📖",
      views: 1543
    }
  ];

  const handleSubmitTicket = async () => {
    if (!supportSubject.trim() || !supportCategory.trim() || !supportMessage.trim()) {
      toast.error("Please fill in subject, category, and message");
      return;
    }

    try {
      await supportService.submitTicket({
        subject: supportSubject,
        category: supportCategory,
        message: supportMessage
      });
      toast.success("Support ticket submitted successfully! We'll get back to you soon.");
      setSupportSubject("");
      setSupportCategory("");
      setSupportMessage("");
    } catch (err) {
      toast.error("Failed to submit ticket.");
    }
  };

  const handleResolveTicket = async (id: string) => {
    if (!resolutionNote.trim()) {
      toast.error("Please provide a resolution note.");
      return;
    }
    
    try {
      await supportService.resolveTicket(id, resolutionNote);
      toast.success("Ticket resolved successfully.");
      setResolutionNote("");
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      toast.error("Failed to resolve ticket.");
    }
  };

  const handleStartChat = async (id: string) => {
    try {
      const { conversationId } = await supportService.startChat(id);
      setCurrentPage('messages', { conversationId });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to start chat.");
    }
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[#5E1916]">Help & Support</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {userRole === 'admin' ? 'Admin' : userRole === 'sub-admin' ? 'Sub-Admin' : userRole === 'scheduler' ? 'Scheduler' : userRole === 'manager' ? 'Manager' : userRole === 'client' ? 'Client' : 'Staff'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Get help, find answers, and contact support
          </p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Start Live Chat
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold text-[#5E1916]">&lt; 5 min</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Support Available</p>
                <p className="text-2xl font-bold text-[#5E1916]">24/7</p>
              </div>
              <Headphones className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-[#5E1916]">98.5%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="faq" className="py-2.5">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="contact" className="py-2.5">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <Book className="h-4 w-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="status">
            <AlertCircle className="h-4 w-4 mr-2" />
            System Status
          </TabsTrigger>
          {(userRole === 'admin' || userRole === 'sub-admin') ? (
            <TabsTrigger value="manage">
              <FileText className="h-4 w-4 mr-2" />
              Manage Tickets
            </TabsTrigger>
          ) : (
            <TabsTrigger value="tickets">
              <FileText className="h-4 w-4 mr-2" />
              My Tickets
            </TabsTrigger>
          )}
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No FAQs found matching your search</p>
                </div>
              ) : (
                filteredFaqs.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-semibold mb-3">{category.category}</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIdx) => (
                        <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Support Tab */}
        <TabsContent value="contact" className="space-y-4">
          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportChannels.map((channel, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <channel.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{channel.title}</CardTitle>
                      <CardDescription>{channel.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Availability:</span>
                    <span className="font-medium">{channel.availability}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-medium text-green-600">{channel.responseTime}</span>
                  </div>
                  {channel.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{channel.phone}</span>
                    </div>
                  )}
                  <Button className="w-full">
                    {channel.action}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Describe your issue and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input 
                  placeholder="Brief description of your issue" 
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Account Help">Account Help</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Provide as much detail as possible..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments (Optional)</label>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
              <Button className="w-full" onClick={handleSubmitTicket}>
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials & Guides</CardTitle>
              <CardDescription>Learn how to use the platform effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorials.map((tutorial, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">{tutorial.thumbnail}</div>
                        <Badge variant="outline" className="mb-2">
                          {tutorial.type.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-2">{tutorial.title}</h4>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {tutorial.duration || tutorial.readTime || tutorial.pages}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {tutorial.views}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                All Systems Operational
              </CardTitle>
              <CardDescription>Last updated: 2 minutes ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Web Application", status: "operational" },
                { name: "Mobile App", status: "operational" },
                { name: "API Services", status: "operational" },
                { name: "Database", status: "operational" },
                { name: "Payment Processing", status: "operational" },
                { name: "Email Notifications", status: "operational" },
                { name: "SMS Notifications", status: "operational" }
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{service.name}</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No scheduled maintenance at this time</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets Tab (Non-Admin) */}
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>View the status of your submitted tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading tickets...</p>
              ) : tickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">You have no open support tickets.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div key={t.id} className="border p-4 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{t.subject}</h4>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleStartChat(t.id)}>
                            Message Support
                          </Button>
                          <Badge variant={t.status === 'RESOLVED' ? 'outline' : 'default'} className={t.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : ''}>
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()} | {t.category}</span>
                      <p className="text-sm mt-1">{t.message}</p>
                      {t.status === 'RESOLVED' && t.resolutionNotes && (
                         <div className="mt-3 bg-muted p-3 border-l-4 border-green-500 rounded text-sm text-foreground">
                            <strong>Resolution Note:</strong> {t.resolutionNotes}
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tickets Tab (Admin Only) */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Support Tickets</CardTitle>
              <CardDescription>Review and resolve support requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading tickets...</p>
              ) : tickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No support tickets at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div key={t.id} className="border p-4 rounded-lg flex flex-col gap-3 group relative transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{t.subject}</h4>
                            <Badge variant={t.status === 'RESOLVED' ? 'outline' : 'default'} className={t.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : ''}>
                              {t.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Submitted by {t.user?.name} ({t.user?.role}) on {new Date(t.createdAt).toLocaleString()} | Category: {t.category}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleStartChat(t.id)}>
                            Message User
                          </Button>
                          {t.status !== 'RESOLVED' && (
                            <Button size="sm" onClick={() => setSelectedTicket(t === selectedTicket ? null : t)}>
                              {selectedTicket?.id === t.id ? 'Cancel' : 'Resolve'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-md text-sm mt-1">
                        {t.message}
                      </div>
                      
                      {selectedTicket?.id === t.id && (
                         <div className="mt-2 space-y-3 p-4 bg-background border rounded-md">
                           <h5 className="font-semibold text-sm">Action: Resolve Ticket</h5>
                           <Textarea 
                             placeholder="Add resolution notes for the user..." 
                             value={resolutionNote}
                             onChange={(e) => setResolutionNote(e.target.value)}
                           />
                           <Button onClick={() => handleResolveTicket(t.id)}>Submit Resolution</Button>
                         </div>
                      )}

                      {t.status === 'RESOLVED' && t.resolutionNotes && (
                         <div className="mt-1 bg-green-50 p-3 border-l-4 border-green-500 rounded text-sm text-green-900">
                            <strong>Resolution by {t.resolvedBy?.name || 'Admin'}:</strong> {t.resolutionNotes}
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
