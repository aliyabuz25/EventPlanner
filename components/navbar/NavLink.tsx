
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
  const isActive = currentView === view || (name === 'Solutions' && currentView.startsWith('sap-'));

  return (
    <a
      href={href}
      onClick={onClick}
      className={`text-[14px] font-semibold transition-all flex items-center tracking-tight ${
        isActive
        ? 'text-sap-blue dark:text-white' 
        : 'text-slate-600 dark:text-slate-400 hover:text-sap-gold dark:hover:text-sap-gold'
      }`}
    >
      {name}
      {hasDropdown && (
        <svg 
          className={`ml-1 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
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
