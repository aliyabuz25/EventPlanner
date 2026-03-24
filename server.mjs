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
const OLLAMA_GENERATE_URL = process.env.OLLAMA_GENERATE_URL || process.env.OLLAMA_CHAT_URL || 'https://qwen.octotech.az/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2:0.5b';
const OLLAMA_TIMEOUT_MS = Math.max(5000, Number(process.env.OLLAMA_TIMEOUT_MS ?? 90000) || 90000);
const OLLAMA_NUM_PREDICT = Math.max(96, Number(process.env.OLLAMA_NUM_PREDICT ?? 160) || 160);

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
    const rawText = String(content ?? '').trim();
    const parsedRaw = parseJsonObject(rawText);
    if (parsedRaw && typeof parsedRaw === 'object') {
      return {
        text: '',
        brief: parsedRaw
      };
    }

    const jsonLikeMatch = rawText.match(/(\{[\s\S]*\})/);
    if (jsonLikeMatch) {
      const parsedInline = parseJsonObject(jsonLikeMatch[1]);
      if (parsedInline && typeof parsedInline === 'object') {
        return {
          text: rawText.replace(jsonLikeMatch[1], '').trim(),
          brief: parsedInline
        };
      }
    }

    return {
      text: rawText,
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

function parseJsonObject(content) {
  try {
    return JSON.parse(String(content ?? '').trim());
  } catch {
    return null;
  }
}

function isLikelyEventName(value) {
  const normalized = sanitizeExtractedValue(value);
  if (!normalized) return false;
  if (normalized.length < 4 || normalized.length > 80) return false;
  if (/^(hotel|briefing|eventdatum|management|daten|support|app|venue|ort)$/i.test(normalized)) return false;
  if (/\b(waere|wäre|interessant|offen|critical|support-level|single source|phase|assistent|assistant|scoping)\b/i.test(normalized)) return false;
  return /[a-zA-ZÄÖÜäöüß]/.test(normalized);
}

function normalizeEventNameValue(value) {
  const normalized = sanitizeExtractedValue(value)
    .replace(/\.\s*das event findet.*$/i, '')
    .replace(/\s+in der\s+[A-ZÄÖÜ].*$/i, '')
    .replace(/\s+im\s+[A-ZÄÖÜ].*$/i, '')
    .replace(/\s+am\s+\d{1,2}\..*$/i, '')
    .trim();

  return isLikelyEventName(normalized) ? normalized : '';
}

function isLikelyLocation(value) {
  const normalized = sanitizeExtractedValue(value);
  if (!normalized) return false;
  if (/^(eventdatum|management|daten|briefing|support-level|hotel)$/i.test(normalized)) return false;
  if (/\b(phase|print-on-demand|walk-ins|app waere|daten)\b/i.test(normalized)) return false;
  return /\b(stra[sß]e|str\.|platz|halle|center|zentrum|venue|istanbul|stuttgart|berlin|m[uü]nchen|hannover|leinfelden|echterdingen|umraniye)\b/i.test(normalized) || /\d/.test(normalized);
}

function isLikelyAttendeesValue(value) {
  const normalized = sanitizeExtractedValue(value);
  if (!normalized) return false;
  if (cleanNumber(normalized) > 0) return true;
  return /(\d[\d.,]*)\s*(teilnehmer|teilnehmende|pax|gaeste|gäste|personen)/i.test(normalized);
}

function shouldAcceptBriefField(key, value) {
  if (Array.isArray(value)) return true;
  const normalized = sanitizeExtractedValue(value);
  if (!normalized) return false;

  switch (key) {
    case 'eventName':
      return isLikelyEventName(normalized);
    case 'eventLocation':
      return isLikelyLocation(normalized);
    case 'attendees':
      return isLikelyAttendeesValue(normalized);
    case 'eventDates':
      return /\d/.test(normalized) || /\b(januar|februar|maerz|märz|april|mai|juni|juli|august|september|oktober|november|dezember|tag|tage)\b/i.test(normalized);
    default:
      return true;
  }
}

async function generateWithOllama(prompt, options = {}) {
  const ollamaResponse = await fetch(OLLAMA_GENERATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      keep_alive: '10m',
      options: {
        temperature: options.temperature ?? 0.3,
        num_predict: options.numPredict ?? OLLAMA_NUM_PREDICT
      }
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS)
  });

  if (!ollamaResponse.ok) {
    const errorText = await ollamaResponse.text();
    throw new Error(`Ollama request failed: ${errorText || ollamaResponse.status}`);
  }

  const result = await ollamaResponse.json();
  return String(result?.response ?? '').trim();
}

function coerceBriefScalar(value) {
  if (Array.isArray(value)) {
    const scalarCandidate = value.map((item) => sanitizeExtractedValue(item)).find(Boolean);
    return scalarCandidate || '';
  }
  return sanitizeExtractedValue(value);
}

function normalizeModelBrief(brief) {
  if (!brief || typeof brief !== 'object') {
    return null;
  }

  const normalized = {
    customerName: coerceBriefScalar(brief.customerName),
    eventName: normalizeEventNameValue(brief.eventName),
    eventLocation: coerceBriefScalar(brief.eventLocation),
    eventDates: coerceBriefScalar(brief.eventDates),
    attendees: coerceBriefScalar(brief.attendees),
    budget: coerceBriefScalar(brief.budget),
    checkInScenario: coerceBriefScalar(brief.checkInScenario),
    venues: coerceBriefScalar(brief.venues),
    entryPoints: coerceBriefScalar(brief.entryPoints),
    onsiteDays: coerceBriefScalar(brief.onsiteDays),
    supportLevel: coerceBriefScalar(brief.supportLevel),
    travelScope: coerceBriefScalar(brief.travelScope),
    badgeType: coerceBriefScalar(brief.badgeType),
    softwareNeeds: Array.isArray(brief.softwareNeeds) ? brief.softwareNeeds.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    rentalNeeds: Array.isArray(brief.rentalNeeds) ? brief.rentalNeeds.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    integrations: Array.isArray(brief.integrations) ? brief.integrations.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    serviceModules: Array.isArray(brief.serviceModules) ? brief.serviceModules.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    costDrivers: Array.isArray(brief.costDrivers) ? brief.costDrivers.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    assumptions: Array.isArray(brief.assumptions) ? brief.assumptions.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    missingItems: Array.isArray(brief.missingItems) ? brief.missingItems.map((item) => sanitizeExtractedValue(item)).filter(Boolean) : [],
    nextStep: coerceBriefScalar(brief.nextStep)
  };

  if (!shouldAcceptBriefField('eventName', normalized.eventName)) normalized.eventName = '';
  if (!shouldAcceptBriefField('eventLocation', normalized.eventLocation)) normalized.eventLocation = '';
  if (!shouldAcceptBriefField('attendees', normalized.attendees)) normalized.attendees = '';
  if (!shouldAcceptBriefField('eventDates', normalized.eventDates)) normalized.eventDates = '';
  if (/^(assistent|assistant|your name|event|venue|team|standard)$/i.test(normalized.customerName)) normalized.customerName = '';
  if (/^(standard|counter entry)$/i.test(normalized.checkInScenario)) normalized.checkInScenario = '';
  if (/^(standard|basic)$/i.test(normalized.supportLevel)) normalized.supportLevel = '';
  if (/^(budget|offen|standard|n\/a)$/i.test(normalized.budget)) normalized.budget = '';

  return normalized;
}

function mergeBriefs(...briefs) {
  const merged = {};

  for (const brief of briefs) {
    if (!brief || typeof brief !== 'object') continue;

    for (const [key, rawValue] of Object.entries(brief)) {
      if (Array.isArray(rawValue)) {
        const nextValues = rawValue.map((value) => sanitizeExtractedValue(value)).filter(Boolean);
        merged[key] = Array.from(new Set([...(Array.isArray(merged[key]) ? merged[key] : []), ...nextValues]));
        continue;
      }

      if (rawValue && typeof rawValue === 'object') {
        merged[key] = rawValue;
        continue;
      }

      const nextValue = sanitizeExtractedValue(rawValue);
      if (nextValue && shouldAcceptBriefField(key, nextValue)) {
        merged[key] = key === 'eventName' ? normalizeEventNameValue(nextValue) : nextValue;
      } else if (!(key in merged) && (rawValue === '' || rawValue == null)) {
        merged[key] = rawValue;
      }
    }
  }

  return merged;
}

function cleanNumber(value) {
  if (value == null) return 0;
  const normalized = String(value).replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeExtractedValue(value) {
  const normalized = String(value ?? '')
    .replace(/^\s*[-*•]+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^(eventname|event name|veranstaltung|eventortadresse|eventort|ortadresse|ort|veranstaltungsort|event-?ort|teilnehmerzahl|teilnehmer|pax|check-?in-?szenario|support-?level|transport|reisekosten)\s*:\s*/i, '')
    .trim();
  if (!normalized) return '';
  if (/^(noch offen|offen|open|n\/a|unbekannt|-|—)$/i.test(normalized)) return '';
  if (/^(beispielantworten|zu beginn|nun m[oö]chten wir wissen)/i.test(normalized)) return '';
  if (/^(zusammenfassung|naechster schritt)\b/i.test(normalized)) return '';
  if (/^(briefing|support-level|stationsbedarf|single source of truth|automatische angebotsvarianten|regel-engine|risiken & constraints|knowledge cards)$/i.test(normalized)) return '';
  if (/^(phase [a-g]|strukturierte datenerfassung)\b/i.test(normalized)) return '';
  if (/^(du bist ein|customername|eventdates|entrypoints|softwareNeeds|rentalNeeds|travelScope|serviceModules|costDrivers|missingItems|nextStep)\b/i.test(normalized)) return '';
  if (/->/.test(normalized)) return '';
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
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^(KUNDE \(PO\)|EVENTNAME|ORT \(VENUES\)|TEILNEHMER|SZENARIO|SUPPORT-LEVEL)$/i.test(trimmed)) {
        return false;
      }
      if (/^(Single Source of Truth|Strukturierte Datenerfassung|Automatische Angebotsvarianten|Regel-Engine|Regel-Engine & Rechenmodelle|Risiken & Constraints|Knowledge Cards)$/i.test(trimmed)) {
        return false;
      }
      if (/^Phase [A-G]\s+[-—]/i.test(trimmed)) {
        return false;
      }
      if (/^(BEISPIELANTWORTEN|Zu Beginn haben wir|Nun m[oö]chten wir wissen|Danke der Informationen|Zusammenfassung|Naechster Schritt)/i.test(trimmed)) {
        return false;
      }
      if (/^\*\*.*\*\*:/.test(trimmed)) {
        return false;
      }
      if (/^\-\s+\*\*.*\*\*:/.test(trimmed)) {
        return false;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return false;
      }
      if (/^(Wird anhand|Plausibilit[aä]tschecks|Vorlaufzeiten|Modul-Spezifische Empfehlungen|Agent erzeugt)/i.test(trimmed)) {
        return false;
      }
      if (/^(Tech-Konferenz|Corporate Event|Team reist aus Hannover an|Event ist lokal, keine [Uu]bernachtung)/i.test(trimmed)) {
        return false;
      }
      return true;
    })
    .map((line) => line.replace(/\*\*/g, '').trim())
    .join('\n');
}

function isPromptAuthoringMessage(text) {
  const normalized = String(text ?? '').toLowerCase();
  if (!normalized) return false;

  const promptSignals = [
    'du bist der fastlane assistant',
    'du bist ein event-scoping-assistent',
    'wichtige arbeitsregeln',
    'zu erfassende struktur',
    'deine aufgabe im chat',
    'antwortstil',
    'wenn ausreichend informationen vorliegen',
    'starte jetzt mit phase a',
    'phase a — event-basisdaten',
    'phase b — software-konfiguration',
    'phase c — projektmanagement',
    'phase d — miettechnik',
    'phase e — verbrauchsmaterial',
    'phase f — support vor ort',
    'phase g — transport & reise',
    '"customername":',
    '"eventname":',
    '"eventlocation":',
    '"eventdates":',
    '"checkinscenario":',
    '"softwareneeds":',
    '"rentalneeds":'
  ];

  const hits = promptSignals.filter((signal) => normalized.includes(signal)).length;
  const bulletLines = normalized.split('\n').filter((line) => line.trim().startsWith('- ')).length;
  return hits >= 3 || (hits >= 2 && bulletLines >= 8) || (hits >= 2 && normalized.includes('{') && normalized.includes('}'));
}

function isConsultingQuestion(text) {
  const normalized = String(text ?? '').toLowerCase();
  if (!normalized) return false;

  const signals = [
    'dienstleister',
    'teilnehmermanagement-services',
    'ki-agent',
    'angebots-agent',
    'kostenübersicht',
    'kostenuebersicht',
    'produktkatalog',
    'regel-engine',
    'pricing',
    'architektur',
    'interview-flow',
    'fragebaum',
    'mvp',
    'deliverables'
  ];

  const hits = signals.filter((signal) => normalized.includes(signal)).length;
  return hits >= 3;
}

async function extractBriefWithOllama(history, userMessage) {
  if (isPromptAuthoringMessage(userMessage)) {
    return null;
  }

  const userTranscript = [
    ...history
      .filter((item) => item?.role === 'user')
      .filter((item) => !isPromptAuthoringMessage(item?.text))
      .map((item) => String(item?.text ?? '')),
    userMessage
  ].join('\n');

  const transcript = normalizeTranscriptForExtraction(userTranscript);
  if (!transcript.trim()) {
    return null;
  }

  const extractionPrompt = `Du bist ein reiner Extraktionsdienst fuer Event-Scoping.
Extrahiere nur belastbare Fakten aus dem folgenden Nutzerverlauf.
Ignoriere Beispielantworten, Prompts, UI-Texte, Fragen des Assistenten und Annahmen.
Wenn eine Information nicht explizit genannt wurde, gib einen leeren String oder ein leeres Array zurueck.
Antworte ausschliesslich mit gueltigem JSON ohne Markdown, ohne Erklaerung, ohne Tags.

JSON-Schema:
{
  "customerName": "",
  "eventName": "",
  "eventLocation": "",
  "eventDates": "",
  "attendees": "",
  "budget": "",
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
}`;

  try {
    const content = await generateWithOllama(`${extractionPrompt}\n\nNutzerverlauf:\n${transcript}`, {
      temperature: 0.1,
      numPredict: 420
    });
    return parseJsonObject(content);
  } catch {
    return null;
  }
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

function pickLastMatch(transcript, patterns) {
  const source = String(transcript ?? '');
  let selected = '';

  for (const pattern of patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const regex = new RegExp(pattern.source, flags);
    let match;
    while ((match = regex.exec(source)) !== null) {
      const candidate = sanitizeExtractedValue(match[1]);
      if (candidate) {
        selected = candidate;
      }
    }
  }

  return selected;
}

function inferEventName(transcript) {
  return pickLastMatch(transcript, [
    /\bevent adı\s*:?\s*([^\n,.;]+)/i,
    /\bevent adi\s*:?\s*([^\n,.;]+)/i,
    /\bevent name\s*[:=-]\s*([^\n,.;]+)/i,
    /\beventname\s*[:=-]\s*([^\n,.;]+)/i,
    /\bveranstaltung\s*[:=-]\s*([^\n,.;]+)/i,
    /\bevent\s*[:=-]\s*([^\n,.;]+)/i,
    /\bwir planen\s+(?:den|das)\s+(.+?)\s+als\b/i,
    /\bwir planen\s+(?:den|das)\s+(.+?)\s+in der\b/i,
    /\bwir planen\s+(?:den|das)\s+(.+?)\s+im\b/i,
    /\bwir planen\s+(?:den|das)\s+(.+?)\s+am\b/i,
    /\b(?:das|unser|mein)\s+event\s+(?:heisst|heißt|ist)\s+([^\n,.;]+)/i,
    /\bname der veranstaltung\s*:?\s*([^\n,.;]+)/i,
    /\b(?:event adı|event adi)\s+([^\n,.;]+)/i
  ]);
}

function inferLocation(transcript) {
  return pickLastMatch(transcript, [
    /\badresi\s*:?\s*([^\n]+)/i,
    /\badresse\s*:?\s*([^\n]+)/i,
    /\bveranstaltungsort\s*:\s*([^\n.;]+)/i,
    /\bevent-?ort\s*:\s*([^\n.;]+)/i,
    /\bvenue\s*:\s*([^\n.;]+)/i,
    /\blocation\s*:\s*([^\n.;]+)/i,
    /\bort\s*:\s*([^\n.;]+)/i,
    /\bin der\s+([A-ZÄÖÜ][^\n]+?)(?:\.\s|,\s+wir|\s+bei\s+[A-ZÄÖÜ]|\s+das\s+event|\s+statt|$)/i,
    /\bin\s+der\s+([A-ZÄÖÜ][^\n]+?)(?:\.\s|,\s+das\s+event|,\s+wir|\s+am\s+\d|\s+mit\s+\d|$)/i,
    /\bim\s+([A-ZÄÖÜ][^\n]+?)(?:\.\s|,\s+das\s+event|,\s+wir|\s+am\s+\d|\s+mit\s+\d|$)/i,
    /\bfindet\s+in\s+([A-ZÄÖÜ][^\n,.;]+)/i,
    /\bin\s+([A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\- ]{2,40})\s+statt\b/i
  ]);
}

function inferEventDates(transcript) {
  return pickLastMatch(transcript, [
    /\beventdatum\s*:?\s*([^\n]+)/i,
    /\beventdaten\s*:?\s*([^\n]+)/i,
    /\bdatum\s*:?\s*([^\n]+)/i,
    /\bam\s+(\d{1,2}\.\s*(?:und|-)\s*\d{1,2}\.\s*[A-Za-zÄÖÜäöüß]+\s*\d{4})/i,
    /\bam\s+(\d{1,2}\.\s*[A-Za-zÄÖÜäöüß]+\s*\d{4}\s*(?:und|bis|-)\s*\d{1,2}\.\s*[A-Za-zÄÖÜäöüß]+\s*\d{4})/i,
    /\bvon\s+(\d{1,2}\.\d{1,2}\.\d{2,4}\s*(?:bis|-)\s*\d{1,2}\.\d{1,2}\.\d{2,4})/i,
    /\b(\d{1,2}\.\d{1,2}\.\d{2,4}\s*(?:bis|-)\s*\d{1,2}\.\d{1,2}\.\d{2,4})/i,
    /\b(\d+\s*(?:tag|tage))\b/i
  ]);
}

function inferAttendees(transcript) {
  return pickLastMatch(transcript, [
    /\berwartete teilnehmerzahl\s*:?\s*([^\n,.;]+)/i,
    /\bteilnehmerzahl\s*:?\s*([^\n,.;]+)/i,
    /\bteilnehmer\s*:?\s*([^\n,.;]+)/i,
    /\bpax\s*:?\s*([^\n,.;]+)/i,
    /\brund\s+(\d[\d.,]*)\s*(?:teilnehmer|teilnehmende|pax|gaeste|gäste|personen)\b/i,
    /\b(\d[\d.,]*)\s*(?:teilnehmer|pax|gaeste|gäste|personen)\b/i,
    /\bmit\s+(\d[\d.,]*)\s*(?:teilnehmer|teilnehmenden|pax|gaesten|gästen|personen)\b/i
  ]);
}

function inferCheckInScenario(transcript, rawBrief = {}) {
  const explicit = firstNonEmpty(
    rawBrief.checkInScenario,
    extractMultilineSection(transcript, ['Check-in-Szenario', 'Checkin-Szenario'])
  );
  if (explicit) return explicit;

  const parts = [];
  if (/print-on-demand|live-badging|badge[-\s]?druck/i.test(transcript)) {
    parts.push('Print-on-Demand / Live-Badging');
  } else if (/vorproduziert|vorgefertigt|klassischer check-?in/i.test(transcript)) {
    parts.push('Klassischer Check-in mit vorproduzierten Badges');
  } else if (/self-?check-?in|badge2go|kiosk/i.test(transcript)) {
    parts.push('Self-Check-in / Kiosk-Setup');
  } else if (/check-?in|einlass|zugang/i.test(transcript)) {
    parts.push('Check-in / Einlassmanagement');
  }

  const entrances = pickLastMatch(transcript, [/\b(\d+)\s*(?:eing[aä]nge|eingange|entrances|eingang)\b/i]);
  if (entrances) {
    parts.push(`${entrances} Eingaenge`);
  }

  const counters = pickLastMatch(transcript, [/\b(\d+)\s*(?:counter|counters|desks|schalter)\b/i]);
  if (counters) {
    parts.push(`${counters} Counter`);
  }

  if (/walk-?ins?/i.test(transcript)) {
    parts.push('Walk-ins eingeplant');
  }

  return parts.join(', ');
}

function inferSupportLevel(transcript) {
  if (/doors?-open critical/i.test(transcript)) return 'Doors-open critical';
  if (/24\s*\/\s*7/i.test(transcript)) return '24/7';
  if (/extended/i.test(transcript)) return 'Extended';
  if (/\bbasic\b/i.test(transcript)) return 'Basic';
  if (/remote-?helpdesk|remote support/i.test(transcript)) return 'Basic';
  if (/onsite|vor ort|techniker/i.test(transcript)) return 'Extended';
  return '';
}

function inferTravelScope(transcript) {
  const parts = [];
  if (/spedition|versand|anlieferung|abholung|transport/i.test(transcript)) {
    parts.push('Material- / Techniktransport');
  }
  if (/hotel|uebernacht|übernacht/i.test(transcript)) {
    parts.push('Hotel / Uebernachtung');
  }
  if (/reise|anreise|flug|bahn|mietwagen/i.test(transcript)) {
    parts.push('Team-Reise');
  }
  return parts.join(', ');
}

function inferBudget(transcript) {
  const direct = pickLastMatch(transcript, [
    /\b(?:budget|rahmenbudget|maximalbudget|budgetrahmen)\s*[:=-]?\s*(?:ca\.\s*)?(\d[\d.,\s]*(?:\s*(?:-|bis)\s*\d[\d.,\s]*)?\s*(?:€|eur|euro))\b/i,
    /\b(?:budget|rahmenbudget|maximalbudget|budgetrahmen)\s*[:=-]?\s*(?:ca\.\s*)?(\d[\d.,\s]*(?:\s*(?:-|bis)\s*\d[\d.,\s]*)?)\b/i
  ]);

  if (direct) {
    return direct.replace(/\s+/g, ' ').trim();
  }

  const freeText = transcript.match(/\bwir haben\s+ein\s+budget\s+von\s+(\d[\d.,\s]*(?:\s*(?:-|bis)\s*\d[\d.,\s]*)?\s*(?:€|eur|euro)?)\b/i);
  return freeText?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function parseBudgetValue(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return null;

  const compact = normalized
    .replace(/ca\.\s*/g, '')
    .replace(/\s*(eur|euro|€)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!compact) return null;

  const rangeMatch = compact.match(/(\d[\d.,]*)\s*(?:-|bis)\s*(\d[\d.,]*)/i);
  if (rangeMatch) {
    const min = cleanNumber(rangeMatch[1]);
    const max = cleanNumber(rangeMatch[2]);
    if (min > 0 && max >= min) {
      return { min, max };
    }
  }

  const single = cleanNumber(compact);
  if (single > 0) {
    return { min: single, max: single };
  }

  return null;
}

function inferBriefFromTranscript(transcript, rawBrief = {}) {
  const normalizedTranscript = normalizeTranscriptForExtraction(transcript);
  const eventName = firstNonEmpty(
    rawBrief.eventName,
    extractLabeledValue(normalizedTranscript, ['Event Name', 'Eventname', 'Veranstaltung', 'Event']),
    inferEventName(normalizedTranscript)
  );
  const eventLocation = firstNonEmpty(
    rawBrief.eventLocation,
    extractLabeledValue(normalizedTranscript, ['Veranstaltungsort', 'Event-Ort', 'Ort', 'Location']),
    inferLocation(normalizedTranscript)
  );
  const eventDates = firstNonEmpty(
    rawBrief.eventDates,
    extractLabeledValue(normalizedTranscript, ['Eventdatum', 'Eventdaten', 'Datum', 'Event Date']),
    inferEventDates(normalizedTranscript)
  );
  const attendees = firstNonEmpty(
    rawBrief.attendees,
    extractLabeledValue(normalizedTranscript, ['Erwartete Teilnehmerzahl', 'Teilnehmerzahl', 'Teilnehmer', 'Attendees', 'Pax']),
    inferAttendees(normalizedTranscript)
  );
  const budget = firstNonEmpty(
    rawBrief.budget,
    extractLabeledValue(normalizedTranscript, ['Budget', 'Rahmenbudget', 'Maximalbudget', 'Budgetrahmen']),
    inferBudget(normalizedTranscript)
  );
  const supportLevel = firstNonEmpty(
    rawBrief.supportLevel,
    extractLabeledValue(normalizedTranscript, ['Support-Level', 'Supportlevel']),
    inferSupportLevel(normalizedTranscript)
  );
  const badgeType = firstNonEmpty(
    rawBrief.badgeType,
    extractLabeledValue(normalizedTranscript, ['Badge-Typ', 'Badge Typ']),
    /pvc/i.test(normalizedTranscript) ? 'PVC-Badge' : /papier|paper/i.test(normalizedTranscript) ? 'Papier-Badge' : /digital/i.test(normalizedTranscript) ? 'Digital / QR' : ''
  );
  const travelScope = firstNonEmpty(
    rawBrief.travelScope,
    extractLabeledValue(normalizedTranscript, ['Transport', 'Reisekosten', 'Travel Scope']),
    inferTravelScope(normalizedTranscript)
  );
  const checkInScenario = inferCheckInScenario(normalizedTranscript, rawBrief);
  const entryPoints = firstNonEmpty(
    rawBrief.entryPoints,
    extractLabeledValue(normalizedTranscript, ['Eingänge', 'Eingaenge']),
    (normalizedTranscript.match(/(\d+)\s*(haupt)?eing[aä]nge/i)?.[1] ?? ''),
    pickLastMatch(normalizedTranscript, [/\b(\d+)\s*(?:eing[aä]nge|eingange|entrances|eingang)\b/i])
  );
  const onsiteDays = firstNonEmpty(
    rawBrief.onsiteDays,
    extractLabeledValue(normalizedTranscript, ['Eventtage', 'Dauer']),
    (normalizedTranscript.match(/(\d+)\s*(tage|tage\)|tag)/i)?.[1] ?? ''),
    pickLastMatch(normalizedTranscript, [/\b(\d+)\s*(?:tage|tag)\b/i])
  );

  const softwareNeeds = Array.from(new Set([
    ...(Array.isArray(rawBrief.softwareNeeds) ? rawBrief.softwareNeeds : []),
    ...( /badge/i.test(normalizedTranscript) ? ['Badge-Druck'] : [] ),
    ...( /scan/i.test(normalizedTranscript) ? ['Scanning'] : [] ),
    ...( /lead/i.test(normalizedTranscript) ? ['Lead-Capture'] : [] ),
    ...( /crm/i.test(normalizedTranscript) ? ['CRM-Integration'] : [] ),
    ...( /reporting/i.test(normalizedTranscript) ? ['Reporting'] : [] ),
    ...( /self-?check-?in|badge2go|kiosk/i.test(normalizedTranscript) ? ['Self-Check-in'] : [] ),
    ...( /event-app|app\b/i.test(normalizedTranscript) ? ['Event-App'] : [] ),
    ...( /rollen|rechte|ticketkategorien/i.test(normalizedTranscript) ? ['Rollen & Rechte'] : [] )
  ]));

  const rentalNeeds = Array.from(new Set([
    ...(Array.isArray(rawBrief.rentalNeeds) ? rawBrief.rentalNeeds : []),
    ...( /drucker/i.test(normalizedTranscript) ? ['Badge-Drucker'] : [] ),
    ...( /scanner/i.test(normalizedTranscript) ? ['Scanner'] : [] ),
    ...( /ipad|tablet/i.test(normalizedTranscript) ? ['Tablets / iPads'] : [] ),
    ...( /router|lte|netzwerk|wifi|wlan/i.test(normalizedTranscript) ? ['Router / LTE Backup'] : [] ),
    ...( /kiosk/i.test(normalizedTranscript) ? ['Self-Check-in Kiosk'] : [] ),
    ...( /laptop/i.test(normalizedTranscript) ? ['Laptops'] : [] )
  ]));

  return {
    customerName: firstNonEmpty(rawBrief.customerName, extractLabeledValue(normalizedTranscript, ['Kunde', 'Customer', 'Ansprechpartner', 'KUNDE \\(PO\\)'])),
    eventName,
    eventLocation,
    eventDates,
    attendees,
    budget,
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
  const structuredFieldMatches = [
    /event name/i,
    /veranstaltungsort/i,
    /eventdatum/i,
    /erwartete teilnehmerzahl/i,
    /check-?in-szenario/i,
    /badge-druck/i,
    /salesforce/i
  ].filter((pattern) => pattern.test(normalized)).length;

  return normalized.length > 500 || structuredFieldMatches >= 3;
}

function shouldAnswerDirectly(text) {
  const normalized = String(text ?? '').toLowerCase();
  return /bitte beantworte|antworte direkt|keine rueckfragen|keine rückfragen|liefere konkrete antworten|als waerst du der kunde|als wärst du der kunde|gib zu jedem punkt eine konkrete antwort|formatiere die antwort sauber nach den phasen|vollstaendige antwort|vollständige antwort/.test(normalized);
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

function buildPromptAuthoringHelpReply() {
  return [
    'Ich brauche noch echte Eventangaben statt einer Anweisung oder Vorlage.',
    'Nennen Sie mir bitte jetzt einfach Eventname, Ort, Datum, Teilnehmerzahl und den geplanten Check-in-Ablauf in normalem Text.'
  ].join('\n');
}

function looksLikeJsonOnlyReply(text) {
  const normalized = String(text ?? '').trim();
  return !normalized || normalized.startsWith('{') || normalized.startsWith('{"') || /^\{[\s\S]*\}$/.test(normalized);
}

function buildAssistantReplyFromBrief(brief) {
  const lines = [];
  const facts = [
    brief?.eventName ? `Event: ${brief.eventName}` : '',
    brief?.eventLocation ? `Ort: ${brief.eventLocation}` : '',
    brief?.eventDates ? `Datum: ${brief.eventDates}` : '',
    brief?.attendees ? `Teilnehmer: ${brief.attendees}` : '',
    brief?.budget ? `Budget: ${brief.budget}` : '',
    brief?.checkInScenario ? `Check-in: ${brief.checkInScenario}` : '',
    brief?.supportLevel ? `Support: ${brief.supportLevel}` : ''
  ].filter(Boolean);

  if (facts.length) {
    lines.push('Ich habe die aktuellen Eckdaten uebernommen.');
    lines.push(...facts.map((fact) => `- ${fact}`));
  } else {
    lines.push('Ich habe noch nicht genug belastbare Eventdaten erkannt.');
  }

  if (brief?.currentQuestion) {
    lines.push('');
    lines.push(brief.currentQuestion);
  }

  return lines.join('\n');
}

function briefOrNullIfEmpty(brief) {
  if (!brief || typeof brief !== 'object') return null;

  const meaningful = [
    brief.customerName,
    brief.eventName,
    brief.eventLocation,
    brief.eventDates,
    brief.attendees,
    brief.budget,
    brief.checkInScenario,
    brief.supportLevel
  ].filter((value) => String(value ?? '').trim());

  return meaningful.length ? brief : null;
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
  const normalizedValue = String(value ?? '').trim();
  if (/^\d+$/.test(normalizedValue)) {
    return Math.max(1, Math.round(cleanNumber(normalizedValue)));
  }

  if (/\b\d{1,2}\.\s*(und|-)\s*\d{1,2}\.\s*[A-Za-zÄÖÜäöüß]+\s*\d{4}\b/i.test(normalizedValue)) {
    return 2;
  }

  if (/\b\d{4}-\d{2}-\d{2}.*\b\d{4}-\d{2}-\d{2}\b/.test(normalizedValue)) {
    return 2;
  }

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
  return /(\d[\d.,]*)\s*(€|eur|euro|usd|\$|pro\s*(tag|stunde|teilnehmer|geraet|gerät|person|nacht|session))/i.test(transcript)
    || /\b(budget|rahmenbudget|maximalbudget|budgetrahmen)\b/i.test(transcript);
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
  const userTranscript = [
    ...history
      .filter((item) => item?.role === 'user')
      .filter((item) => !isPromptAuthoringMessage(item?.text))
      .map((item) => String(item?.text ?? '')),
    ...(isPromptAuthoringMessage(userMessage) ? [] : [userMessage])
  ].join('\n');
  const transcript = normalizeTranscriptForExtraction(userTranscript);
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
    budget: String(inferredBrief.budget ?? '').trim(),
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
  const budgetText = brief.budget || inferBudget(transcript);
  const budgetValue = parseBudgetValue(budgetText);
  const eventDays = parseDayCount(brief.onsiteDays || brief.eventDates, transcript);
  const venues = parseCountFromText(transcript, [/\b(\d+)\s*(venues|locations|standorte|locations?)/i, /\b(\d+)\s*(location|venue)\b/i], cleanNumber(brief.venues) || 1) || 1;
  const entryPoints = parseCountFromText(transcript, [/\b(\d+)\s*(eing[aä]nge|eingange|entrances|eingang|counters)\b/i], cleanNumber(brief.entryPoints) || 2) || 2;
  const requiresBadgePrint = /badge|druck|printer|print-on-demand|drucker/i.test(lowerTranscript) || /badge/i.test(brief.badgeType || '');
  const requiresScanning = /scan|scanner|zugang|check-?in|access/i.test(lowerTranscript);
  const requiresLeadCapture = /lead/i.test(lowerTranscript);
  const requiresRouter = /lte|router|internet|netzwerk/i.test(lowerTranscript);
  const requiresTravel = /reise|travel|hotel|transport|versand|anlieferung|abholung/i.test(lowerTranscript) || Boolean(brief.travelScope);
  const inferredSupportLevel =
    lowerTranscript.includes('24/7')
      ? '24/7'
      : lowerTranscript.includes('extended')
        ? 'Extended'
        : attendees > 800 || requiresBadgePrint || requiresScanning || requiresTravel
          ? 'Extended'
          : 'Basic';
  const supportLevel = brief.supportLevel || inferredSupportLevel;
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
      minFilled: 3,
      fields: [
        brief.eventName,
        brief.eventLocation,
        brief.eventDates,
        attendees ? `${attendees}` : brief.attendees,
        brief.checkInScenario
      ],
      question: 'Wie heisst das Event, wo findet es statt, an welchen Tagen, mit wie vielen Teilnehmern, wie sieht das Check-in-Szenario aus, und gibt es bereits ein Budget oder einen Budgetrahmen?'
    },
    {
      key: 'Software',
      minFilled: 1,
      fields: [softwareNeeds.size ? 'ok' : '', brief.integrations.length ? 'ok' : '', brief.badgeType],
      question: 'Welche Software-Funktionen werden benoetigt: Teilnehmerimport, Badge-Druck, Check-in, Scanning, Lead-Capture, Reporting oder Integrationen?'
    },
    {
      key: 'Projektmanagement',
      minFilled: 2,
      fields: [venues > 0 ? `${venues}` : '', entryPoints > 0 ? `${entryPoints}` : '', brief.onsiteDays || `${eventDays}`],
      question: 'Wie komplex ist das Projekt organisatorisch: wie viele Venues, Eingangsbereiche, Stakeholder und Testlaeufe sind einzuplanen?'
    },
    {
      key: 'Miettechnik',
      minFilled: 1,
      fields: [stations > 0 ? `${stations}` : '', printers > 0 ? `${printers}` : '', scanners > 0 ? `${scanners}` : '', routers > 0 ? `${routers}` : ''],
      question: 'Welche Miettechnik wird konkret benoetigt: Check-in-Stationen, Scanner, Badge-Drucker, Router oder Backup-Geraete?'
    },
    {
      key: 'Verbrauchsmaterial',
      minFilled: 1,
      fields: [requiresBadgePrint ? `${consumableUnits}` : '', brief.badgeType],
      question: 'Welche Verbrauchsmaterialien werden benoetigt: Badge-Typ, Lanyards, Halter, Etiketten oder Druckerbaender?'
    },
    {
      key: 'Support',
      minFilled: 1,
      fields: [brief.supportLevel || supportLevel, technicians > 0 ? `${technicians}` : ''],
      question: 'Welches Support-Level wird vor Ort benoetigt: Basic, Extended, 24/7 oder doors-open critical?'
    },
    {
      key: 'Transport',
      minFilled: 1,
      fields: [brief.travelScope, requiresTravel ? 'ok' : '', eventDays > 1 ? `${eventDays}` : ''],
      question: 'Gibt es Transport-, Reise- oder Hotelbedarf fuer Team, Hardware, Versand oder Logistikpuffer?'
    }
  ];

  const completedPhases = phaseDefinitions.filter((phase) => phase.fields.filter(Boolean).length >= (phase.minFilled ?? Math.max(1, Math.ceil(phase.fields.length / 2))));
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

  let budgetStatus = '';
  if (pricingEnabled && subtotal != null && budgetValue) {
    if (subtotal <= budgetValue.max) {
      budgetStatus = `Im Budgetrahmen (${formatEuro(budgetValue.max)})`;
    } else {
      budgetStatus = `Ueber Budget (${formatEuro(budgetValue.max)})`;
    }
  }

  const enrichedBrief = {
    ...brief,
    customerName: brief.customerName || 'Veranstalter',
    eventName: normalizeEventNameValue(brief.eventName) || brief.eventName,
    budget: budgetText,
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
      budget: budgetText || undefined,
      budgetStatus: budgetStatus || undefined,
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

    const extractedBrief = null;
    const consultingMode = isConsultingQuestion(userMessage);
    if (isPromptAuthoringMessage(userMessage) && !consultingMode) {
      const computed = buildAiExplorerOffer({}, history, '');
      const helperText = buildPromptAuthoringHelpReply();

      createAiExplorerLog({
        model: `${OLLAMA_MODEL} (guidance)`,
        userAgent: String(req.headers['user-agent'] ?? ''),
        status: 'success',
        userMessage,
        assistantText: helperText,
        customerName: computed.brief?.customerName || '',
        eventName: computed.brief?.eventName || '',
        eventLocation: computed.brief?.eventLocation || '',
        attendees: computed.brief?.attendees || '',
        currentPhase: computed.brief?.currentPhase || '',
        brief: computed.brief ?? null,
        offer: computed.offer ?? null
      });

      sendJson(res, 200, {
        text: helperText,
        brief: computed.brief,
        offer: computed.offer,
        model: `${OLLAMA_MODEL} (guidance)`
      });
      return true;
    }

    const systemPrompt = consultingMode
      ? `Du bist ein deutschsprachiger Pre-Sales- und Solution-Consulting-Assistent fuer Teilnehmermanagement-Services auf Events.
Antworte strukturiert, praxisnah und professionell.
Wenn der Nutzer nach Aufbau, Architektur, Interview-Flow, Preislogik, Produktkatalog, Modulen, MVP oder Regeln fuer einen KI-Agenten fragt, liefere konkrete Beratung statt Rueckfragen.
Arbeite mit klaren Abschnitten und knappen Bulletpoints.
Keine Marketingfloskeln, keine Wiederholung des Nutzertexts.
Wenn sinnvoll, schlage eine robuste Systemarchitektur, Datenstruktur, Logikbausteine und Umsetzungsschritte vor.
Fuege am Ende nur dann einen JSON-Block zwischen <brief_json> und </brief_json> ein, wenn der Nutzer echte Eventdaten geliefert hat.`
      : `Du bist ein deutschsprachiger Event-Scoping-Assistent.
Antworte kurz, professionell und konkret.
Wenn der Nutzer Eventdetails nennt, fasse sie knapp zusammen und stelle genau eine naechste Frage.
Wenn der Nutzer verlangt, dass du alles direkt beantwortest, dann antworte direkt ohne Rueckfragen.
Wiederhole niemals die Nutzervorgaben oder Prompt-Texte wortwoertlich.
Wenn der Nutzer statt Eventdaten nur eine Anweisung oder Vorlage sendet, sage kurz, dass du echte Eventangaben brauchst, und stelle direkt die Frage nach Eventname, Ort, Datum, Teilnehmerzahl und Check-in-Ablauf.
Kein Marketing, keine Meta-Kommentare.
Fuege am Ende immer einen JSON-Block zwischen <brief_json> und </brief_json> ein.
Nutze nur dieses Schema und lasse unbekannte Werte leer:
{"customerName":"","eventName":"","eventLocation":"","eventDates":"","attendees":"","budget":"","checkInScenario":"","venues":"","entryPoints":"","onsiteDays":"","softwareNeeds":[],"rentalNeeds":[],"supportLevel":"","travelScope":"","integrations":[],"badgeType":"","serviceModules":[],"costDrivers":[],"assumptions":[],"missingItems":[],"nextStep":""}`;

    const recentHistory = history.slice(-3);
    const prompt = [
      systemPrompt,
      '',
      'Bisheriger Verlauf:'
    ];

    for (const message of recentHistory) {
      const role = message.role === 'model' ? 'Assistent' : 'Nutzer';
      prompt.push(`${role}: ${String(message.text ?? '')}`);
    }

    prompt.push(`Nutzer: ${userMessage}`);
    prompt.push('Assistent:');

    try {
      const content = await generateWithOllama(prompt.join('\n'));
      const parsed = extractAiExplorerBrief(content);
      const mergedBrief = mergeBriefs(normalizeModelBrief(parsed.brief) ?? {}, extractedBrief ?? {});
      const computed = buildAiExplorerOffer(mergedBrief, history, userMessage);
      const assistantText = looksLikeJsonOnlyReply(parsed.text)
        ? buildAssistantReplyFromBrief(computed.brief)
        : parsed.text || buildAssistantReplyFromBrief(computed.brief);

      createAiExplorerLog({
        model: OLLAMA_MODEL,
        userAgent: String(req.headers['user-agent'] ?? ''),
        status: 'success',
        userMessage,
        assistantText,
        customerName: computed.brief?.customerName || '',
        eventName: computed.brief?.eventName || '',
        eventLocation: computed.brief?.eventLocation || '',
        attendees: computed.brief?.attendees || '',
        currentPhase: computed.brief?.currentPhase || '',
        brief: computed.brief ?? null,
        offer: computed.offer ?? null
      });

      sendJson(res, 200, {
        text: assistantText,
        brief: consultingMode ? briefOrNullIfEmpty(computed.brief) : computed.brief,
        offer: consultingMode ? null : computed.offer,
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
          ? error.name === 'TimeoutError'
            ? `Ollama / ${OLLAMA_MODEL} timed out after ${OLLAMA_TIMEOUT_MS}ms`
            : `Ollama / ${OLLAMA_MODEL} is not reachable: ${error.message}`
          : `Ollama / ${OLLAMA_MODEL} is not reachable.`
      });
      sendJson(res, 503, {
        message: error instanceof Error
          ? error.name === 'TimeoutError'
            ? `Ollama / ${OLLAMA_MODEL} timed out after ${OLLAMA_TIMEOUT_MS}ms`
            : `Ollama / ${OLLAMA_MODEL} is not reachable: ${error.message}`
          : `Ollama / ${OLLAMA_MODEL} is not reachable.`
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
