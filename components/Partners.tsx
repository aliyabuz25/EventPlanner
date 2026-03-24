
import React from 'react';
import { Partner } from '../types';
import PartnerIcon from './PartnerIcon';
import { useSiteContent } from '../contexts/SiteContentContext';

const PARTNER_ICON_NAMES = new Set([
  'SAP',
  'Microsoft',
  'Bimser',
  'OpenText',
  'SUSE',
  'RedHat',
  'ARIS',
  'CodeTwo',
  'Bentley',
  'Adobe'
]);

const renderPartnerFallback = (name: string) => {
  if (PARTNER_ICON_NAMES.has(name)) {
    return <PartnerIcon name={name} />;
  }

  const compactName = name.replace(/\.(de|ai|com)$/i, '');
  return (
    <div className="flex h-full w-full items-center justify-center px-2 text-center">
      <span className="text-lg sm:text-[1.35rem] font-black uppercase tracking-[0.12em] leading-tight text-slate-700 dark:text-white/90">
        {compactName}
      </span>
    </div>
  );
};

const Partners: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.home.sections.partners;
  const partners: Partner[] = section.items;

  return (
    <section id="partners" className="py-24 bg-slate-50 dark:bg-[#080808] border-y border-slate-200 dark:border-white/[0.05] overflow-hidden transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">{section.title}</h2>
          <div className="h-px w-24 bg-sap-gold/50 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {partners.map((partner) => (
            <div 
              key={partner.name} 
              className="group h-32 p-8 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-white/5 hover:border-sap-gold dark:hover:border-sap-gold transition-all duration-500 hover:bg-white dark:hover:bg-white/[0.02] shadow-sm hover:shadow-xl"
              title={partner.name}
            >
              <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:text-sap-gold dark:group-hover:text-sap-gold transition-all duration-500 grayscale group-hover:grayscale-0">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  renderPartnerFallback(partner.name)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
