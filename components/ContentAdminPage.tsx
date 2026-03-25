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
  Languages,
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
import { CircleFlag } from 'react-circle-flags';
import { applyFrontendLocaleOverrides, useSiteContent } from '../contexts/SiteContentContext';
import { SiteContent } from '../types';
import { fallbackIcon, iconOptions, resolveIcon } from './iconRegistry';
import { normalizeSiteContent, siteContentSeed } from '../shared/siteContentSeed';
import {
  AdminTranslationJob,
  AiExplorerReport,
  fetchAdminTranslation,
  fetchAdminTranslationJob,
  fetchAiExplorerReports,
  fetchFrontendTranslation,
  fetchSiteDocumentRevisions,
  saveFrontendTranslationDocument,
  startAdminTranslationJob,
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

interface RouteOption {
  label: string;
  value: string;
}

interface RouteOptionGroup {
  label: string;
  options: RouteOption[];
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
  progress?: number;
  persistent?: boolean;
}

type AdminLocale = 'de' | 'en' | 'custom';

const AI_REPORTS_KEY = 'aiReports';
const HIDDEN_ADMIN_KEYS = new Set(['pages.sapBusinessOne']);
const ADMIN_LOCALE_STORAGE_KEY = 'oc_admin_locale_v1';
const ADMIN_CUSTOM_LOCALE_STORAGE_KEY = 'oc_admin_custom_locale_v1';
const ADMIN_CUSTOM_LOCALE_CACHE_KEY = 'oc_admin_custom_locale_cache_v1';
const ADMIN_TRANSLATION_JOB_STORAGE_KEY = 'oc_admin_translation_job_v1';
const CircleFlagIcon = CircleFlag as React.ComponentType<any>;

const adminCopy = {
  de: {
    languageLabel: 'Sprache',
    searchEverything: 'Seiten, Felder, Texte, Badges, Icons und Medien durchsuchen...',
    searchPages: 'Seiten suchen',
    noSearchResults: 'Keine passenden Inhalte gefunden.',
    startSearch: 'Tippe, um die gesamte Inhaltsstruktur zu durchsuchen.',
    crmKicker: 'Admin Panel',
    readOnly: 'Nur Lesen',
    saving: 'Speichert...',
    update: 'Aktualisieren',
    expandSidebar: 'Sidebar erweitern',
    collapseSidebar: 'Sidebar einklappen',
    loggedUsages: 'Protokollierte Nutzungen',
    editableFields: 'Bearbeitbare Felder',
    group: 'Gruppe',
    editorIntro: 'Bearbeite die Felder unten. Aenderungen werden in der Live-Quelle gespeichert und nach dem Update auf der Website sichtbar.',
    aiIntro: 'Jede KI-Nutzung wird hier mit Prompt, Event-Details, User-Agent und Zeitstempel protokolliert.',
    loadingAiReports: 'KI-Berichte werden geladen...',
    noAiReports: 'Noch keine KI-Nutzungsdaten vorhanden.',
    untitledAiUsage: 'Unbenannte KI-Nutzung',
    locationOpen: 'Ort offen',
    attendeesOpen: 'Teilnehmer offen',
    phaseOpen: 'Phase offen',
    unknownUserAgent: 'Unbekannter User-Agent',
    prompt: 'Prompt',
    assistantResponse: 'Assistentenantwort',
    noResponseText: 'Kein Antworttext vorhanden.',
    customer: 'Kunde',
    event: 'Event',
    location: 'Ort',
    created: 'Erstellt',
    open: 'Offen',
    userFriendlySummary: 'Benutzerfreundliche Zusammenfassung',
    noReadableSummary: 'Noch keine lesbare Zusammenfassung verfuegbar.',
    publish: 'Veroeffentlichen',
    status: 'Status',
    readOnlyAiHistory: 'Schreibgeschuetzte KI-Verlaufshistorie',
    readyForUpdate: 'Bereit zum Aktualisieren',
    lastSaved: 'Zuletzt gespeichert',
    notSavedYet: 'Dieses Dokument wurde in dieser Sitzung noch nicht gespeichert.',
    updateDocument: 'Dokument aktualisieren',
    documentSummary: 'Dokumentzusammenfassung',
    documentKey: 'Dokumentschluessel',
    groupItems: 'Elemente in der Gruppe',
    totalDocuments: 'Dokumente gesamt',
    leafFields: 'Einzelfelder',
    editorNotes: 'Editor-Hinweise',
    savedChangeNote: 'Jede gespeicherte Aenderung wird mit Zeitstempel abgelegt und kann wiederhergestellt werden.',
    recentChangesNote: 'Die letzten Aenderungen dieses Dokuments sind unten aufgefuehrt.',
    aiUsageNote: 'Alle KI-Nutzungen werden mit Prompt, Event-Details, User-Agent und Zeitstempel protokolliert.',
    aiUsageSummary: 'KI-Nutzungsuebersicht',
    recentChanges: 'Letzte Aenderungen',
    records: 'Eintraege',
    loadingAiSummary: 'KI-Berichte werden geladen...',
    totalUses: 'Gesamtnutzungen',
    successful: 'Erfolgreich',
    errors: 'Fehler',
    latestActivity: 'Letzte Aktivitaet',
    noActivityYet: 'Noch keine Aktivitaet',
    loadingRevisionHistory: 'Versionsverlauf wird geladen...',
    noSavedChanges: 'Fuer dieses Dokument gibt es noch keine gespeicherten Aenderungen.',
    restore: 'Wiederherstellung',
    updateBadge: 'Update',
    original: 'Original',
    changed: 'Geaendert',
    restoring: 'Wird wiederhergestellt...',
    restorePrevious: 'Vorherige Version wiederherstellen',
    savedSuccessfully: 'Erfolgreich gespeichert',
    saveFailed: 'Speichern fehlgeschlagen',
    previousVersionRestored: 'Vorherige Version wiederhergestellt',
    restoreFailed: 'Wiederherstellung fehlgeschlagen',
    globalSettings: 'Globale Einstellungen',
    aiExplorerLogs: 'KI-Explorer-Protokolle',
    routesAndPages: 'Routen und Seiten',
    navigation: 'Navigation',
    customPages: 'Benutzerdefinierte Seiten',
    homePage: 'Startseite',
    campaignBanner: 'Kampagnenbanner',
    aboutPage: 'Ueber uns',
    privacyStandards: 'Datenschutz und Standards',
    eventFinder: 'Event Finder',
    servicesPage: 'Services-Seite',
    onsiteTeamPage: 'OnSite-Team-Seite',
    legacyShowcasePage: 'Legacy-Showcase-Seite',
    solutionsCatalog: 'Loesungskatalog',
    solutionDetailPages: 'Loesungsdetailseiten',
    core: 'Core',
    pages: 'Seiten',
    other: 'Andere',
    thirdLanguage: 'Dritte Sprache',
    translatingLabel: 'Uebersetzt...',
    translationReady: 'Admin-Sprache wurde aktualisiert.',
    translationFailed: 'Admin-Sprache konnte nicht uebersetzt werden.',
    addLanguage: 'ADD',
    changeLanguage: 'CHANGE',
    chooseLanguage: 'Sprache hinzufuegen',
    languageModalIntro: 'Waehle eine Sprache. Die Lokalisierung wird anschliessend automatisch im Hintergrund erstellt.',
    downloadingLocalization: 'Lokalisierung wird geladen'
  },
  en: {
    languageLabel: 'Language',
    searchEverything: 'Search pages, fields, text, badges, icons, media...',
    searchPages: 'Search pages',
    noSearchResults: 'No matching content found.',
    startSearch: 'Start typing to search the full content structure.',
    crmKicker: 'Admin Panel',
    readOnly: 'Read Only',
    saving: 'Saving...',
    update: 'Update',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    loggedUsages: 'Logged usages',
    editableFields: 'Editable fields',
    group: 'Group',
    editorIntro: 'Edit the fields below. Changes are saved to the live content source and reflected on the site after update.',
    aiIntro: 'Every AI assistant usage is logged here with prompt, generated event detail, user-agent and created date.',
    loadingAiReports: 'Loading AI usage reports...',
    noAiReports: 'No AI usage records yet.',
    untitledAiUsage: 'Untitled AI usage',
    locationOpen: 'Location open',
    attendeesOpen: 'Attendees open',
    phaseOpen: 'Phase open',
    unknownUserAgent: 'Unknown user-agent',
    prompt: 'Prompt',
    assistantResponse: 'Assistant Response',
    noResponseText: 'No response text.',
    customer: 'Customer',
    event: 'Event',
    location: 'Location',
    created: 'Created',
    open: 'Open',
    userFriendlySummary: 'User-Friendly Summary',
    noReadableSummary: 'No readable event summary available for this usage yet.',
    publish: 'Publish',
    status: 'Status',
    readOnlyAiHistory: 'Read-only AI report history',
    readyForUpdate: 'Ready for update',
    lastSaved: 'Last saved',
    notSavedYet: 'This document has not been saved in this session.',
    updateDocument: 'Update Document',
    documentSummary: 'Document Summary',
    documentKey: 'Document key',
    groupItems: 'Group items',
    totalDocuments: 'Total documents',
    leafFields: 'Leaf fields',
    editorNotes: 'Editor Notes',
    savedChangeNote: 'Every saved change is stored with a timestamp and can be restored.',
    recentChangesNote: 'Recent changes for this document are listed below.',
    aiUsageNote: 'All assistant usages are logged with prompt, event detail, user-agent and timestamp.',
    aiUsageSummary: 'AI Usage Summary',
    recentChanges: 'Recent Changes',
    records: 'records',
    loadingAiSummary: 'Loading AI reports...',
    totalUses: 'Total uses',
    successful: 'Successful',
    errors: 'Errors',
    latestActivity: 'Latest activity',
    noActivityYet: 'No activity yet',
    loadingRevisionHistory: 'Loading revision history...',
    noSavedChanges: 'No saved changes yet for this document.',
    restore: 'Restore',
    updateBadge: 'Update',
    original: 'Original',
    changed: 'Changed',
    restoring: 'Restoring...',
    restorePrevious: 'Restore Previous',
    savedSuccessfully: 'Saved successfully',
    saveFailed: 'Save failed',
    previousVersionRestored: 'Previous version restored',
    restoreFailed: 'Restore failed',
    globalSettings: 'Global Settings',
    aiExplorerLogs: 'AI Explorer Logs',
    routesAndPages: 'Routes & Pages',
    navigation: 'Navigation',
    customPages: 'Custom Pages',
    homePage: 'Home Page',
    campaignBanner: 'Campaign Banner',
    aboutPage: 'About Page',
    privacyStandards: 'Privacy & Standards',
    eventFinder: 'Event Finder',
    servicesPage: 'Services Page',
    onsiteTeamPage: 'OnSite Team Page',
    legacyShowcasePage: 'Legacy Showcase Page',
    solutionsCatalog: 'Solutions Catalog',
    solutionDetailPages: 'Solution Detail Pages',
    core: 'Core',
    pages: 'Pages',
    other: 'Other',
    thirdLanguage: 'Third Language',
    translatingLabel: 'Translating...',
    translationReady: 'Admin language updated.',
    translationFailed: 'Admin language could not be translated.',
    addLanguage: 'ADD',
    changeLanguage: 'CHANGE',
    chooseLanguage: 'Add Language',
    languageModalIntro: 'Choose a language. Localization will then be generated automatically in the background.',
    downloadingLocalization: 'Downloading localization',
    aboutSection: 'About Section',
    servicesSection: 'Services Section',
    solutionsSection: 'Solutions Section',
    contactPage: 'Contact Page',
    smtpWizard: 'SMTP Setup Wizard',
    smtpWizardDescription: 'Configure the mail server once. All site form submissions will be delivered to the configured inbox.',
    senderIdentity: 'Step 1. Sender Identity',
    mailServer: 'Step 2. Mail Server',
    deliveryInbox: 'Step 3. Delivery Inbox',
    sendingTest: 'Sending Test...',
    sendTestEmail: 'Send Test Email',
    saveAfterTest: 'Save the document after a successful test to make the site forms use this configuration.',
    selectExistingPath: 'Select an existing site path',
    urlOrRoute: 'URL or internal route',
    mediaUrl: 'Media URL',
    uploadFile: 'Upload File',
    uploading: 'Uploading...',
    previewingSelectedFile: 'Previewing selected file',
    uploadFailed: 'Upload failed',
    mediaPreviewHint: 'Upload a file or paste a media URL to see a preview.',
    iconPreview: 'Current icon preview',
    iconPickerHelp: 'Pick an icon visually or type a Lucide icon name.',
    mediaFieldHelp: 'Upload a file or paste a direct media URL.',
    items: 'Items',
    item: 'item',
    remove: 'Remove',
    addItem: 'Add Item'
  },
  tr: {
    languageLabel: 'Dil',
    searchEverything: 'Sayfa, alan, metin, rozet, ikon ve medya ara...',
    searchPages: 'Sayfalarda ara',
    noSearchResults: 'Eslesen icerik bulunamadi.',
    startSearch: 'Tum icerik yapisinda aramak icin yazmaya basla.',
    crmKicker: 'Yonetim Paneli',
    readOnly: 'Salt Okunur',
    saving: 'Kaydediliyor...',
    update: 'Guncelle',
    expandSidebar: 'Kenar cubugunu genislet',
    collapseSidebar: 'Kenar cubugunu daralt',
    loggedUsages: 'Kayitli kullanimlar',
    editableFields: 'Duzenlenebilir alanlar',
    group: 'Grup',
    editorIntro: 'Asagidaki alanlari duzenle. Degisiklikler canli icerik kaynagina kaydedilir ve guncellemeden sonra sitede gorunur.',
    aiIntro: 'Tum yapay zeka kullanimi burada prompt, etkinlik detayi, user-agent ve zaman bilgisi ile kayit altina alinir.',
    loadingAiReports: 'Yapay zeka kayitlari yukleniyor...',
    noAiReports: 'Henuz yapay zeka kullanim kaydi yok.',
    untitledAiUsage: 'Isimsiz yapay zeka kullanimi',
    locationOpen: 'Konum bos',
    attendeesOpen: 'Katilimci bos',
    phaseOpen: 'Faz bos',
    unknownUserAgent: 'Bilinmeyen user-agent',
    prompt: 'Prompt',
    assistantResponse: 'Asistan Yaniti',
    noResponseText: 'Yanıt metni yok.',
    customer: 'Musteri',
    event: 'Etkinlik',
    location: 'Konum',
    created: 'Olusturulma',
    open: 'Bos',
    userFriendlySummary: 'Kullanici Dostu Ozet',
    noReadableSummary: 'Bu kayit icin okunabilir bir ozet henuz yok.',
    publish: 'Yayinla',
    status: 'Durum',
    readOnlyAiHistory: 'Salt okunur yapay zeka gecmisi',
    readyForUpdate: 'Guncelleme icin hazir',
    lastSaved: 'Son kayit',
    notSavedYet: 'Bu belge bu oturumda henuz kaydedilmedi.',
    updateDocument: 'Belgeyi Guncelle',
    documentSummary: 'Belge Ozeti',
    documentKey: 'Belge anahtari',
    groupItems: 'Grup ogeleri',
    totalDocuments: 'Toplam belge',
    leafFields: 'Alt alanlar',
    editorNotes: 'Editor Notlari',
    savedChangeNote: 'Her kaydedilen degisiklik zaman damgasi ile saklanir ve geri yuklenebilir.',
    recentChangesNote: 'Bu belgeye ait son degisiklikler asagida listelenir.',
    aiUsageNote: 'Tum yapay zeka kullanimlari prompt, etkinlik detayi, user-agent ve zaman bilgisiyle loglanir.',
    aiUsageSummary: 'Yapay Zeka Kullanim Ozeti',
    recentChanges: 'Son Degisiklikler',
    records: 'kayit',
    loadingAiSummary: 'Yapay zeka raporlari yukleniyor...',
    totalUses: 'Toplam kullanim',
    successful: 'Basarili',
    errors: 'Hata',
    latestActivity: 'Son etkinlik',
    noActivityYet: 'Henuz etkinlik yok',
    loadingRevisionHistory: 'Surum gecmisi yukleniyor...',
    noSavedChanges: 'Bu belge icin henuz kaydedilmis degisiklik yok.',
    restore: 'Geri Yukleme',
    updateBadge: 'Guncelleme',
    original: 'Orijinal',
    changed: 'Degisen',
    restoring: 'Geri yukleniyor...',
    restorePrevious: 'Onceki Surumu Geri Yukle',
    savedSuccessfully: 'Basariyla kaydedildi',
    saveFailed: 'Kaydetme basarisiz',
    previousVersionRestored: 'Onceki surum geri yuklendi',
    restoreFailed: 'Geri yukleme basarisiz',
    globalSettings: 'Global Ayarlar',
    aiExplorerLogs: 'YZ Explorer Kayitlari',
    routesAndPages: 'Rotalar ve Sayfalar',
    navigation: 'Navigasyon',
    customPages: 'Ozel Sayfalar',
    homePage: 'Ana Sayfa',
    campaignBanner: 'Kampanya Alani',
    aboutPage: 'Hakkinda Sayfasi',
    privacyStandards: 'Gizlilik ve Standartlar',
    eventFinder: 'Etkinlik Bulucu',
    servicesPage: 'Hizmetler Sayfasi',
    onsiteTeamPage: 'OnSite Ekip Sayfasi',
    legacyShowcasePage: 'Eski Vitrin Sayfasi',
    solutionsCatalog: 'Cozum Katalogu',
    solutionDetailPages: 'Cozum Detay Sayfalari',
    core: 'Temel',
    pages: 'Sayfalar',
    other: 'Diger',
    thirdLanguage: 'Ucuncu Dil',
    translatingLabel: 'Cevriliyor...',
    translationReady: 'Yonetim dili guncellendi.',
    translationFailed: 'Yonetim dili cevrilemedi.',
    addLanguage: 'ADD',
    changeLanguage: 'CHANGE',
    chooseLanguage: 'Dil Ekle',
    languageModalIntro: 'Bir dil sec. Lokalizasyon daha sonra arka planda otomatik olarak olusturulacak.',
    downloadingLocalization: 'Lokalizasyon indiriliyor',
    aboutSection: 'Hakkinda Bolumu',
    servicesSection: 'Hizmetler Bolumu',
    solutionsSection: 'Cozumler Bolumu',
    contactPage: 'Iletisim Sayfasi',
    smtpWizard: 'SMTP Kurulum Sihirbazi',
    smtpWizardDescription: 'Mail sunucusunu bir kez ayarla. Sitedeki tum form gonderimleri ayarlanan kutuya iletilir.',
    senderIdentity: 'Adim 1. Gonderici Kimligi',
    mailServer: 'Adim 2. Mail Sunucusu',
    deliveryInbox: 'Adim 3. Teslimat Kutusu',
    sendingTest: 'Test gonderiliyor...',
    sendTestEmail: 'Test E-postasi Gonder',
    saveAfterTest: 'Basarili testten sonra bu ayarin form gonderimlerinde kullanilmasi icin belgeyi kaydet.',
    selectExistingPath: 'Mevcut bir site yolu sec',
    urlOrRoute: 'URL veya dahili rota',
    mediaUrl: 'Medya URL',
    uploadFile: 'Dosya Yukle',
    uploading: 'Yukleniyor...',
    previewingSelectedFile: 'Secilen dosya onizleniyor',
    uploadFailed: 'Yukleme basarisiz',
    mediaPreviewHint: 'Onizleme icin bir dosya yukle veya medya URL yapistir.',
    iconPreview: 'Guncel ikon onizlemesi',
    iconPickerHelp: 'Gorsel olarak bir ikon sec veya Lucide ikon adini yaz.',
    mediaFieldHelp: 'Dosya yukle veya dogrudan medya URL yapistir.',
    items: 'Ogeler',
    item: 'oge',
    remove: 'Kaldir',
    addItem: 'Oge Ekle'
  }
} as const;

const dynamicAdminLocaleOptions = [
  { code: 'tr', label: 'Turkish', nativeLabel: 'Turkce', countryCode: 'tr' },
  { code: 'az', label: 'Azerbaijani', nativeLabel: 'Azərbaycanca', countryCode: 'az' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', countryCode: 'fr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', countryCode: 'es' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', countryCode: 'it' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', countryCode: 'pt' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', countryCode: 'nl' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', countryCode: 'pl' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', countryCode: 'ru' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', countryCode: 'sa' }
] as const;

const sanitizeTranslatedCopyValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, sanitizeTranslatedCopyValue(child)]));
};

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

const localizedLabels = (copy: typeof adminCopy.en) => ({
  global: { title: copy.globalSettings, description: 'Company identity, contact channels, branding and shared CTA settings.', group: copy.core },
  aiReports: { title: copy.aiExplorerLogs, description: 'AI Explorer sessions, extracted briefs, user-agent and timestamps.', group: copy.core },
  siteMap: { title: copy.routesAndPages, description: 'Public routes, slugs, titles and page descriptions.', group: copy.core },
  navigation: { title: copy.navigation, description: 'Top navbar, footer links and solution dropdown items.', group: copy.core },
  customPages: { title: copy.customPages, description: 'Extra pages created from the admin panel.', group: copy.core },
  'pages.home': { title: copy.homePage, description: 'Homepage hero, services, ecosystem cards and shared contact block.', group: copy.pages },
  'pages.campaign': { title: copy.campaignBanner, description: 'Homepage promo band and CTA copy.', group: copy.pages },
  'pages.about': { title: copy.aboutPage, description: 'About story, mission, values and process timeline.', group: copy.pages },
  'pages.corporateStandards': { title: copy.privacyStandards, description: 'Trust, privacy and operational standards content.', group: copy.pages },
  'pages.survey': { title: copy.eventFinder, description: 'Interactive advisor text, quick-match questions and recommendation copy.', group: copy.pages },
  'pages.services': { title: copy.servicesPage, description: 'Delivery phases, setup flow and support cards.', group: copy.pages },
  'pages.team': { title: copy.onsiteTeamPage, description: 'Team image, principles and event-operations CTA content.', group: copy.pages },
  'pages.sapBusinessOne': { title: copy.legacyShowcasePage, description: 'Hidden legacy landing page content that still exists in the app.', group: copy.pages },
  'pages.solutions': { title: copy.solutionsCatalog, description: 'Module grid and solution summary cards.', group: copy.pages },
  solutionDetails: { title: copy.solutionDetailPages, description: 'All FastLane module detail texts, benefits and CTA blocks.', group: copy.pages }
});

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
const solutionRouteIds: SiteContent['solutionDetails'] extends Record<infer K, unknown> ? K[] : never = [
  'sap-business-one',
  'sap-s4hana',
  'sap-ariba',
  'sap-successfactors',
  'sap-sam',
  'sap-fsm',
  'sap-bw4hana',
  'sap-analytics',
  'sap-bydesign',
  'microsoft-power-bi',
  'opentext',
  'bimser'
];
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

const emptyValueFromTemplate = (template: JsonValue): JsonValue => {
  if (typeof template === 'string') return '';
  if (typeof template === 'number') return 0;
  if (typeof template === 'boolean') return false;
  if (template === null || template === undefined) return '';
  if (Array.isArray(template)) return [];
  return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, emptyValueFromTemplate(value)])) as JsonValue;
};

const defaultItemFromArray = (items: JsonValue[]) => {
  const sample = items[0];
  if (sample === undefined) return '';
  return emptyValueFromTemplate(sample);
};

const enrichEnglishDraft = (source: JsonValue, english: JsonValue, suggested: JsonValue): JsonValue => {
  if (typeof source === 'string') {
    if (typeof english === 'string' && english.trim() && english !== source) {
      return english;
    }

    return typeof suggested === 'string' ? suggested : english;
  }

  if (Array.isArray(source)) {
    const englishArray = Array.isArray(english) ? english : [];
    const suggestedArray = Array.isArray(suggested) ? suggested : [];
    return source.map((item, index) => enrichEnglishDraft(item, englishArray[index] as JsonValue, suggestedArray[index] as JsonValue)) as JsonValue;
  }

  if (!isObject(source)) {
    return english ?? suggested ?? source;
  }

  const englishObject = isObject(english) ? english : {};
  const suggestedObject = isObject(suggested) ? suggested : {};

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      enrichEnglishDraft(
        value as JsonValue,
        (englishObject as Record<string, JsonValue>)[key] as JsonValue,
        (suggestedObject as Record<string, JsonValue>)[key] as JsonValue
      )
    ])
  ) as JsonValue;
};

const ScalarField: React.FC<{
  label: string;
  value: string | number | boolean | null;
  onChange: (value: JsonValue) => void;
  secondaryValue?: string | null;
  onSecondaryChange?: (value: string) => void;
  pathKey?: string;
  isHighlighted?: boolean;
  helpText?: string | null;
}> = ({ label, value, onChange, secondaryValue, onSecondaryChange, pathKey, isHighlighted, helpText }) => {
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
  const supportsSecondary = typeof value !== 'number' && !isSecret && typeof onSecondaryChange === 'function';
  const englishValue = secondaryValue ?? '';

  return (
    <label data-oc-field-path={pathKey} className={`d-block oc-admin-field-shell ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="oc-admin-section-title mb-2">{label}</div>
      {helpText ? <div className="oc-admin-field-help mb-2">{helpText}</div> : null}
      <div className="d-grid gap-3">
        <div>
          <div className="small text-uppercase text-secondary fw-semibold mb-2">DE</div>
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
        </div>
        {supportsSecondary ? (
          <div>
            <div className="small text-uppercase text-secondary fw-semibold mb-2">EN</div>
            {multiline ? (
              <textarea value={englishValue} onChange={(e) => onSecondaryChange?.(e.target.value)} rows={4} className="form-control" />
            ) : (
              <input
                type="text"
                value={englishValue}
                onChange={(e) => onSecondaryChange?.(e.target.value)}
                className="form-control"
              />
            )}
          </div>
        ) : null}
      </div>
    </label>
  );
};

const SmtpWizardCard: React.FC<{
  smtp: SmtpDraftConfig;
  onChange: (path: Array<string | number>, value: JsonValue) => void;
  onStatus: (message: string, tone?: 'success' | 'error') => void;
  copy: typeof adminCopy.en;
}> = ({ smtp, onChange, onStatus, copy }) => {
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
            <div className="oc-admin-section-title mb-1">{copy.smtpWizard}</div>
            <div className="small text-secondary">{copy.smtpWizardDescription}</div>
          </div>
          <label className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" checked={smtp.enabled} onChange={(e) => onChange(['smtp', 'enabled'], e.target.checked)} />
          </label>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <div className="oc-admin-field-help mb-2">{copy.senderIdentity}</div>
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="From Name" value={smtp.fromName} pathKey="smtp.fromName" helpText="Displayed as the sender name in inboxes." onChange={(value) => onChange(['smtp', 'fromName'], value)} />
          </div>
          <div className="col-12 col-md-6">
            <ScalarField label="From Email" value={smtp.fromEmail} pathKey="smtp.fromEmail" helpText="This must usually match your SMTP account or allowed sender domain." onChange={(value) => onChange(['smtp', 'fromEmail'], value)} />
          </div>

          <div className="col-12 mt-2">
            <div className="oc-admin-field-help mb-2">{copy.mailServer}</div>
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
            <div className="oc-admin-field-help mb-2">{copy.deliveryInbox}</div>
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
            {isSendingTest ? copy.sendingTest : copy.sendTestEmail}
          </button>
          <div className="small text-secondary align-self-center">{copy.saveAfterTest}</div>
        </div>
      </div>
    </div>
  );
};

const UrlField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  routeOptionGroups: RouteOptionGroup[];
  copy: typeof adminCopy.en;
  pathKey?: string;
  isHighlighted?: boolean;
  helpText?: string | null;
}> = ({ label, value, onChange, routeOptionGroups, copy, pathKey, isHighlighted, helpText }) => {
  const flattenedOptions = useMemo(
    () =>
      routeOptionGroups.flatMap((group) => group.options).filter((option, index, allOptions) =>
        allOptions.findIndex((candidate) => candidate.value === option.value && candidate.label === option.label) === index
      ),
    [routeOptionGroups]
  );
  const matchingOption = flattenedOptions.find((option) => option.value === value)?.value ?? '';

  return (
    <label data-oc-field-path={pathKey} className={`d-block oc-admin-field-shell ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="oc-admin-section-title mb-2">{label}</div>
      {helpText ? <div className="oc-admin-field-help mb-2">{helpText}</div> : null}
      <select
        value={matchingOption}
        onChange={(e) => {
          if (e.target.value) {
            onChange(e.target.value);
          }
        }}
        className="form-select mb-2"
      >
        <option value="">{copy.selectExistingPath}</option>
        {routeOptionGroups.map((group) => (
          <optgroup key={`${pathKey ?? label}-${group.label}`} label={group.label}>
            {group.options.map((option, index) => (
              <option key={`${pathKey ?? label}-${group.label}-${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        placeholder={copy.urlOrRoute}
      />
    </label>
  );
};

const MediaField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  copy: typeof adminCopy.en;
  pathKey?: string;
  isHighlighted?: boolean;
}> = ({ label, value, onChange, copy, pathKey, isHighlighted }) => {
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

  useEffect(() => {
    setLocalPreviewUrl(null);
    setLocalPreviewKind(null);
    setUploadError(null);
  }, [value]);

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
        <div className="oc-admin-field-help mb-2">{copy.mediaFieldHelp}</div>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="form-control" placeholder={copy.mediaUrl} />
        <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
          <label className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <Plus className="h-4 w-4" />
            {isUploading ? copy.uploading : copy.uploadFile}
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="d-none" />
          </label>
          {localPreviewUrl && <div className="small text-primary">{copy.previewingSelectedFile}</div>}
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
          <div className="mt-3 oc-admin-media-hint">{copy.mediaPreviewHint}</div>
        )}
      </div>
    </div>
  );
};

const IconField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  copy: typeof adminCopy.en;
  pathKey?: string;
  isHighlighted?: boolean;
}> = ({ label, value, onChange, copy, pathKey, isHighlighted }) => {
  const PreviewIcon = resolveIcon(value);

  return (
    <div data-oc-field-path={pathKey} className={`card oc-admin-editor-card ${isHighlighted ? 'oc-admin-search-hit' : ''}`}>
      <div className="card-body">
        <div className="oc-admin-section-title mb-2">{label}</div>
        <div className="oc-admin-field-help mb-2">{copy.iconPickerHelp}</div>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-3 border bg-light" style={{ width: 52, height: 52 }}>
            <PreviewIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="small text-secondary">{copy.iconPreview}</div>
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
  getDefaultArrayItem: (path: Array<string | number>, items: JsonValue[]) => JsonValue;
  copy: typeof adminCopy.en;
  depth?: number;
  highlightedPath?: string | null;
  routeOptionGroups: RouteOptionGroup[];
  secondaryValue?: JsonValue;
  onSecondaryChange?: (path: Array<string | number>, value: JsonValue) => void;
}> = ({ value, path = [], label, onChange, onRemove, onAddArrayItem, getDefaultArrayItem, copy, depth = 0, highlightedPath = null, routeOptionGroups, secondaryValue, onSecondaryChange }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (Array.isArray(value)) {
    const title = label ?? copy.items;
    const arrayPathKey = path.join('.');
    const isOpen = expandedSections[arrayPathKey] ?? depth <= 1;
    const primitiveArray = value.every((item) => !Array.isArray(item) && !isObject(item));

    return (
      <div className="card oc-admin-editor-card">
        <button
          type="button"
          onClick={() => setExpandedSections((prev) => ({ ...prev, [arrayPathKey]: !isOpen }))}
          className="btn btn-link text-decoration-none text-start oc-admin-collapsible-trigger"
        >
          <div className="min-w-0">
            <div className="fw-semibold text-dark">{title}</div>
            <div className="small text-secondary">#{value.length}</div>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {isOpen && (
          <div className="card-body border-top oc-admin-collapsible-body d-grid gap-3">
            {value.map((item, index) => (
              <div key={`${arrayPathKey}-${index}`} className="border rounded-3 p-3 bg-light oc-admin-array-item">
                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <div className="oc-admin-section-title">
                    {primitiveArray
                      ? `${title} ${index + 1}`
                      : prettifyLabel(String((item as any)?.title ?? (item as any)?.name ?? `Item ${index + 1}`))}
                  </div>
                  <button onClick={() => onRemove([...path, index])} className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {copy.remove}
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
                  <ObjectEditor value={item} secondaryValue={Array.isArray(secondaryValue) ? secondaryValue[index] as JsonValue : undefined} path={[...path, index]} onChange={onChange} onSecondaryChange={onSecondaryChange} onRemove={onRemove} onAddArrayItem={onAddArrayItem} getDefaultArrayItem={getDefaultArrayItem} copy={copy} depth={depth + 1} highlightedPath={highlightedPath} routeOptionGroups={routeOptionGroups} />
                )}
              </div>
            ))}

            <button onClick={() => onAddArrayItem(path, getDefaultArrayItem(path, value))} className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <Plus className="h-4 w-4" />
              {copy.addItem}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isObject(value)) {
    const entries = sortObjectEntries(Object.entries(value));

    return (
      <div className={depth === 0 ? 'd-grid gap-3' : 'd-grid gap-3'}>
        {entries.map(([key, child]) => {
          if (depth === 0 && path.length === 0 && key === 'smtp') {
            return null;
          }

          const childPath = [...path, key];
          const cardLike = Array.isArray(child) || isObject(child);

          if (!cardLike) {
            if (isMediaField(key, child)) {
              return <MediaField key={childPath.join('.')} label={friendlyFieldLabel(path, key)} value={(child as string) ?? ''} copy={copy} pathKey={childPath.join('.')} isHighlighted={highlightedPath === childPath.join('.')} onChange={(next) => onChange(childPath, next)} />;
            }

            if (isIconField(key, child)) {
              return <IconField key={childPath.join('.')} label={friendlyFieldLabel(path, key)} value={(child as string) ?? ''} copy={copy} pathKey={childPath.join('.')} isHighlighted={highlightedPath === childPath.join('.')} onChange={(next) => onChange(childPath, next)} />;
            }

            if (isUrlField(key, child)) {
              return (
                <UrlField
                  key={childPath.join('.')}
                  label={friendlyFieldLabel(path, key)}
                  value={(child as string) ?? ''}
                  copy={copy}
                  pathKey={childPath.join('.')}
                  isHighlighted={highlightedPath === childPath.join('.')}
                  helpText={fieldHelpText(path, key)}
                  routeOptionGroups={routeOptionGroups}
                  onChange={(next) => onChange(childPath, next)}
                />
              );
            }

            return (
              <ScalarField
                key={childPath.join('.')}
                label={friendlyFieldLabel(path, key)}
                value={child as string | number | boolean | null}
                secondaryValue={typeof child === 'string' || child === null ? String(isObject(secondaryValue) ? (secondaryValue as Record<string, unknown>)[key] ?? '' : '') : undefined}
                pathKey={childPath.join('.')}
                isHighlighted={highlightedPath === childPath.join('.')}
                helpText={fieldHelpText(path, key)}
                onChange={(next) => onChange(childPath, next)}
                onSecondaryChange={onSecondaryChange && (typeof child === 'string' || child === null) ? ((next) => onSecondaryChange(childPath, next)) : undefined}
              />
            );
          }

          const sectionPathKey = childPath.join('.');
          const isOpen = expandedSections[sectionPathKey] ?? depth <= 0;
          const itemCount = Array.isArray(child)
            ? child.length
            : isObject(child)
              ? Object.keys(child).length
              : 0;

          return (
            <div key={sectionPathKey} data-oc-field-path={sectionPathKey} className={`card oc-admin-editor-card ${highlightedPath === sectionPathKey ? 'oc-admin-search-hit' : ''}`}>
              <button
                type="button"
                onClick={() => setExpandedSections((prev) => ({ ...prev, [sectionPathKey]: !isOpen }))}
                className="btn btn-link text-decoration-none text-start oc-admin-collapsible-trigger"
              >
                <div className="min-w-0">
                  <div className="fw-semibold text-dark">{friendlyFieldLabel(path, key)}</div>
                  {sectionHelpText(path, key) ? <div className="oc-admin-field-help mt-1">{sectionHelpText(path, key)}</div> : null}
                </div>
                <div className="d-flex align-items-center gap-3 flex-shrink-0">
                  <span className="badge text-bg-light border">{itemCount}</span>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
              {isOpen && (
                <div className="card-body border-top oc-admin-collapsible-body">
                <ObjectEditor value={child} secondaryValue={isObject(secondaryValue) ? secondaryValue[key] as JsonValue : undefined} path={childPath} label={friendlyFieldLabel(path, key)} onChange={onChange} onSecondaryChange={onSecondaryChange} onRemove={onRemove} onAddArrayItem={onAddArrayItem} getDefaultArrayItem={getDefaultArrayItem} copy={copy} depth={depth + 1} highlightedPath={highlightedPath} routeOptionGroups={routeOptionGroups} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <ScalarField label={label ?? 'Value'} value={value as string | number | boolean | null} onChange={(next) => onChange(path, next)} />;
};

const ContentAdminPage: React.FC = () => {
  const { sourceContent: content, editableDocumentKeys, saveDocument, restoreDocument, lastSavedAt } = useSiteContent();
  const [locale, setLocale] = useState<AdminLocale>(() => {
    if (typeof window === 'undefined') {
      return 'de';
    }

    const savedLocale = window.localStorage.getItem(ADMIN_LOCALE_STORAGE_KEY);
    return savedLocale === 'de' || savedLocale === 'en' || savedLocale === 'custom' ? savedLocale : 'de';
  });
  const [customLocaleCode, setCustomLocaleCode] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.localStorage.getItem(ADMIN_CUSTOM_LOCALE_STORAGE_KEY) ?? '';
  });
  const [customLocaleCache, setCustomLocaleCache] = useState<Record<string, typeof adminCopy.en>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const rawValue = window.localStorage.getItem(ADMIN_CUSTOM_LOCALE_CACHE_KEY);
      return rawValue ? sanitizeTranslatedCopyValue(JSON.parse(rawValue)) as Record<string, typeof adminCopy.en> : {};
    } catch {
      return {};
    }
  });
  const [isTranslatingLocale, setIsTranslatingLocale] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [translationJob, setTranslationJob] = useState<AdminTranslationJob | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const rawValue = window.localStorage.getItem(ADMIN_TRANSLATION_JOB_STORAGE_KEY);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch {
      return null;
    }
  });
  const selectedDynamicLocale = dynamicAdminLocaleOptions.find((option) => option.code === customLocaleCode) ?? null;
  const customLocaleCopy = customLocaleCode ? customLocaleCache[customLocaleCode] : null;
  const copy = locale === 'custom' ? (customLocaleCopy ?? adminCopy.en) : adminCopy[locale];
  const localizedMeta = useMemo(() => localizedLabels(copy), [copy]);
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

        const title = localizedMeta[key as keyof typeof localizedMeta]?.title ?? labels[key]?.title ?? prettifyLabel(key);
        const description = localizedMeta[key as keyof typeof localizedMeta]?.description ?? labels[key]?.description ?? 'Editable content document.';
        const group = localizedMeta[key as keyof typeof localizedMeta]?.group ?? labels[key]?.group ?? copy.other;
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
    [content, editableDocumentKeys, localizedMeta, copy.other]
  );

  const [selectedKey, setSelectedKey] = useState(items[0]?.key ?? 'global');
  const [draft, setDraft] = useState<JsonValue>(content.global as JsonValue);
  const [englishContent, setEnglishContent] = useState<SiteContent | null>(null);
  const [englishDraft, setEnglishDraft] = useState<JsonValue>(content.global as JsonValue);
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSearchPath, setActiveSearchPath] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [editorResetToken, setEditorResetToken] = useState(0);
  const [revisions, setRevisions] = useState<SiteDocumentRevision[]>([]);
  const [aiReports, setAiReports] = useState<AiExplorerReport[]>([]);
  const [isLoadingAiReports, setIsLoadingAiReports] = useState(false);
  const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
  const [isRestoringRevisionId, setIsRestoringRevisionId] = useState<number | null>(null);
  const routeOptionGroups = useMemo<RouteOptionGroup[]>(() => {
    const contactPage = content.siteMap.find((entry) => entry.view === 'contact');
    const pageOptions: RouteOption[] = content.siteMap
      .filter((entry) => entry.view !== 'content-admin')
      .map((entry) => {
        const value = entry.view === 'studio'
          ? '/studio'
          : entry.slug === 'home'
            ? '/'
            : `/${entry.slug}`;

        return {
          label: `${entry.title} (${value})`,
          value
        };
      });

    const solutionOptions: RouteOption[] = solutionRouteIds.map((id) => ({
      label: `${content.solutionDetails[id]?.title ?? id} (/${id})`,
      value: `/${id}`
    }));

    const customPageOptions: RouteOption[] = content.customPages.map((page) => ({
      label: `${page.title} (/${page.slug})`,
      value: `/${page.slug}`
    }));

    const sectionOptions: RouteOption[] = [
      { label: `${copy.aboutSection} (/#about)`, value: '/#about' },
      { label: `${copy.servicesSection} (/#services)`, value: '/#services' },
      { label: `${copy.solutionsSection} (/#solutions)`, value: '/#solutions' },
      { label: `${copy.contactPage} (/#contact)`, value: '/#contact' },
      ...(contactPage ? [{ label: `${contactPage.title} (${contactPage.slug === 'home' ? '/' : `/${contactPage.slug}`})`, value: contactPage.slug === 'home' ? '/' : `/${contactPage.slug}` }] : [])
    ];

    return [
      { label: 'Pages', options: pageOptions },
      { label: 'Solution Pages', options: solutionOptions },
      ...(customPageOptions.length > 0 ? [{ label: 'Custom Pages', options: customPageOptions }] : []),
      { label: 'Page Sections', options: sectionOptions },
      {
        label: 'Actions',
        options: [
          { label: 'Email (mailto:)', value: 'mailto:' },
          { label: 'Phone (tel:)', value: 'tel:' },
          { label: 'External Link (https://)', value: 'https://' }
        ]
      }
    ];
  }, [content.customPages, content.siteMap, content.solutionDetails, copy.aboutSection, copy.contactPage, copy.servicesSection, copy.solutionsSection]);

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
  const selectedEnglishValue = useMemo(() => {
    if (selectedKey === AI_REPORTS_KEY) {
      return {} as JsonValue;
    }

    const parts = selectedKey.split('.');
    let result: any = englishContent ?? content;
    for (const part of parts) {
      result = result?.[part];
    }
    return cloneJson((result ?? {}) as JsonValue);
  }, [content, englishContent, selectedKey]);
  const smtpDraft = selectedKey === 'global' && isObject(draft) && isObject(draft.smtp) ? (draft.smtp as unknown as SmtpDraftConfig) : undefined;
  const fieldCount = useMemo(() => countLeafFields(draft), [draft]);
  const docCount = items.length;
  const selectedGroupCount = useMemo(() => items.filter((item) => item.group === selectedItem?.group).length, [items, selectedItem]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ADMIN_CUSTOM_LOCALE_STORAGE_KEY, customLocaleCode);
  }, [customLocaleCode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ADMIN_CUSTOM_LOCALE_CACHE_KEY, JSON.stringify(customLocaleCache));
  }, [customLocaleCache]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!translationJob) {
      window.localStorage.removeItem(ADMIN_TRANSLATION_JOB_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_TRANSLATION_JOB_STORAGE_KEY, JSON.stringify(translationJob));
  }, [translationJob]);

  useEffect(() => {
    if (locale !== 'custom') {
      return;
    }

    if ((!customLocaleCode || !customLocaleCopy) && !isTranslatingLocale) {
      setLocale('de');
    }
  }, [customLocaleCode, customLocaleCopy, isTranslatingLocale, locale]);

  useEffect(() => {
    if (!customLocaleCode || customLocaleCache[customLocaleCode]) {
      return;
    }

    let cancelled = false;
    void fetchAdminTranslation(customLocaleCode)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setCustomLocaleCache((prev) => ({
          ...prev,
          [customLocaleCode]: sanitizeTranslatedCopyValue(result.copy) as typeof adminCopy.en
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [customLocaleCache, customLocaleCode]);

  useEffect(() => {
    let cancelled = false;
    const englishSuggestion = applyFrontendLocaleOverrides('en', normalizeSiteContent(cloneJson(content as JsonValue) as unknown as SiteContent) as SiteContent);

    void fetchFrontendTranslation('en')
      .then((result) => {
        if (!cancelled) {
          const fetchedEnglish = normalizeSiteContent(result.copy) as SiteContent;
          const enriched = normalizeSiteContent(
            enrichEnglishDraft(content as unknown as JsonValue, fetchedEnglish as unknown as JsonValue, englishSuggestion as unknown as JsonValue) as unknown as SiteContent
          ) as SiteContent;
          setEnglishContent(enriched);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnglishContent(englishSuggestion);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [content]);

  useEffect(() => {
    setDraft(selectedValue);
    setEnglishDraft(selectedEnglishValue);
    setEditorResetToken((prev) => prev + 1);
    setStatus(null);
  }, [selectedEnglishValue, selectedValue, selectedKey]);

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
          diffs,
          restoreTargetId: previousRevision?.id ?? null,
          restoreTargetValue: cloneJson(previousValue as JsonValue)
        };
      }),
    [revisions, selectedKey]
  );

  const getDefaultArrayItemForPath = (path: Array<string | number>, items: JsonValue[]) => {
    const seedValue = getSeedDocumentValue(selectedKey);
    const seedArray = Array.isArray(seedValue) || (typeof seedValue === 'object' && seedValue !== null)
      ? getByPath(seedValue as JsonValue, path)
      : undefined;

    if (Array.isArray(seedArray) && seedArray.length > 0) {
      return emptyValueFromTemplate(seedArray[0]);
    }

    return defaultItemFromArray(items);
  };

  const handleChange = (path: Array<string | number>, nextValue: JsonValue) => setDraft((prev) => setByPath(prev, path, nextValue));
  const handleEnglishChange = (path: Array<string | number>, nextValue: JsonValue) => setEnglishDraft((prev) => setByPath(prev, path, nextValue));
  const handleRemove = (path: Array<string | number>) => {
    setDraft((prev) => removeByPath(prev, path));
    setEnglishDraft((prev) => removeByPath(prev, path));
  };
  const handleAddArrayItem = (path: Array<string | number>, item: JsonValue) => {
    setDraft((prev) => addArrayItem(prev, path, item));
    setEnglishDraft((prev) => addArrayItem(prev, path, emptyValueFromTemplate(item)));
  };
  const showToast = (message: string, tone: 'success' | 'error' = 'success') => setToast({ message, tone });
  const handleStatusUpdate = (message: string, tone: 'success' | 'error' = 'success') => {
    setStatus(message);
    showToast(message, tone);
  };

  const handleDynamicLocaleSelect = async (nextLocaleCode: string) => {
    if (!nextLocaleCode) {
      return;
    }

    setCustomLocaleCode(nextLocaleCode);

    if (customLocaleCache[nextLocaleCode]) {
      setLocale('custom');
      setIsLanguageModalOpen(false);
      return;
    }

    try {
      const existing = await fetchAdminTranslation(nextLocaleCode);
      setCustomLocaleCache((prev) => ({
        ...prev,
        [nextLocaleCode]: sanitizeTranslatedCopyValue(existing.copy) as typeof adminCopy.en
      }));
      setLocale('custom');
      setIsLanguageModalOpen(false);
      return;
    } catch {
      // continue with background job creation
    }

    try {
      setIsTranslatingLocale(true);
      const result = await startAdminTranslationJob(nextLocaleCode, adminCopy.en);
      setTranslationJob(result.job);
      setToast({
        message: `${copy.downloadingLocalization} 0%`,
        tone: 'success',
        progress: 0,
        persistent: true
      });
      setIsLanguageModalOpen(false);
    } catch (error) {
      handleStatusUpdate(error instanceof Error ? error.message : copy.translationFailed, 'error');
    } finally {
      setIsTranslatingLocale(false);
    }
  };

  const handleSave = async () => {
    if (isAiReportsView) {
      return;
    }

    try {
      setIsSaving(true);
      setStatus(null);
      const [, englishResult] = await Promise.all([
        saveDocument(selectedKey, draft),
        saveFrontendTranslationDocument('en', selectedKey, englishDraft)
      ]);
      setEnglishContent(normalizeSiteContent(englishResult.copy) as SiteContent);
      handleStatusUpdate(copy.savedSuccessfully, 'success');
    } catch (error) {
      handleStatusUpdate(error instanceof Error ? error.message : copy.saveFailed, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreRevision = async (revisionId: number | null, fallbackValue: JsonValue) => {
    try {
      setIsRestoringRevisionId(revisionId ?? -1);
      setStatus(null);

      if (revisionId === null) {
        await saveDocument(selectedKey, fallbackValue);
        setDraft(cloneJson(fallbackValue));
      } else {
        const restored = await restoreDocument(selectedKey, revisionId);
        setDraft(cloneJson(restored.value as JsonValue));
      }

      setEditorResetToken((prev) => prev + 1);
      handleStatusUpdate(copy.previousVersionRestored, 'success');
    } catch (error) {
      handleStatusUpdate(error instanceof Error ? error.message : copy.restoreFailed, 'error');
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

    if (toast.persistent) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!translationJob?.id) {
      return;
    }

    if (translationJob.status === 'completed' && translationJob.copy && customLocaleCode === translationJob.target) {
      setCustomLocaleCache((prev) => ({
        ...prev,
        [translationJob.target]: sanitizeTranslatedCopyValue(translationJob.copy) as typeof adminCopy.en
      }));
      setLocale('custom');
      setTranslationJob(null);
      return;
    }

    if (translationJob.status === 'completed' || translationJob.status === 'error') {
      return;
    }

    let cancelled = false;
    const interval = window.setInterval(async () => {
      try {
        const result = await fetchAdminTranslationJob(translationJob.id);
        if (cancelled) {
          return;
        }

        setTranslationJob(result.job);
        setToast({
          message: `${copy.downloadingLocalization} ${result.job.progress}%`,
          tone: result.job.status === 'error' ? 'error' : 'success',
          progress: result.job.progress,
          persistent: result.job.status !== 'completed' && result.job.status !== 'error'
        });

        if (result.job.status === 'completed' && result.job.copy && customLocaleCode === result.job.target) {
          setCustomLocaleCache((prev) => ({
            ...prev,
            [result.job.target]: sanitizeTranslatedCopyValue(result.job.copy) as typeof adminCopy.en
          }));
          setLocale('custom');
          setTranslationJob(null);
          setToast({
            message: `${copy.translationReady} 100%`,
            tone: 'success',
            progress: 100
          });
          window.clearInterval(interval);
        }

        if (result.job.status === 'error') {
          setTranslationJob(null);
          setToast({
            message: result.job.error || copy.translationFailed,
            tone: 'error'
          });
          window.clearInterval(interval);
        }
      } catch (error) {
        if (!cancelled) {
          setToast({
            message: error instanceof Error ? error.message : copy.translationFailed,
            tone: 'error'
          });
        }
        window.clearInterval(interval);
      }
    }, 1200);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [copy.downloadingLocalization, copy.translationFailed, copy.translationReady, customLocaleCode, translationJob]);

  return (
    <div className="oc-admin-shell">
      {toast ? (
        <div className={`oc-admin-toast ${toast.tone === 'error' ? 'is-error' : 'is-success'}`} role="status" aria-live="polite">
          <div>{toast.message}</div>
          {typeof toast.progress === 'number' ? (
            <div className="oc-admin-toast-progress">
              <div className="oc-admin-toast-progress-bar" style={{ width: `${Math.max(0, Math.min(100, toast.progress))}%` }} />
            </div>
          ) : null}
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
                placeholder={copy.searchEverything}
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
                  {search.trim() ? copy.noSearchResults : copy.startSearch}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isLanguageModalOpen && (
        <div className="oc-admin-search-overlay" onClick={() => setIsLanguageModalOpen(false)}>
          <div className="oc-admin-language-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <div className="fw-semibold text-dark">{copy.chooseLanguage}</div>
                <div className="small text-secondary mt-1">{copy.languageModalIntro}</div>
              </div>
              <button type="button" onClick={() => setIsLanguageModalOpen(false)} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                Close
              </button>
            </div>
            <div className="d-grid gap-2 oc-admin-language-list">
              {dynamicAdminLocaleOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => void handleDynamicLocaleSelect(option.code)}
                  className="oc-admin-language-option"
                  disabled={isTranslatingLocale}
                >
                  <div className="d-flex align-items-center gap-3">
                    <CircleFlagIcon countryCode={option.countryCode} className="rounded-circle flex-shrink-0" style={{ width: 20, height: 20 }} />
                    <div className="text-start">
                      <div className="fw-semibold text-dark">{option.label}</div>
                      <div className="small text-secondary">{option.nativeLabel}</div>
                    </div>
                  </div>
                </button>
              ))}
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
                <div className="oc-admin-brand-kicker">{copy.crmKicker}</div>
                <div className="oc-admin-brand-title">OCTOTECH.AZ</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="d-none d-lg-flex align-items-center gap-2 rounded-pill border bg-white px-2 py-1">
                <span className="small text-secondary px-2">{copy.languageLabel}</span>
                {([
                  ['de', 'de', 'DE'],
                  ['en', 'gb', 'EN']
                ] as Array<[Exclude<AdminLocale, 'custom'>, string, string]>).map(([option, countryCode, label]) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLocale(option)}
                    className={`btn btn-sm d-inline-flex align-items-center gap-2 ${locale === option ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill px-3`}
                  >
                    <CircleFlagIcon countryCode={countryCode} className="rounded-circle" style={{ width: 16, height: 16 }} />
                    {label}
                  </button>
                ))}
                {selectedDynamicLocale && customLocaleCache[selectedDynamicLocale.code] ? (
                  <div className="d-inline-flex align-items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLocale('custom')}
                      className={`btn btn-sm d-inline-flex align-items-center gap-2 ${locale === 'custom' ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill px-3`}
                    >
                      <CircleFlagIcon countryCode={selectedDynamicLocale.countryCode} className="rounded-circle" style={{ width: 16, height: 16 }} />
                      {selectedDynamicLocale.code.toUpperCase()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLanguageModalOpen(true)}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 rounded-pill px-3"
                    >
                      {copy.changeLanguage}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsLanguageModalOpen(true)} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 rounded-pill px-3">
                    <span className="oc-admin-add-flag">
                      <Languages className="h-3 w-3" />
                      <span className="oc-admin-add-flag-mark">?</span>
                    </span>
                    {copy.addLanguage}
                  </button>
                )}
              </div>
              <div className="d-none d-md-block oc-admin-topbar-context">{selectedItem?.title}</div>
              <button onClick={handleSave} disabled={isSaving || isAiReportsView} className="btn btn-primary d-inline-flex align-items-center gap-2">
                <Save className="h-4 w-4" />
                {isAiReportsView ? copy.readOnly : isSaving ? copy.saving : copy.update}
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
                      placeholder={copy.searchPages}
                      className="form-control ps-5"
                    />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                  className="btn btn-outline-secondary oc-admin-sidebar-toggle"
                  aria-label={isSidebarCollapsed ? copy.expandSidebar : copy.collapseSidebar}
                  title={isSidebarCollapsed ? copy.expandSidebar : copy.collapseSidebar}
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
                        <>{copy.loggedUsages}: <span className="fw-bold text-dark">{aiReports.length}</span></>
                      ) : (
                        <>{copy.editableFields}: <span className="fw-bold text-dark">{fieldCount}</span></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card oc-admin-card oc-admin-stat-card">
                    <div className="card-body small text-secondary">
                      {copy.group}: <span className="fw-bold text-dark">{selectedItem?.group}</span>
                    </div>
                  </div>
                </div>
              </div>

              {smtpDraft ? <SmtpWizardCard smtp={smtpDraft} onChange={handleChange} onStatus={handleStatusUpdate} copy={copy} /> : null}

            <div className="card oc-admin-card">
                <div className="card-body">
                <div className="oc-admin-editor-intro mb-4">
                  {isAiReportsView
                    ? copy.aiIntro
                    : copy.editorIntro}
                </div>
                {isAiReportsView ? (
                  <div className="d-grid gap-3">
                    {isLoadingAiReports ? (
                      <div className="small text-secondary">{copy.loadingAiReports}</div>
                    ) : aiReports.length === 0 ? (
                      <div className="small text-secondary">{copy.noAiReports}</div>
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
                              <div className="fw-semibold text-dark">{report.eventName || report.customerName || copy.untitledAiUsage}</div>
                              <div className="small text-secondary mt-1">
                                {report.eventLocation || copy.locationOpen} · {report.attendees || copy.attendeesOpen} · {report.currentPhase || copy.phaseOpen}
                              </div>
                            </div>
                            <div className="small text-secondary text-break text-lg-end" style={{ maxWidth: 320 }}>
                              {report.userAgent || copy.unknownUserAgent}
                            </div>
                          </summary>
                          <div className="card-body border-top pt-4">
                            <div className="row g-3">
                              <div className="col-12 col-xl-6">
                                <div className="oc-admin-field-help mb-2">{copy.prompt}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark oc-admin-scroll-panel">{report.userMessage}</div>
                              </div>
                              <div className="col-12 col-xl-6">
                                <div className="oc-admin-field-help mb-2">{copy.assistantResponse}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark oc-admin-scroll-panel">{report.assistantText || report.errorMessage || copy.noResponseText}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">{copy.customer}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.customerName || copy.open}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">{copy.event}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.eventName || copy.open}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">{copy.location}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{report.eventLocation || copy.open}</div>
                              </div>
                              <div className="col-12 col-md-6 col-xl-3">
                                <div className="oc-admin-field-help mb-2">{copy.created}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark">{new Date(report.createdAt).toLocaleString()}</div>
                              </div>
                              <div className="col-12">
                                <div className="oc-admin-field-help mb-2">{copy.userFriendlySummary}</div>
                                <div className="border rounded-3 bg-light p-3 small text-dark d-grid gap-2 oc-admin-scroll-panel">
                                  {readableReportLines(report).length > 0 ? (
                                    readableReportLines(report).map((line) => <div key={line}>{line}</div>)
                                  ) : (
                                    <div>{copy.noReadableSummary}</div>
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
                  <ObjectEditor key={`${selectedKey}:${editorResetToken}`} value={draft} secondaryValue={englishDraft} onChange={handleChange} onSecondaryChange={handleEnglishChange} onRemove={handleRemove} onAddArrayItem={handleAddArrayItem} getDefaultArrayItem={getDefaultArrayItemForPath} copy={copy} highlightedPath={activeSearchPath} routeOptionGroups={routeOptionGroups} />
                )}
              </div>
              </div>
            </div>
          </section>

          <aside className="col-12 col-lg-4 oc-admin-main p-4 oc-admin-right-rail oc-admin-entrance oc-admin-entrance-rail">
            <div className="sticky-top d-grid gap-4 oc-admin-right-rail-scroll" style={{ top: 89 }}>
              <div className="card oc-admin-card">
                <div className="card-header bg-white fw-semibold">{copy.publish}</div>
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 rounded-3 bg-light p-3 mb-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-success" />
                    <div>
                      <div className="fw-semibold text-dark">{copy.status}</div>
                      <div className="small text-secondary">{isAiReportsView ? copy.readOnlyAiHistory : status ?? copy.readyForUpdate}</div>
                    </div>
                  </div>

                  <div className="small text-secondary mb-3">
                    {lastSavedAt ? `${copy.lastSaved} ${new Date(lastSavedAt).toLocaleString()}` : copy.notSavedYet}
                  </div>

                  <button onClick={handleSave} disabled={isSaving || isAiReportsView} className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2">
                    <Save className="h-4 w-4" />
                    {isAiReportsView ? copy.readOnly : isSaving ? copy.saving : copy.updateDocument}
                  </button>
                </div>
              </div>

              <div className="card oc-admin-card">
                <div className="card-header bg-white fw-semibold">{copy.documentSummary}</div>
                <div className="card-body d-grid gap-3">
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">{copy.documentKey}</span>
                    <span className="fw-semibold text-dark">{selectedKey}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">{copy.groupItems}</span>
                    <span className="fw-semibold text-dark">{selectedGroupCount}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">{copy.totalDocuments}</span>
                    <span className="fw-semibold text-dark">{docCount}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary">{copy.leafFields}</span>
                    <span className="fw-semibold text-dark">{isAiReportsView ? aiReports.length : fieldCount}</span>
                  </div>
                </div>
              </div>

              <div className="card oc-admin-card">
                <div className="card-header bg-white fw-semibold">{copy.editorNotes}</div>
                <div className="card-body d-grid gap-3 small text-secondary">
                  <div className="d-flex align-items-start gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                    {copy.savedChangeNote}
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <History className="mt-1 h-4 w-4 text-primary" />
                    {isAiReportsView ? copy.aiUsageNote : copy.recentChangesNote}
                  </div>

                  <div className="border rounded-3 bg-light p-3 oc-admin-revision-panel">
                    <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                      <div className="fw-semibold text-dark">{isAiReportsView ? copy.aiUsageSummary : copy.recentChanges}</div>
                      <div className="small text-secondary">{isAiReportsView ? `${aiReports.length} ${copy.records}` : `${revisionDetails.length} ${copy.records}`}</div>
                    </div>
                    {isAiReportsView ? (
                      isLoadingAiReports ? (
                        <div className="small text-secondary">{copy.loadingAiSummary}</div>
                      ) : (
                        <div className="d-grid gap-2 small text-secondary">
                          <div>{copy.totalUses}: <span className="fw-semibold text-dark">{aiReports.length}</span></div>
                          <div>{copy.successful}: <span className="fw-semibold text-dark">{aiReports.filter((item) => item.status === 'success').length}</span></div>
                          <div>{copy.errors}: <span className="fw-semibold text-dark">{aiReports.filter((item) => item.status !== 'success').length}</span></div>
                          <div>{copy.latestActivity}: <span className="fw-semibold text-dark">{aiReports[0] ? new Date(aiReports[0].createdAt).toLocaleString() : copy.noActivityYet}</span></div>
                        </div>
                      )
                    ) : isLoadingRevisions ? (
                      <div className="small text-secondary">{copy.loadingRevisionHistory}</div>
                    ) : revisionDetails.length === 0 ? (
                      <div className="small text-secondary">{copy.noSavedChanges}</div>
                    ) : (
                      <div className="d-grid gap-3 oc-admin-revision-list">
                        {revisionDetails.map((revision) => (
                          <div key={revision.id} className="oc-admin-revision-item">
                            <div className="oc-admin-revision-item-body">
                              <div className="min-w-0">
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                  <div className="fw-semibold text-dark">{getRevisionActionLabel(revision.action)}</div>
                                  <span className={`oc-admin-revision-badge ${revision.action === 'restore' ? 'is-restore' : 'is-update'}`}>
                                    {revision.action === 'restore' ? copy.restore : copy.updateBadge}
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
                                          <div className="fw-semibold text-dark mb-1">{copy.original}</div>
                                          <div className="oc-admin-revision-value">{formatDiffValue(diff.previousValue)}</div>
                                        </div>
                                        <div className="small text-secondary mt-2">
                                          <div className="fw-semibold text-dark mb-1">{copy.changed}</div>
                                          <div className="oc-admin-revision-value">{formatDiffValue(diff.nextValue)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRestoreRevision(revision.restoreTargetId, revision.restoreTargetValue)}
                                disabled={isRestoringRevisionId === (revision.restoreTargetId ?? -1)}
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 oc-admin-revision-restore"
                              >
                                <RotateCcw className="h-4 w-4" />
                                {isRestoringRevisionId === (revision.restoreTargetId ?? -1) ? copy.restoring : copy.restorePrevious}
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
