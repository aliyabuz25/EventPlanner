
import React from 'react';
import { ViewType, SolutionId } from '../../types';

interface MobileMenuProps {
  isOpen: boolean;
  currentView: ViewType;
  navLinks: { name: string; view: ViewType; href: string }[];
  solutionSublinks: { name: string; id: SolutionId }[];
  onLinkClick: (e: React.MouseEvent, link: any) => void;
  onSolutionSelect: (id: SolutionId) => void;
  onStudioOpen: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  currentView, 
  navLinks, 
  solutionSublinks, 
  onLinkClick, 
  onSolutionSelect,
  onStudioOpen
}) => {
  return (
    <div className={`md:hidden fixed inset-0 z-[100000] h-[100dvh] min-h-screen bg-sap-paper dark:bg-[#000000] transition-all duration-300 ease-in-out flex flex-col pt-20 sm:pt-24 px-4 sm:px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto pb-10">
        <button
          type="button"
          onClick={onStudioOpen}
          className="w-full rounded-2xl bg-sap-blue text-white px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] shadow-lg"
        >
          Event Studio
        </button>
        {navLinks.map((link) => (
          <div key={link.name} className="border-b border-slate-200 dark:border-white/5 pb-4">
            <a
              href={link.href}
              className={`text-lg sm:text-xl font-bold block ${currentView === link.view ? 'text-sap-blue' : 'text-slate-900 dark:text-white'}`}
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
