import React, { createContext, useContext, useEffect, useState } from 'react';
import { siteContentSeed, editableDocumentKeys as defaultEditableKeys, normalizeSiteContent } from '../shared/siteContentSeed';
import { fetchSiteContent, restoreSiteDocument, saveSiteDocument } from '../services/siteContentService';
import { SiteContent } from '../types';

interface SiteContentContextValue {
  content: SiteContent;
  editableDocumentKeys: string[];
  isLoading: boolean;
  lastSavedAt: string | null;
  saveDocument: (key: string, value: unknown) => Promise<void>;
  restoreDocument: (key: string, revisionId: number) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);
const SITE_CONTENT_CACHE_KEY = 'oc_site_content_cache_v1';

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

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(getInitialContent);
  const [editableDocumentKeys, setEditableDocumentKeys] = useState<string[]>(defaultEditableKeys);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchSiteContent()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setContent(normalizeSiteContent(response.content) as SiteContent);
        setEditableDocumentKeys(response.editableDocumentKeys);
      })
      .catch(() => {
        setContent(normalizeSiteContent(siteContentSeed) as SiteContent);
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
      window.localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(content));
    } catch {
      // Ignore cache write failures and continue using in-memory content.
    }
  }, [content]);

  const saveDocument = async (key: string, value: unknown) => {
    const saved = await saveSiteDocument(key, value);
    setLastSavedAt(saved.updatedAt);

    setContent((prev) => {
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

    setContent((prev) => {
      const next = structuredClone(prev) as Record<string, any>;
      const parts = key.split('.');
      let current = next;

      for (let index = 0; index < parts.length - 1; index += 1) {
        current[parts[index]] = current[parts[index]] ?? {};
        current = current[parts[index]];
      }

      current[parts[parts.length - 1]] = restored.value;
      return normalizeSiteContent(next) as SiteContent;
    });
  };

  return (
    <SiteContentContext.Provider value={{ content, editableDocumentKeys, isLoading, lastSavedAt, saveDocument, restoreDocument }}>
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
