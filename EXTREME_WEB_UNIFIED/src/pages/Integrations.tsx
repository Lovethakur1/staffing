import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Zap,
  Settings,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Plug,
  Clock,
  AlertCircle,
} from "lucide-react";
import { integrationService, Integration } from "../services/integration.service";

const CONFIG_FIELDS: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  quickbooks:        [{ key: "clientId", label: "Client ID", placeholder: "Enter QuickBooks Client ID" }, { key: "clientSecret", label: "Client Secret", placeholder: "Enter Client Secret", type: "password" }, { key: "companyId", label: "Company ID", placeholder: "Enter Company/Realm ID" }],
  xero:              [{ key: "clientId", label: "Client ID", placeholder: "Enter Xero Client ID" }, { key: "clientSecret", label: "Client Secret", placeholder: "Enter Client Secret", type: "password" }],
  adp:               [{ key: "clientId", label: "Client ID", placeholder: "Enter ADP Client ID" }, { key: "clientSecret", label: "Client Secret", placeholder: "Enter Client Secret", type: "password" }],
  gusto:             [{ key: "clientId", label: "Client ID", placeholder: "Enter Gusto Client ID" }, { key: "clientSecret", label: "Client Secret", placeholder: "Enter Client Secret", type: "password" }],
  "google-calendar": [{ key: "apiKey", label: "API Key", placeholder: "Enter Google API Key", type: "password" }, { key: "calendarId", label: "Calendar ID", placeholder: "e.g. primary or calendar@group.calendar.google.com" }],
  outlook:           [{ key: "clientId", label: "Application (Client) ID", placeholder: "Azure App Client ID" }, { key: "tenantId", label: "Tenant ID", placeholder: "Azure Tenant ID" }],
  slack:             [{ key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/..." }, { key: "botToken", label: "Bot Token", placeholder: "xoxb-...", type: "password" }],
  teams:             [{ key: "webhookUrl", label: "Incoming Webhook URL", placeholder: "https://org.webhook.office.com/..." }],
  zapier:            [{ key: "webhookUrl", label: "Zapier Webhook URL", placeholder: "https://hooks.zapier.com/hooks/catch/..." }],
  "google-drive":    [{ key: "apiKey", label: "API Key", placeholder: "Enter Google API Key", type: "password" }, { key: "folderId", label: "Root Folder ID (optional)", placeholder: "Google Drive folder ID" }],
  dropbox:           [{ key: "accessToken", label: "Access Token", placeholder: "Enter Dropbox access token", type: "password" }],
  docusign:          [{ key: "integrationKey", label: "Integration Key", placeholder: "DocuSign integration key" }, { key: "accountId", label: "Account ID", placeholder: "DocuSign account ID" }, { key: "privateKey", label: "RSA Private Key", placeholder: "-----BEGIN RSA PRIVATE KEY-----", type: "password" }],
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  accounting: "Accounting",
  payroll: "Payroll",
  calendar: "Calendar",
  communication: "Communication",
  automation: "Automation",
  storage: "Storage",
  documents: "Documents",
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  accounting: Zap,
  payroll: Zap,
  calendar: Clock,
  communication: Plug,
  automation: Zap,
  storage: Settings,
  documents: Settings,
};

function formatSyncTime(ts: string | null): string {
  if (!ts) return "Never";
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

interface IntegrationsProps {
  userRole: string;
  userId: string;
}

export function Integrations({ userRole }: IntegrationsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const [configDialog, setConfigDialog] = useState<{ open: boolean; integration: Integration | null; mode: "connect" | "configure" }>({ open: false, integration: null, mode: "connect" });
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [configSaving, setConfigSaving] = useState(false);

  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const [syncingKeys, setSyncingKeys] = useState<Set<string>>(new Set());

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await integrationService.list();
      setIntegrations(data);
    } catch {
      setError("Failed to load integrations. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const categories = ["all", ...Array.from(new Set(integrations.map(i => i.category)))];

  const filtered = integrations.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || i.category === activeCategory;
    return matchSearch && matchCat;
  });

  const activeCount = integrations.filter(i => i.isActive).length;

  const openConfigDialog = (integration: Integration, mode: "connect" | "configure") => {
    const fields = CONFIG_FIELDS[integration.key] ?? [];
    const initial: Record<string, string> = {};
    fields.forEach(f => { initial[f.key] = ""; });
    setConfigValues(initial);
    setConfigDialog({ open: true, integration, mode });
  };

  const handleConfigSave = async () => {
    if (!configDialog.integration) return;
    setConfigSaving(true);
    try {
      const { key } = configDialog.integration;
      const config: Record<string, string> = {};
      Object.entries(configValues).forEach(([k, v]) => { if (v.trim()) config[k] = v.trim(); });
      if (configDialog.mode === "connect") {
        await integrationService.connect(key, Object.keys(config).length > 0 ? config : undefined);
      } else {
        await integrationService.updateConfig(key, config);
      }
      setConfigDialog({ open: false, integration: null, mode: "connect" });
      await fetchIntegrations();
    } catch {
      // keep dialog open on error
    } finally {
      setConfigSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    setDisconnecting(true);
    try {
      await integrationService.disconnect(disconnectTarget.key);
      setDisconnectTarget(null);
      await fetchIntegrations();
    } catch {
      // stay open on error
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async (integration: Integration) => {
    setSyncingKeys(prev => new Set(prev).add(integration.key));
    try {
      await integrationService.sync(integration.key);
      setIntegrations(prev =>
        prev.map(i => i.key === integration.key ? { ...i, lastSyncAt: new Date().toISOString() } : i)
      );
    } catch {
      // ignore sync errors silently
    } finally {
      setSyncingKeys(prev => { const s = new Set(prev); s.delete(integration.key); return s; });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-semibold">Failed to load integrations</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={fetchIntegrations} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium">Integrations</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {activeCount} Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Connect your tools and automate your workflow
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchIntegrations} className="self-start md:self-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-bold">{integrations.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-bold">{integrations.length - activeCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Not Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-bold">{categories.length - 1}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="capitalize"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <Search className="h-8 w-8" />
            <p>No integrations match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(integration => {
            const isSyncing = syncingKeys.has(integration.key);
            const CategoryIcon = CATEGORY_ICONS[integration.category] ?? Plug;
            return (
              <Card key={integration.key} className={integration.isActive ? "border-green-200 dark:border-green-900" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${integration.isActive ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
                        <CategoryIcon className={`h-5 w-5 ${integration.isActive ? "text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm leading-tight truncate">{integration.name}</CardTitle>
                        <span className="text-xs text-muted-foreground capitalize">{integration.category}</span>
                      </div>
                    </div>
                    {integration.isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground shrink-0 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-xs leading-relaxed">{integration.description}</CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map(f => (
                      <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                  {integration.isActive && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last sync: {formatSyncTime(integration.lastSyncAt)}
                    </div>
                  )}
                  {(userRole === "admin" || userRole === "sub_admin") ? (
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {integration.isActive ? (
                        <>
                          <Button size="sm" variant="outline" className="flex-1 min-w-0" onClick={() => handleSync(integration)} disabled={isSyncing}>
                            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "Syncing..." : "Sync"}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 min-w-0" onClick={() => openConfigDialog(integration, "configure")}>
                            <Settings className="h-3.5 w-3.5 mr-1.5" />
                            Configure
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1 min-w-0" onClick={() => setDisconnectTarget(integration)}>
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="w-full" onClick={() => openConfigDialog(integration, "connect")}>
                          <Plug className="h-3.5 w-3.5 mr-1.5" />
                          Connect
                        </Button>
                      )}
                    </div>
                  ) : (
                    integration.isActive && (
                      <p className="text-xs text-muted-foreground pt-1">Managed by Administrator</p>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={configDialog.open} onOpenChange={open => !open && setConfigDialog({ open: false, integration: null, mode: "connect" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {configDialog.mode === "connect" ? "Connect" : "Configure"} {configDialog.integration?.name}
            </DialogTitle>
            <DialogDescription>
              {configDialog.mode === "connect"
                ? "Enter your credentials to connect this integration."
                : "Update the configuration for this integration."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {configDialog.integration && (CONFIG_FIELDS[configDialog.integration.key] ?? []).length > 0 ? (
              (CONFIG_FIELDS[configDialog.integration.key] ?? []).map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={configValues[field.key] ?? ""}
                    onChange={e => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                This integration uses OAuth. Click {configDialog.mode === "connect" ? "Connect" : "Save"} to proceed.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfigDialog({ open: false, integration: null, mode: "connect" })} disabled={configSaving}>
              Cancel
            </Button>
            <Button onClick={handleConfigSave} disabled={configSaving}>
              {configSaving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {configDialog.mode === "connect" ? "Connect" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!disconnectTarget} onOpenChange={open => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {disconnectTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disable the integration and clear stored credentials. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} disabled={disconnecting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {disconnecting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}