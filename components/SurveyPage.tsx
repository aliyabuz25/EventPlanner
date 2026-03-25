
import React, { useState } from 'react';
import { ViewType, SolutionId } from '../types';
import ErpAdvisor from './ErpAdvisor';
import { useSiteContent } from '../contexts/SiteContentContext';
import { resolveIcon } from './iconRegistry';
import { 
  Zap, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft,
  Search,
  Bot
} from 'lucide-react';

interface SurveyPageProps {
  onNavigate: (view: ViewType) => void;
}

type Question = {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    icon: React.ElementType;
    scores: Partial<Record<SolutionId, number>>;
  }[];
};

const SurveyPage: React.FC<SurveyPageProps> = ({ onNavigate }) => {
  const { content } = useSiteContent();
  const companyName = content.global.company.name;
  const section = content.pages.survey.sections;
  const [mode, setMode] = useState<'quick' | 'advisor'>('advisor');
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SolutionId | null>(null);
  const questions: Question[] = section.quickQuestions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({
      ...option,
      icon: resolveIcon(option.icon)
    }))
  }));

  const handleOptionSelect = (optionScores: Partial<Record<SolutionId, number>>) => {
    const newScores = { ...scores };
    Object.entries(optionScores).forEach(([key, val]) => {
      newScores[key] = (newScores[key] || 0) + val;
    });
    setScores(newScores);

    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Record<string, number>) => {
    setIsCalculating(true);
    setTimeout(() => {
      let maxScore = -1;
      let topSolution: SolutionId = 'sap-s4hana';

      Object.entries(finalScores).forEach(([key, val]) => {
        if (val > maxScore) {
          maxScore = val;
          topSolution = key as SolutionId;
        }
      });

      setResult(topSolution);
      setIsCalculating(false);
    }, 2000);
  };

  const currentQ = questions[step];

  const getSolutionTitle = (id: SolutionId) => {
    return section.solutionContent[id]?.title || 'Passendes Event-Modul';
  };

  const getSolutionDesc = (id: SolutionId) => {
    return section.solutionContent[id]?.description || `Auf Basis deiner Angaben empfehlen wir das naechstliegende ${companyName}-Modul.`;
  };

  const isAdvisorMode = mode === 'advisor';

  return (
    <div
      className={`bg-sap-paper dark:bg-[#000000] flex flex-col items-center relative overflow-hidden transition-colors duration-500 ${
        isAdvisorMode
          ? 'h-[100svh] pt-24 md:pt-28 pb-4 md:pb-5 justify-start'
          : 'min-h-screen pt-32 pb-20 justify-center'
      }`}
    >
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sap-blue/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sap-gold/10 rounded-full blur-[100px]"></div>
      </div>

      <div
        className={`w-full px-4 md:px-6 lg:px-8 relative z-10 ${
          isAdvisorMode ? 'max-w-[1680px] h-full flex flex-col min-h-0' : 'max-w-[1000px]'
        }`}
      >
        
        {/* Header */}
        <div className={`text-center ${isAdvisorMode ? 'mb-4 md:mb-5 flex-shrink-0' : 'mb-8'}`}>
          <div className="inline-block px-5 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-sap-blue mb-4 shadow-sm">
            {section.badge}
          </div>
          <h1 className={`font-bold text-slate-900 dark:text-white tracking-tight transition-colors ${isAdvisorMode ? 'text-3xl md:text-5xl mb-3' : 'text-4xl md:text-6xl mb-4'}`}>
            {section.title} <span className="text-sap-gold">{section.titleHighlight}</span>
          </h1>
          <p className={`text-slate-600 dark:text-slate-400 max-w-3xl mx-auto transition-colors font-normal ${isAdvisorMode ? 'text-sm md:text-base mb-5' : 'text-lg mb-12'}`}>
            {section.description}
          </p>
          
          {/* Mode Switcher */}
          <div className={`flex justify-center ${isAdvisorMode ? 'mb-0' : 'mb-12'}`}>
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-1.5 rounded-full border border-slate-200 dark:border-white/10 inline-flex shadow-inner">
              <button 
                onClick={() => setMode('quick')}
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 flex items-center ${
                  mode === 'quick' 
                    ? 'bg-sap-blue text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                {section.modeQuick}
              </button>
              <button 
                onClick={() => setMode('advisor')}
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 flex items-center ${
                  mode === 'advisor' 
                    ? 'bg-sap-blue text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 mr-2" />
                {section.modeAdvisor}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {mode === 'quick' ? (
          <div className="bg-white/70 dark:bg-[#121212]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative transition-all duration-500">
            
            {/* Progress Bar */}
            {!result && !isCalculating && (
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-sap-blue to-sap-gold transition-all duration-1000 ease-out"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            )}

            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
              
              {/* CALCULATING STATE */}
              {isCalculating && (
                <div className="text-center animate-in fade-in zoom-in duration-700">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-sap-blue rounded-full animate-spin"></div>
                  <div className="absolute inset-4 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-inner">
                     <Zap className="w-8 h-8 text-sap-blue" />
                  </div>
                </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{section.calculatingTitle}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-normal">{section.calculatingDescription}</p>
                </div>
              )}

              {/* RESULT STATE */}
              {!isCalculating && result && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">{section.recommendationLabel}</h2>
                  <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">{getSolutionTitle(result)}</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
                    {getSolutionDesc(result)}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                      onClick={() => onNavigate(result)}
                      className="px-12 py-5 bg-sap-blue hover:bg-sap-blue/90 text-white font-bold rounded-full shadow-xl hover:shadow-sap-blue/25 transition-all w-full sm:w-auto text-sm uppercase tracking-widest"
                    >
                      {section.viewProductButton}
                    </button>
                    <button 
                      onClick={() => { setResult(null); setStep(0); setScores({}); }}
                      className="px-12 py-5 bg-transparent border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all w-full sm:w-auto text-sm uppercase tracking-widest flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {section.retakeButton}
                    </button>
                  </div>
                </div>
              )}

              {/* QUESTION STATE */}
              {!isCalculating && !result && (
                <div className="animate-in fade-in slide-in-from-right-12 duration-700">
                  <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{currentQ.question}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-normal text-lg">{currentQ.subtitle}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentQ.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(opt.scores)}
                        className="group p-8 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] hover:border-sap-blue hover:shadow-2xl dark:hover:shadow-sap-blue/10 transition-all duration-500 text-left flex flex-col items-center text-center h-full shadow-sm"
                      >
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-sap-blue group-hover:bg-sap-blue/10 transition-all duration-500 mb-6 shadow-inner">
                          <opt.icon className="w-10 h-10" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-sap-blue transition-colors text-lg leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-16 flex justify-center">
                     {step > 0 && (
                       <button 
                         onClick={() => setStep(s => s - 1)}
                         className="text-xs font-bold text-slate-400 hover:text-sap-blue transition-all uppercase tracking-widest flex items-center group"
                       >
                         <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                         {section.backButton}
                       </button>
                     )}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* AI Advisor Mode */
          <div className="animate-in fade-in zoom-in duration-500 flex-1 min-h-0">
            <ErpAdvisor />
          </div>
        )}

      </div>
    </div>
  );
};

export default SurveyPage;
