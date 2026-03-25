import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Avatar from 'react-nice-avatar';
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

const FSCHAT_AVATAR_CONFIG = {
  sex: 'woman' as const,
  faceColor: '#f7d7c4',
  earSize: 'small' as const,
  hairColor: '#f1c75b',
  hairStyle: 'womanLong' as const,
  hatStyle: 'none' as const,
  eyeStyle: 'smile' as const,
  glassesStyle: 'none' as const,
  noseStyle: 'short' as const,
  mouthStyle: 'smile' as const,
  shirtStyle: 'polo' as const,
  shirtColor: '#008fd3',
  bgColor: '#ebf8ff',
  isGradient: true
};

const fsChatAvatarMotionStyles = `
  @keyframes fschat-avatar-float {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-2px) scale(1.02);
    }
  }

  @keyframes fschat-avatar-glow {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.55;
    }
  }
`;

const FSChatAvatar: React.FC<{ className?: string }> = ({ className = 'h-full w-full' }) => (
  <div
    className={`relative overflow-hidden rounded-full ${className}`}
    style={{ animation: 'fschat-avatar-float 3.2s ease-in-out infinite' }}
  >
    <div
      className="absolute inset-[8%] rounded-full bg-white/30 blur-[6px]"
      style={{ animation: 'fschat-avatar-glow 4s ease-in-out infinite' }}
    />
    <Avatar
      className="relative z-[1] h-full w-full scale-[1.02]"
      shape="circle"
      {...FSCHAT_AVATAR_CONFIG}
    />
  </div>
);

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

const createInitialMessage = (companyName: string, isEnglish: boolean) => isEnglish
  ? `Hello. I am your ${companyName} Assistant (pre-sales AI agent).

I will guide you through a structured offer interview to capture your event setup, including software, project management, rental hardware, consumables, support and logistics. Supported languages: German, English, Turkish.

I can then generate:
- A modular event briefing JSON
- A detailed commercial overview with calculation logic
- Automatic offer variants (Standard / Plus / Premium)
- Assumptions and constraints

Let's start with **Phase A (event basics)**: what is the event name, where will it take place, what are the dates, what attendance do you expect, what are the setup / teardown times, how does your check-in scenario look, and is there already a budget or budget range?`
  : `Guten Tag. Ich bin Ihr ${companyName} Assistant (Pre-Sales KI-Agent).

Ich fuehre mit Ihnen ein strukturiertes Angebots-Interview durch, um Ihr Event-Setup (Software, PM, Miettechnik, Verbrauchsmaterial, Support & Logistik) zu erfassen. Unterstuetzte Sprachen: Deutsch, Englisch, Tuerkisch.

Zusammengefasst generiere ich daraus:
- Ein modulares Event-Briefing JSON
- Eine detaillierte Kostenübersicht inkl. Kalkulationslogiken
- Automatische Angebotsvarianten (Standard / Plus / Premium)
- Annahmen & Constraints

Starten wir mit **Phase A (Event-Basisdaten)**: Wie heisst das Event, wo findet es statt, Datum, erwartete Teilnehmerzahl, Aufbau/Abbau-Zeiten, wie sieht Ihr Check-in-Szenario aus und gibt es bereits ein Budget oder einen Budgetrahmen?`;

const createWidgetInitialMessage = (companyName: string, isEnglish: boolean) => isEnglish
  ? `Hello. I am your FastLane Chat workspace copilot.

Tell me directly what should change and I will apply it to the live brief, scope and pricing logic immediately.

Examples:
- Set the event name to Istanbul Corporate Summit 2026
- Change the attendee count to 1,200 and add 14 counters
- Move the venue to Istanbul Congress Center and set the dates to 14-16 October 2026
- Add VIP fast lane, badge printing and Salesforce integration`
  : `Hallo. Ich bin Ihr FastLane-Chat-Workspace-Copilot.

Sagen Sie mir direkt, was geaendert werden soll, und ich uebernehme es sofort in Live-Briefing, Scope und Preislogik.

Beispiele:
- Setze den Eventnamen auf Istanbul Corporate Summit 2026
- Aendere die Teilnehmerzahl auf 1.200 und fuege 14 Counter hinzu
- Setze das Venue auf Istanbul Congress Center und das Datum auf 14.-16. Oktober 2026
- Fuege VIP-Fast-Lane, Badge-Druck und Salesforce-Integration hinzu`;

const widgetLeadMessage = (isEnglish: boolean) => isEnglish
  ? 'Use the prompt field below to describe the event or tell the workspace what should change. The brief, modules and pricing update directly from your input.'
  : 'Nutzen Sie das Prompt-Feld unten, um das Event zu beschreiben oder Aenderungen direkt vorzugeben. Briefing, Module und Preislogik werden sofort aktualisiert.';

const formatCurrency = (value: number, locale: 'de' | 'en' = 'de') =>
  new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);

const formatPriceValue = (value?: number | null, fallback = 'Preis offen', locale: 'de' | 'en' = 'de') =>
  typeof value === 'number' ? formatCurrency(value, locale) : fallback;

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
  <div className="rounded-[2rem] bg-slate-50 dark:bg-dark-surface p-6 border border-slate-300 dark:border-white/15 shadow-sm transition-all group hover:border-sap-gold/30">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center">
        <Lock className="w-4 h-4 text-slate-400 group-hover:text-sap-gold transition-colors" />
      </div>
      <div className="text-base font-black text-slate-800 dark:text-dark-text-primary tracking-tight">{title}</div>
    </div>
    <p className="text-sm text-slate-500 dark:text-dark-text-secondary leading-relaxed font-bold">{description}</p>
  </div>
);

const StudioSection: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ eyebrow, title, description, actions, children }) => (
  <section className="p-6 md:p-10">
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <div className="text-xs font-black uppercase tracking-[0.3em] text-sap-blue/70 dark:text-sap-blue/90 mb-3">{eyebrow}</div>
        ) : null}
        <div className="text-3xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight uppercase">{title}</div>
        {description ? (
          <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-dark-text-secondary font-bold max-w-2xl">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 lg:justify-end">{actions}</div> : null}
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
  'inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold shadow-sm transition-all whitespace-nowrap active:scale-95';

const subtleToolbarButtonClass = `${toolbarButtonClass} bg-white dark:bg-dark-surface/60 text-slate-700 dark:text-dark-text-primary border border-slate-300 dark:border-white/15 hover:border-sap-blue hover:text-sap-blue dark:hover:text-sap-blue shadow-[0_8px_20px_-15px_rgba(0,0,0,0.1)]`;
const primaryToolbarButtonClass = `${toolbarButtonClass} bg-sap-blue text-white hover:bg-sap-blue/90 shadow-[0_12px_24px_-12px_rgba(0,30,70,0.4)]`;

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

const structuredDraftDemoDe: StructuredDraft = {
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

const structuredDraftDemoEn: StructuredDraft = {
  customerName: 'Laura Demir',
  eventName: 'Annual Growth Summit 2026',
  eventLocation: 'Filderhalle in Leinfelden-Echterdingen, Germany',
  eventDates: '17-18 September 2026, setup on 16 September from 14:00, teardown on 18 September from 18:30',
  attendees: '1,200',
  checkInScenario: 'Print-on-demand across 3 entrances with 12 counters, walk-ins and a fast lane for VIPs',
  softwareNeeds: 'Participant import, badge printing, check-in, session scanning, lead capture, reporting',
  integrations: 'Salesforce, bilingual setup in German and English',
  projectManagement: 'Kickoff, weekly status calls, test run two weeks before the event, final rehearsal on the day before',
  rentalNeeds: '12 iPads, 4 badge printers, 14 scanners, 2 LTE routers',
  consumables: 'Paper badges, lanyards, holders, printer rolls and a 10% reserve',
  supportLevel: 'Extended support with 3 technicians and 1 supervisor onsite',
  logistics: 'Freight forwarding for hardware, 2 hotel nights for the team, delivery on the day before',
  budget: 'EUR 25,000 to 30,000'
};

const buildLocalStructuredPrompt = (draft: StructuredDraft, isEnglish: boolean) => {
  const intros = [
    isEnglish
      ? `We are planning ${draft.eventName || 'an event'}${draft.eventLocation ? ` in ${draft.eventLocation}` : ''}.`
      : `Wir planen ${draft.eventName || 'ein Event'}${draft.eventLocation ? ` in ${draft.eventLocation}` : ''}.`,
    isEnglish
      ? `${draft.customerName ? `${draft.customerName} is coordinating ` : 'We are coordinating '}the event ${draft.eventName || 'currently'}${draft.eventLocation ? ` at ${draft.eventLocation}` : ''}.`
      : `${draft.customerName ? `${draft.customerName} betreut ` : 'Wir betreuen '}das Event ${draft.eventName || 'aktuell'}${draft.eventLocation ? ` am Standort ${draft.eventLocation}` : ''}.`,
    isEnglish
      ? `We need a structured proposal for ${draft.eventName || 'the planned event'}${draft.eventLocation ? ` in ${draft.eventLocation}` : ''}.`
      : `Fuer ${draft.eventName || 'das geplante Event'}${draft.eventLocation ? ` in ${draft.eventLocation}` : ''} benoetigen wir ein strukturiertes Angebot.`
  ];

  const timing = draft.eventDates ? (isEnglish ? `The relevant dates and timings are planned as follows: ${draft.eventDates}.` : `Die relevanten Termine und Zeiten sind wie folgt geplant: ${draft.eventDates}.`) : '';
  const attendees = draft.attendees ? (isEnglish ? `We expect ${draft.attendees} attendees.` : `Wir erwarten ${draft.attendees} Teilnehmende.`) : '';
  const scenario = draft.checkInScenario ? (isEnglish ? `The planned check-in scenario is as follows: ${draft.checkInScenario}.` : `Fuer den Check-in ist folgendes Szenario vorgesehen: ${draft.checkInScenario}.`) : '';
  const software = draft.softwareNeeds ? (isEnglish ? `On the software side we need ${draft.softwareNeeds}.` : `Auf der Software-Seite werden ${draft.softwareNeeds} benoetigt.`) : '';
  const integrations = draft.integrations ? (isEnglish ? `Please also consider the following integrations or system connections: ${draft.integrations}.` : `Zu beruecksichtigen sind zudem folgende Integrationen bzw. Systemanbindungen: ${draft.integrations}.`) : '';
  const pm = draft.projectManagement ? (isEnglish ? `For project management and preparation, the expected scope is: ${draft.projectManagement}.` : `Im Projektmanagement und in der Vorbereitung ist folgender Umfang vorgesehen: ${draft.projectManagement}.`) : '';
  const rental = draft.rentalNeeds ? (isEnglish ? `The current rental hardware requirement is: ${draft.rentalNeeds}.` : `An Miettechnik wird aktuell benoetigt: ${draft.rentalNeeds}.`) : '';
  const consumables = draft.consumables ? (isEnglish ? `For consumables we are planning with ${draft.consumables}.` : `Beim Verbrauchsmaterial planen wir mit ${draft.consumables}.`) : '';
  const support = draft.supportLevel ? (isEnglish ? `On site we expect ${draft.supportLevel}.` : `Vor Ort wird ${draft.supportLevel} eingeplant.`) : '';
  const logistics = draft.logistics ? (isEnglish ? `For transport, travel and logistics the current assumption is: ${draft.logistics}.` : `Fuer Transport, Reise und Logistik gilt derzeit: ${draft.logistics}.`) : '';
  const budget = draft.budget ? (isEnglish ? `The budget range is ${draft.budget}.` : `Der Budgetrahmen liegt bei ${draft.budget}.`) : '';

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

const buildLocalEasyExpansionPrompt = (seed: string, isEnglish: boolean) => {
  const cleanSeed = String(seed ?? '').trim();
  if (!cleanSeed) return '';

  return [
    cleanSeed,
    isEnglish
      ? 'Software, project management, rental hardware, consumables, onsite support and transport or travel requirements should also be included in the planning and commercial scope.'
      : 'Zusaetzlich sollen Software, Projektmanagement, Miettechnik, Verbrauchsmaterial, Support vor Ort sowie Transport- und Reisebedarf in die Planung aufgenommen und im Angebot mitgedacht werden.',
    isEnglish
      ? 'Please also consider operational requirements such as the check-in process, badge printing, scanning, device planning, material reserve, onsite support and logistics windows.'
      : 'Bitte beruecksichtigen Sie dabei auch operative Anforderungen wie Check-in-Prozess, Badge-Druck, Scanning, Geraetebedarf, Materialreserve, Onsite-Support und Logistikfenster.'
  ].join(' ');
};

const inferEasyPromptEventName = (seed: string) => {
  const normalized = String(seed ?? '');
  const quotedMatch = normalized.match(/[„"]([^"\n“”]{3,80})[“”"]/);
  if (quotedMatch?.[1]) {
    return quotedMatch[1].trim();
  }
  const explicitMatch = normalized.match(/\b(?:eventname|eventtitel|arbeitstitel)\s*[:=-]?\s*([^\n.,;]{3,80})/i);
  if (explicitMatch?.[1]) {
    return explicitMatch[1].trim();
  }
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
  const explicitMatch = normalized.match(/\b(?:ort|venue|location)\s*[:=-]?\s*([^\n]{3,100})/i);
  if (explicitMatch?.[1]) {
    return explicitMatch[1].trim().replace(/[.]+$/g, '');
  }
  const istanbulVenueMatch = normalized.match(/\bin\s+Istanbul(?:,\s*([A-Za-zÇĞİÖŞÜçğıöşü.\- ]+))?(?:\s*\(([^)]+)\))?/i);
  if (istanbulVenueMatch) {
    const parts = ['Istanbul'];
    if (istanbulVenueMatch[1]) parts.push(istanbulVenueMatch[1].trim());
    if (istanbulVenueMatch[2]) parts.push(`(${istanbulVenueMatch[2].trim()})`);
    return `${parts.join(', ')}, Türkei`;
  }
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

const inferEasyPromptBudget = (seed: string) => {
  const match = String(seed ?? '').match(/(\d[\d.,\s]*(?:\s*(?:-|bis)\s*\d[\d.,\s]*)?\s*(?:TRY|TL|EUR|EURO|€))/i);
  return match?.[1]?.replace(/\s+/g, ' ').trim() || '';
};

const buildDeterministicEasyPrompt = (seed: string, isEnglish: boolean) => {
  const cleanSeed = String(seed ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanSeed) return '';

  const normalizedSeed = cleanSeed.endsWith('.') ? cleanSeed : `${cleanSeed}.`;
  const eventName = inferEasyPromptEventName(cleanSeed);
  const eventLocation = inferEasyPromptLocation(cleanSeed);
  const attendeeHint = inferEasyPromptAttendees(cleanSeed);
  const budgetHint = inferEasyPromptBudget(cleanSeed);

  const operationalParagraph = [
    /badge|check-in|walk-?in|einlass/i.test(cleanSeed)
      ? (isEnglish ? 'Fast check-in, badge printing, walk-ins and controlled visitor flow are important for entry operations.' : 'Fuer den Einlass sind ein schneller Check-in, Badge-Druck, Walk-ins und eine saubere Besuchersteuerung wichtig.')
      : (isEnglish ? 'The check-in process and visitor flow should be planned in a robust operational way.' : 'Der Check-in und die Besuchersteuerung sollen operativ sauber geplant werden.'),
    /software|scanning|lead-capture|integration|reporting/i.test(cleanSeed)
      ? (isEnglish ? 'On the software side, participant management, check-in, badge printing, scanning and, if needed, lead capture or integrations should be included.' : 'Softwareseitig sollen Teilnehmermanagement, Check-in, Badge-Druck, Scanning und bei Bedarf Lead-Capture oder Integrationen beruecksichtigt werden.')
      : (isEnglish ? 'Participant management, check-in, badge printing, reporting and possible integrations should be considered on the software side.' : 'Softwareseitig sollen Teilnehmermanagement, Check-in, Badge-Druck, Reporting und moegliche Integrationen mitgedacht werden.'),
    isEnglish ? 'Project management, preparation, coordination, test runs and detailed operations planning should be included in the proposal.' : 'Projektmanagement, Vorbereitung, Abstimmungen, Testlauf und operative Detailplanung sollen im Angebot enthalten sein.',
    /ipad|tablet|drucker|scanner|router|lte|miettechnik|hardware/i.test(cleanSeed)
      ? (isEnglish ? 'For rental hardware, tablets, badge printers, scanners and, if required, network backup should be planned.' : 'Fuer die Miettechnik sollen Tablets, Badge-Drucker, Scanner und gegebenenfalls Netzwerk-Backup eingeplant werden.')
      : (isEnglish ? 'The expected need for tablets, badge printers, scanners and backup connectivity should be assessed.' : 'Der voraussichtliche Bedarf an Tablets, Badge-Druckern, Scannern und Backup-Konnektivitaet soll geprueft werden.'),
    isEnglish ? 'Consumables such as badges, lanyards, holders, print materials and reserve stock should also be included.' : 'Auch Verbrauchsmaterialien wie Badges, Lanyards, Halter, Druckmaterialien und Materialreserven sollen beruecksichtigt werden.',
    /support|onsite|vor ort|techniker|supervisor|extended/i.test(cleanSeed)
      ? (isEnglish ? 'A suitable support level with onsite technical coverage should be included in the commercial scope.' : 'Ein passendes Support-Level mit technischer Vor-Ort-Betreuung soll mitkalkuliert werden.')
      : (isEnglish ? 'The right support level for peak times and live operations should be defined.' : 'Das geeignete Support-Level fuer Peak-Zeiten und Eventbetrieb soll mitdefiniert werden.'),
    /hotel|reise|transport|spedition|logistik/i.test(cleanSeed)
      ? (isEnglish ? 'Travel, hotel, transport and logistics requirements should also be reflected in the proposal.' : 'Zusaetzlich sollen Reise-, Hotel-, Transport- und Logistikbedarfe im Angebot abgebildet werden.')
      : (isEnglish ? 'Relevant travel, transport, hotel and logistics requirements should also be assessed.' : 'Relevante Reise-, Transport-, Hotel- und Logistikanforderungen sollen mitgeprueft werden.')
  ].join(' ');

  return [
    eventName ? `${isEnglish ? 'Event name' : 'Eventname'}: ${eventName}.` : '',
    eventLocation ? `${isEnglish ? 'Location / venue' : 'Ort / Venue'}: ${eventLocation}.` : '',
    attendeeHint ? `${isEnglish ? 'Attendance' : 'Teilnehmerzahl'}: ${isEnglish ? 'Approx.' : 'Ca.'} ${attendeeHint}.` : '',
    budgetHint ? `Budget: ${budgetHint}.` : '',
    normalizedSeed,
    operationalParagraph
  ].filter(Boolean).join('\n');
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

const deriveLocationDetails = (brief?: AiExplorerBrief | null, isEnglish = false) => {
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
      country = isEnglish ? 'Turkey' : 'Tuerkei';
    } else if (/\b(leinfelden|echterdingen|stuttgart|berlin|m[uü]nchen|hamburg)\b/i.test(location)) {
      country = isEnglish ? 'Germany' : 'Deutschland';
    }
  }

  const details = [
    venue ? { label: 'Venue', value: venue } : null,
    city ? { label: isEnglish ? 'City' : 'Stadt', value: city } : null,
    region ? { label: isEnglish ? 'Region' : 'Region', value: region } : null,
    country ? { label: isEnglish ? 'Country' : 'Land', value: country } : null,
    rawDates ? { label: isEnglish ? 'Date' : 'Datum', value: rawDates } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return details;
};

const ErpAdvisor: React.FC<ErpAdvisorProps> = ({ embedded = false, assistantOnly = false }) => {
  const { content, locale } = useSiteContent();
  const t = content.pages.survey.sections.advisor;
  const companyName = content.global.company.name;
  const isEnglish = locale === 'en';
  const isTurkish = locale === 'tr';
  const openLabel = isEnglish ? 'Open' : 'Noch offen';
  const priceOpenLabel = isEnglish ? 'Price open' : 'Preis offen';
  const fallbackPhases = isEnglish
    ? ['Event Basics', 'Software', 'Project Management', 'Rental Hardware', 'Consumables', 'Support', 'Transport']
    : ['Basisdaten', 'Software', 'Projektmanagement', 'Miettechnik', 'Verbrauchsmaterial', 'Support', 'Transport'];
  const studioText = useMemo(() => ({
    workspaceEyebrow: isEnglish ? 'Workspace' : isTurkish ? 'Calisma Alani' : 'Arbeitsbereich',
    workspaceTitle: isEnglish ? 'Current Input' : isTurkish ? 'Guncel Girdi' : 'Aktuelle Eingabe',
    workspacePromptDescription: isEnglish
      ? 'Use the prompt input below for direct live changes to the brief, modules and pricing.'
      : isTurkish
        ? 'Brief, moduller ve fiyatlama uzerinde dogrudan canli degisiklikler icin asagidaki prompt alanini kullanin.'
        : 'Nutzen Sie die Prompt-Eingabe unten fuer direkte Live-Aenderungen an Briefing, Modulen und Preislogik.',
    promptInputTitle: isEnglish ? 'Prompt Input' : isTurkish ? 'Prompt Girisi' : 'Prompt-Eingabe',
    promptInputDescription: isEnglish
      ? 'Enter the event details or describe what should change. The workspace applies your prompt directly to the live brief, modules and pricing.'
      : isTurkish
        ? 'Etkinlik detaylarini veya neyin degisecegini yazin. Workspace promptunuzu dogrudan live brief, moduller ve fiyatlamaya uygular.'
        : 'Geben Sie Eventdetails ein oder beschreiben Sie direkt, was sich aendern soll. Der Workspace uebernimmt Ihren Prompt direkt in Live-Briefing, Module und Preislogik.',
    promptInputPlaceholder: isEnglish
      ? 'Example: Create a new event in Berlin for 800 attendees with badge printing, 10 counters and a EUR 45,000 budget.'
      : isTurkish
        ? 'Ornek: Berlinde 800 kisilik, badge printing, 10 counter ve 45.000 EUR butceli yeni bir event olustur.'
        : 'Beispiel: Erstellen Sie ein neues Event in Berlin fuer 800 Teilnehmer mit Badge-Druck, 10 Counter und 45.000 EUR Budget.',
    promptInputHint: isEnglish
      ? 'Use this prompt input for direct event changes like name, venue, attendees, counters, integrations and budget.'
      : isTurkish
        ? 'Bu prompt alanini isim, venue, katilimci, counter, entegrasyon ve butce gibi dogrudan event degisiklikleri icin kullanin.'
        : 'Nutzen Sie diese Prompt-Eingabe fuer direkte Event-Aenderungen wie Name, Venue, Teilnehmer, Counter, Integrationen und Budget.',
    modeLabel: isEnglish ? 'Prompt Input' : isTurkish ? 'Prompt Girisi' : 'Prompt-Eingabe',
    liveBriefLocationSection: isEnglish ? 'Location & Team' : isTurkish ? 'Lokasyon ve Ekip' : 'Standort & Team',
    liveBriefModulesSection: isEnglish ? 'Service Modules' : isTurkish ? 'Servis Modulleri' : 'Leistungsmodule',
    liveBriefDriversSection: isEnglish ? 'Cost Drivers' : isTurkish ? 'Maliyet Suruculeri' : 'Kostentreiber',
    liveBriefQuestionsSection: isEnglish ? 'Open Questions' : isTurkish ? 'Acik Sorular' : 'Offene Fragen',
    liveBriefAssumptionsSection: isEnglish ? 'Assumptions' : isTurkish ? 'Varsayimlar' : 'Annahmen',
    structuredBasisDescription: isEnglish ? 'Core details about the location and customer.' : isTurkish ? 'Lokasyon ve musteriyle ilgili temel detaylar.' : 'Kunde, Ort, Datum und Kernparameter des Events.',
    structuredCheckinDescription: isEnglish ? 'Check-in scenarios and technical requirements.' : isTurkish ? 'Check-in senaryolari ve teknik gereksinimler.' : 'Check-in-Szenarien und technische Anforderungen.',
    structuredOperationsDescription: isEnglish ? 'Project management and operational delivery.' : isTurkish ? 'Proje yonetimi ve operasyonel teslimat.' : 'Projektmanagement und operative Umsetzung.',
    structuredLogisticsDescription: isEnglish ? 'Service level and budget parameters.' : isTurkish ? 'Servis seviyesi ve butce parametreleri.' : 'Service-Level, Logistik und Budgetparameter.',
    noSyncedEventYet: isEnglish ? 'No synced event yet' : isTurkish ? 'Henuz senkronize etkinlik yok' : 'Noch kein Event synchronisiert',
    directlyEditable: isEnglish ? 'Directly editable' : isTurkish ? 'Dogrudan duzenlenebilir' : 'Direkt editierbar',
    directlyEditableDescription: isEnglish
      ? 'Adjust individual event, scope and budget details here and send the updated version straight back into the workspace.'
      : isTurkish
        ? 'Etkinlik, kapsam ve butce detaylarini burada duzenleyip guncel halini dogrudan workspacee gonderin.'
        : 'Passen Sie hier Event-, Scope- und Budgetdetails an und senden Sie die aktualisierte Fassung direkt wieder in den Workspace.',
    estimatedTotal: isEnglish ? 'Estimated Total' : isTurkish ? 'Tahmini Toplam' : 'Gesamtsumme',
    modulesAndItems: isEnglish ? 'Modules & Line Items' : isTurkish ? 'Moduller ve Kalemler' : 'Module & Positionen',
    modulesAndItemsDescription: isEnglish ? 'All recommended modules with the currently derived line items.' : isTurkish ? 'Mevcut kalemlerle birlikte onerilen tum moduller.' : 'Alle empfohlenen Module mit den aktuell abgeleiteten Positionen.',
    offerVariants: isEnglish ? 'Offer Variants' : isTurkish ? 'Teklif Varyantlari' : 'Angebotsvarianten',
    offerVariantsDescription: isEnglish ? 'Alternative offer packages based on the current scope and risk assumptions.' : isTurkish ? 'Mevcut kapsam ve risk varsayimlarina gore alternatif teklif paketleri.' : 'Alternative Angebotspakete auf Basis der aktuellen Scope- und Risikoannahmen.',
    knowledgeCards: isEnglish ? 'Knowledge Cards' : isTurkish ? 'Bilgi Kartlari' : 'Wissenskarten',
    knowledgeCardsDescription: isEnglish ? 'Recommendations, risks and typical add-ons per module.' : isTurkish ? 'Her modul icin oneriler, riskler ve tipik ekler.' : 'Empfehlungen, Risiken und typische Zusatzoptionen pro Modul.',
    recommendationLabel: isEnglish ? 'Recommendation' : isTurkish ? 'Oneri' : 'Empfehlung',
    liveWorkspaceSync: isEnglish ? 'Live workspace sync' : isTurkish ? 'Canli workspace senkronu' : 'Live-Workspace-Sync',
    workspaceExport: isEnglish ? 'Workspace Export' : isTurkish ? 'Workspace Disa Aktarma' : 'Workspace-Export'
  }), [isEnglish, isTurkish]);

  const starterPromptsByPhase = t.starterPrompts;

  const manualBriefFieldConfig = useMemo(() => ([
    { key: 'customerName', label: t.fields.customerName.label, placeholder: t.fields.customerName.placeholder },
    { key: 'eventName', label: t.fields.eventName.label, placeholder: t.fields.eventName.placeholder },
    { key: 'eventLocation', label: t.fields.eventLocation.label, placeholder: t.fields.eventLocation.placeholder },
    { key: 'attendees', label: t.fields.attendees.label, placeholder: t.fields.attendees.placeholder },
    { key: 'budget', label: t.fields.budget.label, placeholder: t.fields.budget.placeholder },
    { key: 'checkInScenario', label: t.fields.checkInScenario.label, placeholder: t.fields.checkInScenario.placeholder },
    { key: 'supportLevel', label: t.fields.supportLevel.label, placeholder: t.fields.supportLevel.placeholder }
  ] as Array<{ key: keyof ManualBriefFields; label: string; placeholder: string }>), [t]);

  const structuredSections = useMemo(() => ([
    {
      key: 'basis',
      title: studioText.liveBriefLocationSection,
      description: studioText.structuredBasisDescription,
      fields: [
        { key: 'customerName', label: t.ui.structuredInput.fields.customerName.label, placeholder: t.ui.structuredInput.fields.customerName.placeholder },
        { key: 'eventName', label: t.ui.structuredInput.fields.eventName.label, placeholder: t.ui.structuredInput.fields.eventName.placeholder },
        { key: 'eventLocation', label: isEnglish ? t.ui.structuredInput.fields.eventLocation.label : (isTurkish ? 'Lokasyon / Venue' : 'Ort / Venue'), placeholder: t.ui.structuredInput.fields.eventLocation.placeholder },
        { key: 'eventDates', label: t.ui.structuredInput.fields.eventDates.label, placeholder: t.ui.structuredInput.fields.eventDates.placeholder },
        { key: 'attendees', label: t.ui.structuredInput.fields.attendees.label, placeholder: t.ui.structuredInput.fields.attendees.placeholder }
      ]
    },
    {
      key: 'checkin',
      title: studioText.liveBriefModulesSection,
      description: studioText.structuredCheckinDescription,
      fields: [
        { key: 'checkInScenario', label: t.ui.structuredInput.fields.checkInScenario.label, placeholder: t.ui.structuredInput.fields.checkInScenario.placeholder },
        { key: 'softwareNeeds', label: t.ui.structuredInput.fields.softwareNeeds.label, placeholder: t.ui.structuredInput.fields.softwareNeeds.placeholder },
        { key: 'integrations', label: isEnglish ? t.ui.structuredInput.fields.integrations.label : (isTurkish ? 'Entegrasyonlar' : 'Integrationen'), placeholder: t.ui.structuredInput.fields.integrations.placeholder }
      ]
    },
    {
      key: 'operations',
      title: studioText.liveBriefDriversSection,
      description: studioText.structuredOperationsDescription,
      fields: [
        { key: 'projectManagement', label: isEnglish ? t.ui.structuredInput.fields.projectManagement.label : (isTurkish ? 'Proje Yonetimi' : 'Projektmanagement'), placeholder: t.ui.structuredInput.fields.projectManagement.placeholder },
        { key: 'rentalNeeds', label: t.ui.structuredInput.fields.rentalNeeds.label, placeholder: t.ui.structuredInput.fields.rentalNeeds.placeholder },
        { key: 'consumables', label: t.ui.structuredInput.fields.consumables.label, placeholder: t.ui.structuredInput.fields.consumables.placeholder }
      ]
    },
    {
      key: 'logistics',
      title: studioText.liveBriefLocationSection,
      description: studioText.structuredLogisticsDescription,
      fields: [
        { key: 'supportLevel', label: t.ui.structuredInput.fields.supportLevel.label, placeholder: t.ui.structuredInput.fields.supportLevel.placeholder },
        { key: 'logistics', label: t.ui.structuredInput.fields.logistics.label, placeholder: t.ui.structuredInput.fields.logistics.placeholder },
        { key: 'budget', label: t.ui.structuredInput.fields.budget.label, placeholder: t.ui.structuredInput.fields.budget.placeholder }
      ]
    }
  ] as Array<StructuredSection>), [isEnglish, isTurkish, studioText, t]);

  const workspaceExportLabel = `${companyName} ${studioText.workspaceExport}`;
  const initialMessage = useMemo(() => createInitialMessage(companyName, isEnglish), [companyName, isEnglish]);
  const widgetInitialMessage = useMemo(() => createWidgetInitialMessage(companyName, isEnglish), [companyName, isEnglish]);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: createInitialMessage(companyName, isEnglish) }]);
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
  const [inputMode, setInputMode] = useState<AiExplorerInputMode>('widget');
  const [isModeStepComplete, setIsModeStepComplete] = useState(true);
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
  const [isApplyingStructured, setIsApplyingStructured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [structuredActionNotice, setStructuredActionNotice] = useState<string | null>(null);
  const [pendingPromptReview, setPendingPromptReview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const workspaceComposerRef = useRef<HTMLTextAreaElement>(null);
  const assistantComposerRef = useRef<HTMLTextAreaElement>(null);
  const structuredInputRef = useRef<HTMLDivElement>(null);
  const previousLocaleRef = useRef(locale);

  useEffect(() => {
    setMessages((current) => (
      current.length === 1 && current[0]?.role === 'model'
        ? [{ role: 'model', text: inputMode === 'widget' ? widgetInitialMessage : initialMessage }]
        : current
    ));
  }, [initialMessage, inputMode, widgetInitialMessage]);

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
    if (!assistantOpen) return;
    const frame = window.requestAnimationFrame(() => {
      assistantComposerRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [assistantOpen, inputMode]);

  useEffect(() => {
    if (previousLocaleRef.current === locale) {
      return;
    }

    previousLocaleRef.current = locale;

    if (brief) {
      setManualBrief((current) => {
        const next = { ...current };
        let changed = false;

        for (const field of manualBriefFieldConfig) {
          const key = field.key;
          if (String(current[key] ?? '').trim()) {
            continue;
          }

          const incoming = String(brief?.[key] ?? '').trim();
          if (!incoming) {
            continue;
          }

          next[key] = incoming;
          changed = true;
        }

        return changed ? next : current;
      });
    }

    setMessages([{ role: 'model', text: inputMode === 'widget' ? widgetInitialMessage : initialMessage }]);
    setBrief(null);
    setOffer(null);
    setInput('');
    setError(null);
    setPendingPromptReview(null);
    setStructuredActionNotice(null);
    setAssistantOpen(false);
  }, [brief, initialMessage, inputMode, locale, manualBriefFieldConfig, widgetInitialMessage]);

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
      { label: isEnglish ? 'CUSTOMER (PO)' : 'KUNDE (PO)', value: mergedBrief?.customerName || openLabel, icon: ClipboardList },
      { label: isEnglish ? 'EVENT NAME' : 'EVENTNAME', value: mergedBrief?.eventName || openLabel, icon: CalendarDays },
      { label: isEnglish ? 'LOCATION' : isTurkish ? 'LOKASYON' : 'ORT', value: mergedBrief?.eventLocation || openLabel, icon: MapPin },
      { label: isEnglish ? 'ATTENDEES' : 'TEILNEHMER', value: mergedBrief?.attendees || openLabel, icon: Users },
      { label: 'BUDGET', value: mergedBrief?.budget || openLabel, icon: ReceiptText },
      { label: isEnglish ? 'SCENARIO' : 'SZENARIO', value: mergedBrief?.checkInScenario || openLabel, icon: WandSparkles },
      { label: 'SUPPORT-LEVEL', value: mergedBrief?.supportLevel || openLabel, icon: ShieldCheck }
    ],
    [isEnglish, isTurkish, mergedBrief, openLabel]
  );
  const locationDetails = useMemo(() => deriveLocationDetails(mergedBrief, isEnglish), [isEnglish, mergedBrief]);

  const phases = mergedBrief?.phaseOrder ?? fallbackPhases;
  const currentPhaseIndex = Math.max(0, phases.findIndex((phase) => phase === mergedBrief?.currentPhase));
  const activePhase = mergedBrief?.currentPhase || phases[0];
  const activeStarterPrompts = starterPromptsByPhase[activePhase] || starterPromptsByPhase.default || Object.values(starterPromptsByPhase)[0];
  const knowledgeCards: AiExplorerKnowledgeCard[] = offer?.knowledgeCards ?? [];
  const widgetChatLabel = 'FastLane Chat';
  const isWidgetMode = inputMode === 'widget';
  const showAssistantWidget = false;
  const leadQuestionText = isWidgetMode
    ? widgetLeadMessage(isEnglish)
    : (mergedBrief?.currentQuestion || initialMessage);
  const recentMessages = messages.slice(-4);
  const isStepTwoLocked = !isModeStepComplete;
  const currentModeLabel = isWidgetMode
    ? studioText.modeLabel
    : (isEnglish ? 'Easy Chat' : isTurkish ? 'Kolay Sohbet' : 'Einfacher Chat');

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
      projectManagement: offer?.modules.find((module) => module.key === 'pm')?.summary || '',
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

  const showServiceModules = !!offer?.modules?.length || currentPhaseIndex >= 1;
  const showCostDrivers = !!offer?.costDrivers?.length || currentPhaseIndex >= 2;
  const showPricingOverview = (!!offer?.subtotal && offer.subtotal > 0) || currentPhaseIndex >= 3;
  const showModuleDetails = !!offer?.modules?.length || currentPhaseIndex >= 4;
  const showAssumptions = !!offer?.assumptions?.length || currentPhaseIndex >= 5;
  const showKnowledgeCards = !!offer?.knowledgeCards?.length || currentPhaseIndex >= 6;

  const buildStructuredPrompt = () => {
    const sections = [
      structuredDraft.customerName ? `${isEnglish ? 'Customer-side contact' : 'Ansprechpartner auf Kundenseite'}: ${structuredDraft.customerName}.` : '',
      structuredDraft.eventName ? `${isEnglish ? 'Event name' : 'Eventname'}: ${structuredDraft.eventName}.` : '',
      structuredDraft.eventLocation ? `${isEnglish ? 'Location / venue' : 'Ort / Venue'}: ${structuredDraft.eventLocation}.` : '',
      structuredDraft.eventDates ? `${isEnglish ? 'Dates / timings' : 'Datum / Zeiten'}: ${structuredDraft.eventDates}.` : '',
      structuredDraft.attendees ? `${isEnglish ? 'Attendance' : 'Teilnehmerzahl'}: ${structuredDraft.attendees}.` : '',
      structuredDraft.checkInScenario ? `${isEnglish ? 'Check-in scenario' : 'Check-in-Szenario'}: ${structuredDraft.checkInScenario}.` : '',
      structuredDraft.softwareNeeds ? `${isEnglish ? 'Software scope' : 'Software-Bedarf'}: ${structuredDraft.softwareNeeds}.` : '',
      structuredDraft.integrations ? `${isEnglish ? 'Integrations' : 'Integrationen'}: ${structuredDraft.integrations}.` : '',
      structuredDraft.projectManagement ? `${isEnglish ? 'Project management / preparation' : 'Projektmanagement / Vorbereitung'}: ${structuredDraft.projectManagement}.` : '',
      structuredDraft.rentalNeeds ? `${isEnglish ? 'Rental hardware' : 'Miettechnik'}: ${structuredDraft.rentalNeeds}.` : '',
      structuredDraft.consumables ? `${isEnglish ? 'Consumables' : 'Verbrauchsmaterial'}: ${structuredDraft.consumables}.` : '',
      structuredDraft.supportLevel ? `${isEnglish ? 'Onsite support' : 'Support vor Ort'}: ${structuredDraft.supportLevel}.` : '',
      structuredDraft.logistics ? `${isEnglish ? 'Transport / travel / hotel' : 'Transport / Reise / Hotel'}: ${structuredDraft.logistics}.` : '',
      structuredDraft.budget ? `${isEnglish ? 'Budget range' : 'Budgetrahmen'}: ${structuredDraft.budget}.` : ''
    ].filter(Boolean);

    return sections.join(' ');
  };

  const applyStructuredDraftToWorkspace = async () => {
    const source = buildStructuredPrompt();
    if (!source) {
      setStructuredActionNotice(
        isEnglish
          ? 'Add your event details first.'
          : isTurkish
            ? 'Once event bilgilerinizi ekleyin.'
            : 'Tragen Sie zuerst Ihre Eventdetails ein.'
      );
      structuredInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    setIsApplyingStructured(true);

    try {
      handleSelectInputMode('widget');
      const applied = await handleSend(source, 'widget');
      if (!applied) return;

      setStructuredActionNotice(
        isEnglish
          ? 'Your changes were applied directly to the workspace.'
          : isTurkish
            ? 'Ekledikleriniz dogrudan workspacee uygulandı.'
            : 'Ihre Eingaben wurden direkt auf den Workspace angewendet.'
      );
    } finally {
      setIsApplyingStructured(false);
    }
  };

  const expandEasyInputWithAi = async () => {
    const seed = input.trim();
    if (!seed) return;

    setIsPromptGenerating(true);

    try {
      const deterministicPrompt = buildDeterministicEasyPrompt(seed, isEnglish);
      const aiResult = await generateAiExplorerPrompt(seed, 'phase-completion', isEnglish ? 'en' : 'de').catch(() => null);
      const aiPrompt = String(aiResult?.text ?? '').trim();
      const nextPrompt = isAcceptableExpandedPrompt(seed, aiPrompt)
        ? aiPrompt
        : deterministicPrompt;
      if (!nextPrompt) return;
      openPromptReview(nextPrompt, isEnglish ? 'The input was expanded into a fuller briefing.' : 'Eingabe wurde zu einem volleren Briefing erweitert.');
    } catch (generationError) {
      const fallbackPrompt = buildDeterministicEasyPrompt(seed, isEnglish) || buildLocalEasyExpansionPrompt(seed, isEnglish);
      if (!fallbackPrompt) return;
      openPromptReview(fallbackPrompt, isEnglish ? 'A local briefing was generated successfully.' : 'Lokales Briefing wurde stabil erzeugt.');
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
      excelXmlRow([isEnglish ? 'Field' : 'Feld', isEnglish ? 'Value' : 'Wert']),
      excelXmlRow([isEnglish ? 'Customer' : 'Kunde', mergedBrief?.customerName || openLabel]),
      excelXmlRow([isEnglish ? 'Event name' : 'Eventname', mergedBrief?.eventName || openLabel]),
      excelXmlRow([isEnglish ? 'Location' : 'Ort', mergedBrief?.eventLocation || openLabel]),
      excelXmlRow([isEnglish ? 'Attendees' : 'Teilnehmer', mergedBrief?.attendees || openLabel]),
      excelXmlRow(['Budget', mergedBrief?.budget || openLabel]),
      excelXmlRow([isEnglish ? 'Scenario' : 'Szenario', mergedBrief?.checkInScenario || openLabel]),
      excelXmlRow(['Support-Level', mergedBrief?.supportLevel || openLabel]),
      excelXmlRow([isEnglish ? 'Total' : 'Gesamtsumme', offer?.subtotalFormatted || priceOpenLabel]),
      excelXmlRow([isEnglish ? 'Budget status' : 'Budget-Status', offer?.budgetStatus || openLabel])
    ].join('');

    const moduleRows = [
      excelXmlRow([isEnglish ? 'Area' : 'Bereich', isEnglish ? 'Line item' : 'Position', isEnglish ? 'Quantity' : 'Menge', isEnglish ? 'Unit' : 'Einheit', isEnglish ? 'Rate' : 'Satz', 'Total']),
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
      excelXmlRow([isEnglish ? 'Variant' : 'Variante', isEnglish ? 'Description' : 'Beschreibung', 'Total']),
      ...variants.map((variant) =>
        excelXmlRow([variant.name, variant.description, variant.total ?? (variant.totalFormatted || openLabel)], ['String', 'String', typeof variant.total === 'number' ? 'Number' : 'String'])
      )
    ].join('');

    const notesRows = [
      excelXmlRow([isEnglish ? 'Type' : 'Typ', isEnglish ? 'Entry' : 'Eintrag']),
      ...assumptions.map((item) => excelXmlRow([isEnglish ? 'Assumption' : 'Annahme', item])),
      ...openQuestions.map((item) => excelXmlRow([isEnglish ? 'Open question' : 'Offene Frage', item]))
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
  <Worksheet ss:Name="${isEnglish ? 'Overview' : 'Uebersicht'}">
    <Table>
      ${overviewRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="${isEnglish ? 'Modules' : 'Module'}">
    <Table>
      ${moduleRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="${isEnglish ? 'Variants' : 'Varianten'}">
    <Table>
      ${variantRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="${isEnglish ? 'Notes' : 'Notizen'}">
    <Table>
      ${notesRows}
    </Table>
  </Worksheet>
</Workbook>`;

    downloadFile(`${normalizedExportName}-${isEnglish ? 'offer' : 'angebot'}.xls`, workbook, 'application/vnd.ms-excel;charset=utf-8');
  };

  const handleExportPdf = () => {
    if (typeof window === 'undefined') return;

    const variantHtml = (offer?.variants ?? [])
      .map((variant) => `
        <div class="panel">
          <div class="panel-title-row">
            <div class="panel-title">${escapeHtml(variant.name)}</div>
            <div class="panel-total">${escapeHtml(variant.totalFormatted || openLabel)}</div>
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
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">${isEnglish ? 'Line item' : 'Position'}</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">${isEnglish ? 'Quantity' : 'Menge'}</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">${isEnglish ? 'Unit' : 'Einheit'}</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">${isEnglish ? 'Rate' : 'Satz'}</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #d8dee9;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${module.positions.map((position) => `
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(position.label)}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${position.quantity}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(position.unit)}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(formatPriceValue(position.rate, '-', locale))}</td>
                  <td style="padding:8px;border-bottom:1px solid #eef2f7;">${escapeHtml(formatPriceValue(position.total, '-', locale))}</td>
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
          <title>${escapeHtml(mergedBrief?.eventName || workspaceExportLabel)}</title>
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
                <div class="header-kicker">${escapeHtml(workspaceExportLabel)}</div>
                <h1>${escapeHtml(mergedBrief?.eventName || workspaceExportLabel)}</h1>
                <div class="muted">${escapeHtml(isEnglish ? 'Event brief, offer logic, variants and operational guardrails.' : 'Event-Brief, Angebotslogik, Varianten und operative Leitplanken.')}</div>
              </div>
              <div class="total-box">
                  <div class="total-label">${escapeHtml(isEnglish ? 'Total' : 'Gesamtsumme')}</div>
                  <div class="total-value">${escapeHtml(offer?.subtotalFormatted || priceOpenLabel)}</div>
                </div>
              </div>
            </div>
            <div class="meta">
              <div><div class="label">${escapeHtml(isEnglish ? 'Customer' : 'Kunde')}</div><div class="value">${escapeHtml(mergedBrief?.customerName || openLabel)}</div></div>
              <div><div class="label">${escapeHtml(isEnglish ? 'Location' : 'Ort')}</div><div class="value">${escapeHtml(mergedBrief?.eventLocation || openLabel)}</div></div>
              <div><div class="label">${escapeHtml(isEnglish ? 'Attendees' : 'Teilnehmer')}</div><div class="value">${escapeHtml(mergedBrief?.attendees || openLabel)}</div></div>
              <div><div class="label">Budget</div><div class="value">${escapeHtml(mergedBrief?.budget || openLabel)}</div></div>
              <div><div class="label">${escapeHtml(isEnglish ? 'Scenario' : 'Szenario')}</div><div class="value">${escapeHtml(mergedBrief?.checkInScenario || openLabel)}</div></div>
              <div><div class="label">Support</div><div class="value">${escapeHtml(mergedBrief?.supportLevel || openLabel)}</div></div>
            </div>
            ${(offer?.variants?.length ?? 0) > 0 ? `
              <section style="margin:24px 0;">
                <h2>${escapeHtml(isEnglish ? 'Offer Variants' : 'Angebotsvarianten')}</h2>
                <div class="panel-grid">
                  ${variantHtml}
                </div>
              </section>
            ` : ''}
            <section style="margin:24px 0;">
              <h2>${escapeHtml(isEnglish ? 'Modules & Line Items' : 'Module & Positionen')}</h2>
              ${modulesHtml || `<div class="muted">${escapeHtml(isEnglish ? 'No priced modules are available yet.' : 'Noch keine Module mit Preisen verfuegbar.')}</div>`}
            </section>
            ${listHtml(isEnglish ? 'Assumptions' : 'Annahmen', offer?.assumptions ?? [])}
            ${listHtml(isEnglish ? 'Open Questions' : 'Offene Punkte', offer?.openQuestions ?? [])}
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
    setInputMode('widget');
    setIsModeStepComplete(true);
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

  const handleSelectInputMode = (mode: AiExplorerInputMode) => {
    setInputMode(mode);
    setIsModeStepComplete(true);
    if (mode === 'widget') {
      setAssistantOpen(true);
      setMessages((current) => (
        current.length === 1 && current[0]?.role === 'model'
          ? [{ role: 'model', text: widgetInitialMessage }]
          : current
      ));
    }
  };

  const openAssistantWidget = () => {
    setInputMode('widget');
    setIsModeStepComplete(true);
    setMessages((current) => (
      current.length === 1 && current[0]?.role === 'model'
        ? [{ role: 'model', text: widgetInitialMessage }]
        : current
    ));
    setAssistantOpen(true);
  };

  const openPromptReview = (prompt: string, notice?: string) => {
    handleSelectInputMode('prompt');
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
    if (!nextText || isTyping) return false;
    if (!isModeStepComplete && !modeOverride) return false;
    const effectiveMode = modeOverride ?? inputMode;

    setError(null);
    if (!prefill) {
      setInput('');
    }

    const nextMessages = [...messages, { role: 'user' as const, text: nextText }];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await getAiExplorerResponse(messages, nextText, effectiveMode, isEnglish ? 'en' : 'de', brief);
      setMessages((prev) => [...prev, { role: 'model', text: response.text || (isEnglish ? 'I could not generate a reliable response yet.' : 'Ich konnte noch keine belastbare Rueckmeldung erzeugen.') }]);
      setBrief(response.brief ?? null);
      setOffer(response.offer ?? null);
      setAssistantOpen(true);
      return true;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : (isEnglish ? 'AI explorer could not respond.' : 'AI Explorer konnte nicht antworten.');
      setMessages((prev) => [...prev, { role: 'model', text: message }]);
      setError(message);
      setAssistantOpen(true);
      return false;
    } finally {
      setIsTyping(false);
    }
  };

  const assistantOverlay = (
    <>
      <style>{fsChatAvatarMotionStyles}</style>
      <button
        type="button"
        onClick={openAssistantWidget}
        className={`fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-5 sm:bottom-5 z-[100000] flex h-16 w-16 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 shadow-[0_20px_48px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-18px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-[#0f1622]/95 ${assistantOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}`}
        aria-label={isEnglish ? 'Open FastLane Chat' : 'FastLane Chat oeffnen'}
      >
        <FSChatAvatar className="h-12 w-12" />
      </button>

      <div
        className={`fixed left-4 right-4 bottom-4 sm:left-auto sm:right-5 sm:bottom-5 z-[100000] transition-all duration-200 ${assistantOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'}`}
      >
        <div className="pointer-events-auto flex w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_32px_90px_-24px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[#0f1622] sm:w-[380px]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/95 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                <FSChatAvatar className="h-10 w-10" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sap-blue">{widgetChatLabel}</div>
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{isEnglish ? 'Live workspace sync' : 'Live-Workspace-Sync'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-sap-blue/30 hover:text-sap-blue dark:border-white/10"
                aria-label={isEnglish ? 'Reset session' : 'Sitzung zuruecksetzen'}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setAssistantOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-sap-blue/30 hover:text-sap-blue dark:border-white/10"
                aria-label={isEnglish ? 'Close FastLane Chat' : 'FastLane Chat schliessen'}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4 dark:bg-[#0f1622] max-h-[min(52vh,420px)] scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-[1.25rem] px-3.5 py-3 text-[13px] leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'rounded-br-md bg-sap-blue font-medium text-white'
                  : 'rounded-bl-md border border-slate-100 bg-slate-50 text-slate-700 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200'
                  }`}>
                  <RenderMessageText text={msg.text} />
                </div>
              </div>
            ))}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-[1.25rem] rounded-bl-md border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm dark:border-white/5 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sap-blue" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sap-blue [animation-delay:120ms]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sap-blue [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-slate-50/95 px-4 py-3 dark:border-white/10 dark:bg-[#131b28]">
            <div className="mb-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isEnglish ? 'Tell FastLane Chat what should change.' : 'Sagen Sie FastLane Chat direkt, was geaendert werden soll.'}
            </div>
            <div className="relative">
              <textarea
                ref={assistantComposerRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(undefined, 'widget');
                  }
                }}
                placeholder={isEnglish ? 'Type a change for the event brief, scope or pricing...' : 'Schreiben Sie eine Aenderung fuer Briefing, Scope oder Preislogik...'}
                className="h-20 w-full resize-none rounded-[1.2rem] border border-slate-200 bg-white py-3 pl-4 pr-14 text-sm text-slate-800 shadow-sm transition-all focus:border-sap-blue focus:outline-none focus:ring-4 focus:ring-sap-blue/10 dark:border-white/10 dark:bg-[#0e1621] dark:text-white"
              />
              <button
                onClick={() => handleSend(undefined, 'widget')}
                disabled={!input.trim() || isTyping}
                className="absolute bottom-2.5 right-2.5 rounded-[1rem] bg-sap-blue p-3 text-white shadow-lg transition-all hover:bg-sap-blue/90 hover:shadow-sap-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const promptReviewModal = pendingPromptReview ? (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white dark:bg-dark-elevated shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-500 text-left">
        <div className="px-8 py-8 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-sap-blue flex items-center justify-center text-white shadow-lg shadow-sap-blue/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-sap-blue mb-1">AI Recommendation</div>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{isEnglish ? 'Review & Optimize' : 'Pruefen & Optimieren'}</div>
            </div>
          </div>
          <p className="text-slate-500 dark:text-dark-text-secondary text-sm leading-relaxed mb-6">
            {isEnglish ? 'The prompt was optimized for the workspace. Please review the text.' : 'Der Prompt wurde fuer den Workspace optimiert. Bitte pruefen Sie den Text.'}
          </p>
          <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-dark-base border border-slate-200 dark:border-white/5 p-6 text-[15px] font-medium leading-relaxed text-slate-800 dark:text-dark-text-primary max-h-[40vh] overflow-y-auto no-scrollbar shadow-inner">
            {pendingPromptReview}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-8 py-6 bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setPendingPromptReview(null)}
            className="px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            {isEnglish ? 'Skip' : 'Ueberspringen'}
          </button>
          <button
            type="button"
            onClick={handleApproveReviewedPrompt}
            className="px-8 py-3 rounded-full bg-sap-blue text-white text-[11px] font-black uppercase tracking-widest hover:bg-sap-blue/90 shadow-xl shadow-sap-blue/20 transition-all active:scale-95"
          >
            {isEnglish ? 'Start Analysis' : 'Analysieren Starten'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const assistantOverlayPortal = showAssistantWidget && typeof document !== 'undefined'
    ? createPortal(assistantOverlay, document.body)
    : null;

  if (assistantOnly) {
    return assistantOverlayPortal;
  }

  return (
    <div
      className={`flex flex-col w-full ${embedded ? 'max-w-none mx-0 bg-transparent rounded-none shadow-none' : 'max-w-[1600px] mx-auto bg-white dark:bg-dark-surface rounded-3xl lg:rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10'} overflow-hidden transition-all duration-500 ${embedded ? 'h-full min-h-0' : 'h-full min-h-0'
        }`}
    >
      <div className={`h-[3px] sm:h-1 w-full bg-slate-200/60 dark:bg-white/[0.05] studio-progress-track transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
        {isTyping ? <div className="studio-progress-bar" /> : null}
      </div>
      <div className="px-6 sm:px-8 py-4 bg-transparent">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-[600px]">
          <div className="px-5 py-4 min-h-[72px] flex flex-col justify-center bg-slate-50 dark:bg-dark-surface/40 rounded-2xl border border-slate-300 dark:border-white/15">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-dark-text-secondary mb-1 leading-tight break-words">{t.ui.sidebar.progress}</div>
            <div className="text-base font-bold text-slate-900 dark:text-dark-text-primary tracking-tight">{mergedBrief?.progressLabel || `0/${t.ui.phases.length} ${t.ui.sidebar.status}`}</div>
          </div>
          <div className="px-5 py-4 min-h-[72px] flex flex-col justify-center bg-slate-50 dark:bg-dark-surface/40 rounded-2xl border border-slate-300 dark:border-white/15">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-dark-text-secondary mb-1 leading-tight break-words">{t.ui.sidebar.mode}</div>
            <div className="text-base font-bold text-slate-900 dark:text-dark-text-primary tracking-tight break-words leading-tight">{currentModeLabel}</div>
          </div>
          <div className="px-5 py-4 min-h-[72px] flex flex-col justify-center bg-slate-50 dark:bg-dark-surface/40 rounded-2xl border border-slate-300 dark:border-white/15">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-dark-text-secondary mb-1 leading-tight break-words">{t.ui.sidebar.status}</div>
            <div className="text-base font-bold text-slate-900 dark:text-dark-text-primary tracking-tight leading-tight break-words">
              {isTyping ? t.ui.sidebar.analyzing : isStepTwoLocked ? t.ui.sidebar.step1Open : t.ui.sidebar.ready}
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 sm:px-8 py-5 bg-transparent overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-white/5">
        <div className="flex gap-10 items-center min-w-max">
          {phases.map((phase, index) => {
            const isActive = phase === mergedBrief?.currentPhase || (!mergedBrief?.currentPhase && index === 0);
            const isDone = index < currentPhaseIndex;
            return (
              <div
                key={phase}
                className={`group relative flex flex-col gap-2 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
              >
                <div className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-sap-blue' : 'text-slate-600 dark:text-dark-text-secondary'}`}>
                  {`0${index + 1}`}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-black uppercase tracking-[0.05em] ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-dark-text-secondary'}`}>
                    {phase}
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-sap-blue shadow-[0_0_8px_rgba(0,143,211,0.5)]" />}
                </div>
                <div className={`absolute -bottom-5 left-0 right-0 h-[2px] transition-all duration-500 ${isActive ? 'bg-sap-blue scale-x-100' : 'bg-transparent scale-x-0 group-hover:bg-slate-300 dark:group-hover:bg-white/10 group-hover:scale-x-50'}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_minmax(320px,0.45fr)] xl:grid-cols-[1fr_minmax(420px,0.38fr)] gap-px flex-1 min-h-0 bg-slate-200/50 dark:bg-white/5">
        <section className="min-h-0 flex flex-col bg-white dark:bg-dark-base border-r border-slate-200/60 dark:border-white/5">
          <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4">
            <StudioSection
              eyebrow={studioText.workspaceEyebrow}
              title={studioText.workspaceTitle}
              description={isWidgetMode
                ? studioText.workspacePromptDescription
                : (isEnglish ? 'Answer the current phase directly or send a complete event brief.' : 'Antworten Sie direkt auf die aktuelle Phase oder senden Sie einen kompletten Briefing-Text.')}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sap-blue/10 text-sap-blue flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </div>
                <div className="text-[15px] font-bold text-slate-800 dark:text-dark-text-primary leading-relaxed">{leadQuestionText}</div>
              </div>

              {isWidgetMode ? (
                <div className="mt-12 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="max-w-3xl">
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-sap-blue">
                      {studioText.promptInputTitle}
                    </div>
                    <div className="mt-2 text-sm font-bold leading-relaxed text-slate-700 dark:text-dark-text-primary">
                      {studioText.promptInputDescription}
                    </div>
                  </div>
                  <div className="mt-6 relative group">
                    <textarea
                      ref={workspaceComposerRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(undefined, 'widget');
                        }
                      }}
                      disabled={isStepTwoLocked}
                      placeholder={studioText.promptInputPlaceholder}
                      className="w-full rounded-[1.6rem] border border-slate-200 bg-white py-5 pl-5 pr-16 text-base text-slate-900 shadow-sm transition-all focus:border-sap-blue focus:outline-none focus:ring-4 focus:ring-sap-blue/10 resize-none scrollbar-hide min-h-[180px] dark:border-white/10 dark:bg-[#0e1621] dark:text-white"
                    />
                    <button
                      onClick={() => handleSend(undefined, 'widget')}
                      disabled={isStepTwoLocked || !input.trim() || isTyping}
                      className="absolute right-3 bottom-3 p-3 bg-sap-blue hover:bg-sap-blue/90 text-white rounded-[1rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-sap-blue/25"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 text-xs font-bold leading-relaxed text-slate-500 dark:text-dark-text-secondary">
                    {studioText.promptInputHint}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-12 relative group">
                    <textarea
                      ref={workspaceComposerRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (inputMode !== 'easy' && !isWidgetMode && e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={isStepTwoLocked || isWidgetMode}
                      placeholder={isStepTwoLocked
                        ? t.ui.lockedMessages.inputs
                        : inputMode === 'easy'
                          ? (mergedBrief?.currentQuestion || t.fields.customerName.placeholder)
                          : t.fields.eventName.placeholder}
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 focus:outline-none focus:border-sap-blue transition-all resize-none scrollbar-hide min-h-[120px] disabled:opacity-30 antialiased font-medium break-words leading-tight"
                    />
                    {inputMode === 'easy' ? (
                      <button
                        type="button"
                        onClick={expandEasyInputWithAi}
                        disabled={isStepTwoLocked || !input.trim() || isTyping || isPromptGenerating}
                        className="absolute right-[3.9rem] bottom-2.5 p-3 bg-white text-sap-blue hover:bg-[#fff8ef] rounded-[1rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)]"
                        aria-label={isEnglish ? 'Expand input' : 'Eingabe erweitern'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    ) : null}
                    {inputMode !== 'easy' && !isWidgetMode ? (
                      <button
                        onClick={() => handleSend()}
                        disabled={isStepTwoLocked || !input.trim() || isTyping}
                        className="absolute right-2.5 bottom-2.5 p-3 bg-sap-blue hover:bg-sap-blue/90 text-white rounded-[1rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-sap-blue/25"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 text-xs font-bold leading-relaxed text-slate-500 dark:text-dark-text-secondary break-words">
                    {isStepTwoLocked
                      ? t.ui.lockedMessages.inputs
                      : inputMode === 'easy'
                        ? (isEnglish ? 'Easy mode creates an optimized workspace prompt.' : 'Easy Mode erzeugt einen optimierten Workspace-Prompt.')
                        : (isEnglish ? 'Prompt mode for complete event briefings.' : 'Prompt Mode fuer komplette Event-Briefings.')}
                  </div>
                </>
              )}
            </StudioSection>
          </div>
          <div className="flex-1 min-h-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <StudioSection
              eyebrow={t.ui.activity.eyebrow}
              title={t.ui.activity.title}
              description={t.ui.activity.description}
            >
                <div className="space-y-4">
                  {recentMessages.map((msg, idx) => (
                    <div
                      key={`${msg.role}-${idx}-${msg.text.slice(0, 12)}`}
                      className={`group relative rounded-[2.5rem] px-8 py-6 text-base leading-relaxed shadow-sm border transition-all duration-300 ${msg.role === 'user'
                        ? 'bg-sap-blue text-white border-sap-blue/20 shadow-xl shadow-sap-blue/10'
                        : 'bg-white dark:bg-dark-surface text-slate-700 dark:text-dark-text-primary border-slate-300 dark:border-white/15'
                        }`}
                    >
                      <div className={`mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] ${msg.role === 'user' ? 'text-white/70' : 'text-sap-blue/70 dark:text-sap-blue/90'
                        }`}>
                        {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        {msg.role === 'user'
                          ? (isEnglish ? 'User' : 'Nutzer')
                          : `${companyName} ${isEnglish ? 'Assistant' : 'Assistent'}`}
                      </div>
                      <div className="whitespace-pre-wrap break-words font-medium antialiased">{msg.text}</div>
                    </div>
                  ))}

                  {isTyping ? (
                    <div className="rounded-2xl bg-white/85 dark:bg-white/[0.04] px-5 py-4 text-base text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 italic">
                      {t.ui.activity.processingNotice}
                    </div>
                  ) : null}
                </div>
              </StudioSection>

              <StudioSection
              eyebrow={t.ui.liveBrief.eyebrow}
              title={t.ui.liveBrief.title}
              description={t.ui.liveBrief.description}
            >
                <div className="grid sm:grid-cols-2 gap-5">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="rounded-3xl bg-slate-50 dark:bg-dark-surface p-6 border border-slate-300 dark:border-white/15 shadow-sm hover:shadow-md transition-all">
                      <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-dark-text-secondary mb-2 leading-tight break-words">{item.label}</div>
                      <div className="text-lg font-black text-slate-900 dark:text-dark-text-primary tracking-tight leading-none break-words">{item.value}</div>
                    </div>
                  ))}
                </div>

                {locationDetails.length ? (
                  <div className="mt-8 rounded-3xl bg-slate-50 dark:bg-dark-surface p-5 border border-slate-200/60 dark:border-white/10 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-sap-blue/60 dark:text-sap-blue/80 mb-4 leading-tight break-words">{t.ui.liveBrief.locationDetails}</div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {locationDetails.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="rounded-2xl bg-white dark:bg-dark-base px-4 py-3.5 border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-dark-text-secondary mb-1.5">{item.label}</div>
                          <div className="text-[13px] font-bold text-slate-900 dark:text-dark-text-primary break-words tracking-tight">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(mergedBrief?.serviceModules?.length || mergedBrief?.costDrivers?.length || offer?.assumptions?.length || offer?.openQuestions?.length) ? (
                  <div className="grid lg:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-3xl bg-slate-50 dark:bg-dark-surface/40 p-5 border border-slate-200/60 dark:border-white/5 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary mb-3 leading-tight break-words">{studioText.liveBriefModulesSection}</div>
                      <div className="space-y-2 text-[13px] text-slate-700 dark:text-dark-text-primary font-medium">
                        {(mergedBrief?.serviceModules ?? []).map((item) => (
                          <div key={item} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-sap-blue shrink-0" />{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 dark:bg-dark-surface/40 p-5 border border-slate-200/60 dark:border-white/5 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary mb-3 leading-tight break-words">{studioText.liveBriefDriversSection}</div>
                      <div className="space-y-2 text-[13px] text-slate-700 dark:text-dark-text-primary font-medium">
                        {(mergedBrief?.costDrivers ?? []).map((item) => (
                          <div key={item} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-sap-blue shrink-0" />{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 dark:bg-dark-surface/40 p-5 border border-slate-200/60 dark:border-white/5 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary mb-3 leading-tight break-words">{studioText.liveBriefAssumptionsSection}</div>
                      <div className="space-y-2 text-[13px] text-slate-700 dark:text-dark-text-primary font-medium">
                        {(offer?.assumptions ?? []).map((item) => (
                          <div key={item} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-sap-blue shrink-0" />{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 dark:bg-dark-surface/40 p-5 border border-slate-200/60 dark:border-white/5 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary mb-3 leading-tight break-words">{studioText.liveBriefQuestionsSection}</div>
                      <div className="space-y-2 text-[13px] text-slate-700 dark:text-dark-text-primary font-medium">
                        {(offer?.openQuestions ?? []).map((item) => (
                          <div key={item} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-sap-blue shrink-0" />{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </StudioSection>
            </div>

            <div className="mt-5">
              <StudioSection
                eyebrow={t.ui.structuredInput.eyebrow}
                title={t.ui.structuredInput.title}
                description={t.ui.structuredInput.description}
                actions={
                  <button
                    type="button"
                    onClick={applyStructuredDraftToWorkspace}
                    disabled={isApplyingStructured || isTyping}
                    className={`${primaryToolbarButtonClass} relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isApplyingStructured
                      ? '...'
                      : (isEnglish
                          ? 'Apply my changes'
                          : isTurkish
                            ? 'Eklediklerimi uygula'
                            : 'Meine Eingaben anwenden')}
                  </button>
                }
              >
                <div ref={structuredInputRef} className="mt-4 space-y-3">
                  {structuredActionNotice ? (
                    <div className="rounded-[1rem] bg-sap-blue/8 px-4 py-3 text-xs font-medium text-sap-blue shadow-[inset_0_0_0_1px_rgba(0,143,211,0.12)]">
                      {structuredActionNotice}
                    </div>
                  ) : null}
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-[1.25rem] bg-white/75 dark:bg-white/[0.04] p-5 shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)] border border-slate-300 dark:border-white/15">
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">{t.ui.structuredInput.syncLabel}</div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">{mergedBrief?.eventName || studioText.noSyncedEventYet}</div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                        {isEnglish ? 'Results from the brief, modules and pricing logic prefill these fields automatically. Your manual edits stay intact.' : 'Ergebnisse aus Brief, Modulen und Kostenlogik fuellen diese Felder automatisch vor. Eigene Aenderungen bleiben erhalten.'}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/75 dark:bg-white/[0.04] p-5 shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)] border border-slate-300 dark:border-white/15">
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">{t.ui.structuredInput.priceLabel}</div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">{offer?.subtotalFormatted || priceOpenLabel}</div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                        {offer?.budgetStatus || (isEnglish ? `${offer?.modules?.length ?? 0} modules and ${offer?.variants?.length ?? 0} variants available` : `${offer?.modules?.length ?? 0} Module und ${offer?.variants?.length ?? 0} Varianten verfuegbar`)}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/75 dark:bg-white/[0.04] p-5 shadow-[0_10px_24px_-24px_rgba(32,41,57,0.28)] border border-slate-300 dark:border-white/15">
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">{t.ui.structuredInput.editLabel}</div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">{studioText.directlyEditable}</div>
                      <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                        {studioText.directlyEditableDescription}
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
                                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{field.label}</div>
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

        <aside className="bg-slate-50/50 dark:bg-dark-surface p-4 sm:p-6 md:p-8 min-h-0 overflow-y-auto border-l border-slate-200 dark:border-white/10">
          <div className="mb-8 px-1 py-1">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-sap-blue/70 dark:text-sap-blue/90 mb-4">{t.ui.sidebar.status}</div>
            <div className="mt-1 text-3xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight uppercase leading-tight">{t.ui.console.pricingTitle}</div>
            <div className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-dark-text-secondary font-bold">
              {isEnglish ? 'Summary of positions, costs and variants.' : 'Zusammenfassung der Positionen, Kosten und Varianten.'}
            </div>
          </div>
          {showPricingOverview ? (
            <div className="space-y-6">
              <ConsoleSection
                title={isEnglish ? 'CALCULATION' : 'KALKULATION'}
                description={isEnglish ? 'Total estimate and budget relation.' : 'Gesamtsumme und Budgetbezug.'}
                actions={
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleExportPdf} className={subtleToolbarButtonClass}>
                      <Printer className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button type="button" onClick={handleExportSpreadsheet} className={subtleToolbarButtonClass}>
                      <Download className="w-3.5 h-3.5" />
                      EXCEL
                    </button>
                  </div>
                }
              >
                <div className="px-6 py-10 rounded-[2.5rem] bg-white dark:bg-dark-base border border-slate-300 dark:border-white/15 shadow-xl shadow-slate-200/40 dark:shadow-black/20 flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-dark-text-secondary mb-4">{studioText.estimatedTotal}</div>
                  <div className="text-5xl font-black text-sap-blue dark:text-dark-text-primary tracking-tighter">
                    {offer?.hasPricing ? offer?.subtotalFormatted || formatPriceValue(offer?.subtotal, priceOpenLabel, locale) : (isEnglish ? 'OPEN' : 'OFFEN')}
                  </div>
                  {(offer?.budget || offer?.budgetStatus) ? (
                    <div className="mt-5 space-y-2">
                      {offer?.budget ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[11px] font-black text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider">
                          {isEnglish ? 'Budget' : 'Budget'}: {offer.budget}
                        </div>
                      ) : null}
                      {offer?.budgetStatus ? (
                        <div className={`text-[12px] font-black uppercase tracking-[0.05em] px-4 py-1.5 rounded-xl border ${offer.budgetStatus.startsWith(isEnglish ? 'Within budget' : 'Im Budget') ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20'}`}>
                          {offer.budgetStatus}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </ConsoleSection>

              {offer?.modules?.length ? (
                <ConsoleSection
                  title={studioText.modulesAndItems}
                  description={studioText.modulesAndItemsDescription}
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
                            {formatPriceValue(module.subtotal, isEnglish ? 'Open' : 'Offen', locale)}
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {module.positions.map((position) => (
                            <div key={`${module.key}-${position.label}`} className="flex items-start justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                              <div>{position.label}</div>
                              <div className="text-right">
                                <div>{position.quantity} {position.unit}</div>
                                <div>{formatPriceValue(position.total, isEnglish ? 'Open' : 'Offen', locale)}</div>
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
                  title={studioText.offerVariants}
                  description={studioText.offerVariantsDescription}
                >
                  <div className="space-y-3">
                    {offer.variants.map((variant) => (
                      <div key={variant.name} className="rounded-[1.25rem] bg-white/80 dark:bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{variant.name}</div>
                          <div className="text-sm font-semibold text-sap-blue">{variant.totalFormatted || (isEnglish ? 'Open' : 'Offen')}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{variant.description}</div>
                      </div>
                    ))}
                  </div>
                </ConsoleSection>
              ) : null}

              {knowledgeCards.length ? (
                <ConsoleSection
                  title={studioText.knowledgeCards}
                  description={studioText.knowledgeCardsDescription}
                >
                  <div className="space-y-4">
                    {knowledgeCards.map((card) => (
                      <div key={card.title} className="rounded-[1.25rem] bg-white/80 dark:bg-white/[0.04] p-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</div>
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">{studioText.recommendationLabel}: {card.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </ConsoleSection>
              ) : null}
            </div>
          ) : (
            <LockedPanel title={t.ui.console.lockedTitle} description={t.ui.console.lockedDescription || t.ui.lockedMessages.console} />
          )}
        </aside>
      </div>

      {assistantOverlayPortal}
      {/* Individual isPromptGenerating toast removed from here, integrated below */}
      {typeof document !== 'undefined' && promptReviewModal ? createPortal(promptReviewModal, document.body) : null}

      {/* Fixed Toast / Status Container - Top Right for Tracking */}
      <div className="fixed top-24 right-8 z-[200000] flex flex-col items-end gap-3 pointer-events-none">
        {isPromptGenerating && (
          <div className="pointer-events-auto flex items-center gap-4 bg-white dark:bg-dark-elevated border border-slate-200 dark:border-white/10 px-6 py-4 rounded-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] toast-animate-in border-l-4 border-l-amber-500 min-w-[320px]">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-0.5">{isEnglish ? 'AI Engine Phase' : 'KI Engine Phase'}</div>
              <div className="text-[14px] font-black text-slate-900 dark:text-white leading-tight">{isEnglish ? 'Fixing Prompt...' : 'Prompt wird optimiert...'}</div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-progress-indefinite"></div>
              </div>
            </div>
          </div>
        )}
        {structuredActionNotice && (
          <div className="pointer-events-auto bg-sap-blue text-white px-6 py-4 rounded-2xl shadow-2xl shadow-sap-blue/20 border border-white/10 toast-animate-in max-w-sm">
            <div className="flex items-start gap-4">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-[13px] font-bold leading-relaxed">{structuredActionNotice}</div>
              <button
                type="button"
                onClick={() => setStructuredActionNotice('')}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErpAdvisor;
