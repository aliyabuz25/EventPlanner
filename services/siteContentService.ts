import { SiteContent } from '../types';

export interface SiteContentResponse {
  editableDocumentKeys: string[];
  content: SiteContent;
}

export interface SiteDocumentRevision {
  id: number;
  key: string;
  value: unknown;
  changedAt: string;
  action: 'update' | 'restore' | string;
  summary: string;
}

export interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email: string;
  details: string;
  pageUrl?: string;
}

export interface SmtpConfigPayload {
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

export interface AiExplorerMessagePayload {
  role: 'user' | 'model';
  text: string;
}

export type AiExplorerInputMode = 'easy' | 'prompt' | 'consulting';

export interface AiExplorerBrief {
  customerName?: string;
  eventName?: string;
  eventLocation?: string;
  eventDates?: string;
  attendees?: string;
  budget?: string;
  currentPhase?: string;
  currentQuestion?: string;
  progressPercent?: number;
  progressLabel?: string;
  phaseOrder?: string[];
  checkInScenario?: string;
  venues?: string;
  entryPoints?: string;
  onsiteDays?: string;
  softwareNeeds?: string[];
  rentalNeeds?: string[];
  supportLevel?: string;
  travelScope?: string;
  integrations?: string[];
  badgeType?: string;
  serviceModules?: string[];
  costDrivers?: string[];
  assumptions?: string[];
  missingItems?: string[];
  nextStep?: string;
}

export interface AiExplorerOfferPosition {
  label: string;
  quantity: number;
  unit: string;
  rate: number | null;
  total: number | null;
}

export interface AiExplorerOfferModule {
  key: string;
  title: string;
  summary: string;
  rationale: string;
  subtotal: number | null;
  recommended: boolean;
  positions: AiExplorerOfferPosition[];
}

export interface AiExplorerOfferVariant {
  name: string;
  multiplier: number;
  total: number | null;
  totalFormatted?: string;
  description: string;
}

export interface AiExplorerKnowledgeCard {
  title: string;
  included: string[];
  missing: string[];
  options: string[];
  risks: string[];
  recommendation: string;
}

export interface AiExplorerOffer {
  currency: string;
  hasPricing: boolean;
  subtotal: number | null;
  subtotalFormatted?: string;
  budget?: string;
  budgetStatus?: string;
  modules: AiExplorerOfferModule[];
  variants: AiExplorerOfferVariant[];
  knowledgeCards: AiExplorerKnowledgeCard[];
  assumptions: string[];
  openQuestions: string[];
}

export interface AiExplorerReport {
  id: number;
  createdAt: string;
  model: string;
  userAgent: string;
  status: string;
  userMessage: string;
  assistantText: string;
  customerName: string;
  eventName: string;
  eventLocation: string;
  attendees: string;
  currentPhase: string;
  brief: AiExplorerBrief | null;
  offer: AiExplorerOffer | null;
  errorMessage: string;
}

export async function fetchSiteContent(): Promise<SiteContentResponse> {
  const response = await fetch('/api/site-content');
  if (!response.ok) {
    throw new Error(`Failed to load site content: ${response.status}`);
  }

  return response.json();
}

export async function saveSiteDocument(key: string, value: unknown) {
  const response = await fetch('/api/site-content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key, value })
  });

  if (!response.ok) {
    throw new Error(`Failed to save content: ${response.status}`);
  }

  return response.json();
}

export async function fetchSiteDocumentRevisions(key: string, limit = 12) {
  const response = await fetch(`/api/site-content/revisions?key=${encodeURIComponent(key)}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to load revisions: ${response.status}`);
  }

  return response.json() as Promise<{ key: string; revisions: SiteDocumentRevision[] }>;
}

export async function restoreSiteDocument(key: string, revisionId: number) {
  const response = await fetch('/api/site-content/restore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key, revisionId })
  });

  if (!response.ok) {
    throw new Error(`Failed to restore revision: ${response.status}`);
  }

  return response.json();
}

export async function uploadMedia(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to upload media: ${response.status}`);
  }

  return response.json() as Promise<{ url: string; mimeType: string; fileName: string }>;
}

export async function submitContactForm(payload: ContactFormPayload) {
  const response = await fetch('/api/forms/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Failed to submit form: ${response.status}`);
  }

  return result as Promise<{ ok: true; message: string }>;
}

export async function sendSmtpTestEmail(config: SmtpConfigPayload) {
  const response = await fetch('/api/smtp/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ config })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Failed to send test email: ${response.status}`);
  }

  return result as Promise<{ ok: true; message: string }>;
}

export async function getAiExplorerResponse(history: AiExplorerMessagePayload[], userMessage: string, mode: AiExplorerInputMode = 'easy') {
  const response = await fetch('/api/ai-explorer/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ history, userMessage, mode })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `AI Explorer request failed: ${response.status}`);
  }

  return result as Promise<{
    text: string;
    brief?: AiExplorerBrief | null;
    offer?: AiExplorerOffer | null;
    model: string;
  }>;
}

export async function generateAiExplorerPrompt(source: string, intent: 'structured-brief' | 'phase-completion' = 'structured-brief') {
  const response = await fetch('/api/ai-explorer/promptize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ source, intent })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((result as { message?: string }).message || `AI prompt generation failed: ${response.status}`);
  }

  return result as Promise<{ text: string; model: string }>;
}

export async function fetchAiExplorerReports(limit = 100) {
  const response = await fetch(`/api/ai-explorer/reports?limit=${limit}`);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((result as { message?: string }).message || `Failed to load AI reports: ${response.status}`);
  }

  return result as Promise<{ reports: AiExplorerReport[] }>;
}
