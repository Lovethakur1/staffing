import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  BookOpen,
  ExternalLink,
  FileText,
  Library,
  Link as LinkIcon,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  School,
  Shield,
  Trash2,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ContentItem,
  ContentKind,
  ContentSection,
  createContentItem,
  deleteContentItem,
  getAdminContent,
  getPublishedContent,
  updateContentItem,
} from '../services/content.service';

interface ResourcesProps {
  userRole: string;
  userId: string;
}

const KIND_OPTIONS: ContentKind[] = ['LINK', 'GUIDE', 'VIDEO', 'POLICY', 'COURSE'];
const ROLE_OPTIONS = ['ALL', 'STAFF', 'MANAGER', 'ADMIN', 'SUB_ADMIN', 'SCHEDULER', 'CLIENT'];

const emptyForm = {
  id: '',
  slug: '',
  title: '',
  description: '',
  body: '',
  section: 'RESOURCE' as ContentSection,
  kind: 'LINK' as ContentKind,
  category: 'General',
  icon: 'book-outline',
  color: '#5E1916',
  actionLabel: 'Open',
  url: '',
  pages: '',
  durationMinutes: '',
  modules: '',
  required: false,
  instructor: '',
  audiences: ['STAFF'],
  isPublished: true,
  sortOrder: '0',
};

export function Resources({ userRole }: ResourcesProps) {
  const isAdmin = userRole === 'admin' || userRole === 'sub-admin';
  const activeSection: ContentSection = 'RESOURCE';
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const response = await getAdminContent(activeSection);
        setItems(response.data);
      } else {
        setItems(await getPublishedContent(activeSection));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to load content library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const groupedItems = useMemo(() => {
    return items.reduce((acc: Record<string, ContentItem[]>, item) => {
      const key = item.category || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  const resetForm = () => setForm({ ...emptyForm, section: activeSection });

  const startEdit = (item: ContentItem) => {
    setForm({
      id: item.id,
      slug: item.slug || '',
      title: item.title || '',
      description: item.description || '',
      body: item.body || '',
      section: item.section,
      kind: item.kind,
      category: item.category || 'General',
      icon: item.icon || '',
      color: item.color || '#5E1916',
      actionLabel: item.actionLabel || 'Open',
      url: item.url || '',
      pages: item.pages ? String(item.pages) : '',
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
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      toast.error('Title, description, and category are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: form.slug || form.title,
        title: form.title,
        description: form.description,
        body: form.body || null,
        section: form.section,
        kind: form.kind,
        category: form.category,
        icon: form.icon || null,
        color: form.color || null,
        actionLabel: form.actionLabel || null,
        url: form.url || null,
        pages: form.pages ? Number(form.pages) : null,
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
        toast.success('Content item updated');
      } else {
        await createContentItem(payload);
        toast.success('Content item created');
      }

      resetForm();
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save content item');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ContentItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteContentItem(item.id);
      toast.success('Content item deleted');
      if (form.id === item.id) resetForm();
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete content item');
    }
  };

  const kindIcon = (kind: ContentKind) => {
    if (kind === 'VIDEO') return <Video className="w-4 h-4" />;
    if (kind === 'POLICY') return <Shield className="w-4 h-4" />;
    if (kind === 'COURSE') return <School className="w-4 h-4" />;
    if (kind === 'LINK') return <LinkIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium text-foreground">Resources</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {isAdmin ? 'Admin Content Manager' : userRole === 'manager' ? 'Manager' : 'Staff'}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            {isAdmin
              ? 'Manage resource links and guides published to the mobile app.'
              : 'Browse live resources published by admin.'}
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4 mt-4">
        {isAdmin ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Library className="w-5 h-5" />
                  Published Items
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-3">
                {items.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    No resource items created yet.
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {kindIcon(item.kind)}
                            <span className="font-medium">{item.title}</span>
                            <Badge variant="outline">{item.kind}</Badge>
                            {!item.isPublished && <Badge variant="secondary">Draft</Badge>}
                            {item.required && <Badge>Required</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{item.category}</span>
                            <span>Order {item.sortOrder}</span>
                            <span>{item.audiences.join(', ')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => remove(item)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base sm:text-lg">{form.id ? 'Edit Item' : 'New Item'}</CardTitle>
                <Button variant="outline" size="sm" onClick={resetForm}>Clear</Button>
              </CardHeader>
              <CardContent className="px-0 space-y-3">
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                <Textarea placeholder="Short description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                <Textarea placeholder="Optional long body / notes" value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Kind</p>
                        <Select value={form.kind} onValueChange={(value) => setForm((prev) => ({ ...prev, kind: value as ContentKind }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KIND_OPTIONS.map((kind) => (
                              <SelectItem key={kind} value={kind}>{kind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
                      <Input placeholder="Action label" value={form.actionLabel} onChange={(e) => setForm((prev) => ({ ...prev, actionLabel: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Icon (Ionicons name)" value={form.icon} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} />
                      <Input placeholder="Color (#hex)" value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} />
                    </div>

                    <Input placeholder="URL (optional)" value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} />

                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Pages" value={form.pages} onChange={(e) => setForm((prev) => ({ ...prev, pages: e.target.value }))} />
                      <Input placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))} />
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
                              onClick={() => setForm((prev) => ({
                                ...prev,
                                audiences: selected
                                  ? prev.audiences.filter((entry) => entry !== role)
                                  : [...prev.audiences, role],
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
                        <p className="text-xs text-muted-foreground">Unpublished items stay hidden from mobile users.</p>
                      </div>
                      <Switch checked={form.isPublished} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isPublished: checked }))} />
                    </div>

                    <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <div>
                        <p className="font-medium">Required</p>
                        <p className="text-xs text-muted-foreground">Mark required resources for staff attention.</p>
                      </div>
                      <Switch checked={form.required} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, required: checked }))} />
                    </div>

                    <Button className="w-full" onClick={submit} disabled={saving}>
                      {form.id ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {saving ? 'Saving...' : form.id ? 'Update Item' : 'Create Item'}
                    </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, group]) => (
              <Card key={category} className="p-4 sm:p-6">
                <CardHeader className="px-0 pb-4">
                  <CardTitle className="text-base sm:text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  {group.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 border rounded-lg p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {kindIcon(item.kind)}
                          <span className="font-medium">{item.title}</span>
                          {item.required && <Badge>Required</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.body && <p className="text-sm">{item.body}</p>}
                      </div>
                      {item.url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={item.url} target="_blank" rel="noreferrer">
                            {item.actionLabel || 'Open'}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {!loading && items.length === 0 && (
              <Card className="p-4 sm:p-6">
                <CardContent className="px-0 text-sm text-muted-foreground">
                  No published resources available yet.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

