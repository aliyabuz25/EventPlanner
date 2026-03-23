import { getDocument, updateDocument } from '../server/content-db.mjs';
import { fastlaneContentDocuments } from '../shared/fastlaneContentImport.js';

const documentsToImport = [
  'global',
  'siteMap',
  'navigation',
  'pages.home',
  'pages.campaign',
  'pages.about',
  'pages.corporateStandards',
  'pages.survey',
  'pages.services',
  'pages.team',
  'pages.solutions',
  'solutionDetails'
];

for (const key of documentsToImport) {
  const nextValue = fastlaneContentDocuments[key];

  if (!nextValue) {
    throw new Error(`Missing import payload for ${key}`);
  }

  updateDocument(key, nextValue);
}

const summary = documentsToImport.map((key) => {
  const doc = getDocument(key);
  return {
    key,
    updatedAt: doc?.updatedAt ?? null
  };
});

console.log(JSON.stringify(summary, null, 2));
