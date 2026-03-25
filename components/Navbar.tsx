
import React, { useState, useEffect, useRef } from 'react';
import { ViewType, SolutionId } from '../types';
import Logo from './Logo';
import NavLink from './navbar/NavLink';
import SolutionDropdown from './navbar/SolutionDropdown';
import MobileMenu from './navbar/MobileMenu';
import ThemeToggle from './navbar/ThemeToggle';
import LanguagePicker from './navbar/LanguagePicker';
import { useSiteContent } from '../contexts/SiteContentContext';

const solutionViews = new Set<SolutionId>([
  'sap-s4hana',
  'sap-ariba',
  'sap-successfactors',
  'sap-sam',
  'sap-fsm',
  'sap-business-one',
  'sap-bw4hana',
  'sap-analytics',
  'sap-bydesign',
  'microsoft-power-bi',
  'opentext',
  'bimser'
]);

interface NavbarProps {
  scrolled: boolean;
  setView: (view: ViewType) => void;
  currentView: ViewType;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isReady?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled, setView, currentView, theme, toggleTheme, isReady = true }) => {
  const { content, locale, setLocale, customLocaleCode, customLocaleLabel, isTranslatingLocale, translationJob } = useSiteContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);
  const navLinks = content.navigation.mainLinks;
  const solutionLinks = content.navigation.solutionLinks;
  const solutionsOverviewLabel = locale === 'en' ? 'See All Modules' : 'Tum modulleri gor';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToTarget = (targetId: string) => {
    if (!targetId) {
      return;
    }

    const attemptScroll = () => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.requestAnimationFrame(() => {
      attemptScroll();
      window.setTimeout(attemptScroll, 120);
    });
  };

  const resolveViewFromHref = (href: string): ViewType | null => {
    const normalized = href.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+|\/+$/g, '');

    if (!normalized) {
      return 'home';
    }

    if (normalized === 'studio') {
      return 'studio';
    }

    if (solutionViews.has(normalized as SolutionId)) {
      return normalized as SolutionId;
    }

    const siteMapMatch = content.siteMap.find((entry) => entry.slug === normalized);
    if (siteMapMatch) {
      return siteMapMatch.view;
    }

    const customPageMatch = content.customPages.find((page) => page.slug === normalized);
    return customPageMatch?.view ?? null;
  };

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';

    const href = String(link.href ?? '').trim();
    const isSolutionsOverviewTrigger = link.view === 'solutions' && ['#solutions', '/#solutions', '/solutions'].includes(href);

    if (isSolutionsOverviewTrigger) {
      e.preventDefault();
      setSolutionsOpen(!solutionsOpen);
      return;
    }

    if (/^(mailto:|tel:|https?:\/\/)/i.test(href)) {
      setSolutionsOpen(false);
      return;
    }

    if (href.startsWith('#') || href.startsWith('/#')) {
      e.preventDefault();
      setSolutionsOpen(false);
      const targetId = href.replace(/^\/?#/, '');

      if (currentView !== 'home') {
        setView('home');
      } else {
        scrollToTarget(targetId);
      }

      scrollToTarget(targetId);
      return;
    }

    const resolvedView = resolveViewFromHref(href);
    if (resolvedView) {
      e.preventDefault();
      setSolutionsOpen(false);

      if (resolvedView === 'home' && currentView === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setView(resolvedView);
      return;
    }

    if (link.view !== 'home') {
      setSolutionsOpen(false);
      setView(link.view);
      e.preventDefault();
    }
  };

  const handleSolutionSelect = (id: SolutionId) => {
    setView(id);
    setSolutionsOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSolutionsOverview = () => {
    setView('solutions');
    setSolutionsOpen(false);
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const renderLanguageControls = (compact = false) => {
    return <LanguagePicker compact={compact} />;
  };

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-[220] isolate transition-all duration-500 
      ${scrolled || currentView !== 'home' 
        ? 'bg-sap-paper/90 dark:bg-dark-base/90 backdrop-blur-2xl py-2.5 border-b border-slate-300 dark:border-white/10 shadow-sm' 
        : 'bg-transparent py-5 border-b border-transparent'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 flex min-h-[60px] lg:min-h-[76px] items-center justify-between gap-3">
        <div className="flex h-full items-center">
          <button 
            id="nav-logo-anchor" 
            onClick={() => {
              if (currentView === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }

              setView('home');
            }}
            className={`group flex h-full items-center justify-center focus:outline-none transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          >
             <Logo
               theme={theme}
               scrolled={scrolled}
               className="h-9 sm:h-12 lg:h-14 w-auto max-w-[160px] sm:max-w-[250px] object-contain"
               imgStyle={{
                 imageRendering: '-webkit-optimize-contrast',
                 backfaceVisibility: 'hidden',
                 transform: 'translateZ(0)',
               }}
             />
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative" ref={link.view === 'solutions' ? solutionsDropdownRef : null}>
              <NavLink 
                name={link.name}
                href={link.href}
                view={link.view as ViewType}
                currentView={currentView}
                onClick={(e) => handleLinkClick(e, link)}
                hasDropdown={link.view === 'solutions'}
                  isOpen={solutionsOpen}
                />
              
              {link.view === 'solutions' && (
                <SolutionDropdown 
                  isOpen={solutionsOpen}
                  currentView={currentView}
                  onSelect={handleSolutionSelect}
                  onOverview={handleSolutionsOverview}
                  solutions={solutionLinks as any}
                  overviewLabel={solutionsOverviewLabel}
                />
              )}
            </div>
          ))}

          {renderLanguageControls()}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        </div>

        <div className="md:hidden flex items-center space-x-2">
           {renderLanguageControls(true)}
           <ThemeToggle theme={theme} toggleTheme={toggleTheme} className="bg-slate-200 dark:bg-white/5" />

          <button 
            className="relative z-[100001] p-2 text-slate-800 dark:text-white bg-slate-200 dark:bg-white/5 rounded-md transition-all active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

        <MobileMenu 
          isOpen={mobileMenuOpen}
          currentView={currentView}
          navLinks={navLinks as any}
          solutionSublinks={solutionLinks as any}
          solutionsOverviewLabel={solutionsOverviewLabel}
          onLinkClick={handleLinkClick}
          onSolutionsOverview={handleSolutionsOverview}
          onSolutionSelect={handleSolutionSelect}
        />
      </nav>
    </>
  );
};

export default Navbar;
