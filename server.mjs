import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { editableDocumentKeys } from './shared/siteContentSeed.js';
import {
  createAiExplorerLog,
  getAiExplorerLogs,
  getDocument,
  getDocumentRevisions,
  getSiteContent,
  getSiteMap,
  restoreDocumentRevision,
  syncFastlaneContentIfNeeded,
  updateDocument
} from './server/content-db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 3000);
const uploadsDir = path.resolve(__dirname, 'data', 'uploads');
const OLLAMA_CHAT_URL = process.env.OLLAMA_CHAT_URL || 'http://127.0.0.1:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'humane:6.1';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function getSmtpConfig(overrideConfig = null) {
  const smtp = overrideConfig ?? getSiteContent().global?.smtp;

  return {
    enabled: Boolean(smtp?.enabled),
    host: String(smtp?.host ?? '').trim(),
    port: Number(smtp?.port ?? 0),
    secure: Boolean(smtp?.secure),
    username: String(smtp?.username ?? '').trim(),
    password: String(smtp?.password ?? ''),
    fromName: String(smtp?.fromName ?? '').trim(),
    fromEmail: String(smtp?.fromEmail ?? '').trim(),
    recipientEmail: String(smtp?.recipientEmail ?? '').trim(),
    testRecipientEmail: String(smtp?.testRecipientEmail ?? '').trim()
  };
}

function validateSmtpConfig(config) {
  if (!config.enabled) {
    return 'SMTP is disabled.';
  }

  if (!config.host || !config.port || !config.username || !config.password || !config.fromEmail || !config.recipientEmail) {
    return 'SMTP configuration is incomplete.';
  }

  return null;
}

function createSmtpTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password
    }
  });
}

function extractAiExplorerBrief(content) {
  const match = content.match(/<brief_json>([\s\S]*?)<\/brief_json>/i);
  if (!match) {
    return {
      text: content.trim(),
      brief: null
    };
  }

  const text = content.replace(match[0], '').trim();

  try {
    return {
      text,
      brief: JSON.parse(match[1].trim())
    };
  } catch {
    return {
      text,
      brief: null
    };
  }
}

function cleanNumber(value) {
  if (value == null) return 0;
  const normalized = String(value).replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeExtractedValue(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';
  if (/^(noch offen|offen|open|n\/a|unbekannt|-|—)$/i.test(normalized)) return '';
  if (/^(beispielantworten|zu beginn|nun m[oö]chten wir wissen)/i.test(normalized)) return '';
  return normalized;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const sanitized = sanitizeExtractedValue(value);
    if (sanitized) {
      return sanitized;
    }
  }
  return '';
}

function extractLabeledValue(transcript, labels) {
  for (const label of labels) {
    const expression = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, 'i');
    const match = transcript.match(expression);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function extractMultilineSection(transcript, labels) {
  for (const label of labels) {
    const expression = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?:\\n\\s*[A-ZÄÖÜ][^:\\n]{1,40}:|$)`, 'i');
    const match = transcript.match(expression);
    if (match?.[1]) {
      return match[1]
        .split('\n')
        .map((line) => line.replace(/^[\-\u2022]\s*/, '').trim())
        .map((line) => sanitizeExtractedValue(line))
        .filter(Boolean)
        .join('; ');
    }
  }
  return '';
}

function normalizeTranscriptForExtraction(transcript) {
  return transcript
    .split('\n')
    .filter((line) => !/^(BEISPIELANTWORTEN|Zu Beginn haben wir|Nun m[oö]chten wir wissen|Danke der Informationen)/i.test(line.trim()))
    .join('\n');
}

function parseIntegrationList(transcript) {
  const integrations = [];
  if (/salesforce/i.test(transcript)) integrations.push('Salesforce');
  if (/crm/i.test(transcript) && !integrations.includes('CRM')) integrations.push('CRM');
  if (/sso/i.test(transcript)) integrations.push('SSO');
  if (/payment/i.test(transcript)) integrations.push('Payment');
  if (/eventplattform|event platform/i.test(transcript)) integrations.push('Eventplattform');
  return integrations;
}

function inferBriefFromTranscript(transcript, rawBrief = {}) {
  const normalizedTranscript = normalizeTranscriptForExtraction(transcript);
  const eventName = firstNonEmpty(
    rawBrief.eventName,
    extractLabeledValue(normalizedTranscript, ['Event Name', 'Eventname', 'Veranstaltung', 'Event'])
  );
  const eventLocation = firstNonEmpty(
    rawBrief.eventLocation,
    extractLabeledValue(normalizedTranscript, ['Veranstaltungsort', 'Event-Ort', 'Ort', 'Location'])
  );
  const eventDates = firstNonEmpty(
    rawBrief.eventDates,
    extractLabeledValue(normalizedTranscript, ['Eventdatum', 'Eventdaten', 'Datum', 'Event Date'])
  );
  const attendees = firstNonEmpty(
    rawBrief.attendees,
    extractLabeledValue(normalizedTranscript, ['Erwartete Teilnehmerzahl', 'Teilnehmerzahl', 'Teilnehmer', 'Attendees', 'Pax'])
  );
  const supportLevel = firstNonEmpty(
    rawBrief.supportLevel,
    extractLabeledValue(normalizedTranscript, ['Support-Level', 'Supportlevel'])
  );
  const badgeType = firstNonEmpty(
    rawBrief.badgeType,
    extractLabeledValue(normalizedTranscript, ['Badge-Typ', 'Badge Typ'])
  );
  const travelScope = firstNonEmpty(
    rawBrief.travelScope,
    extractLabeledValue(normalizedTranscript, ['Transport', 'Reisekosten', 'Travel Scope'])
  );
  const checkInScenario = firstNonEmpty(
    rawBrief.checkInScenario,
    extractMultilineSection(normalizedTranscript, ['Check-in-Szenario', 'Checkin-Szenario'])
  );
  const entryPoints = firstNonEmpty(
    rawBrief.entryPoints,
    extractLabeledValue(normalizedTranscript, ['Eingänge', 'Eingaenge']),
    (normalizedTranscript.match(/(\d+)\s*(haupt)?eing[aä]nge/i)?.[1] ?? '')
  );
  const onsiteDays = firstNonEmpty(
    rawBrief.onsiteDays,
    extractLabeledValue(normalizedTranscript, ['Eventtage', 'Dauer']),
    (normalizedTranscript.match(/(\d+)\s*(tage|tage\)|tag)/i)?.[1] ?? '')
  );

  const softwareNeeds = Array.from(new Set([
    ...(Array.isArray(rawBrief.softwareNeeds) ? rawBrief.softwareNeeds : []),
    ...( /badge/i.test(normalizedTranscript) ? ['Badge-Druck'] : [] ),
    ...( /scan/i.test(normalizedTranscript) ? ['Scanning'] : [] ),
    ...( /lead/i.test(normalizedTranscript) ? ['Lead-Capture'] : [] ),
    ...( /crm/i.test(normalizedTranscript) ? ['CRM-Integration'] : [] ),
    ...( /reporting/i.test(normalizedTranscript) ? ['Reporting'] : [] )
  ]));

  const rentalNeeds = Array.from(new Set([
    ...(Array.isArray(rawBrief.rentalNeeds) ? rawBrief.rentalNeeds : []),
    ...( /drucker/i.test(normalizedTranscript) ? ['Badge-Drucker'] : [] ),
    ...( /scanner/i.test(normalizedTranscript) ? ['Scanner'] : [] ),
    ...( /ipad|tablet/i.test(normalizedTranscript) ? ['Tablets / iPads'] : [] ),
    ...( /router|lte|netzwerk|wifi|wlan/i.test(normalizedTranscript) ? ['Router / LTE Backup'] : [] )
  ]));

  return {
    customerName: firstNonEmpty(rawBrief.customerName, extractLabeledValue(normalizedTranscript, ['Kunde', 'Customer', 'Ansprechpartner', 'KUNDE \\(PO\\)'])),
    eventName,
    eventLocation,
    eventDates,
    attendees,
    checkInScenario,
    venues: firstNonEmpty(rawBrief.venues, extractLabeledValue(transcript, ['Venues', 'Standorte']), eventLocation ? '1' : ''),
    entryPoints,
    onsiteDays,
    softwareNeeds,
    rentalNeeds,
    supportLevel: supportLevel || (/24\/7/i.test(normalizedTranscript) ? '24/7' : /extended/i.test(normalizedTranscript) ? 'Extended' : ''),
    travelScope,
    integrations: Array.from(new Set([...(Array.isArray(rawBrief.integrations) ? rawBrief.integrations : []), ...parseIntegrationList(normalizedTranscript)])),
    badgeType,
    serviceModules: Array.isArray(rawBrief.serviceModules) ? rawBrief.serviceModules : [],
    costDrivers: Array.isArray(rawBrief.costDrivers) ? rawBrief.costDrivers : [],
    assumptions: Array.isArray(rawBrief.assumptions) ? rawBrief.assumptions : [],
    missingItems: Array.isArray(rawBrief.missingItems) ? rawBrief.missingItems : [],
    nextStep: String(rawBrief.nextStep ?? '').trim()
  };
}

function isStructuredBriefInput(text) {
  const normalized = String(text ?? '');
  return normalized.length > 350 || /(event name|veranstaltungsort|eventdatum|erwartete teilnehmerzahl|check-?in-szenario|badge-druck|salesforce)/i.test(normalized);
}

function buildDeterministicAssistantReply(brief, offer) {
  const recognized = [
    brief.eventName ? `Event: ${brief.eventName}` : '',
    brief.eventLocation ? `Ort: ${brief.eventLocation}` : '',
    brief.eventDates ? `Datum: ${brief.eventDates}` : '',
    brief.attendees ? `Teilnehmer: ${brief.attendees}` : '',
    brief.checkInScenario ? `Szenario: ${brief.checkInScenario}` : '',
    brief.supportLevel ? `Support: ${brief.supportLevel}` : ''
  ].filter(Boolean);

  const modules = (offer?.modules ?? []).map((module) => module.title).slice(0, 6);
  const lines = [
    'Verstanden. Ich habe die belastbaren Angaben aus Ihrem Input strukturiert uebernommen.',
    recognized.length ? '' : 'Es wurden noch nicht genug strukturierte Angaben erkannt.',
    ...recognized.map((line) => `- ${line}`),
    modules.length ? '' : '',
    ...modules.map((module) => `- Modul erkannt: ${module}`),
    '',
    `Naechster Schritt: ${brief.currentQuestion || 'Bitte bestaetigen Sie die naechste Detailphase.'}`
  ].filter(Boolean);

  return lines.join('\n');
}

function parseAttendees(value, transcript = '') {
  const direct = cleanNumber(value);
  if (direct > 0) return Math.round(direct);

  const match = transcript.match(/(\d[\d.,]*)\s*(teilnehmer|pax|gaeste|gäste|personen)/i);
  if (!match) return 0;
  return Math.round(cleanNumber(match[1]));
}

function parseCountFromText(transcript, patterns, fallback = 0) {
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const value = cleanNumber(match[1]);
      if (value > 0) {
        return Math.round(value);
      }
    }
  }
  return fallback;
}

function parseDayCount(value, transcript = '') {
  const direct = cleanNumber(value);
  if (direct > 0) return Math.max(1, Math.round(direct));

  const explicitDays = transcript.match(/(\d[\d.,]*)\s*(tag|tage)/i);
  if (explicitDays) {
    return Math.max(1, Math.round(cleanNumber(explicitDays[1])));
  }

  return 1;
}

function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

function hasExplicitPricing(transcript) {
  return /(\d[\d.,]*)\s*(€|eur|euro|usd|\$|pro\s*(tag|stunde|teilnehmer|geraet|gerät|person|nacht|session))/i.test(transcript);
}

function createPosition(label, quantity, unit, rate, pricingEnabled) {
  const normalizedQuantity = Math.max(0, Number(quantity) || 0);
  const normalizedRate = pricingEnabled ? Math.max(0, Number(rate) || 0) : null;
  return {
    label,
    quantity: normalizedQuantity,
    unit,
    rate: normalizedRate,
    total: normalizedRate == null ? null : Math.round(normalizedQuantity * normalizedRate)
  };
}

function buildAiExplorerOffer(rawBrief, history, userMessage) {
  const transcript = [...history.map((item) => String(item?.text ?? '')), userMessage].join('\n');
  const lowerTranscript = transcript.toLowerCase();
  const pricingEnabled = hasExplicitPricing(transcript);
  const inferredBrief = inferBriefFromTranscript(transcript, rawBrief ?? {});
  const brief = {
    ...inferredBrief,
    customerName: String(inferredBrief.customerName ?? '').trim(),
    eventName: String(inferredBrief.eventName ?? '').trim(),
    eventLocation: String(inferredBrief.eventLocation ?? '').trim(),
    eventDates: String(inferredBrief.eventDates ?? '').trim(),
    attendees: String(inferredBrief.attendees ?? '').trim(),
    checkInScenario: String(inferredBrief.checkInScenario ?? '').trim(),
    venues: String(inferredBrief.venues ?? '').trim(),
    entryPoints: String(inferredBrief.entryPoints ?? '').trim(),
    onsiteDays: String(inferredBrief.onsiteDays ?? '').trim(),
    supportLevel: String(inferredBrief.supportLevel ?? '').trim(),
    travelScope: String(inferredBrief.travelScope ?? '').trim(),
    badgeType: String(inferredBrief.badgeType ?? '').trim(),
    serviceModules: Array.isArray(inferredBrief.serviceModules) ? inferredBrief.serviceModules.filter(Boolean) : [],
    costDrivers: Array.isArray(inferredBrief.costDrivers) ? inferredBrief.costDrivers.filter(Boolean) : [],
    assumptions: Array.isArray(inferredBrief.assumptions) ? inferredBrief.assumptions.filter(Boolean) : [],
    missingItems: Array.isArray(inferredBrief.missingItems) ? inferredBrief.missingItems.filter(Boolean) : [],
    nextStep: String(inferredBrief.nextStep ?? '').trim(),
    softwareNeeds: Array.isArray(inferredBrief.softwareNeeds) ? inferredBrief.softwareNeeds.filter(Boolean) : [],
    rentalNeeds: Array.isArray(inferredBrief.rentalNeeds) ? inferredBrief.rentalNeeds.filter(Boolean) : [],
    integrations: Array.isArray(inferredBrief.integrations) ? inferredBrief.integrations.filter(Boolean) : []
  };

  const attendees = parseAttendees(brief.attendees, transcript);
  const eventDays = parseDayCount(brief.onsiteDays || brief.eventDates, transcript);
  const venues = parseCountFromText(transcript, [/\b(\d+)\s*(venues|locations|standorte|locations?)/i, /\b(\d+)\s*(location|venue)\b/i], cleanNumber(brief.venues) || 1) || 1;
  const entryPoints = parseCountFromText(transcript, [/\b(\d+)\s*(eing[aä]nge|eingange|entrances|eingang|counters)\b/i], cleanNumber(brief.entryPoints) || 2) || 2;
  const requiresBadgePrint = /badge|druck|printer|print-on-demand|drucker/i.test(lowerTranscript) || /badge/i.test(brief.badgeType || '');
  const requiresScanning = /scan|scanner|zugang|check-?in|access/i.test(lowerTranscript);
  const requiresLeadCapture = /lead/i.test(lowerTranscript);
  const requiresRouter = /lte|router|internet|netzwerk/i.test(lowerTranscript);
  const requiresTravel = /reise|travel|hotel|transport|versand|anlieferung|abholung/i.test(lowerTranscript) || Boolean(brief.travelScope);
  const supportLevel = brief.supportLevel || (lowerTranscript.includes('24/7') ? '24/7' : lowerTranscript.includes('extended') ? 'Extended' : 'Basic');
  const softwareNeeds = new Set(brief.softwareNeeds);
  const rentalNeeds = new Set(brief.rentalNeeds);

  if (requiresBadgePrint) softwareNeeds.add('Badge & Print-on-Demand');
  if (requiresScanning) softwareNeeds.add('Check-in & Scanning');
  if (requiresLeadCapture) softwareNeeds.add('Lead-Capture');
  if (brief.integrations.length) softwareNeeds.add('Integrationen');

  if (requiresScanning) rentalNeeds.add('Scanner');
  if (requiresBadgePrint) rentalNeeds.add('Badge-Drucker');
  if (requiresRouter) rentalNeeds.add('Router / LTE Backup');

  const stations = parseCountFromText(
    transcript,
    [/\b(\d+)\s*(check-?in-stations|stations|counter|counters)\b/i],
    attendees > 0 ? Math.max(2, Math.ceil(attendees / 250)) : 2
  );
  const printers = requiresBadgePrint ? Math.max(1, Math.ceil(stations / 3)) : 0;
  const scanners = requiresScanning ? Math.max(2, stations) : 0;
  const routers = requiresRouter ? Math.max(1, Math.ceil(venues / 2)) : 0;
  const technicians = Math.max(1, Math.ceil(stations / 3));
  const supportHours = eventDays * 10;
  const projectHours =
    8 +
    (brief.integrations.length * 5) +
    ((requiresBadgePrint ? 6 : 0)) +
    ((venues > 1 ? 4 : 0)) +
    ((attendees > 1500 ? 8 : attendees > 600 ? 4 : 0));
  const attendeeVolume = attendees || 300;
  const consumableUnits = requiresBadgePrint ? Math.ceil(attendeeVolume * 1.08) : 0;

  const phaseDefinitions = [
    {
      key: 'Basisdaten',
      fields: [
        brief.eventName,
        brief.eventLocation,
        brief.eventDates,
        attendees ? `${attendees}` : brief.attendees,
        brief.checkInScenario
      ],
      question: 'Wie heisst das Event, wo findet es statt, an welchen Tagen, mit wie vielen Teilnehmern, und wie sieht das Check-in-Szenario aus?'
    },
    {
      key: 'Software',
      fields: [softwareNeeds.size ? 'ok' : '', brief.integrations.length ? 'ok' : '', brief.badgeType],
      question: 'Welche Software-Funktionen werden benoetigt: Teilnehmerimport, Badge-Druck, Check-in, Scanning, Lead-Capture, Reporting oder Integrationen?'
    },
    {
      key: 'Projektmanagement',
      fields: [venues > 0 ? `${venues}` : '', entryPoints > 0 ? `${entryPoints}` : '', brief.onsiteDays || `${eventDays}`],
      question: 'Wie komplex ist das Projekt organisatorisch: wie viele Venues, Eingangsbereiche, Stakeholder und Testlaeufe sind einzuplanen?'
    },
    {
      key: 'Miettechnik',
      fields: [stations > 0 ? `${stations}` : '', printers > 0 ? `${printers}` : '', scanners > 0 ? `${scanners}` : '', routers > 0 ? `${routers}` : ''],
      question: 'Welche Miettechnik wird konkret benoetigt: Check-in-Stationen, Scanner, Badge-Drucker, Router oder Backup-Geraete?'
    },
    {
      key: 'Verbrauchsmaterial',
      fields: [requiresBadgePrint ? `${consumableUnits}` : '', brief.badgeType],
      question: 'Welche Verbrauchsmaterialien werden benoetigt: Badge-Typ, Lanyards, Halter, Etiketten oder Druckerbaender?'
    },
    {
      key: 'Support',
      fields: [brief.supportLevel || supportLevel, technicians > 0 ? `${technicians}` : ''],
      question: 'Welches Support-Level wird vor Ort benoetigt: Basic, Extended, 24/7 oder doors-open critical?'
    },
    {
      key: 'Transport',
      fields: [brief.travelScope, requiresTravel ? 'ok' : '', eventDays > 1 ? `${eventDays}` : ''],
      question: 'Gibt es Transport-, Reise- oder Hotelbedarf fuer Team, Hardware, Versand oder Logistikpuffer?'
    }
  ];

  const completedPhases = phaseDefinitions.filter((phase) => phase.fields.filter(Boolean).length >= Math.max(1, Math.ceil(phase.fields.length / 2)));
  const currentPhaseDefinition = phaseDefinitions.find((phase) => !completedPhases.some((completed) => completed.key === phase.key)) || phaseDefinitions[phaseDefinitions.length - 1];
  const progressPercent = Math.round((completedPhases.length / phaseDefinitions.length) * 100);

  const moduleBlueprints = [
    {
      key: 'software',
      title: 'Software-Tools',
      enabled: softwareNeeds.size > 0 || attendeeVolume > 0,
      summary: 'Teilnehmerplattform, Check-in-Workflow, Reporting und optionale Integrationen.',
      rationale: `Empfohlen fuer ${attendeeVolume} Teilnehmer mit ${stations} Check-in-Stationen und ${brief.integrations.length || 0} Integrationen.`,
      positions: [
        createPosition('Event-Setup & Projekt-Workspace', 1, 'pauschal', 950, pricingEnabled),
        createPosition('Teilnehmermanagement-Lizenz', attendeeVolume, 'Teilnehmer', attendeeVolume > 1500 ? 1.05 : 1.2, pricingEnabled),
        ...(requiresBadgePrint ? [createPosition('Badge-/Print-on-Demand-Modul', eventDays, 'Eventtage', 390, pricingEnabled)] : []),
        ...(requiresScanning ? [createPosition('Check-in & Scanning Workflow', eventDays, 'Eventtage', 320, pricingEnabled)] : []),
        ...(brief.integrations.length ? [createPosition('Integrationspaket', brief.integrations.length, 'Integrationen', 480, pricingEnabled)] : []),
        ...(requiresLeadCapture ? [createPosition('Lead-Capture Modul', eventDays, 'Eventtage', 260, pricingEnabled)] : [])
      ]
    },
    {
      key: 'pm',
      title: 'Projektmanagement & Vorbereitung',
      enabled: true,
      summary: 'Kickoff, Datenchecks, Ablaufplanung, Testlaeufe und Abstimmung mit Stakeholdern.',
      rationale: `Der Aufwand steigt mit ${venues} Venue(s), ${entryPoints} Eingangs-/Counter-Bereichen und ${brief.integrations.length || 0} Integrationen.`,
      positions: [
        createPosition('Kickoff & Discovery', 1, 'pauschal', 420, pricingEnabled),
        createPosition('Projektmanagement / Jour fixes', projectHours, 'Stunden', 110, pricingEnabled),
        createPosition('Testlauf & Abnahmevorbereitung', Math.max(1, eventDays), 'Sessions', 240, pricingEnabled)
      ]
    },
    {
      key: 'rental',
      title: 'Miettechnik',
      enabled: stations > 0,
      summary: 'Check-in-Stations, Drucker, Scanner, Router und Redundanzgeraete.',
      rationale: `Fuers Peak-Handling werden ${stations} Stationen, ${printers} Drucker und ${scanners} Scanner empfohlen.`,
      positions: [
        createPosition('Tablet / Check-in Station', stations * eventDays, 'Geraetetage', 65, pricingEnabled),
        ...(printers ? [createPosition('Badge-Drucker', printers * eventDays, 'Geraetetage', 140, pricingEnabled)] : []),
        ...(scanners ? [createPosition('Scanner', scanners * eventDays, 'Geraetetage', 38, pricingEnabled)] : []),
        ...(routers ? [createPosition('LTE / Netzwerk Backup', routers * eventDays, 'Geraetetage', 55, pricingEnabled)] : [])
      ]
    },
    {
      key: 'consumables',
      title: 'Verbrauchsmaterial',
      enabled: consumableUnits > 0,
      summary: 'Badges, Lanyards, Etiketten und Druckerbaender inklusive Reserve.',
      rationale: `Mit 8% Reserve werden ${consumableUnits} Einheiten fuer Teilnehmer, Walk-ins und Fehldrucke kalkuliert.`,
      positions: [
        createPosition('Badge-Medien', consumableUnits, 'Stueck', brief.badgeType.toLowerCase().includes('pvc') ? 1.45 : 0.85, pricingEnabled),
        createPosition('Lanyards / Halter', consumableUnits, 'Stueck', 0.65, pricingEnabled),
        ...(printers ? [createPosition('Druckerbaender / Rollen', Math.max(1, Math.ceil(consumableUnits / 250)), 'Stueck', 48, pricingEnabled)] : [])
      ]
    },
    {
      key: 'support',
      title: 'Technischer Support vor Ort',
      enabled: true,
      summary: 'Onsite-Techniker, Supervisor, Briefing und Trouble-Shooting waehrend des Events.',
      rationale: `${supportLevel}-Support fuer ${supportHours} Einsatzstunden mit ${technicians} Techniker(n).`,
      positions: [
        createPosition('Onsite-Techniker', technicians * supportHours, 'Stunden', supportLevel === '24/7' ? 95 : supportLevel === 'Extended' ? 85 : 75, pricingEnabled),
        createPosition('Supervisor / Event Lead', eventDays * 10, 'Stunden', 115, pricingEnabled),
        createPosition('Crew Briefing / Schulung', Math.max(1, technicians), 'Session', 160, pricingEnabled)
      ]
    },
    {
      key: 'travel',
      title: 'Transport & Reisekosten',
      enabled: requiresTravel || venues > 1 || stations > 3,
      summary: 'Versand, Anlieferung, Hotel, Per-Diem und logistische Puffer.',
      rationale: 'Logistik wird fuer Hardware, Vor-Ort-Team und zeitkritische Anlieferung separat abgesichert.',
      positions: [
        createPosition('Transport / Versand', Math.max(1, stations + printers), 'Handling-Einheiten', 28, pricingEnabled),
        createPosition('Reisekosten-Pauschale Team', Math.max(1, technicians), 'Personen', 180, pricingEnabled),
        ...(eventDays > 1 ? [createPosition('Hotel / Uebernachtung', technicians * (eventDays - 1), 'Naechte', 140, pricingEnabled)] : [])
      ]
    }
  ];

  const modules = moduleBlueprints
    .filter((module) => module.enabled)
    .map((module) => {
      const subtotal = pricingEnabled ? module.positions.reduce((sum, position) => sum + (position.total || 0), 0) : null;
      return {
        key: module.key,
        title: module.title,
        summary: module.summary,
        rationale: module.rationale,
        subtotal,
        recommended: true,
        positions: module.positions
      };
    });

  const subtotal = pricingEnabled ? modules.reduce((sum, module) => sum + (module.subtotal || 0), 0) : null;
  const openQuestions = Array.from(new Set([
    ...brief.missingItems,
    ...(brief.eventLocation ? [] : ['Event-Ort und Venue-Setup']),
    ...(attendees ? [] : ['Erwartete Teilnehmerzahl und Peak-Check-in-Zeit']),
    ...(brief.eventDates ? [] : ['Event-Datum sowie Aufbau-/Abbauzeiten']),
    ...(requiresBadgePrint ? ['Badge-Typ und Druckvolumen final bestaetigen'] : [])
  ]));
  const assumptions = Array.from(new Set([
    ...brief.assumptions,
    ...(requiresRouter ? ['Fallback-Konnektivitaet wird ueber LTE / Router abgesichert.'] : ['Stabiles Internet wird vor Ort bereitgestellt.']),
    ...(requiresBadgePrint ? ['Badge-Layout wird spaetestens 5 Werktage vor Event bereitgestellt.'] : []),
    'Angebot basiert auf den aktuell bekannten Rahmenparametern und wird bei Scope-Aenderungen nachgeschaerft.'
  ]));

  const knowledgeCards = [
    {
      title: 'Software-Tools',
      included: ['Teilnehmerverwaltung', 'Check-in-Workflow', 'Reporting-Grundsetup'],
      missing: brief.integrations.length ? [] : ['Integrationen zu CRM / Eventplattform / SSO'],
      options: ['Lead-Capture', 'Mehrsprachigkeit', 'Rollen & Rechte', 'Payment / Ticketing'],
      risks: ['Unklare Datenqualitaet in Teilnehmerlisten', 'Zu spaete Freigabe des Badge-Layouts'],
      recommendation: attendeeVolume >= 1500 ? 'Ab 1.500 Teilnehmern sollte mindestens ein separates Reporting- und Monitoring-Setup vorgesehen werden.' : 'Fuer mittelgrosse Events reicht meist ein zentrales Teilnehmer- und Check-in-Setup mit Reporting aus.'
    },
    {
      title: 'Miettechnik',
      included: [`${stations} Check-in-Stationen`, `${printers} Badge-Drucker`, `${scanners} Scanner`],
      missing: requiresRouter ? [] : ['Netzwerk- / Internet-Absicherung'],
      options: ['Backup-Drucker', 'USV', 'Zusaetzliche Router', 'Express-Austauschgeraete'],
      risks: ['Zu wenige Stationen fuer Peak-Zeiten', 'Vor-Ort-Netzwerk nicht stabil genug'],
      recommendation: attendeeVolume >= 1500 ? 'Ab 1.500 Teilnehmern ist mindestens ein Backup-Drucker und ein separates LTE-Fallback sinnvoll.' : 'Die Hardware wurde auf den aktuellen Peak-Load konservativ dimensioniert.'
    },
    {
      title: 'Support & Operations',
      included: [`${technicians} Onsite-Techniker`, 'Supervisor / Event Lead', 'Crew-Briefing'],
      missing: supportLevel ? [] : ['Gewuenschtes Support-Level final bestaetigen'],
      options: ['24/7-Support', 'Doors-open critical coverage', 'Night shift coverage'],
      risks: ['Zu kurze Aufbauzeit', 'Unklare Verantwortlichkeiten vor Ort'],
      recommendation: eventDays > 1 ? 'Bei mehrtaegigen Events sollte eine Schicht- und Escalation-Logik explizit angeboten werden.' : 'Fuer eintaeige Events ist ein klarer doors-open Supportplan meist ausreichend.'
    }
  ];

  const variants = pricingEnabled
    ? [
        {
          name: 'Standard',
          multiplier: 1,
          total: subtotal,
          description: 'Solides Basissetup mit den aktuell benoetigten Komponenten.'
        },
        {
          name: 'Plus',
          multiplier: 1.16,
          total: Math.round(subtotal * 1.16),
          description: 'Mit mehr Redundanz, erweitertem Support und Sicherheitsreserven.'
        },
        {
          name: 'Premium',
          multiplier: 1.33,
          total: Math.round(subtotal * 1.33),
          description: 'High-availability Setup mit maximaler Betriebs- und Serviceabsicherung.'
        }
      ]
    : [];

  const enrichedBrief = {
    ...brief,
    currentPhase: currentPhaseDefinition.key,
    currentQuestion: currentPhaseDefinition.question,
    progressPercent,
    progressLabel: `${completedPhases.length}/${phaseDefinitions.length} Phasen erfasst`,
    phaseOrder: phaseDefinitions.map((phase) => phase.key),
    attendees: attendees ? `${attendees}` : brief.attendees,
    venues: venues ? `${venues}` : brief.venues,
    entryPoints: entryPoints ? `${entryPoints}` : brief.entryPoints,
    onsiteDays: eventDays ? `${eventDays}` : brief.onsiteDays,
    serviceModules: modules.map((item) => item.title),
    costDrivers: Array.from(new Set([
      ...brief.costDrivers,
      `${attendeeVolume} Teilnehmer`,
      `${stations} Check-in-Stationen`,
      `${eventDays} Eventtag(e)`,
      supportLevel,
      requiresBadgePrint ? 'Badge- / Print-on-Demand' : 'Digitales Check-in Setup'
    ].filter(Boolean))),
    assumptions,
    missingItems: openQuestions,
    nextStep: brief.nextStep || 'Naechster Schritt: offene Event-Parameter bestaetigen, Angebotsvariante waehlen und daraus ein freigabefaehiges Angebot erzeugen.'
  };

  return {
    brief: enrichedBrief,
    offer: {
      currency: 'EUR',
      hasPricing: pricingEnabled,
      subtotal,
      subtotalFormatted: pricingEnabled && subtotal != null ? formatEuro(subtotal) : undefined,
      modules,
      variants: variants.map((variant) => ({
        ...variant,
        totalFormatted: variant.total == null ? undefined : formatEuro(variant.total)
      })),
      knowledgeCards,
      assumptions,
      openQuestions
    }
  };
}

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function toSafeFileName(name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext).replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').toLowerCase();
  return `${Date.now()}-${base || 'media'}${ext.toLowerCase()}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, toSafeFileName(file.originalname));
  }
});

const upload = multer({ storage });

function runMiddleware(req, res, middleware) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve(result);
    });
  });
}

async function handleApi(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/site-content') {
    sendJson(res, 200, {
      editableDocumentKeys,
      content: getSiteContent()
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/site-map') {
    sendJson(res, 200, getSiteMap());
    return true;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/document/')) {
    const key = decodeURIComponent(url.pathname.replace('/api/document/', ''));
    const doc = getDocument(key);
    if (!doc) {
      sendJson(res, 404, { message: 'Document not found' });
      return true;
    }
    sendJson(res, 200, doc);
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/site-content/revisions') {
    const key = url.searchParams.get('key') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? 12);

    if (!editableDocumentKeys.includes(key)) {
      sendJson(res, 400, { message: 'Unsupported document key' });
      return true;
    }

    sendJson(res, 200, {
      key,
      revisions: getDocumentRevisions(key, Math.max(1, Math.min(limit, 50)))
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/ai-explorer/reports') {
    const limit = Number(url.searchParams.get('limit') ?? 100);
    sendJson(res, 200, {
      reports: getAiExplorerLogs(limit)
    });
    return true;
  }

  if (req.method === 'PUT' && url.pathname === '/api/site-content') {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const { key, value } = body;

    if (!editableDocumentKeys.includes(key)) {
      sendJson(res, 400, { message: 'Unsupported document key' });
      return true;
    }

    const saved = updateDocument(key, value);
    sendJson(res, 200, saved);
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/site-content/restore') {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const { key, revisionId } = body;

    if (!editableDocumentKeys.includes(key)) {
      sendJson(res, 400, { message: 'Unsupported document key' });
      return true;
    }

    const restored = restoreDocumentRevision(key, Number(revisionId));
    if (!restored) {
      sendJson(res, 404, { message: 'Revision not found' });
      return true;
    }

    sendJson(res, 200, restored);
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/media/upload') {
    await runMiddleware(req, res, upload.single('file'));
    const file = req.file;

    if (!file) {
      sendJson(res, 400, { message: 'file is required' });
      return true;
    }

    sendJson(res, 200, {
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      fileName: file.filename
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/forms/contact') {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const smtpConfig = getSmtpConfig();
    const configError = validateSmtpConfig(smtpConfig);

    if (configError) {
      sendJson(res, 503, { message: configError });
      return true;
    }

    const firstName = String(body.firstName ?? '').trim();
    const lastName = String(body.lastName ?? '').trim();
    const email = String(body.email ?? '').trim();
    const details = String(body.details ?? '').trim();
    const pageUrl = String(body.pageUrl ?? '').trim();

    if (!firstName || !lastName || !email || !details) {
      sendJson(res, 400, { message: 'All form fields are required.' });
      return true;
    }

    const transporter = createSmtpTransporter(smtpConfig);
    const subject = `New contact request from ${firstName} ${lastName}`;
    const text = [
      `First name: ${firstName}`,
      `Last name: ${lastName}`,
      `Email: ${email}`,
      '',
      'Project details:',
      details,
      '',
      `Page URL: ${pageUrl || 'N/A'}`
    ].join('\n');

    await transporter.sendMail({
      from: smtpConfig.fromName ? `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>` : smtpConfig.fromEmail,
      to: smtpConfig.recipientEmail,
      replyTo: email,
      subject,
      text,
      html: `
        <h2>New contact request</h2>
        <p><strong>First name:</strong> ${firstName}</p>
        <p><strong>Last name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project details:</strong></p>
        <p>${details.replace(/\n/g, '<br/>')}</p>
        <p><strong>Page URL:</strong> ${pageUrl || 'N/A'}</p>
      `
    });

    sendJson(res, 200, { ok: true, message: 'Form submitted successfully.' });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/smtp/test') {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const smtpConfig = getSmtpConfig(body.config ?? null);
    const configError = validateSmtpConfig(smtpConfig);

    if (configError) {
      sendJson(res, 400, { message: configError });
      return true;
    }

    const transporter = createSmtpTransporter(smtpConfig);
    const recipient = smtpConfig.testRecipientEmail || smtpConfig.recipientEmail;

    await transporter.sendMail({
      from: smtpConfig.fromName ? `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>` : smtpConfig.fromEmail,
      to: recipient,
      subject: 'SMTP test from Octotech-CRM',
      text: `SMTP test successful.\nHost: ${smtpConfig.host}\nPort: ${smtpConfig.port}\nSecure: ${smtpConfig.secure ? 'yes' : 'no'}`,
      html: `
        <h2>SMTP test successful</h2>
        <p><strong>Host:</strong> ${smtpConfig.host}</p>
        <p><strong>Port:</strong> ${smtpConfig.port}</p>
        <p><strong>Secure:</strong> ${smtpConfig.secure ? 'Yes' : 'No'}</p>
      `
    });

    sendJson(res, 200, { ok: true, message: `Test email sent to ${recipient}.` });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/ai-explorer/chat') {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const history = Array.isArray(body.history) ? body.history : [];
    const userMessage = String(body.userMessage ?? '').trim();

    if (!userMessage) {
      sendJson(res, 400, { message: 'userMessage is required.' });
      return true;
    }

    if (isStructuredBriefInput(userMessage)) {
      const computed = buildAiExplorerOffer({}, history, userMessage);
      const fastText = buildDeterministicAssistantReply(computed.brief, computed.offer);

      createAiExplorerLog({
        model: `${OLLAMA_MODEL} (fast-path)`,
        userAgent: String(req.headers['user-agent'] ?? ''),
        status: 'success',
        userMessage,
        assistantText: fastText,
        customerName: computed.brief?.customerName || '',
        eventName: computed.brief?.eventName || '',
        eventLocation: computed.brief?.eventLocation || '',
        attendees: computed.brief?.attendees || '',
        currentPhase: computed.brief?.currentPhase || '',
        brief: computed.brief ?? null,
        offer: computed.offer ?? null
      });

      sendJson(res, 200, {
        text: fastText,
        brief: computed.brief,
        offer: computed.offer,
        model: `${OLLAMA_MODEL} (fast-path)`
      });
      return true;
    }

    const systemPrompt = `Du bist "KI-Agent", ein deutschsprachiger Angebots- und Scoping-Agent fuer Teilnehmermanagement-Services auf Events.

Ziel:
- Fuehre mit dem Kunden ein strukturiertes Angebots-Interview.
- Erfasse alle relevanten Event-Rahmenparameter.
- Erstelle daraus eine intelligente, modulare Kosten- und Leistungsuebersicht.
- Nutze die folgenden Angebotsbereiche:
  1. Software-Tools
  2. Projektmanagement / Planung / Vorbereitung
  3. Miettechnik
  4. Verbrauchsmaterial
  5. Technischer Support vor Ort
  6. Transport- und Reisekosten

Arbeitsweise:
- Stelle pro Antwort genau eine naechste Hauptfrage.
- Wenn noetig, darfst du maximal 2 sehr kurze Unterpunkte zur gleichen Frage ergaenzen.
- Arbeite phasenweise: Event-Basisdaten, Software, PM, Miettechnik, Verbrauch, Support, Transport/Reise.
- Wenn Informationen fehlen, markiere sie sauber als "Offen" oder "Annahme".
- Wenn genug Informationen vorliegen, liefere eine Angebotsstruktur mit:
  - Kostenbereichen
  - Kostentreibern
  - offenen Punkten
  - Annahmen
  - naechstem sinnvollen Schritt
- Erfasse zusaetzlich, falls erkennbar:
  - Check-in-Szenario
  - Anzahl Venues / Eingaenge / Stations
  - Eventtage
  - Support-Level
  - Integrationen
  - Badge-Typ / Druckbedarf
- Keine Marketingfloskeln. Schreibe klar, beratend und belastbar.
- Wenn der Nutzer einen bestehenden Text oder Bedarf beschreibt, fasse zuerst praezise zusammen und leite dann in die naechste Frage ueber.
- Die Unterhaltung soll sich wie ein step-by-step Onboarding anfuehlen, nicht wie ein freier langer Chat.

Formatregeln:
- Antworte fuer den Nutzer immer in sauberem Deutsch.
- Ergaenze am Ende jeder Antwort zusaetzlich einen JSON-Block zwischen <brief_json> und </brief_json>.
- Der JSON-Block muss gueltig sein und diese Struktur haben:
{
  "customerName": "",
  "eventName": "",
  "eventLocation": "",
  "eventDates": "",
  "attendees": "",
  "checkInScenario": "",
  "venues": "",
  "entryPoints": "",
  "onsiteDays": "",
  "softwareNeeds": [],
  "rentalNeeds": [],
  "supportLevel": "",
  "travelScope": "",
  "integrations": [],
  "badgeType": "",
  "serviceModules": [],
  "costDrivers": [],
  "assumptions": [],
  "missingItems": [],
  "nextStep": ""
}
- Trage bekannte Informationen ein, unbekannte Felder als leeren String oder leeres Array.
- Der JSON-Block ist rein technisch, keine Erklaerung ausserhalb des JSON innerhalb der Tags.
`;

    const recentHistory = history.slice(-6);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((message) => ({
        role: message.role === 'model' ? 'assistant' : 'user',
        content: String(message.text ?? '')
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const ollamaResponse = await fetch(OLLAMA_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          messages,
          options: {
            temperature: 0.3,
            num_predict: 320
          }
        }),
        signal: AbortSignal.timeout(9000)
      });

      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        createAiExplorerLog({
          model: OLLAMA_MODEL,
          userAgent: String(req.headers['user-agent'] ?? ''),
          status: 'error',
          userMessage,
          assistantText: '',
          errorMessage: `Ollama request failed: ${errorText || ollamaResponse.status}`
        });
        sendJson(res, 502, { message: `Ollama request failed: ${errorText || ollamaResponse.status}` });
        return true;
      }

      const result = await ollamaResponse.json();
      const content = result?.message?.content ?? '';
      const parsed = extractAiExplorerBrief(content);
      const computed = buildAiExplorerOffer(parsed.brief ?? {}, history, userMessage);

      createAiExplorerLog({
        model: OLLAMA_MODEL,
        userAgent: String(req.headers['user-agent'] ?? ''),
        status: 'success',
        userMessage,
        assistantText: parsed.text || '',
        customerName: computed.brief?.customerName || '',
        eventName: computed.brief?.eventName || '',
        eventLocation: computed.brief?.eventLocation || '',
        attendees: computed.brief?.attendees || '',
        currentPhase: computed.brief?.currentPhase || '',
        brief: computed.brief ?? null,
        offer: computed.offer ?? null
      });

      sendJson(res, 200, {
        text: parsed.text || 'Ich konnte noch keine belastbare Angebotszusammenfassung erzeugen.',
        brief: computed.brief,
        offer: computed.offer,
        model: OLLAMA_MODEL
      });
      return true;
    } catch (error) {
      createAiExplorerLog({
        model: OLLAMA_MODEL,
        userAgent: String(req.headers['user-agent'] ?? ''),
        status: 'error',
        userMessage,
        assistantText: '',
        errorMessage: error instanceof Error
          ? `Ollama / humane:6.1 is not reachable: ${error.message}`
          : 'Ollama / humane:6.1 is not reachable.'
      });
      sendJson(res, 503, {
        message: error instanceof Error
          ? `Ollama / humane:6.1 is not reachable: ${error.message}`
          : 'Ollama / humane:6.1 is not reachable.'
      });
      return true;
    }
  }

  return false;
}

async function createAppServer() {
  const syncResult = syncFastlaneContentIfNeeded();
  if (syncResult.changed) {
    console.log(
      `FastLane content synchronized to ${syncResult.version}: ${syncResult.updatedKeys.join(', ')}`
    );
  }

  let vite;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
  }

  const server = http.createServer(async (req, res) => {
    try {
      if ((req.url ?? '') === '/favicon.ico') {
        const branding = getSiteContent().global?.branding ?? {};
        const faviconPath = branding.faviconUrl?.startsWith('/uploads/')
          ? path.join(uploadsDir, path.basename(branding.faviconUrl))
          : null;

        if (faviconPath && fs.existsSync(faviconPath)) {
          const ext = path.extname(faviconPath);
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'image/x-icon' });
          res.end(fs.readFileSync(faviconPath));
          return;
        }
      }

      if ((req.url ?? '').startsWith('/api/')) {
        const handled = await handleApi(req, res);
        if (!handled) {
          notFound(res);
        }
        return;
      }

      if ((req.url ?? '').startsWith('/uploads/')) {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
        const requested = path.basename(url.pathname);
        const filePath = path.join(uploadsDir, requested);

        if (!fs.existsSync(filePath)) {
          notFound(res);
          return;
        }

        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
        return;
      }

      if (!isProduction && vite) {
        vite.middlewares(req, res, () => {
          res.statusCode = 404;
          res.end();
        });
        return;
      }

      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
      const distPath = path.resolve(__dirname, 'dist');
      const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
      const filePath = path.join(distPath, requestedPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
        return;
      }

      const indexHtml = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        notFound(res);
        return;
      }

      const siteContent = getSiteContent();
      const branding = siteContent.global?.branding ?? {};
      const injectedHtml = fs
        .readFileSync(indexHtml, 'utf-8')
        .replace(
          '<title>FastLane | Teilnehmermanagement fuer Events</title>',
          `<title>${branding.siteTitle || 'FastLane | Teilnehmermanagement fuer Events'}</title>`
        )
        .replace(
          '</head>',
          `${branding.faviconUrl ? `<link rel="icon" href="${branding.faviconUrl}" />` : ''}${
            branding.appleTouchIconUrl
              ? `<link rel="apple-touch-icon" href="${branding.appleTouchIconUrl}" />`
              : ''
          }</head>`
        );

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(injectedHtml);
    } catch (error) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(error);
      }
      sendJson(res, 500, {
        message: 'Server error',
        detail: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`server listening on http://0.0.0.0:${port}`);
  });
}

createAppServer();
