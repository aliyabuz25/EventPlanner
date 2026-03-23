import React from 'react';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

interface StatsProps {
  CountUp: React.FC<{ end: number; suffix?: string }>;
}

const SapB1Stats: React.FC<StatsProps> = ({ CountUp }) => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.stats;
  return (
    <div className="py-24 bg-[#0e1621] text-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{section.title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
              {section.description}
            </p>
            <div className="flex flex-wrap gap-12 border-t border-white/10 pt-10">
              {section.metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="text-4xl font-bold text-white mb-2">{metric.value.endsWith('+') ? <CountUp end={Number(metric.value.replace('+', ''))} suffix="+" /> : metric.value}</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.2em]">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {section.benefits.map((item, idx) => {
              const Icon = resolveIcon(item.icon);
              return (
                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1">
                  <div className="w-12 h-12 bg-sap-blue rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-xl mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SapB1Stats;
