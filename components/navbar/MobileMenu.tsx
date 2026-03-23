
import React from 'react';
import { ViewType, SolutionId } from '../../types';

interface MobileMenuProps {
  isOpen: boolean;
  currentView: ViewType;
  navLinks: { name: string; view: ViewType; href: string }[];
  solutionSublinks: { name: string; id: SolutionId }[];
  onLinkClick: (e: React.MouseEvent, link: any) => void;
  onSolutionSelect: (id: SolutionId) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  currentView, 
  navLinks, 
  solutionSublinks, 
  onLinkClick, 
  onSolutionSelect
}) => {
  return (
    <div className={`md:hidden fixed inset-0 z-[50] bg-sap-paper dark:bg-[#000000] transition-all duration-300 ease-in-out flex flex-col pt-24 px-6 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
      <div className="space-y-6 overflow-y-auto pb-10">
        {navLinks.map((link) => (
          <div key={link.name} className="border-b border-slate-200 dark:border-white/5 pb-4">
            <a
              href={link.href}
              className={`text-xl font-bold block ${currentView === link.view ? 'text-sap-blue' : 'text-slate-900 dark:text-white'}`}
              onClick={(e) => onLinkClick(e, link)}
            >
              {link.name}
            </a>
            {link.view === 'solutions' && (
              <div className="mt-4 pl-4 space-y-3 border-l-2 border-sap-blue/30">
                 {solutionSublinks.map(s => (
                   <button 
                     key={s.id}
                     onClick={() => onSolutionSelect(s.id)}
                     className="block text-sm font-medium text-slate-600 dark:text-slate-400 text-left w-full py-1"
                   >
                     {s.name}
                   </button>
                 ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
