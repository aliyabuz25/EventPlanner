
import React, { useState, useEffect, useRef } from 'react';
import { ViewType, SolutionId } from '../types';
import Logo from './Logo';
import NavLink from './navbar/NavLink';
import SolutionDropdown from './navbar/SolutionDropdown';
import MobileMenu from './navbar/MobileMenu';
import ThemeToggle from './navbar/ThemeToggle';
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
  const { content } = useSiteContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navLinks = content.navigation.mainLinks;
  const solutionLinks = content.navigation.solutionLinks;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 
      ${scrolled || currentView !== 'home' 
        ? 'bg-sap-paper/90 dark:bg-[#000000]/90 backdrop-blur-md py-2 shadow-md border-b border-slate-300 dark:border-white/[0.08]' 
        : 'bg-transparent py-4'}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex min-h-[64px] lg:min-h-[76px] items-center justify-between">
        <div className="flex h-full items-center">
          <button 
            id="nav-logo-anchor" 
            onClick={() => setView('home')} 
            className={`group flex h-full items-center justify-center focus:outline-none transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          >
             <Logo theme={theme} scrolled={scrolled} className="h-12 sm:h-14 lg:h-16 w-auto max-w-[250px] sm:max-w-[290px] object-contain" />
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative" ref={link.view === 'solutions' ? dropdownRef : null}>
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

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          <button 
            className="px-5 py-2 border border-[#F0AB00] bg-[#F0AB00]/10 text-slate-800 dark:text-[#F0AB00] rounded-md text-[12px] font-bold hover:bg-[#F0AB00] hover:text-[#000000] transition-all uppercase tracking-wide"
          >
            {content.navigation.badges.partner}
          </button>
        </div>

        <div className="md:hidden flex items-center space-x-4">
           <ThemeToggle theme={theme} toggleTheme={toggleTheme} className="bg-slate-200 dark:bg-white/5" />

          <button 
            className="relative z-[70] p-2 text-slate-800 dark:text-white bg-slate-200 dark:bg-white/5 rounded-md transition-all active:scale-95"
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
  );
};

export default Navbar;
