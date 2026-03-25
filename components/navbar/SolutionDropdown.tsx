
import React from 'react';
import { SolutionId, ViewType } from '../../types';

interface SolutionDropdownProps {
  isOpen: boolean;
  currentView: ViewType;
  onSelect: (id: SolutionId) => void;
  onOverview: () => void;
  solutions: { name: string; id: SolutionId }[];
  overviewLabel: string;
}

const SolutionDropdown: React.FC<SolutionDropdownProps> = ({ 
  isOpen, 
  currentView, 
  onSelect, 
  onOverview, 
  solutions,
  overviewLabel
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-4 w-72 bg-sap-paper dark:bg-[#121212] border border-slate-300 dark:border-white/[0.08] shadow-2xl rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-2">
        <button 
          onClick={onOverview}
          className="w-full text-left px-4 py-3 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-sap-gold dark:hover:text-sap-gold transition-all rounded-md"
        >
          {overviewLabel}
        </button>
        <div className="h-px bg-slate-200 dark:bg-white/5 my-1 mx-2"></div>
        {solutions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-4 py-3 text-[14px] font-medium transition-all rounded-md flex items-center justify-between group ${
              currentView === s.id 
                ? 'bg-sap-blue/10 text-sap-blue' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-sap-gold dark:hover:text-sap-gold'
            }`}
          >
            {s.name}
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SolutionDropdown;
