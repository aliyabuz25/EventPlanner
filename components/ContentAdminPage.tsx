import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Blocks,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  History,
  Home,
  Megaphone,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users
} from 'lucide-react';
import bootstrapCssUrl from 'bootstrap/dist/css/bootstrap.min.css?url';
import { GiOctopus } from 'react-icons/gi';
import { useSiteContent } from '../contexts/SiteContentContext';
import { fallbackIcon, iconOptions, resolveIcon } from './iconRegistry';
import { siteContentSeed } from '../shared/siteContentSeed';
import {
  AiExplorerReport,
  fetchAiExplorerReports,
  fetchSiteDocumentRevisions,
  sendSmtpTestEmail,
  SiteDocumentRevision,
  uploadMedia
} from '../services/siteContentService';
import './content-admin.css';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface AdminItem {
  key: string;
  title: string;
  description: string;
  group: string;
}

interface RevisionDiffItem {
  path: string;
  previousValue: unknown;
  nextValue: unknown;
}

interface SearchableAdminItem extends AdminItem {
  searchText: string;
}

interface SearchResultItem {
  key: string;
  title: string;
  group: string;
  path: string;
  snippet: string;
}

interface SmtpDraftConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  recipientEmail: string;
  testRecipientEmail: string;
}

interface AdminToastState {
  message: string;
  tone: 'success' | 'error';
}

const AI_REPORTS_KEY = 'aiReports';
const HIDDEN_ADMIN_KEYS = new Set(['pages.sapBusinessOne']);

const OctopusMark: React.FC = () => <GiOctopus size={20} aria-hidden />;

const labels: Record<string, { title: string; description: string; group: string }> = {
  global: { title: 'Global Settings', description: 'Company identity, contact channels, branding and shared CTA settings.', group: 'Core' },
  aiReports: { title: 'AI Explorer Logs', description: 'AI Explorer sessions, extracted briefs, user-agent and timestamps.', group: 'Core' },
  siteMap: { title: 'Routes & Pages', description: 'Public routes, slugs, titles and page descriptions.', group: 'Core' },
  navigation: { title: 'Navigation', description: 'Top navbar, footer links and solution dropdown items.', group: 'Core' },
  customPages: { title: 'Custom Pages', description: 'Extra pages created from the admin panel.', group: 'Core' },
  'pages.home': { title: 'Home Page', description: 'Homepage hero, services, ecosystem cards and shared contact block.', group: 'Pages' },
  'pages.campaign': { title: 'Campaign Banner', description: 'Homepage promo band and CTA copy.', group: 'Pages' },
  'pages.about': { title: 'About Page', description: 'About story, mission, values and process timeline.', group: 'Pages' },
  'pages.corporateStandards': { title: 'Privacy & Standards', description: 'Trust, privacy and operational standards content.', group: 'Pages' },
  'pages.survey': { title: 'Event Finder', description: 'Interactive advisor text, quick-match questions and recommendation copy.', group: 'Pages' },
  'pages.services': { title: 'Services Page', description: 'Delivery phases, setup flow and support cards.', group: 'Pages' },
  'pages.team': { title: 'OnSite Team Page', description: 'Team image, principles and event-operations CTA content.', group: 'Pages' },
  'pages.sapBusinessOne': { title: 'Legacy Showcase Page', description: 'Hidden legacy landing page content that still exists in the app.', group: 'Pages' },
  'pages.solutions': { title: 'Solutions Catalog', description: 'Module grid and solution summary cards.', group: 'Pages' },
  solutionDetails: { title: 'Solution Detail Pages', description: 'All FastLane module detail texts, benefits and CTA blocks.', group: 'Pages' }
};

const shortLabels: Record<string, string> = {
  global: 'Core',
  aiReports: 'AI',
  siteMap: 'Map',
  navigation: 'Nav',
  customPages: 'Pages',
  'pages.home': 'Home',
  'pages.campaign': 'Camp',
  'pages.about': 'About',
  'pages.corporateStandards': 'Stand',
  'pages.survey': 'AI',
  'pages.services': 'Svc',
  'pages.team': 'Team',
  'pages.sapBusinessOne': 'SAP',
  'pages.solutions': 'Sol',
  solutionDetails: 'Detail'
};

const groupIcons = {
  Core: Globe,
  Pages: FileText,
  Other: Settings2
};

const itemIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  global: Settings2,
  aiReports: Sparkles,
  siteMap: Network,
  navigation: Globe,
  customPages: FileText,
  'pages.home': Home,
  'pages.campaign': Megaphone,
  'pages.about': FileText,
  'pages.corporateStandards': ShieldCheck,
  'pages.survey': Sparkles,
  'pages.services': Briefcase,
  'pages.team': Users,
  'pages.sapBusinessOne': Blocks,
  'pages.solutions': ClipboardList,
  solutionDetails: FileText
};

const readableReportLines = (report: AiExplorerReport) => {
  const brief = report.brief;
  return [
    brief?.eventDates ? `Event tarihi: ${brief.eventDates}` : '',
    brief?.checkInScenario ? `Check-in senaryosu: ${brief.checkInScenario}` : '',
    brief?.supportLevel ? `Destek seviyesi: ${brief.supportLevel}` : '',
    brief?.softwareNeeds?.length ? `Yazılım ihtiyaçları: ${brief.softwareNeeds.join(', ')}` : '',
    brief?.integrations?.length ? `Entegrasyonlar: ${brief.integrations.join(', ')}` : '',
    brief?.missingItems?.length ? `Eksik kalan noktalar: ${brief.missingItems.join(', ')}` : '',
    brief?.nextStep ? `Sonraki adım: ${brief.nextStep}` : ''
  ].filter(Boolean);
};

const isObject = (value: JsonValue): value is Record<string, JsonValue> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const prettifyLabel = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_.-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const friendlyFieldLabel = (path: Array<string | number>, key: string) => {
  const pathString = [...path, key].filter((part) => typeof part === 'string').join('.');

  if (key === 'primaryCta' || key === 'ctaText') {
    return 'Primary Button Text';
  }

  if (key === 'secondaryCta') {
    return 'Secondary Button Text';
  }

  if (key === 'primaryText') {
    return 'Primary Button Label';
  }

  if (key === 'secondaryText') {
    return 'Secondary Button Label';
  }

  if (key === 'buttonText') {
    return pathString.includes('.cta.') ? 'CTA Button Text' : 'Button Text';
  }

  if (key === 'primaryHref' || key === 'ctaHref') {
    return 'Primary Button URL';
  }

  if (key === 'secondaryHref') {
    return 'Secondary Button URL';
  }

  if (key === 'buttonHref') {
    return pathString.includes('.cta.') ? 'CTA Button URL' : 'Button URL';
  }

  if (key === 'submitText') {
    return 'Submit Button Text';
  }

  return prettifyLabel(key);
};

const fieldHelpText = (path: Array<string | number>, key: string) => {
  const pathString = [...path, key].filter((part) => typeof part === 'string').join('.');

  if (key === 'primaryCta' || key === 'secondaryCta' || key === 'buttonText' || key === 'ctaText' || key === 'primaryText' || key === 'secondaryText' || key === 'submitText') {
    return 'This is the button label shown on the live site.';
  }

  if (key === 'primaryHref' || key === 'secondaryHref' || key === 'buttonHref' || key === 'ctaHref') {
    return 'You can type a URL manually or choose an existing site path below.';
  }

  if (isMediaField(key, '')) {
    return 'Upload a file or paste a direct media URL.';
  }

  if (isIconField(key, '')) {
    return 'Pick an icon visually or type a Lucide icon name.';
  }

  if (pathString.includes('.form.')) {
    return 'This text appears inside the public inquiry form.';
  }

  if (pathString.startsWith('smtp.')) {
    return 'This field is used by the website form delivery system.';
  }

  return null;
};

const sectionHelpText = (path: Array<string | number>, key: string) => {
  const pathString = [...path, key].filter((part) => typeof part === 'string').join('.');

  const helpMap: Record<string, string> = {
    hero: 'Main hero content shown at the top of the page.',
    about: 'About section content, cards and CTA settings.',
    services: 'Service cards and service section CTA content.',
    contact: 'Shared contact page/form copy and field labels.',
    branding: 'Site title, logo and icon settings.',
    company: 'Company identity, contact and profile details.',
    navigation: 'Header and footer navigation content.',
    footer: 'Footer links and supporting navigation items.',
    cta: 'Call to action area with button labels and links.',
    timeline: 'Timeline years, labels and descriptions.',
    transparency: 'Transparency and ethics section text.',
    inquiryCard: 'Contact card content for compliance inquiries.',
    webInterface: 'Legacy showcase section content.',
    analytics: 'Legacy analytics section copy and cards.',
    innovation: 'Legacy innovation section content.',
    industries: 'Legacy industry cards and ecosystem labels.',
    deployment: 'Legacy deployment options, labels and descriptions.',
    visual: 'Hero visual media for the floating dashboard composition.',
    form: 'Inquiry form field labels and placeholders.'
  };

  if (helpMap[key]) {
    return helpMap[key];
  }

  if (pathString.endsWith('.sections')) {
    return 'This section groups the content blocks used on the live page.';
  }

  return null;
};

const getEntryPriority = (key: string, value: JsonValue) => {
  if (/^(badge|eyebrow|title|titleLines|titleHighlight|subtitle|description|intro|quote|label)$/i.test(key)) {
    return 1;
  }

  if (/^(primaryCta|secondaryCta|buttonText|ctaText|primaryText|secondaryText|submitText)$/i.test(key)) {
    return 2;
  }

  if (/^(primaryHref|secondaryHref|buttonHref|ctaHref)$/i.test(key)) {
    return 3;
  }

  if (isMediaField(key, value)) {
    return 4;
  }

  if (isIconField(key, value)) {
    return 5;
  }

  if (!Array.isArray(value) && !isObject(value)) {
    return 6;
  }

  return 7;
};

const sortObjectEntries = (entries: Array<[string, JsonValue]>) =>
  [...entries].sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    const leftPriority = getEntryPriority(leftKey, leftValue);
    const rightPriority = getEntryPriority(rightKey, rightValue);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return leftKey.localeCompare(rightKey);
  });

const cloneJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const getSeedDocumentValue = (key: string): unknown => {
  const parts = key.split('.');
  let current: any = siteContentSeed;

  for (const part of parts) {
    current = current?.[part];
  }

  return cloneJson(current ?? {});
};

const valuesAreEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

const formatDiffValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null || value === undefined) {
    return 'Empty';
  }

  const serialized = JSON.stringify(value);
  return serialized.length > 160 ? `${serialized.slice(0, 157)}...` : serialized;
};

const getRevisionActionLabel = (action: string) => {
  if (action === 'restore') {
    return 'Restored version';
  }

  return 'Content updated';
};

const buildSearchIndex = (value: unknown, basePath = ''): string[] => {
  if (value === null || value === undefined) {
    return basePath ? [basePath] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => buildSearchIndex(item, basePath ? `${basePath}.${index}` : String(index)));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      buildSearchIndex(child, basePath ? `${basePath}.${key}` : key)
    );
  }

  return [basePath, String(value)];
};

const buildSearchEntries = (value: unknown, basePath = ''): Array<{ path: string; snippet: string; searchText: string }> => {
  if (value === null || value === undefined) {
    return basePath ? [{ path: basePath, snippet: 'Empty', searchText: `${basePath} empty` }] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => buildSearchEntries(item, basePath ? `${basePath}.${index}` : String(index)));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      buildSearchEntries(child, basePath ? `${basePath}.${key}` : key)
    );
  }

  const snippet = String(value);
  return [
    {
      path: basePath || 'value',
      snippet,
      searchText: `${basePath} ${snippet}`.toLowerCase()
    }
  ];
};

const collectRevisionDiffs = (previousValue: unknown, nextValue: unknown, basePath = ''): RevisionDiffItem[] => {
  if (valuesAreEqual(previousValue, nextValue)) {
    return [];
  }

  const previousIsArray = Array.isArray(previousValue);
  const nextIsArray = Array.isArray(nextValue);

  if (previousIsArray || nextIsArray) {
    return [
      {
        path: basePath || 'document',
        previousValue,
        nextValue
      }
    ];
  }

  const previousIsObject =
    previousValue === undefined || previousValue === null ? true : Boolean(previousValue) && typeof previousValue === 'object';
  const nextIsObject =
    nextValue === undefined || nextValue === null ? true : Boolean(nextValue) && typeof nextValue === 'object';

  if (previousIsObject && nextIsObject) {
    const previousRecord = (previousValue ?? {}) as Record<string, unknown>;
    const nextRecord = (nextValue ?? {}) as Record<string, unknown>;
    const keys = new Set([...Object.keys(previousRecord), ...Object.keys(nextRecord)]);

    return [...keys].flatMap((key) =>
      collectRevisionDiffs(previousRecord[key], nextRecord[key], basePath ? `${basePath}.${key}` : key)
    );
  }

  return [
    {
      path: basePath || 'document',
      previousValue,
      nextValue
    }
  ];
};

const countLeafFields = (value: JsonValue): number => {
  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + countLeafFields(item), 0);
  }

  if (isObject(value)) {
    return Object.values(value).reduce<number>((total, item) => total + countLeafFields(item), 0);
  }

  return 1;
};

const mediaFieldPattern = /(image|video|poster|thumbnail|cover|banner|gallery|src|media|favicon|logo|appleTouch)/i;
const isMediaField = (label: string, value: JsonValue) => typeof value === 'string' && mediaFieldPattern.test(label);
const isIconField = (label: string, value: JsonValue) => typeof value === 'string' && /icon/i.test(label);
const isUrlField = (label: string, value: JsonValue) => typeof value === 'string' && /(href|url|link|route|path)$/i.test(label) && !isMediaField(label, value);
const isVideoValue = (value: string) => /\.(mp4|webm|mov|m4v|ogv|ogg)(\?.*)?$/i.test(value);
const getByPath = (value: JsonValue, path: Array<string | number>): JsonValue =>
  path.reduce<JsonValue>((current, part) => {
    if (Array.isArray(current) && typeof part === 'number') {
      return current[part];
    }

    if (isObject(current) && typeof part === 'string') {
      return current[part];
    }

    return current;
  }, value);

const setByPath = (value: JsonValue, path: Array<string | number>, nextValue: JsonValue): JsonValue => {
  const root = cloneJson(value);

  if (path.length === 0) {
    return nextValue;
  }

  let current: any = root;
  for (let index = 0; index < path.length - 1; index += 1) {
    current = current[path[index] as any];
  }

  current[path[path.length - 1] as any] = nextValue;
  return root;
};

const removeByPath = (value: JsonValue, path: Array<string | number>): JsonValue => {
  const root = cloneJson(value);
  let current: any = root;

  for (let index = 0; index < path.length - 1; index += 1) {
    current = current[path[index] as any];
  }

  const target = path[path.length - 1];
  if (Array.isArray(current) && typeof target === 'number') {
    current.splice(target, 1);
  } else {
    delete current[target as any];
  }

  return root;
};

const addArrayItem = (value: JsonValue, path: Array<string | number>, item: JsonValue): JsonValue => {
  const root = cloneJson(value);
  const target = getByPath(root, path);
  if (Array.isArray(target)) {
    target.push(item);
  }
  return root;
};

const defaultItemFromArray = (items: JsonValue[]) => {
  const sample = items[0];
  if (typeof sample === 'string') return 'New item';
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  if (sample === null || sample === undefined) return '';
  if (Array.isArray(sample)) return [];
  return Object.fromEntries(Object.keys(sample).map((key) => [key, ''])) as JsonValue;
};

const ScalarField: React.FC<{
  label: string;
  value: string | number | boolean | null;
  onChange: (value: JsonValue) => void;
  pathKey?: string;
  isHighlighted?: boolean;
  helpText?: string | null;
}> = ({ label, value, onChange, pathKey, isHighlighted, helpText }) => {
  if (typeof value === 'boolean') {
    return (
      <label
        data-oc-field-path={pathKey}
        className={`oc-admin-field-shell d-flex align-items-center justify-content-between gap-3 ${isHighlighted ? 'oc-admin-search-hit' : ''}`}
      >
        <span>
          <span className="fw-medium text-dark d-block">{label}</span>
          {helpText ? <span className="oc-admin-field-help d-block mt-1">{helpText}</span> : null}
        </span>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="form-check-input m-0" />
      </label>
    );
  }

  const stringValue = value === null ? '' : String(value);
  const multiline = stringValue.length > 100 || stringValue.includes('\n');
  const isSecret = /password|secret/i.test(pathKey ?? label);

  return (
    <label data-oc-field-path={pathKey} className={`d-block oc-admin-field-shell ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="oc-admin-section-title mb-2">{label}</div>
      {helpText ? <div className="oc-admin-field-help mb-2">{helpText}</div> : null}
      {multiline ? (
        <textarea value={stringValue} onChange={(e) => onChange(e.target.value)} rows={4} className="form-control" />
      ) : (
        <input
          type={isSecret ? 'password' : 'text'}
          value={stringValue}
          onChange={(e) => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)}
          className="form-control"
        />
      )}
    </label>
  );
};

const SmtpWizardCard: React.FC<{
  smtp: SmtpDraftConfig;
  onChange: (path: Array<string | number>, value: JsonValue) => void;
  onStatus: (message: string, tone?: 'success' | 'error') => void;
}> = ({ smtp, onChange, onStatus }) => {
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleTest = async () => {
    try {
      setIsSendingTest(true);
      const result = await sendSmtpTestEmail(smtp);
      onStatus(result.message, 'success');
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'SMTP test failed', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="card oc-admin-card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
          <div>
            <div className="oc-admin-section-title mb-1">SMTP Setup Wizard</div>
            <div className="small text-secondary">Configure the mail server once. All site form submissions will be delivered to the configured inbox.</div>
          </div>
          <label className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" checked={smtp.enabled} onChange={(e) => onChange(['smtp', 'enabled'], e.target.checked)} />
          </label>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <div className="oc-admin-field-help mb-2">Step 1. Sender Identity</div>
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="From Name" value={smtp.fromName} pathKey="smtp.fromName" helpText="Displayed as the sender name in inboxes." onChange={(value) => onChange(['smtp', 'fromName'], value)} />
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="From Email" value={smtp.fromEmail} pathKey="smtp.fromEmail" helpText="This must usually match your SMTP account or allowed sender domain." onChange={(value) => onChange(['smtp', 'fromEmail'], value)} />
          </div>

          <div className="col-12 mt-2">
            <div className="oc-admin-field-help mb-2">Step 2. Mail Server</div>
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="SMTP Host" value={smtp.host} pathKey="smtp.host" helpText="Example: `smtp.gmail.com` or your company mail host." onChange={(value) => onChange(['smtp', 'host'], value)} />
          </div>
          <div className="col-12 col-md-3">
            <ScalarField label="Port" value={smtp.port} pathKey="smtp.port" helpText="Usually `587` for TLS or `465` for SSL." onChange={(value) => onChange(['smtp', 'port'], value)} />
          </div>
          <div className="col-12 col-md-3">
            <ScalarField label="Secure SSL" value={smtp.secure} pathKey="smtp.secure" helpText="Turn on for port 465." onChange={(value) => onChange(['smtp', 'secure'], value)} />
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="SMTP Username" value={smtp.username} pathKey="smtp.username" helpText="The username used to authenticate with your mail server." onChange={(value) => onChange(['smtp', 'username'], value)} />
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="SMTP Password" value={smtp.password} pathKey="smtp.password" helpText="Stored in content for now, so use a dedicated app password." onChange={(value) => onChange(['smtp', 'password'], value)} />
          </div>

          <div className="col-12 mt-2">
            <div className="oc-admin-field-help mb-2">Step 3. Delivery Inbox</div>
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="Recipient Email" value={smtp.recipientEmail} pathKey="smtp.recipientEmail" helpText="All live contact form submissions will be delivered here." onChange={(value) => onChange(['smtp', 'recipientEmail'], value)} />
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="Test Recipient Email" value={smtp.testRecipientEmail} pathKey="smtp.testRecipientEmail" helpText="Used by the test button below." onChange={(value) => onChange(['smtp', 'testRecipientEmail'], value)} />
          </div>
        </div>

        <div className="mt-4 d-flex flex-wrap gap-2">
          <button type="button" onClick={handleTest} disabled={isSendingTest} className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <Send className="h-4 w-4" />
            {isSendingTest ? 'Sending Test...' : 'Send Test Email'}
          </button>
          <div className="small text-secondary align-self-center">Save the document after a successful test to make the site forms use this configuration.</div>
        </div>
      </div>
    </div>
  );
};

const UrlField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  routeOptions: Array<{ label: string; value: string }>;
  pathKey?: string;
  isHighlighted?: boolean;
  helpText?: string | null;
}> = ({ label, value, onChange, routeOptions, pathKey, isHighlighted, helpText }) => {
  const matchingOption = routeOptions.find((option) => option.value === value)?.value ?? '';

  return (
    <label data-oc-field-path={pathKey} className={`d-block oc-admin-field-shell ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="oc-admin-section-title mb-2">{label}</div>
      {helpText ? <div className="oc-admin-field-help mb-2">{helpText}</div> : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        placeholder="URL or internal route"
      />
      <select
        value={matchingOption}
        onChange={(e) => {
          if (e.target.value) {
            onChange(e.target.value);
          }
        }}
        className="form-select mt-2"
      >
        <option value="">Select an existing site path</option>
        {routeOptions.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

const MediaField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  pathKey?: string;
  isHighlighted?: boolean;
}> = ({ label, value, onChange, pathKey, isHighlighted }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [localPreviewKind, setLocalPreviewKind] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviewUrl((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return previewUrl;
      });
      setLocalPreviewKind(file.type.startsWith('video/') ? 'video' : 'image');
      const result = await uploadMedia(file);
      onChange(result.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const previewSource = localPreviewUrl || value;
  const hasPreview = Boolean(previewSource);
  const previewIsVideo = localPreviewKind ? localPreviewKind === 'video' : isVideoValue(value);

  return (
    <div data-oc-field-path={pathKey} className={`card oc-admin-editor-card ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="card-body">
        <div className="oc-admin-section-title mb-2">{label}</div>
        <div className="oc-admin-field-help mb-2">Upload a file or paste a direct media URL.</div>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="form-control" placeholder="Media URL" />
        <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
          <label className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <Plus className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload File'}
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="d-none" />
          </label>
          {localPreviewUrl && <div className="small text-primary">Previewing selected file</div>}
          {uploadError && <div className="small text-danger">{uploadError}</div>}
        </div>
        {hasPreview ? (
          <div className="mt-4 border rounded-3 p-3 bg-light">
            {previewIsVideo ? (
              <video src={previewSource} controls className="w-100 rounded" style={{ maxHeight: 288, background: '#000' }} />
            ) : (
              <img src={previewSource} alt={label} className="w-100 rounded object-fit-cover" style={{ maxHeight: 288 }} />
            )}
          </div>
        ) : (
          <div className="mt-3 oc-admin-media-hint">Upload a file or paste a media URL to see a preview.</div>
        )}
      </div>
    </div>
  );
};

const IconField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  pathKey?: string;
  isHighlighted?: boolean;
}> = ({ label, value, onChange, pathKey, isHighlighted }) => {
  const PreviewIcon = resolveIcon(value);

  return (
    <div data-oc-field-path={pathKey} className={`card oc-admin-editor-card ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="card-body">
        <div className="oc-admin-section-title mb-2">{label}</div>
        <div className="oc-admin-field-help mb-2">Pick an icon visually or type a Lucide icon name.</div>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-3 border bg-light" style={{ width: 52, height: 52 }}>
            <PreviewIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="small text-secondary">Current icon preview</div>
        </div>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          list="oc-admin-icon-options"
          className="form-control"
          placeholder="Lucide icon name"
        />
        <datalist id="oc-admin-icon-options">
          {iconOptions.map((iconName) => (
            <option key={iconName} value={iconName} />
          ))}
        </datalist>

        <div className="mt-3 d-flex flex-wrap gap-2">
          {iconOptions.slice(0, 12).map((iconName) => {
            const OptionIcon = resolveIcon(iconName) ?? fallbackIcon;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onChange(iconName)}
                className={`btn btn-sm ${value === iconName ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-2`}
              >
                <OptionIcon className="h-4 w-4" />
                {iconName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ObjectEditor: React.FC<{
  value: JsonValue;
  path?: Array<string | number>;
  label?: string;
  onChange: (path: Array<string | number>, value: JsonValue) => void;
  onRemove: (path: Array<string | number>) => void;
  onAddArrayItem: (path: Array<string | number>, value: JsonValue) => void;
  depth?: number;
  highlightedPath?: string | null;
  routeOptions: Array<{ label: string; value: string }>;
}> = ({ value, path = [], label, onChange, onRemove, onAddArrayItem, depth = 0, highlightedPath = null, routeOptions }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (Array.isArray(value)) {
    const title = label ?? 'Items';
    const arrayPathKey = path.join('.');
    const isOpen = !collapsed[arrayPathKey];
    const primitiveArray = value.every((item) => !Array.isArray(item) && !isObject(item));

    return (
      <div className="card oc-admin-editor-card">
        <button
          onClick={() => setCollapsed((prev) => ({ ...prev, [arrayPathKey]: !prev[arrayPathKey] }))}
          className="btn btn-link text-decoration-none text-start d-flex align-items-center justify-content-between px-4 py-3 text-dark"
        >
          <div>
            <div className="fw-semibold">{title}</div>
            <div className="small text-secondary">{value.length} item</div>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {isOpen && (
          <div className="card-body border-top d-grid gap-3">
            {value.map((item, index) => (
              <div key={`${arrayPathKey}-${index}`} className="border rounded-3 p-3 bg-light">
                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <div className="oc-admin-section-title">
                    {primitiveArray
                      ? `${title} ${index + 1}`
                      : prettifyLabel(String((item as any)?.title ?? (item as any)?.name ?? `Item ${index + 1}`))}
                  </div>
                  <button onClick={() => onRemove([...path, index])} className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                {primitiveArray ? (
                  <ScalarField
                    label={prettifyLabel(`${title} ${index + 1}`)}
                    value={item as string | number | boolean | null}
                    pathKey={[...path, index].join('.')}
                    isHighlighted={highlightedPath === [...path, index].join('.')}
                    onChange={(next) => onChange([...path, index], next)}
                  />
                ) : (
                  <ObjectEditor value={item} path={[...path, index]} onChange={onChange} onRemove={onRemove} onAddArrayItem={onAddArrayItem} depth={depth + 1} highlightedPath={highlightedPath} routeOptions={routeOptions} />
                )}
              </div>
            ))}

            <button onClick={() => onAddArrayItem(path, defaultItemFromArray(value))} className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isObject(value)) {
    const entries = sortObjectEntries(Object.entries(value));

    return (
      <div className={depth === 0 ? 'd-grid gap-4' : 'd-grid gap-3'}>
        {entries.map(([key, child]) => {
          if (depth === 0 && path.length === 0 && key === 'smtp') {
            return null;
          }

          const childPath = [...path, key];
          const cardLike = Array.isArray(child) || isObject(child);

          if (!cardLike) {
            if (isMediaField(key, child)) {
              return <MediaField key={childPath.join('.')} label={friendlyFieldLabel(path, key)} value={(child as string) ?? ''} pathKey={childPath.join('.')} isHighlighted={highlightedPath === childPath.join('.')} onChange={(next) => onChange(childPath, next)} />;
            }

            if (isIconField(key, child)) {
              return <IconField key={childPath.join('.')} label={friendlyFieldLabel(path, key)} value={(child as string) ?? ''} pathKey={childPath.join('.')} isHighlighted={highlightedPath === childPath.join('.')} onChange={(next) => onChange(childPath, next)} />;
            }

            if (isUrlField(key, child)) {
              return (
                <UrlField
                  key={childPath.join('.')}
                  label={friendlyFieldLabel(path, key)}
                  value={(child as string) ?? ''}
                  pathKey={childPath.join('.')}
                  isHighlighted={highlightedPath === childPath.join('.')}
                  helpText={fieldHelpText(path, key)}
                  routeOptions={routeOptions}
                  onChange={(next) => onChange(childPath, next)}
                />
              );
            }

            return (
              <ScalarField
                key={childPath.join('.')}
                label={friendlyFieldLabel(path, key)}
                value={child as string | number | boolean | null}
                pathKey={childPath.join('.')}
                isHighlighted={highlightedPath === childPath.join('.')}
                helpText={fieldHelpText(path, key)}
                onChange={(next) => onChange(childPath, next)}
              />
            );
          }

          return (
            <div key={childPath.join('.')} data-oc-field-path={childPath.join('.')} className={`card oc-admin-editor-card ${highlightedPath === childPath.join('.') ? 'oc-admin-search-hit' : ''}`}>
              <div className="card-header bg-white">
                <div className="fw-semibold text-dark">{friendlyFieldLabel(path, key)}</div>
                {sectionHelpText(path, key) ? <div className="oc-admin-field-help mt-1">{sectionHelpText(path, key)}</div> : null}
              </div>
              <div className="card-body">
                <ObjectEditor value={child} path={childPath} label={friendlyFieldLabel(path, key)} onChange={onChange} onRemove={onRemove} onAddArrayItem={onAddArrayItem} depth={depth + 1} highlightedPath={highlightedPath} routeOptions={routeOptions} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <ScalarField label={label ?? 'Value'} value={value as string | number | boolean | null} onChange={(next) => onChange(path, next)} />;
};

const ContentAdminPage: React.FC = () => {
  const { content, editableDocumentKeys, saveDocument, restoreDocument, lastSavedAt } = useSiteContent();
  const items = useMemo<SearchableAdminItem[]>(
    () =>
      [AI_REPORTS_KEY, ...editableDocumentKeys]
        .filter((key) => !HIDDEN_ADMIN_KEYS.has(key))
        .map((key) => {
        const parts = key.split('.');
        let value: any = content;

        if (key === AI_REPORTS_KEY) {
          value = { reports: 'AI usage history and generated event briefs' };
        } else {
          for (const part of parts) {
            value = value?.[part];
          }
        }

        const title = labels[key]?.title ?? prettifyLabel(key);
        const description = labels[key]?.description ?? 'Editable content document.';
        const group = labels[key]?.group ?? 'Other';
        const searchText = [
          key,
          title,
          description,
          group,
          ...buildSearchIndex(value)
        ]
          .join(' ')
          .toLowerCase();

        return {
          key,
          title,
          description,
          group,
          searchText
        };
      }),
    [content, editableDocumentKeys]
  );

  const [selectedKey, setSelectedKey] = useState(items[0]?.key ?? 'global');
  const [draft, setDraft] = useState<JsonValue>(content.global as JsonValue);
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSearchPath, setActiveSearchPath] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [revisions, setRevisions] = useState<SiteDocumentRevision[]>([]);
  const [aiReports, setAiReports] = useState<AiExplorerReport[]>([]);
  const [isLoadingAiReports, setIsLoadingAiReports] = useState(false);
  const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
  const [isRestoringRevisionId, setIsRestoringRevisionId] = useState<number | null>(null);
  const routeOptions = useMemo(
    () => [
      ...content.siteMap.map((entry) => ({
        label: `${entry.title} (${entry.slug === 'home' ? '/' : `/${entry.slug}`})`,
        value: entry.slug === 'home' ? '/' : `/${entry.slug}`
      })),
      { label: 'About Section (/#about)', value: '/#about' },
      { label: 'Services Section (/#services)', value: '/#services' },
      { label: 'Solutions Section (/#solutions)', value: '/#solutions' },
      { label: 'Contact Page (/kontakt)', value: '/kontakt' },
      { label: 'mailto:', value: 'mailto:' },
      { label: 'https://', value: 'https://' }
    ],
    [content.siteMap]
  );

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = bootstrapCssUrl;
    link.dataset.ocAdminBootstrap = 'true';
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  useEffect(() => {
    if (!items.some((item) => item.key === selectedKey)) {
      setSelectedKey(items[0]?.key ?? 'global');
    }
  }, [items, selectedKey]);

  const selectedValue = useMemo(() => {
    if (selectedKey === AI_REPORTS_KEY) {
      return {} as JsonValue;
    }

    const parts = selectedKey.split('.');
    let result: any = content;
    for (const part of parts) {
      result = result?.[part];
    }
    return cloneJson((result ?? {}) as JsonValue);
  }, [content, selectedKey]);

  const selectedItem = items.find((item) => item.key === selectedKey);
  const isAiReportsView = selectedKey === AI_REPORTS_KEY;
  const smtpDraft = selectedKey === 'global' && isObject(draft) && isObject(draft.smtp) ? (draft.smtp as unknown as SmtpDraftConfig) : undefined;
  const fieldCount = useMemo(() => countLeafFields(draft), [draft]);
  const docCount = items.length;
  const selectedGroupCount = useMemo(() => items.filter((item) => item.group === selectedItem?.group).length, [items, selectedItem]);

  useEffect(() => {
    setDraft(selectedValue);
    setStatus(null);
  }, [selectedValue, selectedKey]);

  useEffect(() => {
    if (!activeSearchPath) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const selector = `[data-oc-field-path="${activeSearchPath.replace(/"/g, '\\"')}"]`;
      const target = document.querySelector(selector);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeSearchPath, selectedKey, draft]);

  useEffect(() => {
    if (selectedKey === AI_REPORTS_KEY) {
      setRevisions([]);
      setIsLoadingRevisions(false);
      return;
    }

    let isMounted = true;

    setIsLoadingRevisions(true);
    fetchSiteDocumentRevisions(selectedKey, 12)
      .then((response) => {
        if (isMounted) {
          setRevisions(response.revisions);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRevisions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRevisions(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedKey, lastSavedAt]);

  useEffect(() => {
    if (selectedKey !== AI_REPORTS_KEY) {
      return;
    }

    let isMounted = true;
    setIsLoadingAiReports(true);

    fetchAiExplorerReports(100)
      .then((response) => {
        if (isMounted) {
          setAiReports(response.reports);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAiReports([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAiReports(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedKey, lastSavedAt]);

  const groupedItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const terms = normalizedSearch.split(/\s+/).filter(Boolean);
    const filtered = terms.length === 0
      ? items
      : items.filter((item) => terms.every((term) => item.searchText.includes(term)));

    return filtered.reduce<Record<string, AdminItem[]>>((groups, item) => {
      groups[item.group] = groups[item.group] ?? [];
      groups[item.group].push(item);
      return groups;
    }, {});
  }, [deferredSearch, items]);

  const searchResults = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const terms = normalizedSearch.split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      return [];
    }

    return items.flatMap((item) => {
      const parts = item.key.split('.');
      let value: any = content;

      for (const part of parts) {
        value = value?.[part];
      }

      return buildSearchEntries(value)
        .filter((entry) => terms.every((term) => `${item.title} ${entry.searchText}`.includes(term)))
        .slice(0, 8)
        .map((entry) => ({
          key: item.key,
          title: item.title,
          group: item.group,
          path: entry.path,
          snippet: entry.snippet
        }));
    }).slice(0, 24);
  }, [content, deferredSearch, items]);

  const revisionDetails = useMemo(
    () =>
      revisions.map((revision, index) => {
        const previousRevision = revisions[index + 1];
        const previousValue = previousRevision?.value ?? getSeedDocumentValue(selectedKey);
        const diffs = collectRevisionDiffs(previousValue, revision.value).slice(0, 6);

        return {
          ...revision,
          diffs
        };
      }),
    [revisions, selectedKey]
  );

  const handleChange = (path: Array<string | number>, nextValue: JsonValue) => setDraft((prev) => setByPath(prev, path, nextValue));
  const handleRemove = (path: Array<string | number>) => setDraft((prev) => removeByPath(prev, path));
  const handleAddArrayItem = (path: Array<string | number>, item: JsonValue) => setDraft((prev) => addArrayItem(prev, path, item));
  const showToast = (message: string, tone: 'success' | 'error' = 'success') => setToast({ message, tone });
  const handleStatusUpdate = (message: string, tone: 'success' | 'error' = 'success') => {
    setStatus(message);
    showToast(message, tone);
  };

  const handleSave = async () => {
    if (isAiReportsView) {
      return;
    }

    try {
      setIsSaving(true);
      setStatus(null);
      await saveDocument(selectedKey, draft);
      handleStatusUpdate('Saved successfully', 'success');
    } catch (error) {
      handleStatusUpdate(error instanceof Error ? error.message : 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreRevision = async (revisionId: number) => {
    try {
      setIsRestoringRevisionId(revisionId);
      setStatus(null);
      await restoreDocument(selectedKey, revisionId);
      handleStatusUpdate(`Revision #${revisionId} restored`, 'success');
    } catch (error) {
      handleStatusUpdate(error instanceof Error ? error.message : 'Restore failed', 'error');
    } finally {
      setIsRestoringRevisionId(null);
    }
  };

  const handleSearchResultClick = (result: SearchResultItem) => {
    setSelectedKey(result.key);
    setActiveSearchPath(result.path);
    setIsSearchActive(false);
  };

  useEffect(() => {
    if (!isSearchActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="oc-admin-shell">
      {toast ? (
        <div className={`oc-admin-toast ${toast.tone === 'error' ? 'is-error' : 'is-success'}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
      {isSearchActive && (
        <div className="oc-admin-search-overlay" onClick={() => setIsSearchActive(false)}>
          <div className="oc-admin-search-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="position-relative">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-4 h-5 w-5 text-secondary" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pages, fields, text, badges, icons, media..."
                className="form-control oc-admin-search-dialog-input ps-5"
              />
            </div>

            <div className="oc-admin-search-dialog-results">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button key={`${result.key}-${result.path}-${index}`} type="button" onClick={() => handleSearchResultClick(result)} className="oc-admin-search-result">
                    <div className="oc-admin-search-result-title">{result.title}</div>
                    <div className="oc-admin-search-result-path">{result.path}</div>
                    <div className="oc-admin-search-result-snippet">{result.snippet}</div>
                  </button>
                ))
              ) : (
                <div className="oc-admin-search-empty">
                  {search.trim() ? 'No matching content found.' : 'Start typing to search the full content structure.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="oc-admin-topbar oc-admin-entrance oc-admin-entrance-topbar">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center justify-content-between gap-3 py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="oc-admin-brand-mark d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm">
                <OctopusMark />
              </div>
              <div className="oc-admin-brand-lockup">
                <div className="oc-admin-brand-kicker">Octotech CRM</div>
                <div className="oc-admin-brand-title">OCTOTECH.AZ</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="d-none d-md-block oc-admin-topbar-context">{selectedItem?.title}</div>
              <button onClick={handleSave} disabled={isSaving || isAiReportsView} className="btn btn-primary d-inline-flex align-items-center gap-2">
                <Save className="h-4 w-4" />
                {isAiReportsView ? 'Read Only' : isSaving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-0">
        <div className="row g-0">
          <aside className={`col-12 ${isSidebarCollapsed ? 'col-lg-1 col-xl-1' : 'col-lg-3 col-xl-2'} oc-admin-sidebar oc-admin-entrance oc-admin-entrance-sidebar ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
            <div className="sticky-top p-4 oc-admin-sidebar-shell" style={{ top: 73 }}>
              <div className={`oc-admin-sidebar-toolbar d-flex align-items-center gap-2 mb-3 ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
                <div className={`position-relative flex-grow-1 oc-admin-sidebar-search-wrap ${isSidebarCollapsed ? 'is-hidden' : ''}`}>
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-secondary" />
                    <input
                      value={search}
                      onFocus={() => setIsSearchActive(true)}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search pages"
                      className="form-control ps-5"
                    />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                  className="btn btn-outline-secondary oc-admin-sidebar-toggle"
                  aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
              </div>

              <div className="oc-admin-sidebar-scroll">
              <div className="d-grid gap-4">
                {(Object.entries(groupedItems) as Array<[string, AdminItem[]]>).map(([group, groupItems]) => {
                  const GroupIcon = groupIcons[group as keyof typeof groupIcons] ?? Settings2;
                  return (
                    <div key={group}>
                      <div className={`oc-admin-menu-group mb-2 d-flex align-items-center gap-2 px-2 ${isSidebarCollapsed ? 'justify-content-center' : ''}`} title={group}>
                        <GroupIcon className="h-4 w-4" />
                        {!isSidebarCollapsed ? group : null}
                      </div>
                      <div className="d-grid gap-1">
                        {groupItems.map((item) => {
                          const ItemIcon = itemIcons[item.key] ?? GroupIcon;
                          const shortLabel = shortLabels[item.key] ?? item.title.slice(0, 4);
                          return (
                            <button
                              key={item.key}
                              onClick={() => setSelectedKey(item.key)}
                              className={`oc-admin-menu-item ${selectedKey === item.key ? 'active' : ''} ${isSidebarCollapsed ? 'is-icon-only' : ''}`}
                              title={item.title}
                            >
                              <div className={`d-flex ${isSidebarCollapsed ? 'flex-column align-items-center justify-content-center' : 'align-items-start'} gap-3`}>
                                <ItemIcon className="h-4 w-4 flex-shrink-0 mt-1 oc-admin-menu-item-icon" />
                                {!isSidebarCollapsed ? (
                                  <div className="oc-admin-menu-item-copy">
                                    <div className="oc-admin-menu-item-title">{item.title}</div>
                                    <div className={`oc-admin-menu-item-description ${selectedKey === item.key ? 'is-active' : ''}`}>{item.description}</div>
                                  </div>
                                ) : (
                                  <div className="oc-admin-menu-item-mini-label">{shortLabel}</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          </aside>

          <section className={`col-12 ${isSidebarCollapsed ? 'col-lg-7 col-xl-7' : 'col-lg-5 col-xl-6'} oc-admin-main oc-admin-entrance oc-admin-entrance-main border-end`}>
            <div className="oc-admin-page-header border-bottom px-4 px-lg-5 py-4">
              <div className="oc-admin-section-title mb-2">{selectedKey}</div>
              <h2 className="fs-2 fw-bold text-dark">{selectedItem?.title}</h2>
              <p className="mt-2 mb-0 small oc-admin-muted">{selectedItem?.description}</p>
            </div>

            <div className="p-4 p-lg-5">
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="card oc-admin-card oc-admin-stat-card">
                    <div className="card-body small text-secondary">
                      {isAiReportsView ? (
                        <>Logged usages: <span className="fw-bold text-dark">{aiReports.length}</span></>
                      ) : (
                        <>Editable fields: <span className="fw-bold text-dark">{fieldCount}</span></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card oc-admin-card oc-admin-stat-card">
                    <div className="card-body small text-secondary">
                      Group: <span className="fw-bold text-dark">{selectedItem?.group}</span>
                    </div>
                  </div>
                </div>
              </div>

              {smtpDraft ? <SmtpWizardCard smtp={smtpDraft} onChange={handleChange} onStatus={handleStatusUpdate} /> : null}

            <div className="card oc-admin-card">
                <div className="card-body">
                <div className="oc-admin-editor-intro mb-4">
                  {isAiReportsView
                    ? 'Every AI assistant usage is logged here with prompt, generated event detail, user-agent and created date.'
                    : 'Edit the fields below. Changes are saved to the live content source and reflected on the site after update.'}
                </div>
                {isAiReportsView ? (
                  <div className="d-grid gap-3">
                    {isLoadingAiReports ? (
                      <div className="small text-secondary">Loading AI usage reports...</div>
                    ) : aiReports.length === 0 ? (
                      <div className="small text-secondary">No AI usage records yet.</div>
                    ) : (
                      aiReports.map((report) => (
                        <details key={report.id} className="card oc-admin-editor-card">
                          <summary className="card-body d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3" style={{ cursor: 'pointer', listStyle: 'none' }}>
                            <div className="min-w-0">
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                <span className={`badge ${report.status === 'success' ? 'text-bg-success' : 'text-bg-danger'}`}>{report.status}</span>
                                <span className="badge text-bg-light border">{report.model}</span>
                                <span className="small text-secondary">{new Date(report.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="fw-semibold text-dark">{report.eventName || report.customerName || 'Untitled AI usage'}</div>
                              <div className="small text-secondary mt-1">
                                {report.eventLocation || 'Location open'} · {report.attendees || 'Attendees open'} · {report.currentPhase || 'Phase open'}
                              </div>
                            </div>
                            <div className="small text-secondary text-break text-lg-end" style={{ maxWidth: 320 }}>
                              {report.userAgent || 'Unknown user-agent'}
                            </div>
                          </summary>
                          <div className="card-body border-top pt-4">
                            <div className="row g-3">
                              <div className="col-12 col-xl-6">
                                <div className="oc-admin-field-help mb-2">Prompt</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.userMessage}</div>
                              </div>
                              <div className="col-12 col-xl-6">
                                <div className="oc-admin-field-help mb-2">Assistant Response</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.assistantText || report.errorMessage || 'No response text.'}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">Customer</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.customerName || 'Open'}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">Event</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.eventName || 'Open'}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">Location</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.eventLocation || 'Open'}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">Created</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{new Date(report.createdAt).toLocaleString()}</div>
                              </div>
                              <div className="col-12">
                                <div className="oc-admin-field-help mb-2">User-Friendly Summary</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark d-grid gap-2">
                                  {readableReportLines(report).length > 0 ? (
                                    readableReportLines(report).map((line) => <div key={line}>{line}</div>)
                                  ) : (
                                    <div>No readable event summary available for this usage yet.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </details>
                      ))
                    )}
                  </div>
                ) : (
                  <ObjectEditor value={draft} onChange={handleChange} onRemove={handleRemove} onAddArrayItem={handleAddArrayItem} highlightedPath={activeSearchPath} routeOptions={routeOptions} />
                )}
              </div>
              </div>
            </div>
          </section>

          <aside className="col-12 col-lg-4 oc-admin-main p-4 oc-admin-right-rail oc-admin-entrance oc-admin-entrance-rail">
            <div className="sticky-top d-grid gap-4 oc-admin-right-rail-scroll" style={{ top: 89 }}>
              <div className="card oc-admin-card">
                <div className="card-header bg-white fw-semibold">Publish</div>
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 rounded-3 bg-light p-3 mb-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-success" />
                    <div>
                      <div className="fw-semibold text-dark">Status</div>
                      <div className="small text-secondary">{isAiReportsView ? 'Read-only AI report history' : status ?? 'Ready for update'}</div>
                    </div>
                  </div>

                  <div className="small text-secondary mb-3">
                    {lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleString()}` : 'This document has not been saved in this session.'}
                  </div>

                  <button onClick={handleSave} disabled={isSaving || isAiReportsView} className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2">
                    <Save className="h-4 w-4" />
                    {isAiReportsView ? 'Read Only' : isSaving ? 'Saving...' : 'Update Document'}
                  </button>
                </div>
              </div>

              <div className="card oc-admin-card">
                <div className="card-header bg-white fw-semibold">Document Summary</div>
                <div className="card-body d-grid gap-3">
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">Document key</span>
                    <span className="fw-semibold text-dark">{selectedKey}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">Group items</span>
                    <span className="fw-semibold text-dark">{selectedGroupCount}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">Total documents</span>
                    <span className="fw-semibold text-dark">{docCount}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">Leaf fields</span>
                    <span className="fw-semibold text-dark">{isAiReportsView ? aiReports.length : fieldCount}</span>
                  </div>
                </div>
              </div>

              <div className="card oc-admin-card">
                <div className="card-header bg-white fw-semibold">Editor Notes</div>
                <div className="card-body d-grid gap-3 small text-secondary">
                  <div className="d-flex align-items-start gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                    Every saved change is stored with a timestamp and can be restored.
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <History className="mt-1 h-4 w-4 text-primary" />
                    {isAiReportsView ? 'All assistant usages are logged with prompt, event detail, user-agent and timestamp.' : 'Recent changes for this document are listed below.'}
                  </div>

                  <div className="border rounded-3 bg-light p-3 oc-admin-revision-panel">
                    <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                      <div className="fw-semibold text-dark">{isAiReportsView ? 'AI Usage Summary' : 'Recent Changes'}</div>
                      <div className="small text-secondary">{isAiReportsView ? `${aiReports.length} records` : `${revisionDetails.length} records`}</div>
                    </div>
                    {isAiReportsView ? (
                      isLoadingAiReports ? (
                        <div className="small text-secondary">Loading AI reports...</div>
                      ) : (
                        <div className="d-grid gap-2 small text-secondary">
                          <div>Total uses: <span className="fw-semibold text-dark">{aiReports.length}</span></div>
                          <div>Successful: <span className="fw-semibold text-dark">{aiReports.filter((item) => item.status === 'success').length}</span></div>
                          <div>Errors: <span className="fw-semibold text-dark">{aiReports.filter((item) => item.status !== 'success').length}</span></div>
                          <div>Latest activity: <span className="fw-semibold text-dark">{aiReports[0] ? new Date(aiReports[0].createdAt).toLocaleString() : 'No activity yet'}</span></div>
                        </div>
                      )
                    ) : isLoadingRevisions ? (
                      <div className="small text-secondary">Loading revision history...</div>
                    ) : revisionDetails.length === 0 ? (
                      <div className="small text-secondary">No saved changes yet for this document.</div>
                    ) : (
                      <div className="d-grid gap-3 oc-admin-revision-list">
                        {revisionDetails.map((revision) => (
                          <div key={revision.id} className="oc-admin-revision-item">
                            <div className="oc-admin-revision-item-body">
                              <div className="min-w-0">
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                  <div className="fw-semibold text-dark">{getRevisionActionLabel(revision.action)}</div>
                                  <span className={`oc-admin-revision-badge ${revision.action === 'restore' ? 'is-restore' : 'is-update'}`}>
                                    {revision.action === 'restore' ? 'Restore' : 'Update'}
                                  </span>
                                </div>
                                <div className="small text-secondary mt-1">
                                  {new Date(revision.changedAt).toLocaleString()}
                                </div>
                                <div className="small text-secondary mt-2">
                                  {revision.summary || 'Document content changed.'}
                                </div>
                                {revision.diffs.length > 0 && (
                                  <div className="mt-3 d-grid gap-2">
                                    {revision.diffs.map((diff) => (
                                      <div key={`${revision.id}-${diff.path}`} className="oc-admin-revision-diff">
                                        <div className="oc-admin-revision-path">{diff.path}</div>
                                        <div className="small text-secondary mt-2">
                                          <div className="fw-semibold text-dark mb-1">Original</div>
                                          <div className="oc-admin-revision-value">{formatDiffValue(diff.previousValue)}</div>
                                        </div>
                                        <div className="small text-secondary mt-2">
                                          <div className="fw-semibold text-dark mb-1">Changed</div>
                                          <div className="oc-admin-revision-value">{formatDiffValue(diff.nextValue)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRestoreRevision(revision.id)}
                                disabled={isRestoringRevisionId === revision.id}
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 oc-admin-revision-restore"
                              >
                                <RotateCcw className="h-4 w-4" />
                                {isRestoringRevisionId === revision.id ? 'Restoring...' : 'Restore'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContentAdminPage;
