import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { editableDocumentKeys, normalizeSiteContent, siteContentSeed } from '../shared/siteContentSeed.js';

const dataDir = path.resolve(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'site-content.sqlite');

const documentLoaders = {
  global: (content) => content.global,
  siteMap: (content) => content.siteMap,
  navigation: (content) => content.navigation,
  customPages: (content) => content.customPages,
  'pages.home': (content) => content.pages.home,
  'pages.campaign': (content) => content.pages.campaign,
  'pages.about': (content) => content.pages.about,
  'pages.corporateStandards': (content) => content.pages.corporateStandards,
  'pages.survey': (content) => content.pages.survey,
  'pages.services': (content) => content.pages.services,
  'pages.team': (content) => content.pages.team,
  'pages.sapBusinessOne': (content) => content.pages.sapBusinessOne,
  'pages.solutions': (content) => content.pages.solutions,
  solutionDetails: (content) => content.solutionDetails
};

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function nowIso() {
  return new Date().toISOString();
}

function parseValue(value) {
  return value ? JSON.parse(value) : null;
}

function buildContentPayload(rows) {
  const docs = Object.fromEntries(rows.map((row) => [row.doc_key, parseValue(row.json_value)]));

  return normalizeSiteContent({
    global: docs.global ?? siteContentSeed.global,
    siteMap: docs.siteMap ?? siteContentSeed.siteMap,
    navigation: docs.navigation ?? siteContentSeed.navigation,
    customPages: docs.customPages ?? siteContentSeed.customPages,
    pages: {
      home: docs['pages.home'] ?? siteContentSeed.pages.home,
      campaign: docs['pages.campaign'] ?? siteContentSeed.pages.campaign,
      about: docs['pages.about'] ?? siteContentSeed.pages.about,
      corporateStandards: docs['pages.corporateStandards'] ?? siteContentSeed.pages.corporateStandards,
      survey: docs['pages.survey'] ?? siteContentSeed.pages.survey,
      services: docs['pages.services'] ?? siteContentSeed.pages.services,
      team: docs['pages.team'] ?? siteContentSeed.pages.team,
      sapBusinessOne: docs['pages.sapBusinessOne'] ?? siteContentSeed.pages.sapBusinessOne,
      solutions: docs['pages.solutions'] ?? siteContentSeed.pages.solutions
    },
    solutionDetails: docs.solutionDetails ?? siteContentSeed.solutionDetails
  });
}

ensureDir();

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS content_documents (
    doc_key TEXT PRIMARY KEY,
    json_value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS content_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_key TEXT NOT NULL,
    json_value TEXT NOT NULL,
    changed_at TEXT NOT NULL,
    action TEXT NOT NULL,
    summary TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS ai_explorer_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    model TEXT NOT NULL,
    user_agent TEXT,
    status TEXT NOT NULL,
    user_message TEXT NOT NULL,
    assistant_text TEXT,
    customer_name TEXT,
    event_name TEXT,
    event_location TEXT,
    attendees TEXT,
    current_phase TEXT,
    brief_json TEXT,
    offer_json TEXT,
    error_message TEXT
  )
`);

const insert = db.prepare(`
  INSERT INTO content_documents (doc_key, json_value, updated_at)
  VALUES (?, ?, ?)
`);

const existingKeys = new Set(
  db.prepare('SELECT doc_key FROM content_documents').all().map((row) => row.doc_key)
);

for (const key of editableDocumentKeys) {
  if (!existingKeys.has(key)) {
    insert.run(key, JSON.stringify(documentLoaders[key](siteContentSeed)), nowIso());
  }
}

const selectAll = db.prepare('SELECT doc_key, json_value, updated_at FROM content_documents ORDER BY doc_key');
const selectOne = db.prepare('SELECT doc_key, json_value, updated_at FROM content_documents WHERE doc_key = ?');
const selectRevisions = db.prepare(`
  SELECT id, doc_key, json_value, changed_at, action, summary
  FROM content_revisions
  WHERE doc_key = ?
  ORDER BY changed_at DESC, id DESC
  LIMIT ?
`);
const selectRevisionById = db.prepare(`
  SELECT id, doc_key, json_value, changed_at, action, summary
  FROM content_revisions
  WHERE id = ? AND doc_key = ?
`);
const upsertOne = db.prepare(`
  INSERT INTO content_documents (doc_key, json_value, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(doc_key) DO UPDATE SET
    json_value = excluded.json_value,
    updated_at = excluded.updated_at
`);
const insertRevision = db.prepare(`
  INSERT INTO content_revisions (doc_key, json_value, changed_at, action, summary)
  VALUES (?, ?, ?, ?, ?)
`);
const insertAiExplorerLog = db.prepare(`
  INSERT INTO ai_explorer_logs (
    created_at,
    model,
    user_agent,
    status,
    user_message,
    assistant_text,
    customer_name,
    event_name,
    event_location,
    attendees,
    current_phase,
    brief_json,
    offer_json,
    error_message
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const selectAiExplorerLogs = db.prepare(`
  SELECT
    id,
    created_at,
    model,
    user_agent,
    status,
    user_message,
    assistant_text,
    customer_name,
    event_name,
    event_location,
    attendees,
    current_phase,
    brief_json,
    offer_json,
    error_message
  FROM ai_explorer_logs
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);

function buildChangeSummary(previousValue, nextValue, basePath = '') {
  if (previousValue === nextValue) {
    return [];
  }

  const previousIsArray = Array.isArray(previousValue);
  const nextIsArray = Array.isArray(nextValue);

  if (previousIsArray || nextIsArray) {
    const previousArray = previousIsArray ? previousValue : [];
    const nextArray = nextIsArray ? nextValue : [];

    if (JSON.stringify(previousArray) === JSON.stringify(nextArray)) {
      return [];
    }

    return [basePath || 'document'];
  }

  const previousIsObject = previousValue && typeof previousValue === 'object';
  const nextIsObject = nextValue && typeof nextValue === 'object';

  if (previousIsObject && nextIsObject) {
    const keys = new Set([...Object.keys(previousValue), ...Object.keys(nextValue)]);
    return [...keys].flatMap((key) => {
      const childPath = basePath ? `${basePath}.${key}` : key;
      return buildChangeSummary(previousValue[key], nextValue[key], childPath);
    });
  }

  return [basePath || 'document'];
}

function summarizeChanges(previousValue, nextValue) {
  const paths = [...new Set(buildChangeSummary(previousValue, nextValue))].filter(Boolean);
  return paths.slice(0, 6).join(', ');
}

function createRevision(key, value, timestamp, action, summary) {
  insertRevision.run(key, JSON.stringify(value), timestamp, action, summary || null);
}

export function getSiteContent() {
  return buildContentPayload(selectAll.all());
}

export function getSiteMap() {
  return getSiteContent().siteMap;
}

export function getDocument(key) {
  const row = selectOne.get(key);
  if (!row) {
    return null;
  }

  return {
    key: row.doc_key,
    value: parseValue(row.json_value),
    updatedAt: row.updated_at
  };
}

export function getDocumentRevisions(key, limit = 12) {
  return selectRevisions.all(key, limit).map((row) => ({
    id: row.id,
    key: row.doc_key,
    value: parseValue(row.json_value),
    changedAt: row.changed_at,
    action: row.action,
    summary: row.summary ?? ''
  }));
}

export function updateDocument(key, value) {
  const current = getDocument(key);
  const timestamp = nowIso();
  upsertOne.run(key, JSON.stringify(value), timestamp);
  createRevision(key, value, timestamp, 'update', summarizeChanges(current?.value, value));

  return {
    key,
    value,
    updatedAt: timestamp
  };
}

export function restoreDocumentRevision(key, revisionId) {
  const revision = selectRevisionById.get(revisionId, key);
  if (!revision) {
    return null;
  }

  const value = parseValue(revision.json_value);
  const timestamp = nowIso();

  upsertOne.run(key, JSON.stringify(value), timestamp);
  createRevision(key, value, timestamp, 'restore', `Reverted to revision #${revisionId}`);

  return {
    key,
    value,
    updatedAt: timestamp,
    restoredFrom: revisionId
  };
}

export function createAiExplorerLog(payload) {
  insertAiExplorerLog.run(
    payload.createdAt ?? nowIso(),
    payload.model ?? '',
    payload.userAgent ?? '',
    payload.status ?? 'success',
    payload.userMessage ?? '',
    payload.assistantText ?? '',
    payload.customerName ?? '',
    payload.eventName ?? '',
    payload.eventLocation ?? '',
    payload.attendees ?? '',
    payload.currentPhase ?? '',
    JSON.stringify(payload.brief ?? null),
    JSON.stringify(payload.offer ?? null),
    payload.errorMessage ?? ''
  );
}

export function getAiExplorerLogs(limit = 100) {
  return selectAiExplorerLogs.all(Math.max(1, Math.min(limit, 500))).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    model: row.model,
    userAgent: row.user_agent ?? '',
    status: row.status,
    userMessage: row.user_message,
    assistantText: row.assistant_text ?? '',
    customerName: row.customer_name ?? '',
    eventName: row.event_name ?? '',
    eventLocation: row.event_location ?? '',
    attendees: row.attendees ?? '',
    currentPhase: row.current_phase ?? '',
    brief: parseValue(row.brief_json),
    offer: parseValue(row.offer_json),
    errorMessage: row.error_message ?? ''
  }));
}
