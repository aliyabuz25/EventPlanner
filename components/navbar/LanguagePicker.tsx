
import React, { useState, useRef, useEffect } from 'react';
import { useSiteContent, FrontendLocale } from '../../contexts/SiteContentContext';
import { ChevronDown, Check } from 'lucide-react';
import { CircleFlag } from 'react-circle-flags';

interface LanguageOption {
  value: FrontendLocale;
  label: string;
  flagCode: string;
}

const CircleFlagIcon = CircleFlag as React.ComponentType<any>;

const LanguagePicker: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { 
    locale, 
    setLocale, 
    customLocaleCode, 
    customLocaleLabel, 
    customLocaleFlag,
    isTranslatingLocale, 
    translationJob 
  } = useSiteContent();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: LanguageOption[] = [
    { value: 'de', label: 'Deutsch', flagCode: 'de' },
    { value: 'en', label: 'English', flagCode: 'gb' },
  ];

  if (customLocaleCode) {
    options.push({
      value: 'custom',
      label: customLocaleLabel ?? customLocaleCode.toUpperCase(),
      flagCode: customLocaleFlag.toLowerCase()
    });
  }

  const currentOption = options.find(opt => opt.value === locale) || options[0];

  const handleSelect = (value: FrontendLocale) => {
    setLocale(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2.5 rounded-full border border-slate-300 dark:border-white/10 
          bg-white/90 dark:bg-[#0b0b0b]/90 text-slate-800 dark:text-white backdrop-blur-md 
          shadow-sm transition-all duration-300 hover:border-slate-400 dark:hover:border-white/20
          hover:shadow-md active:scale-[0.98] focus:outline-none
          ${compact ? 'h-9 px-3 text-[12px]' : 'h-10 px-4 text-[13px]'}
        `}
        aria-label="Select Language"
      >
        <div className="flex shrink-0 shadow-sm rounded-full overflow-hidden border border-black/5 dark:border-white/10 w-5 h-5">
          <CircleFlagIcon countryCode={currentOption.flagCode} height="20" />
        </div>
        
        {!compact && <span className="font-semibold tracking-tight">{currentOption.label}</span>}
        
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
        
        {isTranslatingLocale && translationJob?.target && (
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sap-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sap-gold shadow-sm"></span>
          </div>
        )}
      </button>

      {isOpen && (
        <div 
          className={`
            absolute top-full mt-2 right-0 min-w-[170px] overflow-hidden rounded-2xl
            border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0b0b]/95 
            backdrop-blur-xl shadow-2xl z-[300] dropdown-animate-in
          `}
        >
          <div className="p-1.5">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[13px]
                  transition-all duration-200 group
                  ${locale === option.value 
                    ? 'bg-slate-100 dark:bg-white/10 text-slate-950 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex shrink-0 shadow-sm rounded-full overflow-hidden border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform w-5 h-5">
                    <CircleFlagIcon countryCode={option.flagCode} height="20" />
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
                {locale === option.value && (
                  <Check className="w-4 h-4 text-sap-gold" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
          
          {isTranslatingLocale && translationJob?.target && (
            <div className="px-4 py-3 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-sap-gold"></span>
                  Syncing {translationJob.target.toUpperCase()}
                </span>
                <span className="text-[11px] font-bold text-sap-gold">
                  {Math.max(1, translationJob.progress)}%
                </span>
              </div>
              <div className="h-1 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sap-gold transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(1, translationJob.progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguagePicker;
