
import React from 'react';
import { SolutionId } from '../types';
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

interface SolutionDetailPageProps {
  id: SolutionId;
}

const SolutionDetailPage: React.FC<SolutionDetailPageProps> = ({ id }) => {
  const { content } = useSiteContent();
  const company = content.global.company;
  const ui = content.global.solutionDetailUi;
  const data = content.solutionDetails[id];

  if (!data) return <div className="pt-40 text-center text-slate-800 dark:text-white">{ui.notFoundText}</div>;

  const transformDescription = ui.transformDescriptionTemplate
    .replace('{company}', company.name)
    .replace('{solution}', data.title);

  return (
    <div className="pt-40 pb-32 bg-sap-paper dark:bg-[#000000] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
        {/* Solution Hero */}
        <div className="mb-32">
          <div className="text-sap-gold font-bold uppercase tracking-[0.2em] text-xs mb-4">{data.category}</div>
          <h1 className="text-5xl sm:text-8xl font-bold mb-8 tracking-tight text-slate-900 dark:text-white leading-[1.05] transition-colors">
            {data.title}
          </h1>
          <p className="text-2xl sm:text-3xl text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed font-normal mb-12 transition-colors">
            {data.intro}
          </p>
          <a href={data.ctaHref} className="group relative inline-block px-10 py-5 bg-sap-blue text-white font-bold text-sm rounded-full hover:bg-sap-blue/90 transition-all shadow-xl overflow-hidden">
            <span className="relative z-10 flex items-center">
              {data.ctaText}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </a>
        </div>

        {/* Details Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-32">
          {/* Key Capabilities */}
          <div className="bg-slate-50 dark:bg-[#111] p-12 border border-slate-200 dark:border-white/[0.08] rounded-[3rem] shadow-xl dark:shadow-sm transition-colors">
            <div className="flex items-center space-x-4 mb-10">
              <Sparkles className="w-8 h-8 text-sap-gold" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{ui.capabilitiesTitle}</h2>
            </div>
            <ul className="space-y-8">
              {data.features.map((feature, idx) => (
                <li key={idx} className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-sap-gold/10 border border-sap-gold/20 flex items-center justify-center text-sap-gold flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg font-bold leading-relaxed transition-colors">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategic Benefits */}
          <div className="bg-slate-50 dark:bg-[#111] p-12 border border-slate-200 dark:border-white/[0.08] rounded-[3rem] shadow-xl dark:shadow-sm transition-colors">
            <div className="flex items-center space-x-4 mb-10">
              <ShieldCheck className="w-8 h-8 text-sap-blue" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{ui.benefitsTitle}</h2>
            </div>
            <ul className="space-y-8">
              {data.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-sap-blue/10 border border-sap-blue/20 flex items-center justify-center text-sap-blue flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg font-bold leading-relaxed transition-colors">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lower Banner */}
        <div className="p-16 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-[3rem] text-center shadow-xl dark:shadow-sm transition-colors">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors">{ui.transformTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 text-xl leading-relaxed font-normal transition-colors">
            {transformDescription}
          </p>
          <div className="flex justify-center flex-wrap gap-6">
            <a href={ui.primaryButtonHref} className="px-10 py-4 bg-sap-gold text-white font-bold text-sm rounded-full hover:bg-sap-gold/90 transition-all shadow-lg">
              {ui.primaryButtonText}
            </a>
            <a href={ui.secondaryButtonHref} className="px-10 py-4 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              {ui.secondaryButtonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetailPage;
