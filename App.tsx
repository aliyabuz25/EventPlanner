
import React, { Suspense, lazy, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Partners from './components/Partners';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SolutionsPage from './components/SolutionsPage';
import FullAboutPage from './components/FullAboutPage';
import CampaignSection from './components/CampaignSection';
import TeamPage from './components/TeamPage';
import FullServicesPage from './components/FullServicesPage';
import CorporateStandardsPage from './components/CorporateStandardsPage';
import SolutionDetailPage from './components/SolutionDetailPage';
import SurveyPage from './components/SurveyPage';
import StudioPage from './components/StudioPage';
import LoadingScreen from './components/LoadingScreen';
import GenericContentPage from './components/GenericContentPage';
import ErpAdvisor from './components/ErpAdvisor';
import { useSiteContent } from './contexts/SiteContentContext';
import { CustomPageView, SolutionId, ViewType } from './types';

const ContentAdminPage = lazy(() => import('./components/ContentAdminPage'));

const adminPath = '/oc-admin';

const viewToPath = (view: ViewType, content: ReturnType<typeof useSiteContent>['content']) => {
  if (view === 'content-admin') {
    return adminPath;
  }

  const mapped = content.siteMap.find((entry) => entry.view === view);
  if (mapped) {
    return mapped.slug === 'home' ? '/' : `/${mapped.slug}`;
  }

  return '/';
};

const pathToView = (pathname: string, content: ReturnType<typeof useSiteContent>['content']): ViewType => {
  if (pathname === adminPath) {
    return 'content-admin';
  }

  const normalized = pathname.replace(/^\/+|\/+$/g, '') || 'home';
  const mapped = content.siteMap.find((entry) => entry.slug === normalized);
  if (mapped) {
    return mapped.view;
  }

  return 'home';
};

const App: React.FC = () => {
  const { content, localeStatus, clearLocaleStatus } = useSiteContent();
  const initialView = pathToView(window.location.pathname, content);
  const [loading, setLoading] = useState(initialView !== 'content-admin');
  const [fadingOut, setFadingOut] = useState(false);
  const [logoTransform, setLogoTransform] = useState<React.CSSProperties | undefined>(undefined);
  const [scrolled, setScrolled] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (currentView === 'content-admin') {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setFadingOut(true);

      const sourceEl = document.getElementById('loading-logo-source');
      const targetEl = document.getElementById('nav-logo-anchor');

      if (sourceEl && targetEl) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
          const sourceRect = sourceEl.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();
          const scale = targetRect.width / sourceRect.width;
          const x = targetRect.left - sourceRect.left;
          const y = targetRect.top - sourceRect.top;

          setLogoTransform({
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          });
        }
      }

      setTimeout(() => {
        setLoading(false);
      }, 800);
    }, 2000); 

    return () => clearTimeout(timer);
  }, [currentView]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  useEffect(() => {
    const nextPath = viewToPath(currentView, content);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ view: currentView }, '', nextPath);
    }
  }, [currentView, content]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(pathToView(window.location.pathname, content));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [content]);

  useEffect(() => {
    setCurrentView((prev) => {
      const resolved = pathToView(window.location.pathname, content);
      return prev === resolved ? prev : resolved;
    });
  }, [content]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const activeCustomPage = String(currentView).startsWith('custom:')
      ? content.customPages.find((page) => page.view === currentView)
      : null;
    const branding = content.global?.branding;

    const titleMap: Partial<Record<ViewType, string>> = {
      home: content.pages.home?.seoTitle,
      about: content.pages.about?.sections?.heroTitle?.join(' '),
      services: content.pages.services?.sections?.title?.join(' '),
      team: content.pages.team?.sections?.title,
      contact: content.pages.home?.sections?.contact?.title,
      studio: 'FastLane Workspace',
      solutions: content.pages.solutions?.sections?.title
    };

    document.title =
      activeCustomPage?.seoTitle ||
      titleMap[currentView] ||
      branding?.siteTitle ||
      'Site';

    const ensureIconLink = (rel: string) => {
      let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      return link;
    };

    const faviconUrl = branding?.faviconUrl || '/favicon.ico';
    ensureIconLink('icon').href = faviconUrl;
    ensureIconLink('shortcut icon').href = faviconUrl;

    const appleTouchIcon = branding?.appleTouchIconUrl || faviconUrl;
    ensureIconLink('apple-touch-icon').href = appleTouchIcon;
  }, [content, currentView]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderContent = () => {
    if (currentView === 'survey') {
      return <SurveyPage onNavigate={(view) => setCurrentView(view)} />;
    }

    if (currentView === 'studio') {
      return <StudioPage />;
    }

    if (currentView === 'content-admin') {
      return (
        <Suspense fallback={<div className="min-h-[40vh] bg-white" />}>
          <ContentAdminPage />
        </Suspense>
      );
    }

    if (String(currentView).startsWith('custom:')) {
      return <GenericContentPage view={currentView as CustomPageView} />;
    }

    const solutionIds: SolutionId[] = [
      'sap-business-one',
      'sap-s4hana', 'sap-ariba', 'sap-successfactors', 
      'sap-sam', 'sap-fsm', 
      'sap-bw4hana', 'sap-analytics', 'sap-bydesign', 
      'microsoft-power-bi', 'opentext', 'bimser'
    ];

    if (solutionIds.includes(currentView as SolutionId)) {
      return <SolutionDetailPage id={currentView as SolutionId} />;
    }

    switch (currentView) {
      case 'solutions': return <SolutionsPage onSelectSolution={(id) => setCurrentView(id)} />;
      case 'about': return <FullAboutPage />;
      case 'team': return <TeamPage />;
      case 'services': return <FullServicesPage />;
      case 'corporate-standards': return <CorporateStandardsPage />;
      case 'contact': return <Contact />;
      default:
        return (
          <>
            <Hero onOpenStudio={() => setCurrentView('studio')} />
            <CampaignSection />
            <About onReadMore={() => setCurrentView('about')} />
            <Partners />
            <Services onExplore={() => setCurrentView('solutions')} />
          </>
        );
    }
  };

  const isSurveyView = currentView === 'survey';
  const isStudioView = currentView === 'studio';
  const mainTransitionClass = isStudioView ? 'view-slide-in-right' : 'view-fade-in-soft';

  return (
    <div className="min-h-screen bg-sap-paper dark:bg-[#050505] selection:bg-sap-gold/30 selection:text-black dark:selection:text-white transition-colors duration-500">
      {loading && (
        <LoadingScreen 
          isFadingOut={fadingOut} 
          transformStyle={logoTransform} 
          theme={theme}
        />
      )}
      
      <div className="animate-in fade-in duration-700">
        {currentView !== 'content-admin' && (
          <Navbar 
            scrolled={scrolled} 
            setView={setCurrentView} 
            currentView={currentView} 
            theme={theme}
            toggleTheme={toggleTheme}
            isReady={!loading}
          />
        )}

        <main key={currentView} className={mainTransitionClass}>
          {renderContent()}
        </main>

        {currentView !== 'content-admin' && !isSurveyView && <Footer setView={setCurrentView} theme={theme} />}
        {currentView !== 'content-admin' && !isSurveyView && !isStudioView && <ErpAdvisor assistantOnly />}
      </div>

      {currentView !== 'content-admin' && localeStatus && (
        <button
          type="button"
          onClick={clearLocaleStatus}
          className="fixed bottom-4 right-4 z-[260] w-[min(92vw,380px)] text-start rounded-4 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#050505]/95 shadow-2xl backdrop-blur-xl p-4"
        >
          <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
            <div className="small fw-bold text-uppercase text-secondary">Localization</div>
            <div className={`small fw-semibold ${localeStatus.tone === 'error' ? 'text-danger' : localeStatus.tone === 'success' ? 'text-success' : 'text-primary'}`}>
              {Math.max(0, Math.min(100, localeStatus.progress))}%
            </div>
          </div>
          <div className="text-dark dark:text-white fw-semibold mb-3">{localeStatus.message}</div>
          <div className="w-100 rounded-pill bg-slate-200 dark:bg-white/10 overflow-hidden" style={{ height: 8 }}>
            <div
              className={`${localeStatus.tone === 'error' ? 'bg-danger' : localeStatus.tone === 'success' ? 'bg-success' : 'bg-primary'} rounded-pill transition-all duration-500`}
              style={{ width: `${Math.max(4, Math.min(100, localeStatus.progress))}%`, height: '100%' }}
            />
          </div>
        </button>
      )}
    </div>
  );
};

export default App;
