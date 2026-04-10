import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
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
  CheckCircle,
  TrendingUp,
  Send,
  Search,
  Building2,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  User,
  Upload,
  FileText,
  X,
  Menu,
  Home,
  Info,
  PhoneCall,
  Star,
  Zap,
  Shield,
  ArrowRight,
  Heart,
  Award,
  Globe,
  Sparkles,
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchJobs();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const getTypeBadgeStyle = (type: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      "full-time": { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" },
      "part-time": { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
      contractor: { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" },
      seasonal: { background: "#faf5ff", color: "#7c3aed", border: "1px solid #e9d5ff" },
    };
    return styles[type] || { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
  };

  const handleApply = (job: JobPosting) => {
    setApplyingTo(job);
    setIsApplyOpen(true);
    setSubmitted(false);
    setResumeFile(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applyingTo) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      let resumeUrl = (formData.get("resumeUrl") as string) || undefined;
      if (resumeFile) {
        setIsUploadingResume(true);
        const uploadData = new FormData();
        uploadData.append("file", resumeFile);
        const uploadRes = await api.post("/public/upload-resume", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        resumeUrl = uploadRes.data.url;
        setIsUploadingResume(false);
      }

      await api.post(`/public/jobs/${applyingTo.id}/apply`, {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") || undefined,
        coverLetter: formData.get("coverLetter"),
        resumeUrl,
        notes: formData.get("notes") || undefined,
      });
      setSubmitted(true);
    } catch {
      setIsUploadingResume(false);
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

  const smoothScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      {/* ======= INLINE STYLES ======= */}
      <style>{`
        @keyframes careers-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes careers-float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
        }
        @keyframes careers-pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes careers-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes careers-bounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-8px) translateX(-50%); }
        }
        .careers-float { animation: careers-float 6s ease-in-out infinite; }
        .careers-float2 { animation: careers-float2 8s ease-in-out infinite; }
        .careers-pulse-glow { animation: careers-pulse-glow 4s ease-in-out infinite; }
        .careers-slide-up { animation: careers-slide-up 0.6s ease-out both; }
        .careers-bounce { animation: careers-bounce 2s ease-in-out infinite; }
        .careers-job-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .careers-job-card:hover { transform: translateY(-2px); }
        .careers-hero-dots {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .careers-gradient-text {
          background: linear-gradient(135deg, #818cf8, #a78bfa, #f0abfc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ======= NAVBAR ======= */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={
          scrolled
            ? { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderBottom: "1px solid #f1f5f9" }
            : { background: "transparent" }
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" style={{ height: 64 }}>
            {/* Logo */}
            <a href="#/careers" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={
                  scrolled
                    ? { background: "linear-gradient(135deg, #1e293b, #0f172a)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                    : { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }
                }
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span
                className="font-bold text-lg tracking-tight transition-colors duration-300"
                style={{ color: scrolled ? "#0f172a" : "#fff" }}
              >
                Extreme Staffing
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Home", icon: Home, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                { label: "About", icon: Info, action: () => smoothScroll("about") },
                { label: "Jobs", icon: Briefcase, action: () => smoothScroll("jobs") },
                { label: "Contact", icon: PhoneCall, action: () => smoothScroll("contact") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                  style={{ color: scrolled ? "#475569" : "rgba(255,255,255,0.8)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = scrolled ? "#f1f5f9" : "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = scrolled ? "#0f172a" : "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = scrolled ? "#475569" : "rgba(255,255,255,0.8)";
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: scrolled ? "#334155" : "#fff" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className="md:hidden overflow-hidden transition-all duration-300"
            style={{ maxHeight: mobileMenuOpen ? 240 : 0 }}
          >
            <div className="space-y-1 pt-2 pb-4" style={{ borderTop: `1px solid ${scrolled ? "#f1f5f9" : "rgba(255,255,255,0.1)"}` }}>
              {[
                { label: "Home", icon: Home, action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); } },
                { label: "About", icon: Info, action: () => smoothScroll("about") },
                { label: "Jobs", icon: Briefcase, action: () => smoothScroll("jobs") },
                { label: "Contact", icon: PhoneCall, action: () => smoothScroll("contact") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5"
                  style={{ color: scrolled ? "#475569" : "rgba(255,255,255,0.8)" }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ======= HERO SECTION ======= */}
      <div
        className="relative flex items-center overflow-hidden"
        style={{
          minHeight: 620,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%)",
        }}
      >
        {/* Dot pattern */}
        <div className="absolute inset-0 careers-hero-dots" />

        {/* Glow orbs */}
        <div
          className="absolute careers-pulse-glow"
          style={{ top: 60, left: 40, width: 280, height: 280, borderRadius: "50%", background: "rgba(99,102,241,0.18)", filter: "blur(60px)" }}
        />
        <div
          className="absolute careers-pulse-glow"
          style={{ bottom: 40, right: 40, width: 350, height: 350, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(70px)", animationDelay: "2s" }}
        />
        <div
          className="absolute"
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "rgba(59,130,246,0.08)", filter: "blur(80px)" }}
        />

        {/* Floating shapes */}
        <div
          className="absolute careers-float hidden lg:block"
          style={{ top: 120, right: "15%", width: 56, height: 56, border: "2px solid rgba(255,255,255,0.08)", borderRadius: 16, transform: "rotate(12deg)" }}
        />
        <div
          className="absolute careers-float2 hidden lg:block"
          style={{ bottom: 120, left: "10%", width: 40, height: 40, border: "2px solid rgba(129,140,248,0.15)", borderRadius: "50%" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style={{ paddingTop: 100, paddingBottom: 80 }}>
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 careers-slide-up"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
            >
              <Sparkles className="h-4 w-4" style={{ color: "#a5b4fc" }} />
              We're hiring across multiple positions
            </div>

            {/* Heading */}
            <h1
              className="font-extrabold leading-tight mb-6 careers-slide-up"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", color: "#fff", animationDelay: "0.1s" }}
            >
              Build Your Career
              <br />
              <span className="careers-gradient-text">With Our Team</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed careers-slide-up"
              style={{ color: "rgba(255,255,255,0.6)", animationDelay: "0.2s" }}
            >
              Join a team of passionate professionals in the event staffing industry. Grow your skills, earn competitive pay, and make an impact.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto careers-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <div
                  className="absolute"
                  style={{ inset: -4, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3), rgba(236,72,153,0.3))", filter: "blur(8px)", opacity: 0.5 }}
                />
                <div className="relative flex items-center bg-white rounded-xl" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                  <Search className="h-5 w-5 text-slate-400 ml-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search positions, departments, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-slate-900 text-base outline-none px-4"
                    style={{ height: 56 }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mr-2 p-1.5 rounded-full text-slate-400 transition-colors"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="hidden sm:flex items-center mr-3">
                    <Button
                      onClick={() => smoothScroll("jobs")}
                      className="text-white rounded-lg px-5"
                      style={{ height: 40, background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12 careers-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { value: `${filteredJobs.length}+`, label: "Open Roles" },
                { value: "100+", label: "Team Members" },
                { value: "50+", label: "Events/Year" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute hidden sm:flex flex-col items-center gap-2 careers-bounce"
            style={{ bottom: 28, left: "50%", color: "rgba(255,255,255,0.35)" }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* ======= WHY WORK WITH US ======= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ marginTop: -56 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { icon: TrendingUp, title: "Career Growth", desc: "Clear advancement paths and professional development programs", iconColor: "#10b981", iconBg: "#ecfdf5" },
            { icon: DollarSign, title: "Competitive Pay", desc: "Industry-leading wages with weekly payouts and bonuses", iconColor: "#3b82f6", iconBg: "#eff6ff" },
            { icon: Heart, title: "Great Benefits", desc: "Health coverage, PTO, and employee wellness programs", iconColor: "#f43f5e", iconBg: "#fff1f2" },
            { icon: Users, title: "Team Culture", desc: "Supportive environment with mentorship and team events", iconColor: "#8b5cf6", iconBg: "#faf5ff" },
          ].map((item) => (
            <Card
              key={item.title}
              className="group bg-white border-0 transition-all duration-300 overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)")}
            >
              <CardContent className="p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: item.iconBg }}
                >
                  <item.icon className="h-6 w-6" style={{ color: item.iconColor }} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ======= JOB LISTINGS ======= */}
      <div id="jobs" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: "#eef2ff", color: "#4f46e5" }}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Career Opportunities
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Open Positions</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Discover the perfect role for you. We have{" "}
            <span className="font-semibold" style={{ color: "#4f46e5" }}>{filteredJobs.length}</span>{" "}
            {filteredJobs.length === 1 ? "opening" : "openings"} available.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4" style={{ padding: "80px 0" }}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full" style={{ border: "4px solid #e0e7ff" }} />
              <div className="absolute inset-0 w-12 h-12 rounded-full animate-spin" style={{ border: "4px solid transparent", borderTopColor: "#4f46e5" }} />
            </div>
            <p className="text-sm text-slate-400">Loading positions...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card style={{ border: "2px dashed #e2e8f0", background: "#f8fafc" }}>
            <CardContent className="text-center" style={{ padding: 64 }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "#f1f5f9" }}
              >
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No open positions right now</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {searchTerm
                  ? "No positions match your search. Try different keywords."
                  : "Check back soon — we're always growing and adding new roles!"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className="careers-job-card careers-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card
                  className="bg-white cursor-pointer overflow-hidden transition-all duration-300"
                  style={
                    selectedJob?.id === job.id
                      ? { border: "1px solid #c7d2fe", boxShadow: "0 8px 30px rgba(79,70,229,0.1)", outline: "1px solid #e0e7ff" }
                      : { border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
                  }
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                >
                  <CardContent className="p-0">
                    {/* Accent bar */}
                    <div
                      style={{
                        height: 3,
                        background: selectedJob?.id === job.id
                          ? "linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899)"
                          : "transparent",
                        transition: "background 0.3s",
                      }}
                    />

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={getTypeBadgeStyle(job.type)}
                            >
                              {getTypeLabel(job.type)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                              {job.salaryRange}
                            </span>
                            {job.postedDate && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {formatDate(job.postedDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Button
                            className="text-white"
                            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 14px rgba(79,70,229,0.25)" }}
                            onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                          >
                            Apply Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          <ChevronDown
                            className="h-5 w-5 text-slate-400 transition-transform duration-300"
                            style={{ transform: selectedJob?.id === job.id ? "rotate(180deg)" : "rotate(0)" }}
                          />
                        </div>
                      </div>

                      {/* Expanded Detail */}
                      {selectedJob?.id === job.id && (
                        <div className="mt-6 pt-6" style={{ borderTop: "1px solid #f1f5f9" }} onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4" style={{ color: "#6366f1" }} />
                                About This Role
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {job.requirements?.length > 0 && (
                                <div className="rounded-xl p-5" style={{ background: "#f8fafc" }}>
                                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" style={{ color: "#10b981" }} />
                                    Requirements
                                  </h4>
                                  <ul className="space-y-2">
                                    {job.requirements.map((req, idx) => (
                                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {job.responsibilities?.length > 0 && (
                                <div className="rounded-xl p-5" style={{ background: "#eff6ff" }}>
                                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Zap className="h-4 w-4" style={{ color: "#3b82f6" }} />
                                    Responsibilities
                                  </h4>
                                  <ul className="space-y-2">
                                    {job.responsibilities.map((resp, idx) => (
                                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#3b82f6" }} />
                                        {resp}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {job.benefits?.length > 0 && (
                                <div className="rounded-xl p-5" style={{ background: "#faf5ff" }}>
                                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Star className="h-4 w-4" style={{ color: "#8b5cf6" }} />
                                    Benefits
                                  </h4>
                                  <ul className="space-y-2">
                                    {job.benefits.map((benefit, idx) => (
                                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#8b5cf6" }} />
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button
                                size="lg"
                                className="text-white"
                                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 14px rgba(79,70,229,0.25)" }}
                                onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                              >
                                Apply for this Position
                                <Send className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======= ABOUT SECTION ======= */}
      <div id="about" className="scroll-mt-20" style={{ background: "linear-gradient(180deg, #f8fafc, #fff)", paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: "#eef2ff", color: "#4f46e5" }}
            >
              <Globe className="h-3.5 w-3.5" />
              About Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Extreme Staffing?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              We deliver exceptional service for every occasion, and we invest in our people to make it happen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Mission */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#e0e7ff" }}>
                    <Award className="h-5 w-5" style={{ color: "#4f46e5" }} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Our Mission</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">
                  At Extreme Staffing, we connect talented individuals with exciting event opportunities. From corporate galas to music festivals, our team ensures every event is staffed with professional, reliable, and passionate people.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We believe in investing in our people — providing training, fair compensation, and a supportive work environment that helps everyone grow.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "500+", label: "Events Staffed" },
                  { value: "98%", label: "Client Satisfaction" },
                  { value: "4.8", label: "Staff Rating" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 text-center" style={{ border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div className="text-2xl font-bold careers-gradient-text">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Why Choose Us */}
            <div className="space-y-4">
              {[
                { icon: Clock, title: "Flexible Scheduling", desc: "Work fits your lifestyle — choose shifts and events that suit you best.", color: "#10b981", bg: "#ecfdf5" },
                { icon: DollarSign, title: "Competitive Pay & Weekly Deposits", desc: "Get paid what you're worth with industry-leading wages and on-time payments.", color: "#3b82f6", bg: "#eff6ff" },
                { icon: Star, title: "Prestigious Venues & Events", desc: "Work at high-profile events and build an impressive professional portfolio.", color: "#f59e0b", bg: "#fffbeb" },
                { icon: TrendingUp, title: "Professional Development", desc: "Access certifications, training programs, and clear career advancement paths.", color: "#8b5cf6", bg: "#faf5ff" },
                { icon: Heart, title: "Supportive Team Culture", desc: "Join a positive, inclusive environment with mentorship and team building events.", color: "#f43f5e", bg: "#fff1f2" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-4 p-4 rounded-xl bg-white transition-all duration-300"
                  style={{ border: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: item.bg }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======= CONTACT SECTION ======= */}
      <div id="contact" className="relative scroll-mt-20 overflow-hidden" style={{ paddingTop: 80, paddingBottom: 80 }}>
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }} />
        <div className="absolute inset-0 careers-hero-dots" />
        <div
          className="absolute careers-pulse-glow"
          style={{ top: 0, right: 0, width: 350, height: 350, borderRadius: "50%", background: "rgba(99,102,241,0.15)", filter: "blur(60px)" }}
        />
        <div
          className="absolute careers-pulse-glow"
          style={{ bottom: 0, left: 0, width: 280, height: 280, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(60px)", animationDelay: "2s" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
            >
              <PhoneCall className="h-3.5 w-3.5" />
              Contact Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Get In Touch</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              Have questions about working with us? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { icon: Mail, title: "Email Us", detail: "careers@extremestaffing.com", gradient: "linear-gradient(135deg, #3b82f6, #4f46e5)" },
              { icon: Phone, title: "Call Us", detail: "+1 (555) 123-4567", gradient: "linear-gradient(135deg, #10b981, #059669)" },
              { icon: MapPin, title: "Visit Us", detail: "123 Main Street, Suite 100", gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl p-6 text-center transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: item.gradient, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======= FOOTER ======= */}
      <footer style={{ background: "#020617", color: "#fff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6" style={{ padding: "40px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">Extreme Staffing</span>
                <p className="text-sm" style={{ color: "#94a3b8" }}>Premier event staffing solutions</p>
              </div>
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.location.hash = ""; window.location.reload(); }}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
            >
              Staff Login
            </a>
          </div>
          <div className="text-center" style={{ padding: "24px 0" }}>
            <p className="text-sm" style={{ color: "#64748b" }}>
              &copy; {new Date().getFullYear()} Extreme Staffing. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ======= APPLY DIALOG ======= */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          {submitted ? (
            <div className="text-center space-y-5" style={{ padding: "48px 24px" }}>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "linear-gradient(135deg, #ecfdf5, #ccfbf1)" }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: "#059669" }} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                Thank you for applying for <strong className="text-slate-700">{applyingTo?.title}</strong>. Our team will review your application and get back to you soon.
              </p>
              <Button
                onClick={() => setIsApplyOpen(false)}
                className="text-white px-8"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Dialog header with gradient */}
              <div
                className="px-6 py-5 text-white"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: "8px 8px 0 0" }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">Apply for {applyingTo?.title}</DialogTitle>
                  <DialogDescription style={{ color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                    {applyingTo?.department} &middot; {applyingTo?.location} &middot;{" "}
                    {getTypeLabel(applyingTo?.type || "")}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-5 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Full Name <span style={{ color: "#f43f5e" }}>*</span>
                    </Label>
                    <Input name="name" placeholder="John Doe" required style={{ height: 44 }} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Email <span style={{ color: "#f43f5e" }}>*</span>
                    </Label>
                    <Input name="email" type="email" placeholder="john@example.com" required style={{ height: 44 }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone Number
                  </Label>
                  <Input name="phone" type="tel" placeholder="+1 (555) 000-0000" style={{ height: 44 }} />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">
                    Cover Letter <span style={{ color: "#f43f5e" }}>*</span>
                  </Label>
                  <Textarea
                    name="coverLetter"
                    placeholder="Tell us why you're a great fit for this role, your relevant experience, and what excites you about this position..."
                    style={{ minHeight: 140, resize: "none" }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Upload className="h-3.5 w-3.5 text-slate-400" />
                    Resume
                  </Label>
                  {resumeFile ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ border: "1px solid #c7d2fe", background: "#eef2ff" }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#e0e7ff" }}>
                        <FileText className="h-5 w-5" style={{ color: "#4f46e5" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{resumeFile.name}</p>
                        <p className="text-xs text-slate-500">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 shrink-0 text-slate-400"
                        onClick={() => setResumeFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      className="flex flex-col items-center gap-2 p-5 rounded-xl cursor-pointer transition-all duration-200 group"
                      style={{ border: "2px dashed #e2e8f0" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.background = "rgba(238,242,255,0.3)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#f1f5f9" }}>
                        <Upload className="h-5 w-5 text-slate-400" />
                      </div>
                      <span className="text-sm text-slate-600 font-medium">Click to upload your resume</span>
                      <span className="text-xs text-slate-400">PDF, DOC, or DOCX (max 5MB)</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB."); return; }
                            setResumeFile(file);
                          }
                        }}
                      />
                    </label>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>or paste a link:</span>
                    <Input
                      name="resumeUrl"
                      type="url"
                      placeholder="https://drive.google.com/your-resume.pdf"
                      className="text-xs"
                      style={{ height: 32 }}
                      disabled={!!resumeFile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Additional Notes</Label>
                  <Textarea
                    name="notes"
                    placeholder="Availability, certifications, referrals, or anything else..."
                    style={{ minHeight: 80, resize: "none" }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                  <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 14px rgba(79,70,229,0.25)", minWidth: 160 }}
                  >
                    {isUploadingResume ? (
                      <>
                        <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                        Uploading...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full animate-spin mr-2" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
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
