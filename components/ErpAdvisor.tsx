import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';
import {
  AiExplorerBrief,
  AiExplorerKnowledgeCard,
  AiExplorerOffer,
  getAiExplorerResponse
} from '../services/siteContentService';
import {
  Bot,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Lock,
  MapPin,
  MessageSquare,
  ReceiptText,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  WandSparkles,
  Wrench,
  X,
  CheckCircle,
  Circle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ErpAdvisorProps {
  embedded?: boolean;
  assistantOnly?: boolean;
}

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

const starterPromptsByPhase: Record<string, string[]> = {
  Basisdaten: [
    'Tech-Konferenz in Berlin, 3 Tage, 1.200 pax, Print-on-Demand an 3 Eingängen, 12 Counter.',
    'Corporate Event in München, 1 Tag, 450 pax, klassischer Check-in (vorproduzierte Badges).'
  ],
  Software: [
    'Badge-Druck, Scanning, Lead-Capture für Aussteller, CRM-Integration (Salesforce).',
    'Nur Teilnehmerimport und schneller Check-in, keine Schnittstellen nötig.'
  ],
  Projektmanagement: [
    'Volles PM: Kickoff, 4 Jour fixes, 3 Badge-Layouts und Generalprobe vor Ort.',
    'Standard-Setup, ein Layout, ein Testlauf remote.'
  ],
  Miettechnik: [
    '12 iPads, 4 Badge-Drucker, 15 Handscanner, eigenes LTE-Netzwerk.',
    'Wir haben WLAN. Brauchen nur 4 iPads und 2 Drucker.'
  ],
  Verbrauchsmaterial: [
    'Papier-Badges (klimaneutral) + Bambus-Lanyards für 1.200 pax + 10% Reserve.',
    'Premium PVC-Badges mit doppelter Lochung, 450 Stück + 50 Blanko.'
  ],
  Support: [
    'Extended Support: 2 Techniker vor Ort, doors-open critical, 1 Tag Vorab-Aufbau.',
    'Basic Support reicht (Remote-Helpdesk), Crew macht den Aufbau selbst.'
  ],
  Transport: [
    'Team reist aus Hannover an (2 Nächte Hotel), Technik-Versand per Spedition.',
    'Event ist lokal, keine Übernachtung, Material bringen die Techniker mit.'
  ]
};

const initialMessage = `Guten Tag. Ich bin Ihr FastLane Assistant (Pre-Sales KI-Agent).

Ich führe mit Ihnen ein strukturiertes Angebots-Interview durch, um Ihr Event-Setup (Software, PM, Miettechnik, Verbrauchsmaterial, Support & Logistik) zu erfassen. 

Zusammengefasst generiere ich daraus:
- Ein modulares Event-Briefing JSON
- Eine detaillierte Kostenübersicht inkl. Kalkulationslogiken
- Automatische Angebotsvarianten (Standard / Plus / Premium)
- Annahmen & Constraints

Starten wir mit **Phase A (Event-Basisdaten)**: Wie heißt das Event, wo findet es statt, Datum, erwartete Teilnehmerzahl, Aufbau/Abbau-Zeiten und wie sieht Ihr Check-in-Szenario aus? (Eingänge, Counter, Walk-ins)`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);

const formatPriceValue = (value?: number | null, fallback = 'Preis offen') =>
  typeof value === 'number' ? formatCurrency(value) : fallback;

const LockedPanel: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="rounded-[1.5rem] border border-dashed border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Lock className="w-4 h-4 text-slate-400" />
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</div>
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const ErpAdvisor: React.FC<ErpAdvisorProps> = ({ embedded = false, assistantOnly = false }) => {
  const { content } = useSiteContent();
  const companyName = content.global.company.name;
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: initialMessage }]);
  const [brief, setBrief] = useState<AiExplorerBrief | null>(null);
  const [offer, setOffer] = useState<AiExplorerOffer | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMaximized, setAssistantMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, assistantOpen]);

  const summaryItems = useMemo(
    () => [
      { label: 'KUNDE (PO)', value: brief?.customerName || 'Noch offen', icon: ClipboardList },
      { label: 'EVENTNAME', value: brief?.eventName || 'Noch offen', icon: CalendarDays },
      { label: 'ORT (VENUES)', value: brief?.eventLocation || 'Noch offen', icon: MapPin },
      { label: 'TEILNEHMER', value: brief?.attendees || 'Noch offen', icon: Users },
      { label: 'SZENARIO', value: brief?.checkInScenario || 'Noch offen', icon: WandSparkles },
      { label: 'SUPPORT-LEVEL', value: brief?.supportLevel || 'Noch offen', icon: ShieldCheck }
    ],
    [brief]
  );

  const phases = brief?.phaseOrder ?? ['Basisdaten', 'Software', 'Projektmanagement', 'Miettechnik', 'Verbrauchsmaterial', 'Support', 'Transport'];
  const currentPhaseIndex = Math.max(0, phases.findIndex((phase) => phase === brief?.currentPhase));
  const activePhase = brief?.currentPhase || 'Basisdaten';
  const activeStarterPrompts = starterPromptsByPhase[activePhase] || starterPromptsByPhase.Basisdaten;
  const knowledgeCards: AiExplorerKnowledgeCard[] = offer?.knowledgeCards ?? [];

  const showServiceModules = currentPhaseIndex >= 1;
  const showCostDrivers = currentPhaseIndex >= 2;
  const showPricingOverview = currentPhaseIndex >= 3;
  const showModuleDetails = currentPhaseIndex >= 4;
  const showAssumptions = currentPhaseIndex >= 5;
  const showKnowledgeCards = currentPhaseIndex >= 6;

  const handleReset = () => {
    setMessages([{ role: 'model', text: initialMessage }]);
    setBrief(null);
    setOffer(null);
    setInput('');
    setError(null);
  };

  const handleSend = async (prefill?: string) => {
    const nextText = (prefill ?? input).trim();
    if (!nextText || isTyping) return;

    setError(null);
    if (!prefill) {
      setInput('');
    }

    const nextMessages = [...messages, { role: 'user' as const, text: nextText }];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await getAiExplorerResponse(messages, nextText);
      setMessages((prev) => [...prev, { role: 'model', text: response.text || 'Ich konnte noch keine belastbare Rueckmeldung erzeugen.' }]);
      setBrief(response.brief ?? null);
      setOffer(response.offer ?? null);
      setAssistantOpen(true);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'AI Explorer konnte nicht antworten.';
      setMessages((prev) => [...prev, { role: 'model', text: message }]);
      setError(message);
      setAssistantOpen(true);
    } finally {
      setIsTyping(false);
    }
  };

  const assistantOverlay = (
    <>
      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        className={`fixed bottom-5 right-5 z-[120] w-14 h-14 rounded-full bg-sap-blue text-white shadow-[0_18px_45px_-15px_rgba(0,143,211,0.7)] hover:bg-sap-blue/90 transition-all flex items-center justify-center ${assistantOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      <div
        className={`fixed z-[130] flex items-end gap-5 transition-all duration-300 ${
          assistantMaximized ? 'inset-4 items-stretch justify-end' : 'bottom-5 right-5'
        } ${
          assistantOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        {/* Bound Widget: Live Brief (Left Sidecar) */}
        <div className={`${assistantMaximized ? 'hidden xl:flex flex-1 max-w-[440px] h-full' : 'hidden lg:flex w-[min(380px,calc(100vw-480px))] h-[min(78vh,860px)]'} rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1622]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex-col origin-bottom-right`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03] shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-sap-blue flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              LIVE BRIEF
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-white/10 px-2 py-0.5 rounded-full">
               Auto-Sync
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-[#0e1621] scrollbar-hide">
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Event-Brief & Konzept (JSON)</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Single Source of Truth: Die Parameter aus dem Kundendialog werden fortlaufend strukturiert und veredelt.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white break-words">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 shadow-sm mb-4">
                 <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Strukturierte Datenerfassung</div>
                 <div className="space-y-2.5 mt-3">
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase A — Event-Basisdaten</span><CheckCircle className="w-4 h-4 text-emerald-500"/></div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase B — Software-Konfiguration</span>{currentPhaseIndex >= 1 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase C — Projektmanagement</span>{currentPhaseIndex >= 2 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase D — Miettechnik</span>{currentPhaseIndex >= 3 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase E — Verbrauchsmaterial</span>{currentPhaseIndex >= 4 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase F — Support vor Ort</span>{currentPhaseIndex >= 5 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                    <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600 dark:text-slate-300 font-medium">Phase G — Transport & Reise</span>{currentPhaseIndex >= 6 ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700"/>}</div>
                 </div>
              </div>

              <div className="space-y-4">
                {showPricingOverview ? <div className="rounded-[1.5rem] border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 shadow-sm"><div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Automatische Angebotsvarianten</div><p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 leading-relaxed">Agent erzeugt: Standard (solide) / Plus (Redundanz) / Premium (High-availability) Kalkulation.</p></div> : <LockedPanel title="Angebotsvarianten" description="Wird anhand der Rechenmodelle nach der Erfassung generiert (z.B. Standard / Plus / Premium)." />}
                
                {showModuleDetails ? <div className="rounded-[1.5rem] border border-sap-blue/20 bg-sap-blue/5 p-4 shadow-sm"><div className="text-sm font-semibold text-sap-blue dark:text-blue-400">Regel-Engine & Rechenmodelle</div><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Plausibilitätschecks durchgeführt. Stations-, PM- und Verbrauchskalkulation angewendet (z.B. Teilnehmer × 10% Reserve).</p></div> : <LockedPanel title="Regel-Engine" description="Die Hintergrundkalkulation (Stationsbedarf, Verbrauchsmaterialien) berechnet die Detailpositionen automatisch." />}
                
                {showAssumptions ? <div className="rounded-[1.5rem] border border-orange-200 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/5 p-4 shadow-sm"><div className="text-sm font-semibold text-orange-700 dark:text-orange-400">Risiken & Constraints</div><p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1 leading-relaxed">Vorlaufzeiten, Abhängigkeiten, Constraints (z.B. Internet vor Ort) und offene Punkte dokumentiert.</p></div> : <LockedPanel title="Risiken & Constraints" description="Zusammenfassung von Constraints, offenen Punkten und Annahmen (Assumptions) zum Angebot." />}

                {showKnowledgeCards ? <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4 shadow-sm"><div className="text-sm font-semibold text-slate-900 dark:text-white">Knowledge Cards</div><p className="text-xs text-slate-500 mt-1 leading-relaxed">Modul-Spezifische Empfehlungen und Zusatzinfos (z.B. 'ab 1.500 pax: Backup-Drucker vorausgesetzt').</p></div> : <LockedPanel title="Knowledge Cards" description="Berater-Dienstleistungen: Typische Fehlerquellen und Empfehlungen für den Kunden je Leistungsbereich." />}
              </div>
            </div>
          </div>
        </div>

        {/* Existing Chat Widget Container */}
        <div className={`${assistantMaximized ? 'w-full max-w-[min(1040px,100%)] h-full' : 'w-[min(440px,calc(100vw-1.5rem))] h-[min(78vh,860px)]'} rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1622]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sap-blue/10 text-sap-blue flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sap-blue">KI-Agent</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">FastLane Assistant</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAssistantMaximized((current) => !current)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
              aria-label={assistantMaximized ? 'Minimize assistant' : 'Maximize assistant'}
            >
              {assistantMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
              aria-label="Reset session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAssistantOpen(false);
                setAssistantMaximized(false);
              }}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 bg-white dark:bg-[#0f1622] scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-sap-gold text-white' : 'bg-sap-blue text-white'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-4 rounded-[1.75rem] text-[13.5px] leading-relaxed whitespace-pre-wrap shadow-sm transition-all ${
                  msg.role === 'user' 
                    ? 'bg-sap-blue text-white rounded-br-none font-medium' 
                    : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-bl-none'
                }`}>
                  {msg.text}
                  {idx === messages.length - 1 && msg.role === 'model' && !isTyping && activeStarterPrompts && (
                    <div className="mt-5 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Sparkles className="w-3 h-3 text-sap-blue" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Beispielantworten</span>
                      </div>
                      {activeStarterPrompts.slice(0, 2).map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="text-left px-4 py-3.5 rounded-2xl border border-sap-blue/15 bg-white dark:bg-[#0e1621] shadow-sm hover:border-sap-blue hover:shadow-md hover:-translate-y-0.5 text-[12px] leading-[1.6] text-slate-600 dark:text-slate-300 transition-all font-medium group"
                        >
                           <div className="group-hover:text-sap-blue transition-colors">{prompt}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping ? (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-sap-blue text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 px-4 py-3 rounded-[1.5rem] rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          ) : null}

        </div>

        <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#131b28]/95 px-5 py-5 shrink-0">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={brief?.currentQuestion || 'Geben Sie die Antwort fuer den aktuellen Schritt ein...'}
              className="w-full bg-white dark:bg-[#0e1621] border border-slate-200 dark:border-white/10 rounded-3xl py-4.5 pl-6 pr-16 focus:outline-none focus:border-sap-blue focus:ring-4 focus:ring-sap-blue/10 transition-all text-sm text-slate-800 dark:text-white resize-none h-20 shadow-sm scrollbar-hide"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2.5 top-2.5 p-3.5 bg-sap-blue hover:bg-sap-blue/90 text-white rounded-[1.25rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-sap-blue/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );

  if (assistantOnly) {
    return assistantOverlay;
  }

  return (
    <div
      className={`flex flex-col w-full max-w-[1680px] mx-auto bg-white dark:bg-[#0e1621] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-500 ${
        embedded ? 'h-full min-h-0' : 'h-full min-h-0'
      }`}
    >
      <div className="bg-slate-50 dark:bg-[#151d29] p-6 md:p-7 border-b border-slate-200 dark:border-white/5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-sap-blue/10 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
            <Bot className="w-8 h-8 text-sap-blue" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-sap-blue">
              KI-Agent
            </div>
            <h3 className="mt-3 font-bold text-slate-900 dark:text-white text-xl md:text-2xl tracking-tight">AI Explorer Angebotsassistent</h3>
            <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {companyName} AI Explorer fuehrt Schritt fuer Schritt durch die Event-Erfassung, strukturiert die Angebotsmodule und verdichtet daraus eine belastbare Uebersicht.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[180px]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
              <span>{brief?.progressLabel || '0/7 Phasen erfasst'}</span>
              <span>{brief?.progressPercent || 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sap-blue to-sap-gold transition-all duration-500" style={{ width: `${brief?.progressPercent || 0}%` }} />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-sap-blue" />
            Ollama humane:6.1
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)] flex-1 min-h-0">
        <section className="min-h-0 flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0e1621]">
          <div className="px-6 md:px-8 pt-6 pb-4 border-b border-slate-200 dark:border-white/5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {phases.map((phase, index) => {
                const isActive = phase === brief?.currentPhase || (!brief?.currentPhase && index === 0);
                const isDone = index < currentPhaseIndex;
                return (
                  <div key={phase} className={`rounded-[1.25rem] border px-4 py-3 transition-all ${isActive ? 'border-sap-blue bg-sap-blue/5 shadow-sm' : isDone ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${isActive ? 'bg-sap-blue text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300'}`}>{index + 1}</div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{isDone ? 'Erfasst' : isActive ? 'Aktiv' : 'Naechste'}</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{phase}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-5 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Aktuelle Frage</div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-sap-blue/10 text-sap-blue flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-200">{brief?.currentQuestion || initialMessage}</div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-6 md:p-8 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-4 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="bg-[linear-gradient(180deg,#f7fafc_0%,#edf4fb_100%)] dark:bg-[linear-gradient(180deg,#101722_0%,#0b1118_100%)] p-6 md:p-7 min-h-0 overflow-y-auto">
          {showPricingOverview ? (
            <div className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.03] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ReceiptText className="w-4 h-4 text-sap-blue" />
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Kostenuebersicht</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {offer?.hasPricing ? offer?.subtotalFormatted || formatPriceValue(offer?.subtotal) : 'Preis offen'}
              </div>
            </div>
          ) : (
            <LockedPanel title="Kostenuebersicht" description="Die Kostenuebersicht wird erst nach Technik- und Scope-Angaben freigegeben." />
          )}
        </aside>
      </div>

      {assistantOverlay}
    </div>
  );
};

export default ErpAdvisor;
