
import React from 'react';
import { ViewType } from '../types';
import Logo from './Logo';
import { useSiteContent } from '../contexts/SiteContentContext';

interface FooterProps {
  setView?: (view: ViewType) => void;
  theme?: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ setView, theme = 'light' }) => {
  const { content } = useSiteContent();
  const currentYear = new Date().getFullYear();
  const company = content.global.company;
  const socialLinks = content.global.socialLinks;

  return (
    <footer className="bg-sap-paper dark:bg-[#050505] border-t border-slate-300 dark:border-white/[0.12] py-20 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <button 
              onClick={() => {
                setView?.('home');
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="group focus:outline-none flex items-center mb-8"
              aria-label={`${company.name} Home`}
            >
               <Logo theme={theme} className="h-12 w-auto" />
            </button>
            <p className="text-slate-600 dark:text-slate-500 max-w-lg leading-relaxed mb-10 text-lg font-normal transition-colors">
              {content.pages.home.sections.footerSummary}
            </p>
            <div className="flex space-x-8 opacity-75 hover:opacity-100 transition-all duration-300 text-slate-900 dark:text-white">
               {socialLinks.map(social => (
                 <a key={social.name} href={social.href} className="text-sm font-bold tracking-wide hover:text-sap-gold">{social.name}</a>
               ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-8 transition-colors">
              {content.navigation.footer.ecosystemLabel}
            </h4>
            <ul className="space-y-4 text-slate-600 dark:text-slate-500 text-sm font-medium transition-colors">
              {content.navigation.footer.ecosystemLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={() => link.view && setView?.(link.view)} className="hover:text-sap-gold transition-colors text-left">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-8 transition-colors">
              {content.navigation.footer.corporateLabel}
            </h4>
            <ul className="space-y-4 text-slate-600 dark:text-slate-500 text-sm font-medium transition-colors">
              {content.navigation.footer.corporateLinks.map((link) => (
                <li key={link.label}>
                  {link.view ? (
                    <button onClick={() => setView?.(link.view!)} className="hover:text-sap-gold transition-colors text-left">
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.href} className="hover:text-sap-gold transition-colors">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-300 dark:border-white/[0.12] flex flex-col md:flex-row justify-between items-center text-sm text-slate-600 dark:text-slate-400 font-bold transition-colors">
          <div className="flex flex-col md:flex-row md:space-x-10 space-y-3 md:space-y-0 text-center md:text-left">
            <span>&copy; {currentYear} {company.fullName}.</span>
            <span>{company.phone}</span>
            <span>{company.email}</span>
          </div>
          <div className="mt-6 md:mt-0 opacity-80">{company.sapPartnerLevel}</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
