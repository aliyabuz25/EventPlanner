import React from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';
import { CustomPageView } from '../types';

interface GenericContentPageProps {
  view: CustomPageView;
}

const GenericContentPage: React.FC<GenericContentPageProps> = ({ view }) => {
  const { content } = useSiteContent();
  const page = content.customPages.find((item) => item.view === view);

  if (!page) {
    return <div className="pt-40 pb-24 text-center text-slate-700 dark:text-white">Page not found.</div>;
  }

  const isVideo = page.hero.mediaType === 'video';

  return (
    <div className="bg-sap-paper dark:bg-[#050505] pt-28 pb-24 transition-colors duration-500">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-sap-gold mb-4">{page.hero.eyebrow}</div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">{page.hero.title}</h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{page.hero.description}</p>
          </div>
          <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#111]">
            {page.hero.mediaUrl ? (
              isVideo ? (
                <video src={page.hero.mediaUrl} poster={page.hero.mediaPoster} controls className="w-full h-full min-h-[320px] object-cover bg-black" />
              ) : (
                <img src={page.hero.mediaUrl} alt={page.title} className="w-full h-full min-h-[320px] object-cover" />
              )
            ) : (
              <div className="min-h-[320px] flex items-center justify-center text-slate-400">No media selected</div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="max-w-4xl">
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">{page.excerpt}</p>
          </div>
          <div className="grid gap-8">
            {page.sections.map((section, index) => (
              <section key={`${page.slug}-${index}`} className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] p-8 lg:p-10 shadow-sm">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">{section.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericContentPage;
