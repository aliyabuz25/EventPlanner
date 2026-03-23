
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiConsultantResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { COMPANY_CONFIG } from '../config';
import Logo from './Logo';
import { 
  MessageSquare,
  X,
  Send,
  Sparkles,
  User,
  RotateCcw,
  Bot
} from 'lucide-react';

const SUGGESTIONS = [
  "Migration Services: S/4HANA Upgrade, Cloud Transition, Readiness Assessment",
  "Technical Audit: System Health, Custom Code Check, Security Review"
];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Greetings! I'm FastLane Assistant at ${COMPANY_CONFIG.name}. How can I help you navigate your SAP journey today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    const messageToSend = text.trim();
    if (!messageToSend || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsTyping(true);

    try {
      const response = await getGeminiConsultantResponse(messageToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `My apologies, our specialized consulting systems are briefly offline. Please contact us directly at ${COMPANY_CONFIG.contact.email}.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Greetings! I'm FastLane Assistant at ${COMPANY_CONFIG.name}. How can I help you navigate your SAP journey today?` }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[130] font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-sap-blue rounded-2xl rotate-3 group-hover:rotate-6 transition-transform blur-lg opacity-40 group-hover:opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-white dark:to-slate-100 rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 dark:border-slate-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-sap-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MessageSquare className="w-7 h-7 text-white dark:text-sap-blue relative z-10" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-sap-gold rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-lg z-20"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[min(440px,calc(100vw-1.5rem))] h-[min(78vh,860px)] rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1622]/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col pointer-events-auto animate-in fade-in slide-in-from-bottom-8 origin-bottom-right">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sap-blue/10 text-sap-blue flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sap-blue">KI-AGENT</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">FastLane Assistant</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-sap-blue hover:border-sap-blue/30 transition-all bg-white dark:bg-transparent"
                aria-label="Reset session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all bg-white dark:bg-transparent"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef} 
            className="h-[calc(100%-180px)] overflow-y-auto px-5 py-4 space-y-4 bg-white dark:bg-[#0f1622] scrollbar-hide"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex items-end gap-2 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-sap-blue text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3.5 rounded-[1.5rem] text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-none border-transparent' 
                      : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border-slate-100 dark:border-white/5 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex items-end gap-2 max-w-[92%]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-sap-blue text-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="p-3.5 rounded-[1.5rem] rounded-bl-none shadow-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 flex items-center space-x-1.5 h-11">
                    <span className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-sap-blue rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Area (Fixed 180px height) */}
          <div className="h-[180px] border-t border-slate-200 dark:border-white/10 bg-slate-50/95 dark:bg-[#131b28]/95 px-5 py-4 shrink-0">
            <div className="flex flex-wrap gap-2 mb-3 h-16 overflow-y-auto scrollbar-hide content-start">
              {SUGGESTIONS.map((suggestion) => (
                <button 
                  key={suggestion}
                  type="button" 
                  onClick={() => handleSend(suggestion)}
                  disabled={isTyping}
                  className="px-3 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 hover:border-sap-blue hover:text-sap-blue transition-all disabled:opacity-50 text-left line-clamp-1 h-8"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask query or describe technical details..." 
                className="w-full bg-white dark:bg-[#0e1621] border border-slate-200 dark:border-white/10 rounded-3xl py-4 pl-5 pr-16 focus:outline-none focus:border-sap-blue focus:ring-4 focus:ring-sap-blue/10 transition-all text-sm text-slate-800 dark:text-white resize-none h-20 shadow-sm scrollbar-hide"
              ></textarea>
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="absolute right-2.5 top-2.5 p-3 bg-sap-blue hover:bg-sap-blue/90 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-sap-blue/25"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
