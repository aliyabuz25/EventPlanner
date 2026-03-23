import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  colorClass: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, colorClass }) => (
  <div className="mb-12">
    {subtitle && <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 ${colorClass}`}>{subtitle}</div>}
    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight max-w-2xl">{title}</h2>
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, color }) => (
  <div className="p-8 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-1.5 h-full ${color} opacity-80`}></div>
    <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-sm`}>
      <div className={`${color.replace('bg-', 'text-')}`}>
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);
