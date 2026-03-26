import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

// Catalog of all supported integrations (static metadata)
const CATALOG = [
  { key: 'quickbooks',     name: 'QuickBooks Online',    category: 'accounting',    description: 'Sync invoices, expenses, and financial data automatically', features: ['Invoice Sync', 'Expense Tracking', 'Payroll Integration'] },
  { key: 'xero',           name: 'Xero',                 category: 'accounting',    description: 'Cloud-based accounting software integration', features: ['Bank Reconciliation', 'Invoice Management', 'Financial Reports'] },
  { key: 'adp',            name: 'ADP Workforce',        category: 'payroll',       description: 'Automated payroll processing and tax compliance', features: ['Payroll Automation', 'Tax Filing', 'Benefits Management'] },
  { key: 'gusto',          name: 'Gusto',                category: 'payroll',       description: 'Modern payroll, benefits, and HR platform', features: ['Payroll', 'Benefits', 'HR Tools'] },
  { key: 'google-calendar',name: 'Google Calendar',      category: 'calendar',      description: 'Sync event schedules with Google Calendar', features: ['Event Sync', 'Reminders', 'Team Calendars'] },
  { key: 'outlook',        name: 'Microsoft Outlook',    category: 'calendar',      description: 'Integrate with Outlook calendar and email', features: ['Calendar Sync', 'Email Integration', 'Meeting Scheduling'] },
  { key: 'slack',          name: 'Slack',                category: 'communication', description: 'Team communication and notifications', features: ['Notifications', 'Team Chat', 'File Sharing'] },
  { key: 'teams',          name: 'Microsoft Teams',      category: 'communication', description: 'Collaboration and video conferencing', features: ['Video Calls', 'Chat', 'File Collaboration'] },
  { key: 'zapier',         name: 'Zapier',               category: 'automation',    description: 'Connect with 5,000+ apps via automated workflows', features: ['Workflow Automation', 'Multi-app Integration', 'Custom Triggers'] },
  { key: 'google-drive',   name: 'Google Drive',         category: 'storage',       description: 'Cloud storage for documents and files', features: ['File Storage', 'Document Sharing', 'Real-time Collaboration'] },
  { key: 'dropbox',        name: 'Dropbox',              category: 'storage',       description: 'Secure file storage and sharing', features: ['File Sync', 'Team Folders', 'Version History'] },
  { key: 'docusign',       name: 'DocuSign',             category: 'documents',     description: 'Electronic signature and document management', features: ['E-Signatures', 'Document Templates', 'Audit Trail'] },
];

/** GET /api/integrations — list all integrations merged with DB state */
export const listIntegrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dbRows = await prisma.integration.findMany();
    const dbMap = new Map(dbRows.map(r => [r.key, r]));

    const result = CATALOG.map(item => {
      const db = dbMap.get(item.key);
      return {
        ...item,
        id: db?.id ?? null,
        isActive: db?.isActive ?? false,
        lastSyncAt: db?.lastSyncAt ?? null,
        hasConfig: !!db?.config,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('listIntegrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

/** POST /api/integrations/:key/connect — enable an integration */
export const connectIntegration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { config } = req.body; // optional JSON config (api key, token, etc.)

    const catalogItem = CATALOG.find(c => c.key === key);
    if (!catalogItem) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    const integration = await prisma.integration.upsert({
      where: { key },
      update: {
        isActive: true,
        config: config ? JSON.stringify(config) : undefined,
        updatedAt: new Date(),
      },
      create: {
        key,
        name: catalogItem.name,
        category: catalogItem.category,
        description: catalogItem.description,
        isActive: true,
        config: config ? JSON.stringify(config) : null,
      },
    });

    res.json({ success: true, integration: { ...integration, config: undefined } });
  } catch (error) {
    console.error('connectIntegration error:', error);
    res.status(500).json({ error: 'Failed to connect integration' });
  }
};

/** POST /api/integrations/:key/disconnect — disable an integration */
export const disconnectIntegration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const existing = await prisma.integration.findUnique({ where: { key } });
    if (!existing) {
      res.status(404).json({ error: 'Integration not found or not connected' });
      return;
    }

    const integration = await prisma.integration.update({
      where: { key },
      data: { isActive: false, config: null, updatedAt: new Date() },
    });

    res.json({ success: true, integration: { ...integration, config: undefined } });
  } catch (error) {
    console.error('disconnectIntegration error:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
};

/** PUT /api/integrations/:key/config — update config (api keys, tokens) */
export const updateIntegrationConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      res.status(400).json({ error: 'config object is required' });
      return;
    }

    const existing = await prisma.integration.findUnique({ where: { key } });
    if (!existing) {
      res.status(404).json({ error: 'Integration not connected' });
      return;
    }

    await prisma.integration.update({
      where: { key },
      data: { config: JSON.stringify(config), updatedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('updateIntegrationConfig error:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
};

/** POST /api/integrations/:key/sync — trigger a manual sync (records timestamp) */
export const syncIntegration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const existing = await prisma.integration.findUnique({ where: { key } });
    if (!existing || !existing.isActive) {
      res.status(404).json({ error: 'Integration not active' });
      return;
    }

    await prisma.integration.update({
      where: { key },
      data: { lastSyncAt: new Date(), updatedAt: new Date() },
    });

    res.json({ success: true, syncedAt: new Date() });
  } catch (error) {
    console.error('syncIntegration error:', error);
    res.status(500).json({ error: 'Failed to sync integration' });
  }
};
