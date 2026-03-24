
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SiteContentProvider } from './contexts/SiteContentContext';
import './index.css';

declare const __APP_VERSION__: string;

declare global {
  interface Window {
    fastlaneConsole?: {
      version: string;
      help: () => void;
      clear: () => void;
      storage: () => Record<string, string>;
      translations: () => Promise<unknown>;
    };
  }
}

const printConsoleBanner = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const octopus = [
    '           ,\'""`.',
    '          / _  _ \\\\',
    '          |(@)(@)|',
    '          )  __  (',
    '         /,\'))((`.\\\\',
    '        (( ((  )) ))',
    "         `\\\\ `)(' /'"
  ].join('\n');

  const help = () => {
    console.table([
      { command: 'fastlaneConsole.help()', description: 'Show available console helpers' },
      { command: 'fastlaneConsole.clear()', description: 'Clear the console' },
      { command: 'fastlaneConsole.storage()', description: 'Inspect localStorage as a plain object' },
      { command: 'fastlaneConsole.translations()', description: 'Inspect generated translation files and upload references' }
    ]);
  };

  const translations = async () => {
    const response = await fetch('/api/admin/translations/overview');
    if (!response.ok) {
      throw new Error(`Failed to load translations overview: ${response.status}`);
    }

    const overview = await response.json();
    console.group('FastLane Translations');
    console.group('Admin');
    console.log('Translation file:', overview.admin?.file);
    console.table(overview.admin?.locales ?? []);
    console.group('Referenced Uploads');
    console.table(overview.admin?.uploads?.referenced ?? []);
    console.groupEnd();
    console.group('Upload Files');
    console.table(overview.admin?.uploads?.files ?? []);
    console.groupEnd();
    console.groupEnd();
    console.group('Frontend');
    console.log('Translation file:', overview.frontend?.file);
    console.table(overview.frontend?.locales ?? []);
    console.groupEnd();
    console.groupEnd();
    return overview;
  };

  window.fastlaneConsole = {
    version: __APP_VERSION__,
    help,
    clear: () => console.clear(),
    translations,
    storage: () =>
      Object.fromEntries(
        Array.from({ length: window.localStorage.length }, (_, index) => {
          const key = window.localStorage.key(index) ?? '';
          return [key, window.localStorage.getItem(key) ?? ''];
        })
      )
  };

  console.log('%c%s', 'color: #2271b1; font-family: monospace; font-weight: 700;', octopus);
  console.log('%cFastLane Console', 'color: #0f172a; font-size: 16px; font-weight: 800; letter-spacing: 0.04em;');
  console.log('%cVersion%c  %s', 'color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase;', 'color: #0f172a; font-size: 12px; font-weight: 700;', __APP_VERSION__);
  console.log('%cConsole Commands', 'color: #166534; font-size: 12px; font-weight: 800; text-transform: uppercase;');
  console.log('%c• fastlaneConsole.help()%c  Show available console helpers', 'color: #0f172a; font-weight: 700;', 'color: #64748b;');
  console.log('%c• fastlaneConsole.clear()%c  Clear the console', 'color: #0f172a; font-weight: 700;', 'color: #64748b;');
  console.log('%c• fastlaneConsole.storage()%c  Inspect localStorage as an object', 'color: #0f172a; font-weight: 700;', 'color: #64748b;');
  console.log('%c• fastlaneConsole.translations()%c  Inspect translation cache, locales and uploads', 'color: #0f172a; font-weight: 700;', 'color: #64748b;');
};

printConsoleBanner();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SiteContentProvider>
      <App />
    </SiteContentProvider>
  </React.StrictMode>
);
