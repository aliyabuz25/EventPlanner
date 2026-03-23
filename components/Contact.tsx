
import React, { useState } from 'react';
import { Phone, Mail, Send } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';
import { submitContactForm } from '../services/siteContentService';

const Contact: React.FC = () => {
  const { content } = useSiteContent();
  const company = content.global.company;
  const section = content.pages.home.sections.contact;
  const smtpEnabled = content.global.smtp.enabled;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus(null);
      await submitContactForm({
        ...formData,
        pageUrl: typeof window !== 'undefined' ? window.location.href : '/#contact'
      });
      setStatus({ type: 'success', message: section.form.successMessage });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        details: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : section.form.errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
        <div className="bg-slate-50 dark:bg-[#121212] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-slate-200 dark:border-white/[0.05] transition-all duration-500">
          {/* Left Side: Corporate Info */}
          <div className="lg:w-2/5 p-16 bg-slate-100 dark:bg-[#0a0a0a] relative overflow-hidden flex flex-col justify-between border-r border-slate-200 dark:border-white/[0.05] transition-colors">
            <div className="relative z-10">
              <h2 className="text-sm font-bold text-sap-gold uppercase tracking-[0.2em] mb-4">{section.eyebrow}</h2>
              <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight leading-tight">{section.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-12 text-lg leading-relaxed">
                {section.description}
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-sap-blue/10 rounded-xl flex items-center justify-center text-sap-blue border border-sap-blue/20">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">{section.phoneLabel}</div>
                    <div className="font-bold text-xl text-slate-900 dark:text-white transition-colors">{company.phone}</div>
                    <div className="text-slate-500 text-sm mt-1">{section.phoneMeta}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-sap-blue/10 rounded-xl flex items-center justify-center text-sap-blue border border-sap-blue/20">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">{section.emailLabel}</div>
                    <div className="font-bold text-xl text-slate-900 dark:text-white transition-colors">{company.email}</div>
                    <div className="text-slate-500 text-sm mt-1">{section.emailMeta}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side: Standard SAP-style Form */}
          <div className="lg:w-3/5 p-16 bg-white dark:bg-[#121212] transition-colors">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">{section.form.firstName}</label>
                  <input type="text" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 focus:outline-none focus:border-sap-blue focus:ring-1 focus:ring-sap-blue transition-all text-sm rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" placeholder={section.form.firstNamePlaceholder} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">{section.form.lastName}</label>
                  <input type="text" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 focus:outline-none focus:border-sap-blue focus:ring-1 focus:ring-sap-blue transition-all text-sm rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" placeholder={section.form.lastNamePlaceholder} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">{section.form.email}</label>
                <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 focus:outline-none focus:border-sap-blue focus:ring-1 focus:ring-sap-blue transition-all text-sm rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" placeholder={section.form.emailPlaceholder} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">{section.form.details}</label>
                <textarea rows={4} value={formData.details} onChange={(e) => handleChange('details', e.target.value)} required className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 focus:outline-none focus:border-sap-blue focus:ring-1 focus:ring-sap-blue transition-all resize-none text-sm rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" placeholder={section.form.detailsPlaceholder}></textarea>
              </div>
              {status ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'}`}>
                  {status.message}
                </div>
              ) : null}
              {!smtpEnabled ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  SMTP is not configured yet. Configure it in Core &gt; Global Settings.
                </div>
              ) : null}
              <button type="submit" disabled={isSubmitting || !smtpEnabled} className="w-full sm:w-auto px-10 py-4 bg-sap-blue hover:bg-[#007db8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all rounded-xl shadow-lg flex items-center justify-center space-x-3 group">
                <span>{isSubmitting ? 'Sending...' : section.form.submitText}</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
