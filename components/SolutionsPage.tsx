
import React from 'react';
import { SolutionId } from '../types';
import { ChevronRight, Zap } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';
import { resolveIcon } from './iconRegistry';

interface SolutionsPageProps {
  onSelectSolution?: (id: SolutionId) => void;
}

const SolutionsPage: React.FC<SolutionsPageProps> = ({ onSelectSolution }) => {
  const { content } = useSiteContent();
  const section = content.pages.solutions.sections;

  return (
    <div className="pt-32 pb-32 bg-sap-paper dark:bg-[#0e1621] relative min-h-screen transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between transition-colors">
          <div>
            <h2 className="text-xs font-bold text-sap-gold uppercase tracking-[0.2em] mb-2">{section.eyebrow}</h2>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{section.title}</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg text-right text-sm mt-4 md:mt-0 transition-colors">
            {section.description}
          </p>
        </div>

        {/* Dashboard Grid Layout (Tile-like) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {section.products.map((p, idx) => {
            const Icon = resolveIcon(p.icon) ?? Zap;
            return (
            <div 
              key={idx} 
              onClick={() => onSelectSolution?.(p.id)}
              className="bg-white dark:bg-[#1d2330] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:border-sap-blue hover:shadow-2xl cursor-pointer transition-all duration-500 group flex flex-col justify-between h-72 shadow-sm"
            >
              <div className="flex justify-between items-start">
                 <div className="text-sap-blue p-3 bg-sap-blue/10 rounded-2xl group-hover:bg-sap-blue group-hover:text-white transition-all duration-500">
                    <Icon className="w-6 h-6" />
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{p.category}</div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-sap-gold transition-colors">{p.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 transition-colors">
                  {p.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex justify-end transition-colors">
                 <span className="text-[11px] font-bold text-slate-400 group-hover:text-sap-gold transition-all uppercase tracking-widest flex items-center">
                    Access Module
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                 </span>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;
