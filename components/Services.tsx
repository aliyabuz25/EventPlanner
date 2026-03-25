
import React from 'react';
import ServiceCard from './ServiceCard';
import { useSiteContent } from '../contexts/SiteContentContext';

interface ServicesProps {
  onExplore?: () => void;
}

const Services: React.FC<ServicesProps> = ({ onExplore }) => {
  const { content } = useSiteContent();
  const section = content.pages.home.sections.services;

  return (
    <section id="services" className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl reveal reveal-up">
            <h2 className="text-sm font-black text-sap-blue dark:text-[#008FD3] uppercase tracking-widest mb-4">{section.eyebrow}</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase">
              {section.title}
            </p>
          </div>
          <p className="reveal reveal-up delay-200 text-slate-700 dark:text-slate-300 max-w-md text-lg font-medium">
            {section.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.items.map((service, index) => (
            <div key={service.id} className={`reveal reveal-up delay-${(index % 3) * 150}`}>
              <ServiceCard service={service} index={index} />
            </div>
          ))}
        </div>

        <div className="reveal reveal-up delay-300 mt-20 p-12 bg-white dark:bg-[#121212] border border-slate-300 dark:border-white/10 border-l-[12px] border-l-[#008FD3] flex flex-col lg:flex-row items-center justify-between gap-12 rounded-2xl shadow-2xl transition-all">
          <div className="text-center lg:text-left flex-1">
              <h3 className="text-3xl font-black mb-4 text-slate-900 dark:text-white tracking-tight uppercase italic">{section.cta.title}</h3>
              <p className="text-slate-700 dark:text-slate-300 max-w-2xl text-lg font-bold leading-relaxed">{section.cta.description}</p>
          </div>
          <a
            href={section.cta.buttonHref}
            onClick={onExplore}
            className="px-10 py-5 bg-[#008FD3] text-white font-black text-sm uppercase tracking-widest hover:bg-[#007db8] hover:scale-105 active:scale-95 transition-all rounded-2xl shadow-2xl whitespace-nowrap"
          >
            {section.cta.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
