import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Globe,
  CheckCircle,
  TrendingUp,
  Send,
  Search,
  ArrowLeft,
  Building2,
  ChevronRight,
  Mail,
  Phone,
  User,
  ExternalLink,
  X,
} from "lucide-react";
import api from "../services/api";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salaryRange: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  postedDate: string;
}

export function PublicCareers() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyingTo, setApplyingTo] = useState<JobPosting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/public/jobs");
      setJobs(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      console.error("Failed to load job postings");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "full-time": "Full-Time",
      "part-time": "Part-Time",
      contractor: "Contractor",
      seasonal: "Seasonal",
    };
    return labels[type] || type;
  };

  const handleApply = (job: JobPosting) => {
    setApplyingTo(job);
    setIsApplyOpen(true);
    setSubmitted(false);
  };

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applyingTo) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      await api.post(`/public/jobs/${applyingTo.id}/apply`, {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") || undefined,
        coverLetter: formData.get("coverLetter"),
        resumeUrl: formData.get("resumeUrl") || undefined,
        notes: formData.get("notes") || undefined,
      });
      setSubmitted(true);
    } catch {
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#5E1916] to-[#8B2E2A] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8" />
            <span className="text-lg font-medium opacity-90">Extreme Staffing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Build your career in the exciting world of event staffing. We're looking for passionate people to join our growing team.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search positions, departments, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white/95 border-0 text-slate-900 placeholder:text-slate-400 text-base rounded-full shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Why Work With Us */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#5E1916]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-[#5E1916]" />
              </div>
              <h3 className="font-semibold mb-1">Career Growth</h3>
              <p className="text-sm text-muted-foreground">
                Clear advancement paths and professional development
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#5E1916]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-[#5E1916]" />
              </div>
              <h3 className="font-semibold mb-1">Competitive Pay</h3>
              <p className="text-sm text-muted-foreground">
                Industry-leading wages with performance bonuses
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#5E1916]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-[#5E1916]" />
              </div>
              <h3 className="font-semibold mb-1">Great Culture</h3>
              <p className="text-sm text-muted-foreground">
                Supportive team environment and work-life balance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Open Positions
            {filteredJobs.length > 0 && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({filteredJobs.length} {filteredJobs.length === 1 ? "opening" : "openings"})
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#5E1916] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No open positions right now</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No positions match your search. Try different keywords."
                  : "Check back soon — we're always growing!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#5E1916] transition-colors">
                          {job.title}
                        </h3>
                        <Badge variant="outline" className="bg-[#5E1916]/5 text-[#5E1916] border-[#5E1916]/20">
                          {getTypeLabel(job.type)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {job.salaryRange}
                        </span>
                        {job.postedDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Posted {formatDate(job.postedDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        className="bg-[#5E1916] hover:bg-[#8B2E2A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(job);
                        }}
                      >
                        Apply Now
                        <Send className="h-4 w-4 ml-2" />
                      </Button>
                      <ChevronRight
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          selectedJob?.id === job.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedJob?.id === job.id && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-slate-900">About This Role</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {job.requirements?.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-slate-900">Requirements</h4>
                            <ul className="space-y-1.5">
                              {job.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {job.responsibilities?.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-slate-900">Responsibilities</h4>
                            <ul className="space-y-1.5">
                              {job.responsibilities.map((resp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {job.benefits?.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-slate-900">Benefits</h4>
                            <ul className="space-y-1.5">
                              {job.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle className="h-4 w-4 text-[#5E1916] mt-0.5 shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          className="bg-[#5E1916] hover:bg-[#8B2E2A]"
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(job);
                          }}
                        >
                          Apply for this Position
                          <Send className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Building2 className="h-8 w-8 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-semibold mb-2">Extreme Staffing</h3>
          <p className="text-sm text-slate-400 mb-4">
            Premier event staffing solutions
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "";
                window.location.reload();
              }}
              className="hover:text-white transition-colors"
            >
              Staff Login
            </a>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
              <p className="text-muted-foreground">
                Thank you for applying for <strong>{applyingTo?.title}</strong>. Our team will review your application and get back to you soon.
              </p>
              <Button onClick={() => setIsApplyOpen(false)} className="bg-[#5E1916] hover:bg-[#8B2E2A]">
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Apply for {applyingTo?.title}</DialogTitle>
                <DialogDescription>
                  {applyingTo?.department} &middot; {applyingTo?.location} &middot;{" "}
                  {getTypeLabel(applyingTo?.type || "")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitApplication} className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Full Name *
                    </Label>
                    <Input name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Email *
                    </Label>
                    <Input name="email" type="email" placeholder="john@example.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </Label>
                  <Input name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="space-y-2">
                  <Label>Cover Letter *</Label>
                  <Textarea
                    name="coverLetter"
                    placeholder="Tell us why you're a great fit for this role, your relevant experience, and what excites you about this position..."
                    className="min-h-[140px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Resume URL
                  </Label>
                  <Input
                    name="resumeUrl"
                    type="url"
                    placeholder="https://drive.google.com/your-resume.pdf"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a link to your resume (Google Drive, Dropbox, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    name="notes"
                    placeholder="Availability, certifications, referrals, or anything else..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#5E1916] hover:bg-[#8B2E2A]">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
