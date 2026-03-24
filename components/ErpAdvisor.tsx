import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';
import {
  AiExplorerBrief,
  AiExplorerInputMode,
  AiExplorerKnowledgeCard,
  AiExplorerOffer,
  generateAiExplorerPrompt,
  getAiExplorerResponse
} from '../services/siteContentService';
import {
  Bot,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Lock,
  MapPin,
  MessageSquare,
  ReceiptText,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  WandSparkles,
  Wrench,
  X,
  CheckCircle,
  Circle,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Download,
  Printer,
  ChevronDown
} from 'lucide-react';

interface ErpAdvisorProps {
  embedded?: boolean;
  assistantOnly?: boolean;
}

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

type ManualBriefFields = Pick<AiExplorerBrief, 'customerName' | 'eventName' | 'eventLocation' | 'attendees' | 'budget' | 'checkInScenario' | 'supportLevel'>;
type StructuredDraft = {
  customerName: string;
  eventName: string;
  eventLocation: string;
  eventDates: string;
  attendees: string;
  checkInScenario: string;
  softwareNeeds: string;
  integrations: string;
  projectManagement: string;
  rentalNeeds: string;
  consumables: string;
  supportLevel: string;
  logistics: string;
  budget: string;
};

type StructuredDraftTouched = Record<keyof StructuredDraft, boolean>;

type StructuredSection = {
  key: string;
  title: string;
  description: string;
  fields: Array<{ key: keyof StructuredDraft; label: string; placeholder: string; rows?: number }>;
};

const manualBriefFieldConfig: Array<{ key: keyof ManualBriefFields; label: string; placeholder: string }> = [
  { key: 'customerName', label: 'KUNDE (PO)', placeholder: 'z.B. Laura Demir' },
  { key: 'eventName', label: 'EVENTNAME', placeholder: 'z.B. Annual Growth Summit 2026' },
  { key: 'eventLocation', label: 'ORT (VENUES)', placeholder: 'z.B. Filderhalle in Leinfelden-Echterdingen' },
  { key: 'attendees', label: 'TEILNEHMER', placeholder: 'z.B. 1200' },
  { key: 'budget', label: 'BUDGET', placeholder: 'z.B. 25.000 EUR oder 20.000 bis 30.000 EUR' },
  { key: 'checkInScenario', label: 'SZENARIO', placeholder: 'z.B. Print-on-Demand, 3 Eingaenge, 12 Counter' },
  { key: 'supportLevel', label: 'SUPPORT-LEVEL', placeholder: 'z.B. Extended' }
];

const renderInlineMarkdown = (line: string) => {
  const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    const boldMatch = segment.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={`${segment}-${index}`} className="font-semibold">{boldMatch[1]}</strong>;
    }

    return <React.Fragment key={`${segment}-${index}`}>{segment}</React.Fragment>;
  });
};

const RenderMessageText: React.FC<{ text: string }> = ({ text }) => {
  const lines = String(text ?? '').split('\n').filter((line, index, all) => line.trim() || all[index - 1]?.trim());

  return (
    <div className="space-y-2.5">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`spacer-${index}`} className="h-1" />;
        }

        if (/^-\s+/.test(trimmed)) {
          return (
            <div key={`bullet-${index}`} className="flex items-start gap-2">
              <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
              <div>{renderInlineMarkdown(trimmed.replace(/^-\s+/, ''))}</div>
            </div>
          );
        }

        return (
          <p key={`line-${index}`} className="m-0">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const starterPromptsByPhase: Record<string, string[]> = {
  Basisdaten: [
    'Tech-Konferenz in Berlin, 3 Tage, 1.200 pax, Print-on-Demand an 3 Eingängen, 12 Counter.',
    'Corporate Event in München, 1 Tag, 450 pax, klassischer Check-in (vorproduzierte Badges).'
  ],
  Software: [
    'Badge-Druck, Scanning, Lead-Capture für Aussteller, CRM-Integration (Salesforce).',
    'Nur Teilnehmerimport und schneller Check-in, keine Schnittstellen nötig.'
  ],
  Projektmanagement: [
    'Volles PM: Kickoff, 4 Jour fixes, 3 Badge-Layouts und Generalprobe vor Ort.',
    'Standard-Setup, ein Layout, ein Testlauf remote.'
  ],
  Miettechnik: [
    '12 iPads, 4 Badge-Drucker, 15 Handscanner, eigenes LTE-Netzwerk.',
    'Wir haben WLAN. Brauchen nur 4 iPads und 2 Drucker.'
  ],
  Verbrauchsmaterial: [
    'Papier-Badges (klimaneutral) + Bambus-Lanyards für 1.200 pax + 10% Reserve.',
    'Premium PVC-Badges mit doppelter Lochung, 450 Stück + 50 Blanko.'
  ],
  Support: [
    'Extended Support: 2 Techniker vor Ort, doors-open critical, 1 Tag Vorab-Aufbau.',
    'Basic Support reicht (Remote-Helpdesk), Crew macht den Aufbau selbst.'
  ],
  Transport: [
    'Team reist aus Hannover an (2 Nächte Hotel), Technik-Versand per Spedition.',
    'Event ist lokal, keine Übernachtung, Material bringen die Techniker mit.'
  ]
};

const initialMessage = `Guten Tag. Ich bin Ihr FastLane Assistant (Pre-Sales KI-Agent).

Ich führe mit Ihnen ein strukturiertes Angebots-Interview durch, um Ihr Event-Setup (Software, PM, Miettechnik, Verbrauchsmaterial, Support & Logistik) zu erfassen. 

Zusammengefasst generiere ich daraus:
- Ein modulares Event-Briefing JSON
- Eine detaillierte Kostenübersicht inkl. Kalkulationslogiken
- Automatische Angebotsvarianten (Standard / Plus / Premium)
- Annahmen & Constraints

Starten wir mit **Phase A (Event-Basisdaten)**: Wie heißt das Event, wo findet es statt, Datum, erwartete Teilnehmerzahl, Aufbau/Abbau-Zeiten, wie sieht Ihr Check-in-Szenario aus und gibt es bereits ein Budget oder einen Budgetrahmen?`;

const consultingLeadMessage = 'Beschreiben Sie Ihr Ziel fuer den KI-Agenten oder Ihre Frage zu Architektur, Produktkatalog, Preislogik, Angebotsvarianten, Interview-Flow, Knowledge Cards, Budgetlogik oder CRM-Uebergabe. Das Studio antwortet dann als fachlicher Pre-Sales- und Solution-Consulting-Assistent.';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);

const formatPriceValue = (value?: number | null, fallback = 'Preis offen') =>
  typeof value === 'number' ? formatCurrency(value) : fallback;

const escapeHtml = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeXml = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const LockedPanel: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="rounded-[1.5rem] bg-[#fffaf0] dark:bg-white/[0.03] p-4 shadow-[0_12px_30px_-24px_rgba(32,41,57,0.28)]">
    <div className="flex items-center gap-2 mb-2">
      <Lock className="w-4 h-4 text-slate-400" />
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</div>
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const StudioSection: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ eyebrow, title, description, actions, children }) => (
  <section className="p-4 sm:p-5">
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</div>
        ) : null}
        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
        {description ? (
          <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
    </div>
    {children}
  </section>
);

const ConsoleSection: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, actions, children }) => (
  <section className="p-5">
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
        {description ? (
          <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
    </div>
    {children}
  </section>
);

const toolbarButtonClass =
  'inline-flex min-h-10 items-center justify-center rounded-full px-3.5 py-2 text-xs font-semibold shadow-sm transition whitespace-nowrap';

const subtleToolbarButtonClass = `${toolbarButtonClass} bg-white/80 text-slate-700 hover:text-sap-blue`;
const primaryToolbarButtonClass = `${toolbarButtonClass} bg-sap-blue text-white hover:bg-sap-blue/90`;

const structuredFields: Array<{ key: keyof StructuredDraft; label: string; placeholder: string; rows?: number }> = [
  { key: 'customerName', label: 'Kunde / PO', placeholder: 'z.B. Laura Demir' },
  { key: 'eventName', label: 'Eventname', placeholder: 'z.B. Annual Growth Summit 2026' },
  { key: 'eventLocation', label: 'Ort / Venue', placeholder: 'z.B. Filderhalle in Leinfelden-Echterdingen' },
  { key: 'eventDates', label: 'Datum / Aufbau / Abbau', placeholder: 'z.B. 17.-18. September 2026, Aufbau 16.09. ab 14:00 Uhr', rows: 2 },
  { key: 'attendees', label: 'Teilnehmer', placeholder: 'z.B. 1.200' },
  { key: 'checkInScenario', label: 'Check-in Szenario', placeholder: 'z.B. Print-on-Demand, 3 Eingaenge, 12 Counter, Walk-ins', rows: 2 },
  { key: 'softwareNeeds', label: 'Software', placeholder: 'z.B. Teilnehmerimport, Badge-Druck, Check-in, Scanning, Lead-Capture', rows: 2 },
  { key: 'integrations', label: 'Integrationen', placeholder: 'z.B. Salesforce, Event-App, SSO', rows: 2 },
  { key: 'projectManagement', label: 'Projektmanagement', placeholder: 'z.B. Kickoff, Jour fixes, Testlauf, Generalprobe', rows: 2 },
  { key: 'rentalNeeds', label: 'Miettechnik', placeholder: 'z.B. 12 iPads, 4 Badge-Drucker, 14 Scanner, 2 LTE-Router', rows: 2 },
  { key: 'consumables', label: 'Verbrauchsmaterial', placeholder: 'z.B. Papier-Badges, Lanyards, Halter, Druckerrollen', rows: 2 },
  { key: 'supportLevel', label: 'Support', placeholder: 'z.B. Extended, 3 Techniker, 1 Supervisor', rows: 2 },
  { key: 'logistics', label: 'Transport / Reise / Hotel', placeholder: 'z.B. Spedition, 2 Hotelnaechte, Anlieferung am Vortag', rows: 2 },
  { key: 'budget', label: 'Budget', placeholder: 'z.B. 25.000 bis 30.000 EUR' }
];

const structuredSections: StructuredSection[] = [
  {
    key: 'basis',
    title: 'Basisdaten',
    description: 'Grunddaten zum Event, Ort, Datum und Teilnehmerstruktur.',
    fields: structuredFields.filter((field) => ['customerName', 'eventName', 'eventLocation', 'eventDates', 'attendees'].includes(field.key))
  },
  {
    key: 'checkin',
    title: 'Check-in & Software',
    description: 'Check-in Ablauf, benoetigte Softwarefunktionen und Integrationen.',
    fields: structuredFields.filter((field) => ['checkInScenario', 'softwareNeeds', 'integrations'].includes(field.key))
  },
  {
    key: 'operations',
    title: 'Projekt & Operations',
    description: 'Projektmanagement, Technik, Verbrauchsmaterial und Support.',
    fields: structuredFields.filter((field) => ['projectManagement', 'rentalNeeds', 'consumables', 'supportLevel'].includes(field.key))
  },
  {
    key: 'logistics',
    title: 'Logistik & Budget',
    description: 'Transport, Reise, Hotel und Budgetrahmen.',
    fields: structuredFields.filter((field) => ['logistics', 'budget'].includes(field.key))
  }
];

const structuredDraftDemo: StructuredDraft = {
  customerName: 'Laura Demir',
  eventName: 'Annual Growth Summit 2026',
  eventLocation: 'Filderhalle in Leinfelden-Echterdingen',
  eventDates: '17. und 18. September 2026, Aufbau 16.09. ab 14:00 Uhr, Abbau 18.09. ab 18:30 Uhr',
  attendees: '1.200',
  checkInScenario: 'Print-on-Demand an 3 Eingaengen mit 12 Counter, Walk-ins und Fast-Lane fuer VIPs',
  softwareNeeds: 'Teilnehmerimport, Badge-Druck, Check-in, Session-Scanning, Lead-Capture, Reporting',
  integrations: 'Salesforce, zweisprachiges Setup Deutsch/Englisch',
  projectManagement: 'Kickoff, woechentliche Jour fixes, Testlauf zwei Wochen vorher, Generalprobe am Vortag',
  rentalNeeds: '12 iPads, 4 Badge-Drucker, 14 Scanner, 2 LTE-Router',
  consumables: 'Papier-Badges, Lanyards, Halter, Druckerrollen und 10% Reserve',
  supportLevel: 'Extended Support mit 3 Technikern und 1 Supervisor vor Ort',
  logistics: 'Spedition fuer Technik, 2 Hotelnaechte fuer das Team, Anlieferung am Vortag',
  budget: '25.000 bis 30.000 EUR'
};

const buildLocalStructuredPrompt = (draft: StructuredDraft) => {
  const intros = [
    `Wir planen ${draft.eventName || 'ein Event'}${draft.eventLocation ? ` in ${draft.eventLocation}` : ''}.`,
    `${draft.customerName ? `${draft.customerName} betreut ` : 'Wir betreuen '}das Event ${draft.eventName || 'aktuell'}${draft.eventLocation ? ` am Standort ${draft.eventLocation}` : ''}.`,
    `Fuer ${draft.eventName || 'das geplante Event'}${draft.eventLocation ? ` in ${draft.eventLocation}` : ''} benoetigen wir ein strukturiertes Angebot.`
  ];

  const timing = draft.eventDates ? `Die relevanten Termine und Zeiten sind wie folgt geplant: ${draft.eventDates}.` : '';
  const attendees = draft.attendees ? `Wir erwarten ${draft.attendees} Teilnehmende.` : '';
  const scenario = draft.checkInScenario ? `Fuer den Check-in ist folgendes Szenario vorgesehen: ${draft.checkInScenario}.` : '';
  const software = draft.softwareNeeds ? `Auf der Software-Seite werden ${draft.softwareNeeds} benoetigt.` : '';
  const integrations = draft.integrations ? `Zu beruecksichtigen sind zudem folgende Integrationen bzw. Systemanbindungen: ${draft.integrations}.` : '';
  const pm = draft.projectManagement ? `Im Projektmanagement und in der Vorbereitung ist folgender Umfang vorgesehen: ${draft.projectManagement}.` : '';
  const rental = draft.rentalNeeds ? `An Miettechnik wird aktuell benoetigt: ${draft.rentalNeeds}.` : '';
  const consumables = draft.consumables ? `Beim Verbrauchsmaterial planen wir mit ${draft.consumables}.` : '';
  const support = draft.supportLevel ? `Vor Ort wird ${draft.supportLevel} eingeplant.` : '';
  const logistics = draft.logistics ? `Fuer Transport, Reise und Logistik gilt derzeit: ${draft.logistics}.` : '';
  const budget = draft.budget ? `Der Budgetrahmen liegt bei ${draft.budget}.` : '';

  const parts = [
    intros[new Date().getSeconds() % intros.length],
    timing,
    attendees,
    scenario,
    software,
    integrations,
    pm,
    rental,
    consumables,
    support,
    logistics,
    budget
  ].filter(Boolean);

  if (parts.length <= 4) {
    return parts.join(' ');
  }

  return [parts.slice(0, 4).join(' '), parts.slice(4).join(' ')].filter(Boolean).join('\n\n');
};

const buildLocalEasyExpansionPrompt = (seed: string) => {
  const cleanSeed = String(seed ?? '').trim();
  if (!cleanSeed) return '';

  return [
    cleanSeed,
    'Zusaetzlich sollen Software, Projektmanagement, Miettechnik, Verbrauchsmaterial, Support vor Ort sowie Transport- und Reisebedarf in die Planung aufgenommen und im Angebot mitgedacht werden.',
    'Bitte beruecksichtigen Sie dabei auch operative Anforderungen wie Check-in-Prozess, Badge-Druck, Scanning, Geraetebedarf, Materialreserve, Onsite-Support und Logistikfenster.'
  ].join(' ');
};

const inferEasyPromptEventName = (seed: string) => {
  const normalized = String(seed ?? '');
  if (/tesla/i.test(normalized) && /galata|istanbul/i.test(normalized)) {
    return 'Tesla Brand Experience Galata';
  }
  if (/tesla/i.test(normalized)) {
    return 'Tesla Brand Experience Event';
  }
  return '';
};

const inferEasyPromptLocation = (seed: string) => {
  const normalized = String(seed ?? '');
  if (/galata/i.test(normalized) && /istanbul/i.test(normalized)) {
    return 'Galata, Istanbul, Türkei';
  }
  if (/istanbul/i.test(normalized)) {
    return 'Istanbul, Türkei';
  }
  return '';
};

const inferEasyPromptAttendees = (seed: string) => {
  const match = String(seed ?? '').match(/(\d[\d.]*)\s*(?:bis|-)\s*(\d[\d.]*)|(\d[\d.]*)\s*(teilnehmer|personen|gaeste|gäste|pax)/i);
  if (!match) return '';
  if (match[1] && match[2]) {
    return `${match[1]} bis ${match[2]}`;
  }
  return match[3] || '';
};

const buildDeterministicEasyPrompt = (seed: string) => {
  const cleanSeed = String(seed ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanSeed) return '';

  const normalizedSeed = cleanSeed.endsWith('.') ? cleanSeed : `${cleanSeed}.`;
  const lowerSeed = cleanSeed.toLowerCase();
  const eventName = inferEasyPromptEventName(cleanSeed);
  const eventLocation = inferEasyPromptLocation(cleanSeed);
  const attendeeHint = inferEasyPromptAttendees(cleanSeed);

  const scenarioLine = /badge|check-in|walk-?in|einlass/i.test(cleanSeed)
    ? 'Check-in-Szenario: Schneller Check-in mit Badge-Druck, Walk-ins und Besuchersteuerung.'
    : 'Check-in-Szenario: Noch zu definieren, voraussichtlich mit registriertem Check-in und moeglichen Walk-ins.';
  const softwareLine = /software|scanning|lead-capture|integration|reporting/i.test(cleanSeed)
    ? 'Software: Teilnehmermanagement, Check-in, Badge-Druck, Scanning und bei Bedarf Lead-Capture bzw. Integrationen.'
    : 'Software: Teilnehmermanagement, Check-in, Badge-Druck, Reporting und moegliche Integrationen mitdenken.';
  const pmLine = 'Projektmanagement: Vorbereitung, Abstimmungen, Testlauf und operative Detailplanung beruecksichtigen.';
  const rentalLine = /ipad|tablet|drucker|scanner|router|lte|miettechnik|hardware/i.test(cleanSeed)
    ? 'Miettechnik: Tablets, Badge-Drucker, Scanner und gegebenenfalls Netzwerk-Backup einplanen.'
    : 'Miettechnik: Voraussichtlichen Bedarf an Tablets, Badge-Druckern, Scannern und Backup-Konnektivitaet pruefen.';
  const consumablesLine = 'Verbrauchsmaterial: Badges, Lanyards, Halter, Druckmaterialien und Materialreserve beruecksichtigen.';
  const supportLine = /support|onsite|vor ort|techniker|supervisor/i.test(cleanSeed)
    ? 'Support vor Ort: Technischen Vor-Ort-Support passend zum Besucheraufkommen dimensionieren.'
    : 'Support vor Ort: Geeignetes Support-Level fuer Peak-Zeiten und Eventbetrieb einplanen.';
  const logisticsLine = /hotel|reise|transport|spedition|logistik/i.test(cleanSeed)
    ? 'Transport / Reise / Hotel: Reise-, Hotel-, Transport- und Logistikbedarf im Angebot abbilden.'
    : 'Transport / Reise / Hotel: Relevante Logistik-, Reise- und Hotelbedarfe mitpruefen.';
  const budgetLine = /budget|rahmenbudget|maximalbudget/i.test(cleanSeed)
    ? 'Budget: Vorhandenen Budgetrahmen in der Angebotslogik beruecksichtigen.'
    : 'Budget: Noch offen, soll in der weiteren Planung abgestimmt werden.';

  return [
    eventName ? `Eventname: ${eventName}.` : 'Eventname: Noch zu bestaetigen.',
    eventLocation ? `Ort / Venue: ${eventLocation}.` : 'Ort / Venue: Noch zu bestaetigen.',
    attendeeHint ? `Teilnehmerzahl: Ca. ${attendeeHint}.` : 'Teilnehmerzahl: Noch zu bestaetigen.',
    normalizedSeed,
    scenarioLine,
    softwareLine,
    pmLine,
    rentalLine,
    consumablesLine,
    supportLine,
    logisticsLine,
    budgetLine
  ].join('\n');
};

const isAcceptableExpandedPrompt = (seed: string, prompt: string) => {
  const normalizedPrompt = String(prompt ?? '').trim();
  const normalizedSeed = String(seed ?? '').trim();

  if (!normalizedPrompt || normalizedPrompt.length < 120) return false;
  if (/[{}[\]<>]/.test(normalizedPrompt)) return false;
  if (/ip-adkicker|artens bietet|angebot abrufen|planningernichts|vorhimmel|anschlussbedarf, das unseren|gespielt und/i.test(normalizedPrompt)) {
    return false;
  }

  const requiredSignals = [
    /\bistanbul\b/i.test(normalizedSeed) ? /\bistanbul\b/i.test(normalizedPrompt) : true,
    /\b(\d{3,4}|\d+\s*bis\s*\d+)\b/.test(normalizedSeed) ? /\b(\d{3,4}|\d+\s*bis\s*\d+)\b/.test(normalizedPrompt) : true,
    /badge|check-in|walk-in|scanner|support|hotel|transport/i.test(normalizedSeed)
      ? /badge|check-in|walk-in|scanner|support|hotel|transport/i.test(normalizedPrompt)
      : true
  ];

  return requiredSignals.every(Boolean);
};

const deriveLocationDetails = (brief?: AiExplorerBrief | null) => {
  const rawLocation = String(brief?.eventLocation ?? '').trim();
  const rawDates = String(brief?.eventDates ?? '').trim();
  const location = rawLocation.replace(/\s+/g, ' ').trim();

  if (!location && !rawDates) {
    return [];
  }

  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  let venue = '';
  let city = '';
  let region = '';
  let country = '';

  if (parts.length >= 1) {
    venue = parts[0];
  }

  for (const part of parts.slice(1)) {
    if (!city && /\b(istanbul|ankara|izmir|bursa|antalya|stuttgart|berlin|m[uü]nchen|hamburg|leinfelden-echterdingen|leinfelden|echterdingen)\b/i.test(part)) {
      city = part;
      continue;
    }
    if (!country && /\b(t[uü]rkei|turkey|deutschland|germany|azerbaijan|aserbaidschan)\b/i.test(part)) {
      country = part;
      continue;
    }
    if (!region) {
      region = part;
    }
  }

  if (!city) {
    const cityMatch = location.match(/\b(in|im|bei)\s+([A-ZÄÖÜ][\wÄÖÜäöüß-]+(?:\s+[A-ZÄÖÜ][\wÄÖÜäöüß-]+)*)/);
    if (cityMatch) {
      city = cityMatch[2].trim();
    }
  }

  if (!country) {
    if (/\bistanbul\b/i.test(location)) {
      country = 'Türkei';
    } else if (/\b(leinfelden|echterdingen|stuttgart|berlin|m[uü]nchen|hamburg)\b/i.test(location)) {
      country = 'Deutschland';
    }
  }

  const details = [
    venue ? { label: 'Venue', value: venue } : null,
    city ? { label: 'Stadt', value: city } : null,
    region ? { label: 'Region', value: region } : null,
    country ? { label: 'Land', value: country } : null,
    rawDates ? { label: 'Datum', value: rawDates } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return details;
};

const ErpAdvisor: React.FC<ErpAdvisorProps> = ({ embedded = false, assistantOnly = false }) => {
  const { content } = useSiteContent();
  const companyName = content.global.company.name;
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: initialMessage }]);
  const [brief, setBrief] = useState<AiExplorerBrief | null>(null);
  const [offer, setOffer] = useState<AiExplorerOffer | null>(null);
  const [manualBrief, setManualBrief] = useState<ManualBriefFields>({
    customerName: '',
    eventName: '',
    eventLocation: '',
    attendees: '',
    budget: '',
    checkInScenario: '',
    supportLevel: ''
  });
  const [manualBriefTouched, setManualBriefTouched] = useState<Record<keyof ManualBriefFields, boolean>>({
    customerName: false,
    eventName: false,
    eventLocation: false,
    attendees: false,
    budget: false,
    checkInScenario: false,
    supportLevel: false
  });
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<AiExplorerInputMode>('easy');
  const [structuredDraft, setStructuredDraft] = useState<StructuredDraft>({
    customerName: '',
    eventName: '',
    eventLocation: '',
    eventDates: '',
    attendees: '',
    checkInScenario: '',
    softwareNeeds: '',
    integrations: '',
    projectManagement: '',
    rentalNeeds: '',
    consumables: '',
    supportLevel: '',
    logistics: '',
    budget: ''
  });
  const [structuredDraftTouched, setStructuredDraftTouched] = useState<StructuredDraftTouched>({
    customerName: false,
    eventName: false,
    eventLocation: false,
    eventDates: false,
    attendees: false,
    checkInScenario: false,
    softwareNeeds: false,
    integrations: false,
    projectManagement: false,
    rentalNeeds: false,
    consumables: false,
    supportLevel: false,
    logistics: false,
    budget: false
  });
  const [openStructuredSections, setOpenStructuredSections] = useState<Record<string, boolean>>({
    basis: true,
    checkin: false,
    operations: false,
    logistics: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isPromptGenerating, setIsPromptGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMaximized, setAssistantMaximized] = useState(false);
  const [structuredActionNotice, setStructuredActionNotice] = useState<string | null>(null);
  const [pendingPromptReview, setPendingPromptReview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const workspaceComposerRef = useRef<HTMLTextAreaElement>(null);
  const structuredInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, assistantOpen]);

  useEffect(() => {
    if (!structuredActionNotice) return;
    const timeout = window.setTimeout(() => setStructuredActionNotice(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [structuredActionNotice]);

  useEffect(() => {
    if (!assistantOnly) return;
    document.body.style.overflow = assistantOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [assistantOnly, assistantOpen]);

  useEffect(() => {
    if (!brief) return;

    setManualBrief((current) => {
      const next = { ...current };
      let changed = false;

      for (const field of manualBriefFieldConfig) {
        const key = field.key;
        const incoming = String(brief?.[key] ?? '').trim();

        if (!manualBriefTouched[key] && incoming && current[key] !== incoming) {
          next[key] = incoming;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [brief, manualBriefTouched]);

  const mergedBrief = useMemo(
    () => ({
      ...brief,
      ...Object.fromEntries(
        Object.entries(manualBrief).filter(([, value]) => String(value ?? '').trim())
      )
    }),
    [brief, manualBrief]
  );

  const summaryItems = useMemo(
    () => [
      { label: 'KUNDE (PO)', value: mergedBrief?.customerName || 'Noch offen', icon: ClipboardList },
      { label: 'EVENTNAME', value: mergedBrief?.eventName || 'Noch offen', icon: CalendarDays },
      { label: 'ORT (VENUES)', value: mergedBrief?.eventLocation || 'Noch offen', icon: MapPin },
      { label: 'TEILNEHMER', value: mergedBrief?.attendees || 'Noch offen', icon: Users },
      { label: 'BUDGET', value: mergedBrief?.budget || 'Noch offen', icon: ReceiptText },
      { label: 'SZENARIO', value: mergedBrief?.checkInScenario || 'Noch offen', icon: WandSparkles },
      { label: 'SUPPORT-LEVEL', value: mergedBrief?.supportLevel || 'Noch offen', icon: ShieldCheck }
    ],
    [mergedBrief]
  );
  const locationDetails = useMemo(() => deriveLocationDetails(mergedBrief), [mergedBrief]);

  const phases = mergedBrief?.phaseOrder ?? ['Basisdaten', 'Software', 'Projektmanagement', 'Miettechnik', 'Verbrauchsmaterial', 'Support', 'Transport'];
  const currentPhaseIndex = Math.max(0, phases.findIndex((phase) => phase === mergedBrief?.currentPhase));
  const activePhase = mergedBrief?.currentPhase || 'Basisdaten';
  const activeStarterPrompts = starterPromptsByPhase[activePhase] || starterPromptsByPhase.Basisdaten;
  const knowledgeCards: AiExplorerKnowledgeCard[] = offer?.knowledgeCards ?? [];
  const leadQuestionText = inputMode === 'consulting'
    ? consultingLeadMessage
    : (mergedBrief?.currentQuestion || initialMessage);
  const recentMessages = messages.slice(-4);

  useEffect(() => {
    if (!mergedBrief && !offer) return;

    const nextValues: Partial<StructuredDraft> = {
      customerName: String(mergedBrief?.customerName ?? '').trim(),
      eventName: String(mergedBrief?.eventName ?? '').trim(),
      eventLocation: String(mergedBrief?.eventLocation ?? '').trim(),
      eventDates: String(mergedBrief?.eventDates ?? '').trim(),
      attendees: String(mergedBrief?.attendees ?? '').trim(),
      checkInScenario: String(mergedBrief?.checkInScenario ?? '').trim(),
      softwareNeeds: Array.isArray(mergedBrief?.softwareNeeds) ? mergedBrief?.softwareNeeds.join(', ') : '',
      integrations: Array.isArray(mergedBrief?.integrations) ? mergedBrief?.integrations.join(', ') : '',
      projectManagement: offer?.modules.find((module) => module.key === 'project-management')?.summary || '',
      rentalNeeds: Array.isArray(mergedBrief?.rentalNeeds) ? mergedBrief?.rentalNeeds.join(', ') : '',
      consumables: offer?.modules.find((module) => module.key === 'consumables')?.summary || '',
      supportLevel: String(mergedBrief?.supportLevel ?? '').trim(),
      logistics: String(mergedBrief?.travelScope ?? '').trim() || offer?.modules.find((module) => module.key === 'travel')?.summary || '',
      budget: String(mergedBrief?.budget ?? '').trim()
    };

    setStructuredDraft((current) => {
      let changed = false;
      const next = { ...current };

      (Object.entries(nextValues) as Array<[keyof StructuredDraft, string]>).forEach(([key, value]) => {
        if (!value) return;
        if (structuredDraftTouched[key]) return;
        if (current[key] === value) return;
        next[key] = value;
        changed = true;
      });

      return changed ? next : current;
    });
  }, [mergedBrief, offer, structuredDraftTouched]);

  const showServiceModules = currentPhaseIndex >= 1;
  const showCostDrivers = currentPhaseIndex >= 2;
  const showPricingOverview = currentPhaseIndex >= 3;
  const showModuleDetails = currentPhaseIndex >= 4;
  const showAssumptions = currentPhaseIndex >= 5;
  const showKnowledgeCards = currentPhaseIndex >= 6;

  const buildStructuredPrompt = () => {
    const sections = [
      structuredDraft.customerName ? `Ansprechpartner auf Kundenseite: ${structuredDraft.customerName}.` : '',
      structuredDraft.eventName ? `Eventname: ${structuredDraft.eventName}.` : '',
      structuredDraft.eventLocation ? `Ort / Venue: ${structuredDraft.eventLocation}.` : '',
      structuredDraft.eventDates ? `Datum / Zeiten: ${structuredDraft.eventDates}.` : '',
      structuredDraft.attendees ? `Teilnehmerzahl: ${structuredDraft.attendees}.` : '',
      structuredDraft.checkInScenario ? `Check-in-Szenario: ${structuredDraft.checkInScenario}.` : '',
      structuredDraft.softwareNeeds ? `Software-Bedarf: ${structuredDraft.softwareNeeds}.` : '',
      structuredDraft.integrations ? `Integrationen: ${structuredDraft.integrations}.` : '',
      structuredDraft.projectManagement ? `Projektmanagement / Vorbereitung: ${structuredDraft.projectManagement}.` : '',
      structuredDraft.rentalNeeds ? `Miettechnik: ${structuredDraft.rentalNeeds}.` : '',
      structuredDraft.consumables ? `Verbrauchsmaterial: ${structuredDraft.consumables}.` : '',
      structuredDraft.supportLevel ? `Support vor Ort: ${structuredDraft.supportLevel}.` : '',
      structuredDraft.logistics ? `Transport / Reise / Hotel: ${structuredDraft.logistics}.` : '',
      structuredDraft.budget ? `Budgetrahmen: ${structuredDraft.budget}.` : ''
    ].filter(Boolean);

    return sections.join(' ');
  };

  const openAllStructuredSections = () => {
    setOpenStructuredSections({
      basis: true,
      checkin: true,
      operations: true,
      logistics: true
    });
  };

  const applyStructuredDemo = () => {
    setStructuredDraft(structuredDraftDemo);
    openAllStructuredSections();
    setStructuredActionNotice('Beispieldaten wurden eingefuellt.');
    structuredInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const buildEffectiveStructuredPrompt = () => {
    const prompt = buildStructuredPrompt();
    if (prompt) return prompt;

    const fallbackSections = [
      structuredDraftDemo.customerName ? `Ansprechpartner auf Kundenseite: ${structuredDraftDemo.customerName}.` : '',
      structuredDraftDemo.eventName ? `Eventname: ${structuredDraftDemo.eventName}.` : '',
      structuredDraftDemo.eventLocation ? `Ort / Venue: ${structuredDraftDemo.eventLocation}.` : '',
      structuredDraftDemo.eventDates ? `Datum / Zeiten: ${structuredDraftDemo.eventDates}.` : '',
      structuredDraftDemo.attendees ? `Teilnehmerzahl: ${structuredDraftDemo.attendees}.` : '',
      structuredDraftDemo.checkInScenario ? `Check-in-Szenario: ${structuredDraftDemo.checkInScenario}.` : '',
      structuredDraftDemo.softwareNeeds ? `Software-Bedarf: ${structuredDraftDemo.softwareNeeds}.` : '',
      structuredDraftDemo.integrations ? `Integrationen: ${structuredDraftDemo.integrations}.` : '',
      structuredDraftDemo.projectManagement ? `Projektmanagement / Vorbereitung: ${structuredDraftDemo.projectManagement}.` : '',
      structuredDraftDemo.rentalNeeds ? `Miettechnik: ${structuredDraftDemo.rentalNeeds}.` : '',
      structuredDraftDemo.consumables ? `Verbrauchsmaterial: ${structuredDraftDemo.consumables}.` : '',
      structuredDraftDemo.supportLevel ? `Support vor Ort: ${structuredDraftDemo.supportLevel}.` : '',
      structuredDraftDemo.logistics ? `Transport / Reise / Hotel: ${structuredDraftDemo.logistics}.` : '',
      structuredDraftDemo.budget ? `Budgetrahmen: ${structuredDraftDemo.budget}.` : ''
    ].filter(Boolean);

    return fallbackSections.join(' ');
  };

  const generateStructuredPromptWithAi = async () => {
    const source = buildEffectiveStructuredPrompt();
    if (!source) return '';

    setIsPromptGenerating(true);

    try {
      const result = await generateAiExplorerPrompt(source);
      return String(result.text ?? '').trim();
    } catch (generationError) {
      const fallbackDraft = buildStructuredPrompt() ? structuredDraft : structuredDraftDemo;
      const fallbackPrompt = buildLocalStructuredPrompt(fallbackDraft);
      const message = generationError instanceof Error ? generationError.message : 'AI-Prompt konnte nicht erzeugt werden.';

      if (/404/.test(message)) {
        setStructuredActionNotice('AI-Prompt-Service noch nicht verfuegbar. Lokaler Prompt wurde erzeugt.');
        return fallbackPrompt;
      }

      setStructuredActionNotice('AI-Prompt konnte nicht erzeugt werden. Lokaler Prompt wurde als Fallback erstellt.');
      return fallbackPrompt;
    } finally {
      setIsPromptGenerating(false);
    }
  };

  const expandEasyInputWithAi = async () => {
    const seed = input.trim();
    if (!seed) return;

    setIsPromptGenerating(true);

    try {
      const deterministicPrompt = buildDeterministicEasyPrompt(seed);
      const aiResult = await generateAiExplorerPrompt(seed, 'phase-completion').catch(() => null);
      const aiPrompt = String(aiResult?.text ?? '').trim();
      const nextPrompt = isAcceptableExpandedPrompt(seed, aiPrompt)
        ? aiPrompt
        : deterministicPrompt;
      if (!nextPrompt) return;
      openPromptReview(nextPrompt, 'Eingabe wurde zu einem volleren Briefing erweitert.');
    } catch (generationError) {
      const fallbackPrompt = buildDeterministicEasyPrompt(seed) || buildLocalEasyExpansionPrompt(seed);
      if (!fallbackPrompt) return;
      openPromptReview(fallbackPrompt, 'Lokales Briefing wurde stabil erzeugt.');
    } finally {
      setIsPromptGenerating(false);
    }
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const normalizedExportName = (mergedBrief?.eventName || 'fastlane-studio')
    .replace(/[^\w-]+/g, '-')
    .toLowerCase();

  const excelXmlCell = (value: string | number, type: 'String' | 'Number' = 'String') =>
    `<Cell><Data ss:Type="${type}">${type === 'Number' ? value : escapeXml(String(value))}</Data></Cell>`;

  const excelXmlRow = (cells: Array<string | number>, types?: Array<'String' | 'Number'>) =>
    `<Row>${cells
      .map((cell, index) => excelXmlCell(cell, types?.[index] ?? (typeof cell === 'number' ? 'Number' : 'String')))
      .join('')}</Row>`;

  const handleExportSpreadsheet = () => {
    const modules = offer?.modules ?? [];
    const variants = offer?.variants ?? [];
    const assumptions = offer?.assumptions ?? [];
    const openQuestions = offer?.openQuestions ?? [];

    if (!modules.length && !variants.length && !assumptions.length && !openQuestions.length) return;

    const overviewRows = [
      excelXmlRow(['Feld', 'Wert']),
      excelXmlRow(['Kunde', mergedBrief?.customerName || 'Noch offen']),
      excelXmlRow(['Eventname', mergedBrief?.eventName || 'Noch offen']),
      excelXmlRow(['Ort', mergedBrief?.eventLocation || 'Noch offen']),
      excelXmlRow(['Teilnehmer', mergedBrief?.attendees || 'Noch offen']),
      excelXmlRow(['Budget', mergedBrief?.budget || 'Noch offen']),
      excelXmlRow(['Szenario', mergedBrief?.checkInScenario || 'Noch offen']),
      excelXmlRow(['Support-Level', mergedBrief?.supportLevel || 'Noch offen']),
      excelXmlRow(['Gesamtsumme', offer?.subtotalFormatted || 'Preis offen']),
      excelXmlRow(['Budget-Status', offer?.budgetStatus || 'Noch offen'])
    ].join('');

    const moduleRows = [
      excelXmlRow(['Bereich', 'Position', 'Menge', 'Einheit', 'Satz', 'Total']),
      ...modules.flatMap((module) =>
        module.positions.map((position) =>
          excelXmlRow(
            [
              module.title,
              position.label,
              position.quantity ?? '',
              position.unit ?? '',
              position.rate ?? '',
              position.total ?? ''
            ],
            ['String', 'String', typeof position.quantity === 'number' ? 'Number' : 'String', 'String', typeof position.rate === 'number' ? 'Number' : 'String', typeof position.total === 'number' ? 'Number' : 'String']
          )
        )
      )
    ].join('');

    const variantRows = [
      excelXmlRow(['Variante', 'Beschreibung', 'Total']),
      ...variants.map((variant) =>
        excelXmlRow([variant.name, variant.description, variant.total ?? (variant.totalFormatted || 'Offen')], ['String', 'String', typeof variant.total === 'number' ? 'Number' : 'String'])
      )
    ].join('');

    const notesRows = [
      excelXmlRow(['Typ', 'Eintrag']),
      ...assumptions.map((item) => excelXmlRow(['Assumption', item])),
      ...openQuestions.map((item) => excelXmlRow(['Open Question', item]))
    ].join('');

    const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#F8F4EB" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Overview">
    <Table>
      ${overviewRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Modules">
    <Table>
      ${moduleRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Variants">
    <Table>
      ${variantRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Notes">
    <Table>
      ${notesRows}
    </Table>
  </Worksheet>
</Workbook>`;

    downloadFile(`${normalizedExportName}-angebot.xls`, workbook, 'application/vnd.ms-excel;charset=utf-8');
  };

  const handleExportPdf = () => {
    if (typeof window === 'undefined') return;

    const variantHtml = (offer?.variants ?? [])
      .map((variant) => `
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">${escapeHtml(variant.name)}</div>
            <div class="panel-total">${escapeHtml(variant.totalFormatted || 'Offen')}</div>
          </div>
          <div class="muted">${escapeHtml(variant.description)}</div>
        </div>
      `)
      .join('');

    const listHtml = (title: string, items: string[]) =>
      items.length
        ? `
          <section style="margin:24px 0;">
            <h2>${escapeHtml(title)}</h2>
            <ul class="bullet-list">
              ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </section>
        `
        : '';

    const modulesHtml = (offer?.modules ?? [])
      .map((module) => `
        <section style="margin:24px 0;">
          <h3 style="margin:0 0 8px;font-size:18px;">${escapeHtml(module.title)}</h3>
          <p style="margin:0 0 10px;color:#4b5563;">${escapeHtml(module.summary)}</p>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">Position</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">Menge</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">Einheit</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">Satz</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${module.positions.map((position) => `
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(position.label)}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${position.quantity}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(position.unit)}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(formatPriceValue(position.rate, '-'))}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(formatPriceValue(position.total, '-'))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      `)
      .join('');

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(mergedBrief?.eventName || 'FastLane Studio Export')}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; font-size: 12px; }
            h1 { margin: 0; font-size: 20px; line-height: 1.25; }
            h2 { margin: 20px 0 10px; font-size: 15px; line-height: 1.3; }
            h3 { margin: 0 0 6px; font-size: 13px; line-height: 1.3; }
            p { margin: 0; }
            .page { padding: 0; }
            .header { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding-bottom:14px; border-bottom:1px solid #d8dee9; }
            .header-copy { flex:1; min-width:0; }
            .header-kicker { font-size:10px; text-transform:uppercase; letter-spacing:.16em; color:#64748b; margin-bottom:6px; }
            .muted { color:#475569; font-size:12px; line-height:1.5; }
            .total-box { min-width:150px; padding:10px 12px; border:1px solid #d8dee9; text-align:right; }
            .total-label { font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:#64748b; }
            .total-value { margin-top:4px; font-size:18px; font-weight:700; color:#0f172a; }
            .meta { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin:16px 0 22px; }
            .meta div { background:#faf7f1; padding:9px 10px; border:1px solid #ece4d8; }
            .label { font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:#64748b; margin-bottom:3px; }
            .value { font-size:12px; font-weight:600; line-height:1.4; }
            table { width:100%; border-collapse:collapse; font-size:11px; }
            th { text-align:left; padding:7px; border-bottom:1px solid #d8dee9; background:#f8f4eb; }
            td { padding:7px; border-bottom:1px solid #eef2f7; vertical-align:top; line-height:1.45; }
            .panel-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:10px; }
            .panel { background:#faf7f1; border:1px solid #ece4d8; padding:10px; }
            .panel-title-row { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
            .panel-title { font-size:12px; font-weight:700; }
            .panel-total { font-size:12px; font-weight:700; color:#0f172a; }
            .bullet-list { margin:0; padding-left:16px; color:#475569; font-size:12px; line-height:1.5; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="header-copy">
                <div class="header-kicker">FastLane Studio Export</div>
                <h1>${escapeHtml(mergedBrief?.eventName || 'FastLane Studio Export')}</h1>
                <div class="muted">Event-Brief, Angebotslogik, Varianten und operative Leitplanken.</div>
              </div>
              <div class="total-box">
                  <div class="total-label">Gesamtsumme</div>
                  <div class="total-value">${escapeHtml(offer?.subtotalFormatted || 'Preis offen')}</div>
                </div>
              </div>
            </div>
            <div class="meta">
              <div><div class="label">Kunde</div><div class="value">${escapeHtml(mergedBrief?.customerName || 'Noch offen')}</div></div>
              <div><div class="label">Ort</div><div class="value">${escapeHtml(mergedBrief?.eventLocation || 'Noch offen')}</div></div>
              <div><div class="label">Teilnehmer</div><div class="value">${escapeHtml(mergedBrief?.attendees || 'Noch offen')}</div></div>
              <div><div class="label">Budget</div><div class="value">${escapeHtml(mergedBrief?.budget || 'Noch offen')}</div></div>
              <div><div class="label">Szenario</div><div class="value">${escapeHtml(mergedBrief?.checkInScenario || 'Noch offen')}</div></div>
              <div><div class="label">Support</div><div class="value">${escapeHtml(mergedBrief?.supportLevel || 'Noch offen')}</div></div>
            </div>
            ${(offer?.variants?.length ?? 0) > 0 ? `
              <section style="margin:24px 0;">
                <h2>Angebotsvarianten</h2>
                <div class="panel-grid">
                  ${variantHtml}
                </div>
              </section>
            ` : ''}
            <section style="margin:24px 0;">
              <h2>Module & Positionen</h2>
              ${modulesHtml || '<div class="muted">Noch keine Module mit Preisen verfuegbar.</div>'}
            </section>
            ${listHtml('Annahmen', offer?.assumptions ?? [])}
            ${listHtml('Offene Punkte', offer?.openQuestions ?? [])}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleReset = () => {
    setMessages([{ role: 'model', text: initialMessage }]);
    setBrief(null);
    setOffer(null);
    setManualBrief({
      customerName: '',
      eventName: '',
      eventLocation: '',
      attendees: '',
      budget: '',
      checkInScenario: '',
      supportLevel: ''
    });
    setManualBriefTouched({
      customerName: false,
      eventName: false,
      eventLocation: false,
      attendees: false,
      budget: false,
      checkInScenario: false,
      supportLevel: false
    });
    setInput('');
    setInputMode('easy');
    setStructuredDraft({
      customerName: '',
      eventName: '',
      eventLocation: '',
      eventDates: '',
      attendees: '',
      checkInScenario: '',
      softwareNeeds: '',
      integrations: '',
      projectManagement: '',
      rentalNeeds: '',
      consumables: '',
      supportLevel: '',
      logistics: '',
      budget: ''
    });
    setStructuredDraftTouched({
      customerName: false,
      eventName: false,
      eventLocation: false,
      eventDates: false,
      attendees: false,
      checkInScenario: false,
      softwareNeeds: false,
      integrations: false,
      projectManagement: false,
      rentalNeeds: false,
      consumables: false,
      supportLevel: false,
      logistics: false,
      budget: false
    });
    setOpenStructuredSections({
      basis: true,
      checkin: false,
      operations: false,
      logistics: false
    });
    setError(null);
  };

  const handleManualBriefChange = (key: keyof ManualBriefFields, value: string) => {
    setManualBriefTouched((current) => ({
      ...current,
      [key]: true
    }));
    setManualBrief((current) => ({
      ...current,
      [key]: value
    }));
  };

  const focusWorkspaceComposer = () => {
    if (workspaceComposerRef.current) {
      workspaceComposerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      workspaceComposerRef.current.focus();
    }
  };

  const handleStructuredDraftChange = (key: keyof StructuredDraft, value: string) => {
    setStructuredDraftTouched((current) => ({
      ...current,
      [key]: true
    }));
    setStructuredDraft((current) => ({
      ...current,
      [key]: value
    }));
  };

  const openPromptReview = (prompt: string, notice?: string) => {
    setInputMode('prompt');
    setInput(prompt);
    setPendingPromptReview(prompt);
    if (notice) {
      setStructuredActionNotice(notice);
    }
    requestAnimationFrame(() => focusWorkspaceComposer());
  };

  const handleApproveReviewedPrompt = async () => {
    const prompt = String(pendingPromptReview ?? '').trim();
    if (!prompt) return;
    setPendingPromptReview(null);
    await handleSend(prompt, 'prompt');
  };

  const handleSend = async (prefill?: string, modeOverride?: AiExplorerInputMode) => {
    const nextText = (prefill ?? input).trim();
    if (!nextText || isTyping) return;
    const effectiveMode = modeOverride ?? inputMode;

    setError(null);
    if (!prefill) {
      setInput('');
    }

    const nextMessages = [...messages, { role: 'user' as const, text: nextText }];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await getAiExplorerResponse(messages, nextText, effectiveMode);
      setMessages((prev) => [...prev, { role: 'model', text: response.text || 'Ich konnte noch keine belastbare Rueckmeldung erzeugen.' }]);
      setBrief(response.brief ?? null);
      setOffer(response.offer ?? null);
      setAssistantOpen(true);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'AI Explorer konnte nicht antworten.';
      setMessages((prev) => [...prev, { role: 'model', text: message }]);
      setError(message);
      setAssistantOpen(true);
    } finally {
      setIsTyping(false);
    }
  };

  const assistantOverlay = (
    <>
      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-5 sm:right-5 z-[100000] w-14 h-14 rounded-full bg-sap-blue text-white shadow-[0_18px_45px_-15px_rgba(0,143,211,0.7)] hover:bg-sap-blue/90 transition-all flex items-center justify-center ${assistantOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      <div
        className={`fixed z-[100000] flex items-end gap-5 transition-all duration-300 ${
          assistantMaximized ? 'inset-0 sm:inset-4 items-stretch justify-end' : 'inset-x-0 bottom-0 px-0 sm:bottom-5 sm:right-5 sm:left-auto sm:px-0'
        } ${
          assistantOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        {/* Bound Widget: Live Brief (Left Sidecar) */}
        <div className={`${assistantMaximized ? 'hidden xl:flex flex-1 max-w-[440px] h-full' : 'hidden lg:flex w-[min(380px,calc(100vw-480px))] h-[min(78vh,860px)]'} rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1622]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex-col origin-bottom-right`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03] shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-sap-blue flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              LIVE BRIEF
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-white/10 px-2 py-0.5 rounded-full">
               Auto-Sync
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-[#0e1621] scrollbar-hide">
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Event-Brief & Konzept</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Single Source of Truth: Die Parameter aus dem Kundendialog werden fortlaufend strukturiert und veredelt.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Widget Data</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Diese Werte koennen manuell angepasst werden und ueberschreiben die AI-Vorschau.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManualBrief({
                      customerName: '',
                      eventName: '',
                      eventLocation: '',
                      attendees: '',
                      budget: '',
                      checkInScenario: '',
                      supportLevel: ''
                    });
                    setManualBriefTouched({
                      customerName: false,
                      eventName: false,
                      eventLocation: false,
                      attendees: false,
                      budget: false,
                      checkInScenario: false,
                      supportLevel: false
                    });
                  }}
                  className="text-[11px] font-semibold text-sap-blue hover:text-sap-blue/80 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-3">
                {manualBriefFieldConfig.map((field) => (
                  <label key={field.key} className="block">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5">{field.label}</div>
                    <input
                      type="text"
                      value={manualBrief[field.key] || ''}
                      onChange={(event) => handleManualBriefChange(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1622] px-3.5 py-3 text-sm text-slate-800 dark:text-white shadow-sm focus:outline-none focus:border-sap-blue focus:ring-4 focus:ring-sap-blue/10 transition-all"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 shadow-sm mb-4">
                 <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Strukturierte Datenerfassung</div>
                 <div className="space-y-2.5 mt-3">
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase A — Event-Basisdaten</span><CheckCircle className="w-4 h-4 text-emerald-500"/></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase B — Software-Konfiguration</span>{currentPhaseIndex >= 1 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase C — Projektmanagement</span>{currentPhaseIndex >= 2 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase D — Miettechnik</span>{currentPhaseIndex >= 3 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase E — Verbrauchsmaterial</span>{currentPhaseIndex >= 4 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase F — Support vor Ort</span>{currentPhaseIndex >= 5 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase G — Transport & Reise</span>{currentPhaseIndex >= 6 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                 </div>
              </div>

              <div className="space-y-4">
                {showPricingOverview ? <div className="rounded-[1.5rem] border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 shadow-sm"><div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Automatische Angebotsvarianten</div><p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 leading-relaxed">Agent erzeugt: Standard (solide) / Plus (Redundanz) / Premium (High-availability) Kalkulation.</p></div> : <LockedPanel title="Angebotsvarianten" description="Wird anhand der Rechenmodelle nach der Erfassung generiert (z.B. Standard / Plus / Premium)." />}
                
                {showModuleDetails ? <div className="rounded-[1.5rem] border border-sap-blue/20 bg-sap-blue/5 p-4 shadow-sm"><div className="text-sm font-semibold text-sap-blue dark:text-blue-400">Regel-Engine & Rechenmodelle</div><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Plausibilitätschecks durchgeführt. Stations-, PM- und Verbrauchskalkulation angewendet (z.B. Teilnehmer × 10% Reserve).</p></div> : <LockedPanel title="Regel-Engine" description="Die Hintergrundkalkulation (Stationsbedarf, Verbrauchsmaterialien) berechnet die Detailpositionen automatisch." />}
                
                {showAssumptions ? <div className="rounded-[1.5rem] border border-orange-200 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/5 p-4 shadow-sm"><div className="text-sm font-semibold text-orange-700 dark:text-orange-400">Risiken & Constraints</div><p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1 leading-relaxed">Vorlaufzeiten, Abhängigkeiten, Constraints (z.B. Internet vor Ort) und offene Punkte dokumentiert.</p></div> : <LockedPanel title="Risiken & Constraints" description="Zusammenfassung von Constraints, offenen Punkten und Annahmen (Assumptions) zum Angebot." />}

                {showKnowledgeCards ? <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 shadow-sm"><div className="text-sm font-semibold text-slate-900 dark:text-white">Knowledge Cards</div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Modul-Spezifische Empfehlungen und Zusatzinfos (z.B. 'ab 1.500 pax: Backup-Drucker vorausgesetzt').</p></div> : <LockedPanel title="Knowledge Cards" description="Berater-Dienstleistungen: Typische Fehlerquellen und Empfehlungen für den Kunden je Leistungsbereich." />}
              </div>
            </div>
          </div>
        </div>

        {/* Existing Chat Widget Container */}
        <div className={`${assistantMaximized ? 'w-full max-w-[min(1040px,100%)] h-full' : 'w-full sm:w-[min(440px,calc(100vw-1.5rem))] h-[100dvh] max-h-[100dvh] sm:h-[min(78vh,860px)] sm:max-h-[min(78vh,860px)]'} rounded-none sm:rounded-[2rem] border-x-0 border-b-0 sm:border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1622]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col overscroll-contain`}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sap-blue/10 text-sap-blue flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sap-blue">KI-Agent</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">FastLane Assistant</div>
            </div>
          </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {assistantOnly ? (
              <a
                href="/studio"
                className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
                aria-label="Open studio"
              >
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            ) : null}
            <button
              onClick={() => setAssistantMaximized((current) => !current)}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
              aria-label={assistantMaximized ? 'Minimize assistant' : 'Maximize assistant'}
            >
              {assistantMaximized ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
              aria-label="Reset session"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => {
                setAssistantOpen(false);
                setAssistantMaximized(false);
              }}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
              aria-label="Close assistant"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 bg-white dark:bg-[#0f1622] scrollbar-hide overscroll-contain">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[96%] sm:max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-sap-gold text-white' : 'bg-sap-blue text-white'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div className={`min-w-0 break-words overflow-hidden p-3.5 sm:p-4 rounded-[1.5rem] sm:rounded-[1.75rem] text-[13.5px] leading-relaxed shadow-sm transition-all ${
                  msg.role === 'user' 
                    ? 'bg-sap-blue text-white rounded-br-none font-medium' 
                    : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-bl-none'
                }`}>
                  <RenderMessageText text={msg.text} />
                  {idx === messages.length - 1 && msg.role === 'model' && !isTyping && activeStarterPrompts && messages.length === 1 && !brief && (
                    <div className="mt-5 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Sparkles className="w-3 h-3 text-sap-blue" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Beispielantworten</span>
                      </div>
                      {activeStarterPrompts.slice(0, 2).map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="text-left px-4 py-3.5 rounded-2xl border border-sap-blue/15 bg-white dark:bg-[#0e1621] shadow-sm hover:border-sap-blue hover:shadow-md hover:-translate-y-0.5 text-[12px] leading-[1.6] text-slate-600 dark:text-slate-300 transition-all font-medium group"
                        >
                           <div className="group-hover:text-sap-blue transition-colors">{prompt}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping ? (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-sap-blue text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 px-4 py-3 rounded-[1.5rem] rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#131b28]/95 px-4 sm:px-5 pt-3.5 sm:pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-1 shadow-sm">
              {([
                { key: 'easy', label: 'Easy Mode' },
                { key: 'prompt', label: 'Prompt Mode' },
                { key: 'consulting', label: 'Consulting' }
              ] as const).map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setInputMode(mode.key)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    inputMode === mode.key
                      ? 'bg-sap-blue text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {inputMode === 'easy'
                ? 'Schritt fuer Schritt antworten'
                : inputMode === 'prompt'
                  ? 'Freien Event-Text direkt senden'
                  : 'Architektur, Pricing-Logik und Agent-Konzept beraten lassen'}
            </div>
          </div>

          {inputMode !== 'easy' ? (
            <div className="mb-3 rounded-[1.25rem] border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {inputMode === 'prompt'
                ? 'Schreiben Sie das Event wie in einer normalen E-Mail oder einem Briefing auf Deutsch. Der Agent uebernimmt die Angaben automatisch.'
                : 'Stellen Sie Fragen zu Agent-Architektur, Fragebaum, Produktkatalog, Preislogik, Angebotsvarianten, MVP-Stufen oder operativer Systemlogik.'}
            </div>
          ) : null}

          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={inputMode === 'easy'
                ? (mergedBrief?.currentQuestion || 'Geben Sie die Antwort fuer den aktuellen Schritt ein...')
                : inputMode === 'prompt'
                  ? 'z.B. Wir planen ein zweitaegiges Event in Berlin mit 800 Teilnehmern, Print-on-Demand, 8 Counter und Budgetrahmen von 25.000 EUR.'
                  : 'z.B. Wie wuerdest du fuer Teilnehmermanagement einen KI-Agenten mit Event-Brief, Pricing Engine, Varianten, Knowledge Cards und CRM-Uebergabe aufsetzen?'}
              className={`w-full bg-white dark:bg-[#0e1621] border border-slate-200 dark:border-white/10 rounded-3xl py-3.5 sm:py-4 pl-4 sm:pl-6 pr-16 focus:outline-none focus:border-sap-blue focus:ring-4 focus:ring-sap-blue/10 transition-all text-sm text-slate-800 dark:text-white resize-none shadow-sm scrollbar-hide ${inputMode === 'easy' ? 'h-[72px] sm:h-20' : 'h-[120px] sm:h-32'}`}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2.5 top-2.5 p-3.5 bg-sap-blue hover:bg-sap-blue/90 text-white rounded-[1.25rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-sap-blue/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );

  if (assistantOnly) {
    return assistantOverlay;
  }

  return (
    <div
      className={`flex flex-col w-full ${embedded ? 'max-w-none mx-0 bg-transparent rounded-none shadow-none' : 'max-w-[1680px] mx-auto bg-[#fffdf7] dark:bg-[#0e1621] rounded-[1.5rem] lg:rounded-[2rem] shadow-[0_30px_80px_-35px_rgba(24,33,49,0.28)]'} overflow-hidden transition-all duration-500 ${
        embedded ? 'h-full min-h-0' : 'h-full min-h-0'
      }`}
    >
      <div className={`h-[3px] sm:h-1 w-full bg-slate-200/60 dark:bg-white/[0.05] studio-progress-track transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
        {isTyping ? <div className="studio-progress-bar" /> : null}
      </div>
      <div className="px-4 sm:px-6 md:px-8 py-3 bg-transparent dark:bg-transparent">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-[520px]">
          <div className="px-3 py-2 min-h-[60px] flex flex-col justify-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Progress</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{mergedBrief?.progressLabel || '0/7 Phasen'}</div>
          </div>
          <div className="px-3 py-2 min-h-[60px] flex flex-col justify-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Mode</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {inputMode === 'easy' ? 'Guided Capture' : inputMode === 'prompt' ? 'Free Prompt' : 'Consulting'}
            </div>
          </div>
          <div className="px-3 py-2 min-h-[60px] flex flex-col justify-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{isTyping ? 'Analysiert...' : 'Bereit'}</div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-8 py-3 bg-transparent dark:bg-transparent">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {phases.map((phase, index) => {
            const isActive = phase === mergedBrief?.currentPhase || (!mergedBrief?.currentPhase && index === 0);
            const isDone = index < currentPhaseIndex;
            return (
              <div key={phase} className={`px-3 py-3 sm:px-4 transition-all ${isActive ? 'bg-sap-blue/[0.05] shadow-[inset_0_0_0_1px_rgba(0,143,211,0.16)]' : isDone ? 'bg-emerald-50/65 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)] dark:bg-emerald-500/8 dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.16)]' : 'bg-transparent shadow-[inset_0_0_0_1px_rgba(234,223,206,0.45)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'}`}>
                <div className="flex flex-col items-start gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${isActive ? 'bg-sap-blue text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-[#efe4ce] text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight break-words">{phase}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)] flex-1 min-h-0">
        <section className="min-h-0 flex flex-col bg-transparent dark:bg-transparent">
          <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4">
            <StudioSection
              eyebrow="Workspace"
              title="Aktuelle Eingabe"
              description={inputMode === 'consulting'
                ? 'Nutzen Sie das Studio fuer Systemarchitektur, Preislogik und Agent-Konzeption.'
                : 'Antworten Sie direkt auf die aktuelle Phase oder senden Sie einen kompletten Briefing-Text.'}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-sap-blue/10 text-sap-blue flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-200">{leadQuestionText}</div>
              </div>

              <div className="mt-4 flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit rounded-full bg-[#fff8ec] dark:bg-white/[0.03] p-1 shadow-[inset_0_0_0_1px_rgba(234,223,206,0.7)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  {([
                    { key: 'easy', label: 'Easy Mode' },
                    { key: 'prompt', label: 'Prompt Mode' },
                    { key: 'consulting', label: 'Consulting' }
                  ] as const).map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setInputMode(mode.key)}
                      className={`rounded-full px-3.5 py-2 text-[11px] font-semibold transition-colors ${
                        inputMode === mode.key
                          ? 'bg-sap-blue text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {inputMode === 'easy'
                    ? 'Der Agent fragt die fehlenden Punkte Schritt fuer Schritt ab.'
                    : inputMode === 'prompt'
                      ? 'Schreiben Sie einen freien deutschen Event-Text wie in einem normalen Briefing.'
                    : 'Nutzen Sie das Studio fuer Agent-Konzept, Preislogik, Produktkatalog, Fragebaum und Architekturfragen.'}
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={workspaceComposerRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (inputMode !== 'easy' && e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={inputMode === 'easy'
                    ? (mergedBrief?.currentQuestion || 'Geben Sie die Antwort fuer den aktuellen Schritt ein...')
                    : inputMode === 'prompt'
                      ? 'z.B. Wir planen ein zweitaegiges Event in Berlin mit 800 Teilnehmern, Print-on-Demand, 8 Counter, Scanner, Badge-Druckern und einem Budgetrahmen von 25.000 EUR.'
                      : 'z.B. Wie sollte ein KI-Agent fuer Teilnehmermanagement aufgebaut sein, inklusive Event-Brief, Preisregeln, Angebotsvarianten und Knowledge Cards?'}
                  className={`w-full bg-[#fff8ef] dark:bg-white/[0.02] rounded-[1.25rem] py-3.5 pl-4 ${inputMode === 'easy' ? 'pr-[4.5rem]' : 'pr-16'} focus:outline-none focus:ring-4 focus:ring-sap-blue/10 transition-all text-sm text-slate-800 dark:text-white resize-none scrollbar-hide shadow-[inset_0_0_0_1px_rgba(234,223,206,0.72)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] ${inputMode === 'easy' ? 'h-24' : 'h-32'}`}
                />
                {inputMode === 'easy' ? (
                  <button
                    type="button"
                    onClick={expandEasyInputWithAi}
                    disabled={!input.trim() || isTyping || isPromptGenerating}
                    className="absolute right-[3.9rem] bottom-2.5 p-3 bg-white text-sap-blue hover:bg-[#fff8ef] rounded-[1rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)]"
                    aria-label="Eingabe erweitern"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                ) : null}
                {inputMode !== 'easy' ? (
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2.5 bottom-2.5 p-3 bg-sap-blue hover:bg-sap-blue/90 text-white rounded-[1rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-sap-blue/25"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              <div className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {inputMode === 'easy'
                  ? 'Easy Mode erzeugt zuerst einen studiofaehigen Prompt. Versendet wird erst nach der Optimierung.'
                  : inputMode === 'prompt'
                    ? 'Prompt Mode eignet sich fuer komplette Event-Briefings in einem freien Text.'
                    : 'Consulting Mode eignet sich fuer Agent-Design, Preislogik, Architektur, MVP und Angebotsstrategie.'}
              </div>
            </StudioSection>
          </div>
          <div className="flex-1 min-h-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <StudioSection
                eyebrow="Activity"
                title="Studio Aktivitaet"
                description="Die letzten Eingaben und Antworten bleiben hier sichtbar, waehrend das Studio Brief und Angebotslogik aktualisiert."
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div />
                  {isTyping ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-sap-blue/10 px-3 py-1 text-[11px] font-semibold text-sap-blue">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:120ms]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:240ms]"></span>
                      </span>
                      Analysiere Eingabe
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3">
                  {recentMessages.map((msg, idx) => (
                    <div
                      key={`${msg.role}-${idx}-${msg.text.slice(0, 12)}`}
                      className={`rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-sap-blue text-white'
                          : 'bg-white/85 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className={`mb-1 text-[10px] font-bold uppercase tracking-[0.16em] ${msg.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                        {msg.role === 'user' ? 'Ihre Eingabe' : 'Assistent'}
                      </div>
                      <div className="line-clamp-4 whitespace-pre-wrap break-words">{msg.text}</div>
                    </div>
                  ))}

                  {isTyping ? (
                    <div className="rounded-[1.25rem] bg-white/85 dark:bg-white/[0.04] px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
                      Die Anfrage wird verarbeitet. Brief, Kostenlogik und naechste Antwort werden gerade aktualisiert.
                    </div>
                  ) : null}
                </div>
              </StudioSection>

              <StudioSection
                eyebrow="Live Brief"
                title="Aktueller Projektstand"
                description="Die wichtigsten Eckdaten, Treiber und offenen Punkte werden laufend aus dem Dialog abgeleitet."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] bg-[#fff8ef] dark:bg-white/[0.03] p-4 shadow-[0_12px_26px_-24px_rgba(32,41,57,0.22)]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</div>
                    </div>
                  ))}
                </div>

                {locationDetails.length ? (
                  <div className="mt-4 rounded-[1.5rem] bg-[#fff8ef] dark:bg-white/[0.03] p-4 shadow-[0_12px_26px_-24px_rgba(32,41,57,0.22)]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Standortdetails</div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {locationDetails.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="rounded-[1rem] bg-white/80 dark:bg-white/[0.04] px-3.5 py-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-1">{item.label}</div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(mergedBrief?.serviceModules?.length || mergedBrief?.costDrivers?.length || offer?.assumptions?.length || offer?.openQuestions?.length) ? (
                  <div className="grid lg:grid-cols-2 gap-4 mt-4">
                    <div className="rounded-[1.5rem] bg-[#fff8ef] dark:bg-white/[0.03] p-4 shadow-[0_12px_26px_-24px_rgba(32,41,57,0.22)]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Service Modules</div>
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {(mergedBrief?.serviceModules ?? []).map((item) => (
                          <div key={item}>• {item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#fff8ef] dark:bg-white/[0.03] p-4 shadow-[0_12px_26px_-24px_rgba(32,41,57,0.22)]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Cost Drivers</div>
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {(mergedBrief?.costDrivers ?? []).map((item) => (
                          <div key={item}>• {item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#fff8ef] dark:bg-white/[0.03] p-4 shadow-[0_12px_26px_-24px_rgba(32,41,57,0.22)]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Assumptions</div>
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {(offer?.assumptions ?? []).map((item) => (
                          <div key={item}>• {item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#fff8ef] dark:bg-white/[0.03] p-4 shadow-[0_12px_26px_-24px_rgba(32,41,57,0.22)]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Open Questions</div>
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {(offer?.openQuestions ?? []).map((item) => (
                          <div key={item}>• {item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </StudioSection>
            </div>

            <div className="mt-5">
            <StudioSection
              eyebrow="Manuelle Eingabe"
              title="Strukturierte Felder"
              description="Pflegen Sie Event- und Angebotsdaten manuell und uebernehmen Sie diese als Prompt oder senden Sie sie direkt an das Studio."
              actions={
                <>
                  <button
                    type="button"
                    onClick={applyStructuredDemo}
                    disabled={isPromptGenerating}
                    className={`${subtleToolbarButtonClass} relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Beispiel fuellen
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      let draftWasEmpty = false;
                      if (!buildStructuredPrompt()) {
                        draftWasEmpty = true;
                        applyStructuredDemo();
                      }
                      const prompt = await generateStructuredPromptWithAi();
                      if (!prompt) return;
                      setInputMode('prompt');
                      setInput(prompt);
                      setStructuredActionNotice(draftWasEmpty ? 'AI-Prompt wurde aus dem Beispiel generiert.' : 'AI-Prompt wurde in das Studio uebernommen.');
                      requestAnimationFrame(() => focusWorkspaceComposer());
                    }}
                    disabled={isPromptGenerating}
                    className={`${subtleToolbarButtonClass} relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isPromptGenerating ? 'Prompt wird erstellt...' : 'In Prompt uebernehmen'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      let draftWasEmpty = false;
                      if (!buildStructuredPrompt()) {
                        draftWasEmpty = true;
                        applyStructuredDemo();
                      }
                      const prompt = await generateStructuredPromptWithAi();
                      if (!prompt) return;
                      setInputMode('prompt');
                      setInput(prompt);
                      setStructuredActionNotice(draftWasEmpty ? 'AI-Prompt wird direkt aus dem Beispiel an das Studio gesendet.' : 'AI-Prompt wird direkt an das Studio gesendet.');
                      requestAnimationFrame(() => focusWorkspaceComposer());
                      handleSend(prompt, 'prompt');
                    }}
                    disabled={isPromptGenerating || isTyping}
                    className={`${primaryToolbarButtonClass} relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isPromptGenerating ? 'AI bereitet vor...' : 'Direkt senden'}
                  </button>
                </>
              }
            >
              <div ref={structuredInputRef} className="mt-4 space-y-3">
                {structuredActionNotice ? (
                  <div className="rounded-[1rem] bg-sap-blue/8 px-4 py-3 text-xs font-medium text-sap-blue shadow-[inset_0_0_0_1px_rgba(0,143,211,0.12)]">
                    {structuredActionNotice}
                  </div>
                ) : null}
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-white/75 dark:bg-white/[0.04] p-4 shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-1">Live Sync</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{mergedBrief?.eventName || 'Noch kein Event synchronisiert'}</div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Ergebnisse aus Brief, Modulen und Kostenlogik fuellen diese Felder automatisch vor. Eigene Aenderungen bleiben erhalten.
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/75 dark:bg-white/[0.04] p-4 shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-1">Preis Snapshot</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{offer?.subtotalFormatted || 'Preis offen'}</div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {offer?.budgetStatus || `${offer?.modules?.length ?? 0} Module und ${offer?.variants?.length ?? 0} Varianten verfuegbar`}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/75 dark:bg-white/[0.04] p-4 shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-1">Feinschliff</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Direkt editierbar</div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Aendern Sie hier einzelne Event-, Scope- und Budgetdetails und senden Sie die aktualisierte Fassung direkt wieder ins Studio.
                    </div>
                  </div>
                </div>
                {structuredSections.map((section) => {
                  const isOpen = openStructuredSections[section.key];

                  return (
                    <div key={section.key} className="rounded-[1.35rem] bg-white/70 dark:bg-white/[0.04] shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)]">
                      <button
                        type="button"
                        onClick={() => setOpenStructuredSections((current) => ({ ...current, [section.key]: !current[section.key] }))}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</div>
                          <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{section.description}</div>
                        </div>
                        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen ? (
                        <div className="border-t border-[rgba(234,223,206,0.7)] px-4 pb-4 pt-4 dark:border-white/10">
                          <div className="grid gap-3 md:grid-cols-2">
                            {section.fields.map((field) => (
                              <label key={field.key} className="block">
                                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{field.label}</div>
                                {field.rows && field.rows > 1 ? (
                                  <textarea
                                    value={structuredDraft[field.key]}
                                    onChange={(event) => handleStructuredDraftChange(field.key, event.target.value)}
                                    rows={field.rows}
                                    placeholder={field.placeholder}
                                    className="w-full resize-none rounded-[1.1rem] bg-white/85 dark:bg-white/[0.04] px-3.5 py-3 text-sm text-slate-800 shadow-[inset_0_0_0_1px_rgba(234,223,206,0.72)] transition focus:outline-none focus:ring-4 focus:ring-sap-blue/10 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={structuredDraft[field.key]}
                                    onChange={(event) => handleStructuredDraftChange(field.key, event.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full rounded-[1.1rem] bg-white/85 dark:bg-white/[0.04] px-3.5 py-3 text-sm text-slate-800 shadow-[inset_0_0_0_1px_rgba(234,223,206,0.72)] transition focus:outline-none focus:ring-4 focus:ring-sap-blue/10 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                                  />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </StudioSection>
            </div>
          </div>
        </section>

        <aside className="bg-transparent dark:bg-transparent p-4 sm:p-6 md:p-7 min-h-0 overflow-y-auto">
          <div className="mb-4 px-1 py-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Offer Console</div>
            <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {inputMode === 'consulting' ? 'Consulting & Konzept' : 'Preis, Module und Varianten'}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {inputMode === 'consulting'
                ? 'Nutzen Sie die rechte Seite fuer Architektur, Deliverables und fachliche Leitplanken.'
                : 'Hier verdichtet das Studio Positionen, Kosten, Varianten und operative Empfehlungen.'}
            </div>
          </div>
          {inputMode === 'consulting' ? (
            <div className="space-y-4">
              <ConsoleSection
                title="Consulting Fokus"
                description="Dieser Modus beantwortet Architektur-, Produkt- und Angebotsfragen ohne den Event-Dialog zu erzwingen."
              >
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Dieses Studio kann in diesem Modus Architektur, Event-Brief-Struktur, Preisregeln, Angebotsmodule, Variantenlogik, MVP-Stufen und operative Modellierung ausarbeiten.
                </p>
              </ConsoleSection>
              <ConsoleSection
                title="Typische Deliverables"
                description="Diese Ergebnisbausteine kann das Studio ausarbeiten oder vorbereiten."
              >
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div>Event-Brief Struktur und Pflichtfelder</div>
                  <div>Interview-Flow je Angebotsbereich</div>
                  <div>Preis- und Rechenlogik fuer Module</div>
                  <div>Standard / Plus / Premium Varianten</div>
                  <div>Knowledge Cards und operative Empfehlungen</div>
                  <div>CRM-, PM- und Dokumenten-Uebergabe</div>
                </div>
              </ConsoleSection>
            </div>
          ) : showPricingOverview ? (
            <div className="space-y-4">
              <ConsoleSection
                title="Kostenuebersicht"
                description="Gesamtsumme, Budgetbezug und Export der aktuellen Kalkulation."
                actions={
                  <>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                    className={subtleToolbarButtonClass}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSpreadsheet}
                    className={subtleToolbarButtonClass}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Excel
                    </button>
                  </>
                }
              >
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {offer?.hasPricing ? offer?.subtotalFormatted || formatPriceValue(offer?.subtotal) : 'Preis offen'}
                </div>
                {(offer?.budget || offer?.budgetStatus) ? (
                  <div className="mt-3 space-y-1">
                    {offer?.budget ? (
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Budget: {offer.budget}
                      </div>
                    ) : null}
                    {offer?.budgetStatus ? (
                      <div className={`text-sm font-semibold ${offer.budgetStatus.startsWith('Im Budget') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {offer.budgetStatus}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </ConsoleSection>

              {offer?.modules?.length ? (
                <ConsoleSection
                  title="Module & Positionen"
                  description="Alle empfohlenen Module mit den aktuell abgeleiteten Positionen."
                >
                  <div className="space-y-4">
                    {offer.modules.map((module) => (
                      <div key={module.key} className="rounded-[1.25rem] bg-white/80 dark:bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{module.title}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{module.summary}</div>
                          </div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {formatPriceValue(module.subtotal, 'Offen')}
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {module.positions.map((position) => (
                            <div key={`${module.key}-${position.label}`} className="flex items-start justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                              <div>{position.label}</div>
                              <div className="text-right">
                                <div>{position.quantity} {position.unit}</div>
                                <div>{formatPriceValue(position.total, 'Offen')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ConsoleSection>
              ) : null}

              {offer?.variants?.length ? (
                <ConsoleSection
                  title="Angebotsvarianten"
                  description="Alternative Angebotspakete auf Basis der aktuellen Scope- und Risikoannahmen."
                >
                  <div className="space-y-3">
                    {offer.variants.map((variant) => (
                      <div key={variant.name} className="rounded-[1.25rem] bg-white/80 dark:bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{variant.name}</div>
                          <div className="text-sm font-semibold text-sap-blue">{variant.totalFormatted || 'Offen'}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{variant.description}</div>
                      </div>
                    ))}
                  </div>
                </ConsoleSection>
              ) : null}

              {knowledgeCards.length ? (
                <ConsoleSection
                  title="Knowledge Cards"
                  description="Fachliche Empfehlungen, Risiken und typische Zusatzoptionen pro Modul."
                >
                  <div className="space-y-4">
                    {knowledgeCards.map((card) => (
                      <div key={card.title} className="rounded-[1.25rem] bg-white/80 dark:bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</div>
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">Empfehlung: {card.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </ConsoleSection>
              ) : null}
            </div>
          ) : (
            <LockedPanel title="Kostenuebersicht" description="Die Kostenuebersicht wird erst nach Technik- und Scope-Angaben freigegeben." />
          )}
        </aside>
      </div>

      {!embedded ? assistantOverlay : null}
      {isPromptGenerating ? (
        <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100001] pointer-events-none">
          <div className="flex items-center gap-3 rounded-2xl bg-white/96 px-4 py-3 text-slate-900 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur-md dark:bg-[#f8f8f8]">
            <span className="inline-flex h-5 w-5 items-center justify-center">
              <span className="h-4 w-4 rounded-full border-2 border-sap-blue/20 border-t-sap-blue animate-spin" />
            </span>
            <span className="text-sm font-semibold tracking-[0.01em]">Fixing Prompt</span>
          </div>
        </div>
      ) : null}
      {pendingPromptReview ? (
        <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-[1.75rem] bg-white px-6 py-6 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.45)] dark:bg-[#0f1622]">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sap-blue">Prompt Review</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Die Optimierung ist abgeschlossen.</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Der Prompt wurde fuer das Studio vorbereitet. Moechten Sie jetzt mit der Erstellung starten?
            </div>
            <div className="mt-4 rounded-[1.25rem] bg-[#fff8ef] dark:bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200 max-h-44 overflow-y-auto">
              {pendingPromptReview}
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingPromptReview(null)}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Ueberspringen
              </button>
              <button
                type="button"
                onClick={handleApproveReviewedPrompt}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-sap-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-sap-blue/90"
              >
                Senden
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ErpAdvisor;
