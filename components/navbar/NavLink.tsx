
import React from 'react';
import { ViewType } from '../../types';

interface NavLinkProps {
  name: string;
  href: string;
  view: ViewType;
  currentView: ViewType;
  onClick: (e: React.MouseEvent) => void;
  hasDropdown?: boolean;
  isOpen?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  name, 
  href, 
  view, 
  currentView, 
  onClick, 
  hasDropdown, 
  isOpen 
}) => {
  const solutionViews = new Set([
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
  const isActive = currentView === view || (view === 'solutions' && solutionViews.has(currentView));

  return (
    <a
      href={href}
      onClick={onClick}
      className={`relative py-1 text-[15px] lg:text-[16px] font-semibold transition-all flex items-center tracking-tight group ${
        isActive
        ? 'text-sap-blue dark:text-dark-text-primary' 
        : 'text-slate-600 dark:text-dark-text-secondary hover:text-sap-blue dark:hover:text-dark-text-primary'
      }`}
    >
      <span className="relative z-10">{name}</span>
      <span className={`absolute bottom-0 left-0 h-[2px] bg-sap-gold transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
      
      {hasDropdown && (
        <svg 
          className={`ml-1.5 w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </a>
  );
};

export default NavLink;
