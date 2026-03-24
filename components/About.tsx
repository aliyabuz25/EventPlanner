
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

interface AboutProps {
  onReadMore?: () => void;
}

const About: React.FC<AboutProps> = ({ onReadMore }) => {
  const { content } = useSiteContent();
  const about = content.pages.home.sections.about;

  return (
    <section id="about" className="py-24 bg-sap-paper dark:bg-dark-base transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="w-full lg:w-1/2">
            <div className="text-sap-gold font-semibold uppercase tracking-wide text-xs mb-3">{about.eyebrow}</div>
            <h2 className="text-4xl sm:text-5xl font-semibold mb-8 leading-tight tracking-tight text-slate-900 dark:text-dark-text-primary transition-colors">{about.title}</h2>
            <div className="space-y-6 text-slate-600 dark:text-dark-text-secondary text-lg leading-relaxed font-normal transition-colors">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4">
               {about.badges.map((badge) => (
                 <div key={badge} className="flex items-center space-x-3 bg-white dark:bg-dark-elevated/40 border border-slate-200 dark:border-white/5 px-6 py-3 rounded-full shadow-sm dark:shadow-none transition-all">
                    <CheckCircle2 className="w-5 h-5 text-sap-gold" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-dark-text-primary tracking-wide">{badge}</span>
                 </div>
               ))}
            </div>
            
            <div className="mt-10">
              <a
                href={about.buttonHref}
                onClick={onReadMore}
                className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-sap-gold dark:hover:bg-sap-gold hover:text-white dark:hover:text-white transition-all text-sm font-medium rounded-full shadow-md"
              >
                {about.buttonText}
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {about.cards.map((card, index) => (
              <div key={card.label} className={`p-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:shadow-lg dark:hover:bg-white/[0.04] transition-all rounded-3xl group relative overflow-hidden shadow-sm ${index % 2 === 1 ? 'sm:mt-12' : ''}`}>
                <div className="text-5xl font-bold mb-2 group-hover:text-sap-gold transition-colors text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                <div className="text-sm text-slate-500 font-medium group-hover:text-sap-gold/80 transition-colors">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
