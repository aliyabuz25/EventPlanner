import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { siteContentSeed, editableDocumentKeys as defaultEditableKeys, normalizeSiteContent } from '../shared/siteContentSeed';
import {
  fetchFrontendTranslation,
  fetchFrontendTranslationJob,
  fetchSiteContent,
  restoreSiteDocument,
  saveSiteDocument,
  startFrontendTranslationJob,
  type FrontendTranslationJob
} from '../services/siteContentService';
import { SiteContent } from '../types';

export type FrontendLocale = 'en' | 'de' | 'custom';

interface FrontendLocaleStatus {
  tone: 'info' | 'success' | 'error';
  message: string;
  progress: number;
}

interface SiteContentContextValue {
  content: SiteContent;
  sourceContent: SiteContent;
  editableDocumentKeys: string[];
  isLoading: boolean;
  lastSavedAt: string | null;
  locale: FrontendLocale;
  customLocaleCode: string | null;
  customLocaleLabel: string | null;
  customLocaleFlag: string;
  isTranslatingLocale: boolean;
  translationJob: FrontendTranslationJob | null;
  localeStatus: FrontendLocaleStatus | null;
  saveDocument: (key: string, value: unknown) => Promise<void>;
  restoreDocument: (key: string, revisionId: number) => Promise<{ value: unknown; updatedAt: string }>;
  setLocale: (locale: FrontendLocale) => void;
  clearLocaleStatus: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);
const SITE_CONTENT_CACHE_KEY = 'oc_site_content_cache_v1';
const FRONTEND_LOCALE_STORAGE_KEY = 'oc_frontend_locale_v1';
const FRONTEND_TRANSLATION_CACHE_KEY = 'oc_frontend_locale_cache_v1';
const FRONTEND_TRANSLATION_JOB_STORAGE_KEY = 'oc_frontend_translation_job_v1';
const FRONTEND_TRANSLATION_SUPPORT_STORAGE_KEY = 'oc_frontend_translation_support_v1';
const FRONTEND_DEFAULT_AUTO_LOCALE = 'en';

const customLocaleMeta: Record<string, { label: string; flag: string }> = {
  tr: { label: 'Turkce', flag: 'TR' },
  fr: { label: 'Francais', flag: 'FR' },
  es: { label: 'Espanol', flag: 'ES' },
  it: { label: 'Italiano', flag: 'IT' },
  pt: { label: 'Portugues', flag: 'PT' },
  nl: { label: 'Nederlands', flag: 'NL' },
  pl: { label: 'Polski', flag: 'PL' },
  ru: { label: 'Russkiy', flag: 'RU' },
  ar: { label: 'Arabic', flag: 'SA' },
  az: { label: 'Azerbaijani', flag: 'AZ' }
};

const englishFrontendOverrides = {
  siteMap: [
    { slug: 'home', view: 'home', title: 'Home', description: 'Landing page with FastLane event entry services.' },
    { slug: 'solutions', view: 'solutions', title: 'Solutions', description: 'FastLane modules for live, hybrid and medical events.' },
    { slug: 'services', view: 'services', title: 'Services', description: 'Consulting, setup and on-site support for event operations.' },
    { slug: 'about', view: 'about', title: 'About Us', description: 'Company profile, values and operating model.' },
    { slug: 'team', view: 'team', title: 'OnSite Team', description: 'How FastLane works on site with clients and guests.' },
    { slug: 'contact', view: 'contact', title: 'Contact', description: 'Direct consultation and event inquiry page.' },
    { slug: 'corporate-standards', view: 'corporate-standards', title: 'Privacy & Compliance', description: 'Trust, privacy and operational standards.' },
    { slug: 'survey', view: 'survey', title: 'Event Finder', description: 'Interactive recommendation flow for the right event setup.' },
    { slug: 'studio', view: 'studio', title: 'FastLane Workspace', description: 'Full event scoping and briefing workspace.' }
  ],
  navigation: {
    mainLinks: [
      { name: 'Solutions', view: 'solutions', href: '#solutions' },
      { name: 'Services', view: 'services', href: '#services' },
      { name: 'OnSite', view: 'team', href: '#team' },
      { name: 'About Us', view: 'about', href: '#about' },
      { name: 'Contact', view: 'contact', href: '/contact' }
    ],
    footer: {
      ecosystemLinks: [
        { label: 'Live Badging', view: 'sap-s4hana' },
        { label: 'Entry Management', view: 'sap-successfactors' },
        { label: 'Event Apps', view: 'sap-ariba' },
        { label: 'Event Finder', view: 'survey' }
      ],
      corporateLinks: [
        { label: 'About Us', view: 'about' },
        { label: 'Services', view: 'services' },
        { label: 'Workspace', view: 'studio' },
        { label: 'Privacy', view: 'corporate-standards' },
        { label: 'Contact', view: 'contact' }
      ]
    },
    badges: {
      partner: 'On-site event services',
      admin: 'CMS'
    }
  },
  pages: {
    home: {
      seoTitle: 'FastLane | Accreditation, Check-in and Live Badging',
      sections: {
        hero: {
          badge: 'Participant management for live and hybrid events',
          title: {
            lineOne: 'Accreditation,',
            highlight: 'Check-in',
            lineThree: '& Live Badging.'
          },
          description: 'Professional event entry with accreditation, live badge printing and fast check-ins directly on site. Flexible, reliable and tailored to your event.',
          primaryCta: 'View Solutions',
          secondaryCta: 'Request a Call',
          stats: [
            { value: '25+ Years', label: 'Participant management experience' },
            { value: 'OnSite', label: 'Support directly on site' },
            { value: 'Live + Hybrid', label: 'Event setups from one source' }
          ]
        },
        about: {
          eyebrow: 'About FastLane',
          title: 'Participant management with hands-on experience',
          paragraphs: [
            'FastLane is an independent on-site event service provider supporting live, hybrid and medical formats with structured accreditation, entry management and digitally guided participant processes.',
            'The company has worked in participant management for more than 25 years and is led by the second generation. The goal is always a setup that fits the event, the audience and the on-site flow.'
          ],
          badges: ['25+ Years Experience', '2nd Generation'],
          buttonText: 'Learn More',
          cards: [
            { value: 'Live', label: 'Accreditation & badges' },
            { value: 'Mobile', label: 'Check-in by app or kiosk' },
            { value: 'Hybrid', label: 'On-site and remote processes' },
            { value: 'Medical', label: 'Secure participant guidance' }
          ]
        },
        services: {
          eyebrow: 'Our Services',
          title: 'Modular services for your event’s first impression',
          description: 'From accreditation to reporting, FastLane combines technology, process design and on-site delivery into one clear entry concept.',
          cta: {
            title: 'FastLane for your event',
            description: 'Let us decide together which setup fits your audience size, format and entry logic.',
            buttonText: 'Open Solution Catalog'
          }
        },
        contact: {
          eyebrow: 'Contact',
          title: 'Talk to FastLane about your event',
          description: 'We advise you personally and define the right combination of entry flow, badges, app and on-site service together.',
          phoneLabel: 'Phone',
          phoneMeta: 'Mon-Fri, 09:00 - 18:00',
          emailLabel: 'Email',
          emailMeta: 'Usually answered within 24 hours',
          form: {
            firstName: 'First Name',
            firstNamePlaceholder: 'Enter first name',
            lastName: 'Last Name',
            lastNamePlaceholder: 'Enter last name',
            email: 'Email',
            emailPlaceholder: 'name@company.com',
            details: 'Event Details',
            detailsPlaceholder: 'Which services are relevant for your event?',
            submitText: 'Send Request',
            successMessage: 'Your request was sent successfully.',
            errorMessage: 'The request could not be sent right now. Please try again later.'
          }
        }
      }
    },
    campaign: {
      sections: {
        badge: 'Modular Setup',
        titleLines: ['One setup,', 'multiple event modules'],
        initiativesLabel: 'FastLane Focus',
        initiativesText: 'Live badging, entry management, event apps, medical events and hybrid formats can be combined flexibly.',
        buttonText: 'Get in Touch'
      }
    },
    about: {
      sections: {
        heroBadge: 'About Us',
        heroTitle: ['Participant processes', 'with accountability.'],
        intro: 'FastLane stands for reliable participant operations, smooth event entry and practical on-site execution for events that cannot afford friction.',
        mission: {
          title: 'Our Mission',
          description: 'To create event entry setups that feel professional for guests, controllable for organizers and dependable under pressure.'
        },
        vision: {
          title: 'Our Vision',
          description: 'To become the trusted operating layer for modern event accreditation, entry and participant flow management in Europe.'
        },
        valuesTitle: 'What matters to us',
        valuesSubtitle: 'Operational clarity, reliability and respectful collaboration shape every event day.'
      }
    },
    services: {
      sections: {
        eyebrow: 'Services',
        title: ['Operational setup', 'for events that need to run cleanly.'],
        description: 'FastLane covers planning, setup, hardware, software, accreditation and on-site execution in one connected service scope.'
      }
    },
    team: {
      sections: {
        title: 'The OnSite Team'
      }
    },
    solutions: {
      sections: {
        title: 'Solutions'
      }
    }
  }
} as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const applyExplicitOverrides = <T,>(base: T, override: unknown): T => {
  if (override === undefined) {
    return base;
  }

  if (Array.isArray(override)) {
    return structuredClone(override) as T;
  }

  if (typeof override === 'string' || typeof override === 'number' || typeof override === 'boolean' || override === null) {
    return override as T;
  }

  if (!isPlainObject(base) || !isPlainObject(override)) {
    return base;
  }

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in result ? applyExplicitOverrides(result[key], value) : structuredClone(value);
  }

  return result as T;
};

export const applyFrontendLocaleOverrides = (target: string, value: SiteContent): SiteContent => {
  if (target !== 'en') {
    return value;
  }

  return applyExplicitOverrides(value, englishFrontendOverrides);
};

const sanitizeTranslatedCopyValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeTranslatedCopyValue(entry));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, sanitizeTranslatedCopyValue(child)])
  );
};

const mergeLocalizedContent = <T,>(source: T, overlay: unknown): T => {
  if (typeof source === 'string') {
    return (typeof overlay === 'string' && overlay.trim() ? overlay : source) as T;
  }

  if (Array.isArray(source)) {
    if (!Array.isArray(overlay)) {
      return source as T;
    }

    return source.map((item, index) => mergeLocalizedContent(item, overlay[index])) as T;
  }

  if (!isPlainObject(source)) {
    return source;
  }

  const result: Record<string, unknown> = { ...source };
  for (const [key, value] of Object.entries(source)) {
    result[key] = mergeLocalizedContent(value, isPlainObject(overlay) ? overlay[key] : Array.isArray(overlay) ? undefined : undefined);
  }

  return result as T;
};

const getValueAtKey = (value: unknown, key: string): unknown => {
  const parts = key.split('.');
  let current: any = value;

  for (const part of parts) {
    current = current?.[part];
  }

  return current;
};

const getInitialContent = (): SiteContent => {
  if (typeof window === 'undefined') {
    return normalizeSiteContent(siteContentSeed) as SiteContent;
  }

  try {
    const cached = window.localStorage.getItem(SITE_CONTENT_CACHE_KEY);
    if (!cached) {
      return normalizeSiteContent(siteContentSeed) as SiteContent;
    }

    return normalizeSiteContent(JSON.parse(cached)) as SiteContent;
  } catch {
    return normalizeSiteContent(siteContentSeed) as SiteContent;
  }
};

const getInitialFrontendLocale = (): FrontendLocale => {
  if (typeof window === 'undefined') {
    return 'de';
  }

  const stored = window.localStorage.getItem(FRONTEND_LOCALE_STORAGE_KEY);
  return stored === 'en' || stored === 'custom' ? stored : 'de';
};

const getInitialTranslationCache = (): Record<string, SiteContent> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const cached = window.localStorage.getItem(FRONTEND_TRANSLATION_CACHE_KEY);
    if (!cached) {
      return {};
    }

    const parsed = JSON.parse(cached) as Record<string, SiteContent>;
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [
        key,
        applyFrontendLocaleOverrides(key, normalizeSiteContent(sanitizeTranslatedCopyValue(value)) as SiteContent)
      ])
    );
  } catch {
    return {};
  }
};

const getInitialTranslationJob = (): FrontendTranslationJob | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(FRONTEND_TRANSLATION_JOB_STORAGE_KEY);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as FrontendTranslationJob;
  } catch {
    return null;
  }
};

const fetchStaticFrontendTranslation = async (target: string): Promise<SiteContent | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (target !== 'en') {
    return null;
  }

  const response = await fetch('/locales/frontend-en.json', {
    cache: 'no-cache'
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json().catch(() => null);
  return result ? applyFrontendLocaleOverrides(target, normalizeSiteContent(sanitizeTranslatedCopyValue(result)) as SiteContent) : null;
};

const getInitialTranslationSupport = (): boolean => {
  if (typeof window === 'undefined') {
    return true;
  }

  const stored = window.localStorage.getItem(FRONTEND_TRANSLATION_SUPPORT_STORAGE_KEY);
  return stored !== '0';
};

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sourceContent, setSourceContent] = useState<SiteContent>(getInitialContent);
  const [editableDocumentKeys, setEditableDocumentKeys] = useState<string[]>(defaultEditableKeys);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<FrontendLocale>(getInitialFrontendLocale);
  const [translationCache, setTranslationCache] = useState<Record<string, SiteContent>>(getInitialTranslationCache);
  const [translationJob, setTranslationJob] = useState<FrontendTranslationJob | null>(getInitialTranslationJob);
  const [localeStatus, setLocaleStatus] = useState<FrontendLocaleStatus | null>(null);
  const [translationSupportEnabled, setTranslationSupportEnabled] = useState<boolean>(getInitialTranslationSupport);
  const configuredFrontendThirdLanguage = String(sourceContent.global?.localization?.frontendThirdLanguage ?? '').trim().toLowerCase();
  const customLocaleCode = customLocaleMeta[configuredFrontendThirdLanguage] ? configuredFrontendThirdLanguage : null;

  const customMeta = customLocaleCode ? customLocaleMeta[customLocaleCode] ?? { label: customLocaleCode.toUpperCase(), flag: customLocaleCode.slice(0, 2).toUpperCase() } : null;
  const isTranslatingLocale = Boolean(translationJob && (translationJob.status === 'pending' || translationJob.status === 'running'));
  const localizedContent = useMemo(() => {
    const selectedTarget = locale === 'custom' ? customLocaleCode : locale === 'en' ? 'en' : null;
    if (!selectedTarget || selectedTarget === 'de') {
      return sourceContent;
    }

    const overlay = translationCache[selectedTarget];
    return overlay ? mergeLocalizedContent(sourceContent, overlay) : sourceContent;
  }, [customLocaleCode, locale, sourceContent, translationCache]);

  useEffect(() => {
    let isMounted = true;

    fetchSiteContent()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setSourceContent(normalizeSiteContent(response.content) as SiteContent);
        setEditableDocumentKeys(response.editableDocumentKeys);
      })
      .catch(() => {
        setSourceContent(normalizeSiteContent(siteContentSeed) as SiteContent);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(sourceContent));
    } catch {
      // Ignore cache write failures and continue using in-memory content.
    }
  }, [sourceContent]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(FRONTEND_LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(FRONTEND_TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
    } catch {
      // Ignore cache write failures.
    }
  }, [translationCache]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (translationJob) {
      window.localStorage.setItem(FRONTEND_TRANSLATION_JOB_STORAGE_KEY, JSON.stringify(translationJob));
      return;
    }

    window.localStorage.removeItem(FRONTEND_TRANSLATION_JOB_STORAGE_KEY);
  }, [translationJob]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(FRONTEND_TRANSLATION_SUPPORT_STORAGE_KEY, translationSupportEnabled ? '1' : '0');
  }, [translationSupportEnabled]);

  useEffect(() => {
    if (locale !== 'custom') {
      return;
    }

    if (!customLocaleCode) {
      setLocaleState('de');
    }
  }, [customLocaleCode, locale]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (translationCache[FRONTEND_DEFAULT_AUTO_LOCALE]) {
      return;
    }

    void (async () => {
      try {
        const staticTranslation = await fetchStaticFrontendTranslation(FRONTEND_DEFAULT_AUTO_LOCALE);
        if (staticTranslation) {
          setTranslationCache((prev) => ({ ...prev, [FRONTEND_DEFAULT_AUTO_LOCALE]: staticTranslation }));
          return;
        }

        if (!translationSupportEnabled) {
          return;
        }

        const existing = await fetchFrontendTranslation(FRONTEND_DEFAULT_AUTO_LOCALE);
        const normalized = applyFrontendLocaleOverrides(
          FRONTEND_DEFAULT_AUTO_LOCALE,
          normalizeSiteContent(sanitizeTranslatedCopyValue(existing.copy)) as SiteContent
        );
        setTranslationCache((prev) => ({ ...prev, [FRONTEND_DEFAULT_AUTO_LOCALE]: normalized }));
      } catch {
        try {
          const result = await startFrontendTranslationJob(FRONTEND_DEFAULT_AUTO_LOCALE, sourceContent);
          setTranslationJob(result.job);
          setLocaleStatus({
            tone: 'info',
            message: result.job.message,
            progress: result.job.progress
          });
        } catch {
          // Ignore initial auto-translation failures and keep source language available.
        }
      }
    })();
  }, [isLoading, sourceContent, translationCache, translationSupportEnabled]);

  useEffect(() => {
    if (isLoading || !customLocaleCode || translationCache[customLocaleCode]) {
      return;
    }

    void ensureTranslation(customLocaleCode);
  }, [customLocaleCode, isLoading, translationCache]);

  useEffect(() => {
    if (!translationJob?.id) {
      return;
    }

    if (translationJob.status === 'completed' || translationJob.status === 'error') {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const result = await fetchFrontendTranslationJob(translationJob.id);
        setTranslationJob(result.job);
        setLocaleStatus({
          tone: result.job.status === 'error' ? 'error' : result.job.status === 'completed' ? 'success' : 'info',
          message: result.job.message,
          progress: result.job.progress
        });

        if (result.job.status === 'completed' && result.job.copy) {
          const normalized = applyFrontendLocaleOverrides(
            result.job.target,
            normalizeSiteContent(sanitizeTranslatedCopyValue(result.job.copy)) as SiteContent
          );
          setTranslationCache((prev) => ({ ...prev, [result.job.target]: normalized }));

          window.setTimeout(() => {
            setTranslationJob((current) => (current?.id === result.job.id ? null : current));
            setLocaleStatus((current) =>
              current?.message === result.job.message
                ? { tone: 'success', message: 'Localization updated.', progress: 100 }
                : current
            );
          }, 1200);
        }

        if (result.job.status === 'error') {
          window.setTimeout(() => {
            setTranslationJob((current) => (current?.id === result.job.id ? null : current));
          }, 2000);
        }
      } catch (error) {
        setLocaleStatus({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Localization could not be updated.',
          progress: translationJob.progress
        });
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [translationJob]);

  useEffect(() => {
    if (!localeStatus || localeStatus.tone === 'info') {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLocaleStatus((current) => (current === localeStatus ? null : current));
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [localeStatus]);

  const saveDocument = async (key: string, value: unknown) => {
    const saved = await saveSiteDocument(key, value);
    setLastSavedAt(saved.updatedAt);

    setSourceContent((prev) => {
      const next = structuredClone(prev) as Record<string, any>;
      const parts = key.split('.');
      let current = next;

      for (let index = 0; index < parts.length - 1; index += 1) {
        current[parts[index]] = current[parts[index]] ?? {};
        current = current[parts[index]];
      }

      current[parts[parts.length - 1]] = value;
      return normalizeSiteContent(next) as SiteContent;
    });
  };

  const restoreDocument = async (key: string, revisionId: number) => {
    const restored = await restoreSiteDocument(key, revisionId);
    setLastSavedAt(restored.updatedAt);
    const response = await fetchSiteContent();
    const normalizedContent = normalizeSiteContent(response.content) as SiteContent;
    setSourceContent(normalizedContent);
    setEditableDocumentKeys(response.editableDocumentKeys);

    return {
      value: getValueAtKey(normalizedContent, key),
      updatedAt: restored.updatedAt
    };
  };

  const ensureTranslation = async (target: string) => {
    if (!target || target === 'en') {
      const staticTranslation = await fetchStaticFrontendTranslation('en');
      if (staticTranslation) {
        setTranslationCache((prev) => ({ ...prev, en: staticTranslation }));
      }
      return;
    }

    if (translationCache[target]) {
      return;
    }

    try {
      const staticTranslation = await fetchStaticFrontendTranslation(target);
      if (staticTranslation) {
        setTranslationCache((prev) => ({ ...prev, [target]: staticTranslation }));
        return;
      }

      if (!translationSupportEnabled) {
        return;
      }

      const existing = await fetchFrontendTranslation(target);
      const normalized = applyFrontendLocaleOverrides(
        target,
        normalizeSiteContent(sanitizeTranslatedCopyValue(existing.copy)) as SiteContent
      );
      setTranslationCache((prev) => ({ ...prev, [target]: normalized }));
      return;
    } catch (fetchError) {
      try {
        const result = await startFrontendTranslationJob(target, sourceContent);
        setTranslationJob(result.job);
        setTranslationSupportEnabled(true);
        setLocaleStatus({
          tone: 'info',
          message: result.job.message,
          progress: result.job.progress
        });
      } catch (jobError) {
        const statusCode = jobError instanceof Error ? jobError.message.match(/\b(\d{3})\b/)?.[1] : null;

        if (statusCode === '404' || (fetchError instanceof Error && fetchError.message.includes('404'))) {
          setTranslationSupportEnabled(false);
          setLocaleStatus({
            tone: 'error',
            message: 'Frontend localization API is not available yet. Restart the app server to enable it.',
            progress: 0
          });
          return;
        }

        setLocaleStatus({
          tone: 'error',
          message: jobError instanceof Error ? jobError.message : 'Localization could not be started.',
          progress: 0
        });
      }
    }
  };

  const setLocale = (nextLocale: FrontendLocale) => {
    setLocaleState(nextLocale);

    if (nextLocale === 'en') {
      void ensureTranslation('en');
    }

    if (nextLocale === 'custom' && customLocaleCode) {
      void ensureTranslation(customLocaleCode);
    }
  };

  const clearLocaleStatus = () => {
    setLocaleStatus(null);
  };

  return (
    <SiteContentContext.Provider
      value={{
        content: localizedContent,
        sourceContent,
        editableDocumentKeys,
        isLoading,
        lastSavedAt,
        locale,
        customLocaleCode,
        customLocaleLabel: customMeta?.label ?? null,
        customLocaleFlag: customMeta?.flag ?? '??',
        isTranslatingLocale,
        translationJob,
        localeStatus,
        saveDocument,
        restoreDocument,
        setLocale,
        clearLocaleStatus
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used inside SiteContentProvider');
  }

  return context;
}
