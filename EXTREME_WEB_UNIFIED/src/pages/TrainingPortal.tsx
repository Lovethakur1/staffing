import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  FileText,
  Users,
  Plus,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  ContentItem,
  ContentKind,
  createContentItem,
  deleteContentItem,
  getAdminContent,
  getPublishedContent,
  updateContentItem,
} from "../services/content.service";
import { staffService } from "../services/staff.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

interface TrainingPortalProps {
  userRole: string;
  userId: string;
}

const ROLE_OPTIONS = ['ALL', 'STAFF', 'MANAGER', 'ADMIN', 'SUB_ADMIN', 'SCHEDULER', 'CLIENT'];

const emptyForm = {
  id: '',
  slug: '',
  title: '',
  description: '',
  body: '',
  kind: 'COURSE' as ContentKind,
  category: 'General',
  icon: 'school-outline',
  color: '#5E1916',
  actionLabel: 'Open Course',
  url: '',
  durationMinutes: '',
  modules: '',
  required: false,
  instructor: '',
  audiences: ['STAFF'],
  isPublished: true,
  sortOrder: '0',
};

export function TrainingPortal({ userRole }: TrainingPortalProps) {
  const isAdmin = userRole === 'admin' || userRole === 'sub-admin';
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Issue-cert dialog
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [certCourse, setCertCourse] = useState<ContentItem | null>(null);
  const [certForm, setCertForm] = useState({ staffId: '', issueDate: '', expiryDate: '' });
  const [issuingCert, setIssuingCert] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const response = await getAdminContent('TRAINING');
        setItems(response.data);
      } else {
        setItems(await getPublishedContent('TRAINING'));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to load training courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin]);

  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))), [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const resetForm = () => setForm({ ...emptyForm });

  const startEdit = (item: ContentItem) => {
    setForm({
      id: item.id,
      slug: item.slug || '',
      title: item.title || '',
      description: item.description || '',
      body: item.body || '',
      kind: item.kind,
      category: item.category || 'General',
      icon: item.icon || 'school-outline',
      color: item.color || '#5E1916',
      actionLabel: item.actionLabel || 'Open Course',
      url: item.url || '',
      durationMinutes: item.durationMinutes ? String(item.durationMinutes) : '',
      modules: item.modules ? String(item.modules) : '',
      required: Boolean(item.required),
      instructor: item.instructor || '',
      audiences: item.audiences?.length ? item.audiences : ['STAFF'],
      isPublished: Boolean(item.isPublished),
      sortOrder: String(item.sortOrder ?? 0),
    });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug || form.title,
        title: form.title,
        description: form.description,
        body: form.body || null,
        section: 'TRAINING' as const,
        kind: form.kind,
        category: form.category || 'General',
        icon: form.icon || null,
        color: form.color || null,
        actionLabel: form.actionLabel || null,
        url: form.url || null,
        pages: null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        modules: form.modules ? Number(form.modules) : null,
        required: form.required,
        instructor: form.instructor || null,
        audiences: form.audiences,
        isPublished: form.isPublished,
        sortOrder: Number(form.sortOrder || 0),
      };

      if (form.id) {
        await updateContentItem(form.id, payload);
        toast.success('Course updated');
      } else {
        await createContentItem(payload);
        toast.success('Course created');
      }
      resetForm();
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ContentItem) => {
    if (!window.confirm(`Delete course "${item.title}"?`)) return;
    try {
      await deleteContentItem(item.id);
      toast.success('Course deleted');
      if (form.id === item.id) resetForm();
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete course');
    }
  };

  const openIssueCert = (course: ContentItem) => {
    setCertCourse(course);
    setCertForm({ staffId: '', issueDate: new Date().toISOString().split('T')[0], expiryDate: '' });
    setCertDialogOpen(true);
  };

  const issueCertification = async () => {
    if (!certForm.staffId.trim() || !certCourse) {
      toast.error('Staff ID is required');
      return;
    }
    setIssuingCert(true);
    try {
      await staffService.createCertification({
        staffId: certForm.staffId,
        name: certCourse.title,
        issuer: certCourse.instructor || 'Training Portal',
        issueDate: certForm.issueDate || undefined,
        expiryDate: certForm.expiryDate || undefined,
      });
      toast.success(`Certification "${certCourse.title}" issued successfully`);
      setCertDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to issue certification');
    } finally {
      setIssuingCert(false);
    }
  };

  // Stats
  const stats = {
    total: items.length,
    required: items.filter(i => i.required).length,
    optional: items.filter(i => !i.required).length,
    totalMinutes: items.reduce((sum, i) => sum + (i.durationMinutes || 0), 0),
    published: items.filter(i => i.isPublished).length,
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium text-foreground">Training Portal</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {isAdmin ? 'Admin Course Manager' : userRole === 'manager' ? 'Manager' : 'Staff'}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            {isAdmin
              ? 'Create and manage training courses. Issue certifications to staff upon completion.'
              : 'Browse training courses and develop your skills.'}
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Required</p>
              <p className="text-xl font-semibold">{stats.required}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Optional</p>
              <p className="text-xl font-semibold">{stats.optional}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-xl font-semibold">{stats.totalMinutes} min</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content area */}
      {isAdmin ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          {/* Course list */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Training Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No training courses created yet. Use the form to add courses.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <GraduationCap className="w-4 h-4 text-sangria" />
                          <span className="font-medium truncate">{item.title}</span>
                          {!item.isPublished && <Badge variant="secondary">Draft</Badge>}
                          {item.required && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Required</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{item.category}</span>
                          {item.durationMinutes && <span>{item.durationMinutes} min</span>}
                          {item.modules && <span>{item.modules} modules</span>}
                          {item.instructor && <span>by {item.instructor}</span>}
                          <span>{item.audiences.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                          <Pencil className="w-4 h-4 mr-1" />Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openIssueCert(item)}>
                          <Award className="w-4 h-4 mr-1" />Issue Cert
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => remove(item)}>
                          <Trash2 className="w-4 h-4 mr-1" />Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Form panel */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg">{form.id ? 'Edit Course' : 'New Course'}</CardTitle>
              <Button variant="outline" size="sm" onClick={resetForm}>Clear</Button>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              <Input placeholder="Course title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Short description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
              <Textarea placeholder="Course details / body" value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} />

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
                <Input placeholder="Instructor" value={form.instructor} onChange={(e) => setForm(p => ({ ...p, instructor: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Duration (min)" value={form.durationMinutes} onChange={(e) => setForm(p => ({ ...p, durationMinutes: e.target.value }))} />
                <Input placeholder="Modules" value={form.modules} onChange={(e) => setForm(p => ({ ...p, modules: e.target.value }))} />
                <Input placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
              </div>

              <Input placeholder="Course URL (link to external course)" value={form.url} onChange={(e) => setForm(p => ({ ...p, url: e.target.value }))} />

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} />
                <Input placeholder="Action label" value={form.actionLabel} onChange={(e) => setForm(p => ({ ...p, actionLabel: e.target.value }))} />
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Audiences</p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const selected = form.audiences.includes(role);
                    return (
                      <Button
                        key={role}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setForm(p => ({
                          ...p,
                          audiences: selected
                            ? p.audiences.filter(e => e !== role)
                            : [...p.audiences, role],
                        }))}
                      >
                        {role}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-xs text-muted-foreground">Visible on the mobile Training Portal.</p>
                </div>
                <Switch checked={form.isPublished} onCheckedChange={(checked) => setForm(p => ({ ...p, isPublished: checked }))} />
              </div>

              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div>
                  <p className="font-medium">Required</p>
                  <p className="text-xs text-muted-foreground">Staff must complete this course.</p>
                </div>
                <Switch checked={form.required} onCheckedChange={(checked) => setForm(p => ({ ...p, required: checked }))} />
              </div>

              <Button className="w-full" onClick={submit} disabled={saving}>
                {form.id ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {saving ? 'Saving...' : form.id ? 'Update Course' : 'Create Course'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Non-admin read-only course catalog */
        <div className="space-y-4">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Required courses */}
          {filtered.filter(c => c.required).length > 0 && (
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-red-700">
                  <Award className="w-5 h-5" />
                  Required Training
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-3">
                {filtered.filter(c => c.required).map(renderCourseCard)}
              </CardContent>
            </Card>
          )}

          {/* Optional courses */}
          {filtered.filter(c => !c.required).length > 0 && (
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-base sm:text-lg">Additional Courses</CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-3">
                {filtered.filter(c => !c.required).map(renderCourseCard)}
              </CardContent>
            </Card>
          )}

          {!loading && filtered.length === 0 && (
            <Card className="p-4 sm:p-6">
              <CardContent className="px-0 text-sm text-muted-foreground text-center py-8">
                No training courses available yet.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Issue Certification Dialog */}
      <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Certification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Issue a certification for <strong>{certCourse?.title}</strong> to a staff member.
            </p>
            <div className="space-y-2">
              <Label>Staff User ID</Label>
              <Input
                placeholder="Enter staff user ID"
                value={certForm.staffId}
                onChange={(e) => setCertForm(p => ({ ...p, staffId: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={certForm.issueDate}
                  onChange={(e) => setCertForm(p => ({ ...p, issueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={certForm.expiryDate}
                  onChange={(e) => setCertForm(p => ({ ...p, expiryDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertDialogOpen(false)}>Cancel</Button>
            <Button onClick={issueCertification} disabled={issuingCert}>
              <Award className="w-4 h-4 mr-2" />
              {issuingCert ? 'Issuing...' : 'Issue Certification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderCourseCard(item: ContentItem) {
    return (
      <div key={item.id} className="flex items-start justify-between gap-3 border rounded-lg p-4 hover:bg-muted/30 transition-colors">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <GraduationCap className="w-4 h-4 text-sangria" />
            <span className="font-medium">{item.title}</span>
            {item.required && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Required</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          {item.body && <p className="text-sm mt-1">{item.body}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {item.category && <Badge variant="outline">{item.category}</Badge>}
            {item.durationMinutes && (
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.durationMinutes} min</span>
            )}
            {item.modules && (
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{item.modules} modules</span>
            )}
            {item.instructor && (
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.instructor}</span>
            )}
          </div>
        </div>
        {item.url && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.actionLabel || 'Open Course'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        )}
      </div>
    );
  }
}
