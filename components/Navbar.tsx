
import React, { useState, useEffect, useRef } from 'react';
import { ViewType, SolutionId } from '../types';
import Logo from './Logo';
import NavLink from './navbar/NavLink';
import SolutionDropdown from './navbar/SolutionDropdown';
import MobileMenu from './navbar/MobileMenu';
import ThemeToggle from './navbar/ThemeToggle';
import LanguagePicker from './navbar/LanguagePicker';
import { useSiteContent } from '../contexts/SiteContentContext';

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';

    if (link.view === 'solutions') {
      e.preventDefault();
      setSolutionsOpen(!solutionsOpen);
      return;
    }

    if (link.view !== 'home') {
      setView(link.view);
      e.preventDefault();
    } else if (link.view === 'home' && currentView === 'home') {
      const targetId = link.href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSolutionSelect = (id: SolutionId) => {
    setView(id);
    setSolutionsOpen(false);
    setMobileMenuOpen(false);
  };

  const renderLanguageControls = (compact = false) => {
    return <LanguagePicker compact={compact} />;
  };

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-[220] isolate transition-all duration-500 
      ${scrolled || currentView !== 'home' 
        ? 'bg-sap-paper/80 dark:bg-dark-base/80 backdrop-blur-xl py-2 border-b border-slate-200/80 dark:border-white/[0.05]' 
        : 'bg-transparent py-4 border-b border-transparent'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 flex min-h-[60px] lg:min-h-[76px] items-center justify-between gap-3">
        <div className="flex h-full items-center">
          <button 
            id="nav-logo-anchor" 
            onClick={() => setView('home')} 
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
                  onOverview={() => { setView('solutions'); setSolutionsOpen(false); }}
                  solutions={solutionLinks as any}
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
          onLinkClick={handleLinkClick}
          onSolutionSelect={handleSolutionSelect}
        />
      </nav>
    </>
  );
};

export default Navbar;
