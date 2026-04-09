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
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ContentItem,
  ContentKind,
  createContentItem,
  deleteContentItem,
  getAdminContent,
  getPublishedContent,
  updateContentItem,
} from '../services/content.service';

interface MobileDocumentationProps {
  userRole: string;
  userId: string;
}

const DOC_KIND_OPTIONS: ContentKind[] = ['GUIDE', 'VIDEO', 'POLICY'];
const ROLE_OPTIONS = ['ALL', 'STAFF', 'MANAGER', 'ADMIN', 'SUB_ADMIN', 'SCHEDULER', 'CLIENT'];

const emptyForm = {
  id: '',
  slug: '',
  title: '',
  description: '',
  body: '',
  kind: 'GUIDE' as ContentKind,
  category: 'General',
  icon: 'document-text-outline',
  color: '#5E1916',
  actionLabel: 'Read',
  url: '',
  pages: '',
  durationMinutes: '',
  required: false,
  audiences: ['STAFF'],
  isPublished: true,
  sortOrder: '0',
};

export function MobileDocumentation({ userRole }: MobileDocumentationProps) {
  const isAdmin = userRole === 'admin' || userRole === 'sub-admin';
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const response = await getAdminContent('DOCUMENTATION');
        setItems(response.data);
      } else {
        setItems(await getPublishedContent('DOCUMENTATION'));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin]);

  const groupedItems = useMemo(() => {
    return items.reduce((acc: Record<string, ContentItem[]>, item) => {
      const key = item.category || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

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
      icon: item.icon || 'document-text-outline',
      color: item.color || '#5E1916',
      actionLabel: item.actionLabel || 'Read',
      url: item.url || '',
      pages: item.pages ? String(item.pages) : '',
      durationMinutes: item.durationMinutes ? String(item.durationMinutes) : '',
      required: Boolean(item.required),
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
        section: 'DOCUMENTATION' as const,
        kind: form.kind,
        category: form.category,
        icon: form.icon || null,
        color: form.color || null,
        actionLabel: form.actionLabel || null,
        url: form.url || null,
        pages: form.pages ? Number(form.pages) : null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        modules: null,
        required: form.required,
        instructor: null,
        audiences: form.audiences,
        isPublished: form.isPublished,
        sortOrder: Number(form.sortOrder || 0),
      };

      if (form.id) {
        await updateContentItem(form.id, payload);
        toast.success('Documentation item updated');
      } else {
        await createContentItem(payload);
        toast.success('Documentation item created');
      }

      resetForm();
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save documentation item');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ContentItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteContentItem(item.id);
      toast.success('Documentation item deleted');
      if (form.id === item.id) resetForm();
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete item');
    }
  };

  const kindIcon = (kind: ContentKind) => {
    if (kind === 'VIDEO') return <Video className="w-4 h-4 text-purple-500" />;
    if (kind === 'POLICY') return <Shield className="w-4 h-4 text-orange-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  const kindLabel = (kind: ContentKind) => {
    if (kind === 'VIDEO') return 'Video';
    if (kind === 'POLICY') return 'Policy';
    return 'Guide';
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium text-foreground">Mobile Documentation</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {isAdmin ? 'Admin Content Manager' : userRole === 'manager' ? 'Manager' : 'Staff'}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            {isAdmin
              ? 'Manage guides, videos, and policies published to the mobile Documentation screen.'
              : 'Browse guides, videos, and policies published by admin.'}
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats row for admin */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-4">
          {(['GUIDE', 'VIDEO', 'POLICY'] as ContentKind[]).map((k) => {
            const count = items.filter(i => i.kind === k).length;
            const published = items.filter(i => i.kind === k && i.isPublished).length;
            return (
              <Card key={k} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    {kindIcon(k)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kindLabel(k)}s</p>
                    <p className="text-xl font-semibold">{count}</p>
                    <p className="text-xs text-muted-foreground">{published} published</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Content area */}
      {isAdmin ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentation Items
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No documentation items created yet. Add guides, videos, or policies below.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {kindIcon(item.kind)}
                          <span className="font-medium truncate">{item.title}</span>
                          <Badge variant="outline" className="shrink-0">{kindLabel(item.kind)}</Badge>
                          {!item.isPublished && <Badge variant="secondary" className="shrink-0">Draft</Badge>}
                          {item.required && <Badge className="shrink-0">Required</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">{item.category}</span>
                          {item.pages && <span>{item.pages} pages</span>}
                          {item.durationMinutes && <span>{item.durationMinutes} min</span>}
                          <span>{item.audiences.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                          <Pencil className="w-4 h-4 mr-1" />Edit
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
              <CardTitle className="text-base sm:text-lg">{form.id ? 'Edit Item' : 'New Item'}</CardTitle>
              <Button variant="outline" size="sm" onClick={resetForm}>Clear</Button>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Short description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
              <Textarea placeholder="Full content / body text" value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Type</p>
                  <Select value={form.kind} onValueChange={(value) => setForm(p => ({ ...p, kind: value as ContentKind }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_KIND_OPTIONS.map(k => (
                        <SelectItem key={k} value={k}>{kindLabel(k)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} />
                <Input placeholder="Action label (e.g. Read)" value={form.actionLabel} onChange={(e) => setForm(p => ({ ...p, actionLabel: e.target.value }))} />
              </div>

              <Input placeholder="URL or link (optional)" value={form.url} onChange={(e) => setForm(p => ({ ...p, url: e.target.value }))} />

              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Pages" value={form.pages} onChange={(e) => setForm(p => ({ ...p, pages: e.target.value }))} />
                <Input placeholder="Duration (min)" value={form.durationMinutes} onChange={(e) => setForm(p => ({ ...p, durationMinutes: e.target.value }))} />
                <Input placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
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
                  <p className="text-xs text-muted-foreground">Visible on the mobile Documentation screen.</p>
                </div>
                <Switch checked={form.isPublished} onCheckedChange={(checked) => setForm(p => ({ ...p, isPublished: checked }))} />
              </div>

              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div>
                  <p className="font-medium">Required</p>
                  <p className="text-xs text-muted-foreground">Mark mandatory policies or reading for staff.</p>
                </div>
                <Switch checked={form.required} onCheckedChange={(checked) => setForm(p => ({ ...p, required: checked }))} />
              </div>

              <Button className="w-full" onClick={submit} disabled={saving}>
                {form.id ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {saving ? 'Saving...' : form.id ? 'Update Item' : 'Create Item'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Non-admin read-only view */
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, group]) => (
            <Card key={category} className="p-4 sm:p-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-base sm:text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-3">
                {group.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 border rounded-lg p-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {kindIcon(item.kind)}
                        <span className="font-medium">{item.title}</span>
                        <Badge variant="outline">{kindLabel(item.kind)}</Badge>
                        {item.required && <Badge>Required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.body && <p className="text-sm mt-1">{item.body}</p>}
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {item.pages && <span>{item.pages} pages</span>}
                        {item.durationMinutes && <span>{item.durationMinutes} min read</span>}
                      </div>
                    </div>
                    {item.url && (
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.actionLabel || 'Read'}
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
                No documentation published yet.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
