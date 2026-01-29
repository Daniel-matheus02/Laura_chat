
import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatConfig } from './types';
import ChatBubble from './components/ChatBubble';
import SettingsModal from './components/SettingsModal';
import { sendToN8n } from './services/n8nService';

const STORAGE_KEY_CONFIG = 'n8n_chat_config';
const STORAGE_KEY_MESSAGES = 'n8n_chat_messages';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    webhookUrl: '',
    sessionId: `SESS-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
  });

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      setIsSettingsOpen(true);
    }

    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      // Drastically reduced tilt factor for a more stable/expensive feel
      const x = (clientY / window.innerHeight - 0.5) * 2;
      const y = (clientX / window.innerWidth - 0.5) * -2;
      setTilt({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return;
    if (!config.webhookUrl) {
      setIsSettingsOpen(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendToN8n(text, config);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Operational Link severed. Network diagnostics required. [${error.message}]`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (newConfig: ChatConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  };

  return (
    <div 
      className="flex flex-col h-screen bg-transparent overflow-hidden font-sans selection:bg-blue-500/30 transition-transform duration-700 ease-out"
      style={{ 
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Dynamic Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between px-12 py-8 glass-panel border-b border-white/5 reveal-3d">
        <div className="flex items-center gap-6">
          <div className="group relative">
            <div className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-700"></div>
            <div className="relative w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
               <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.5em] text-white/90">
              Enterprise Orchestration <span className="ml-2 text-[9px] text-blue-400 opacity-60 font-mono tracking-tight">NODE-01</span>
            </h1>
            <div className="flex items-center gap-2.5 mt-2">
              <span className={`w-1.5 h-1.5 rounded-full ${config.webhookUrl ? 'bg-blue-400 shadow-[0_0_10px_#38bdf8]' : 'bg-red-500'}`}></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">
                {config.webhookUrl ? 'Tunnel Connection Secured' : 'Awaiting Authentication Endpoint'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="group relative px-8 py-3.5 bg-white text-slate-950 rounded-xl transition-all duration-700 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-100"
          >
            System Config
          </button>
        </div>
      </header>

      {/* Primary Interaction Environment */}
      <main 
        ref={scrollRef}
        className="relative z-20 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-24 py-16"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center reveal-3d">
              {/* ENERGY SPARKLE & LIGHTNING CORE */}
              <div className="mb-14 relative group">
                {/* Slowed energy pulse */}
                <div className="absolute -inset-32 bg-blue-500/5 rounded-full blur-[120px] animate-[pulse-energy_8s_infinite]"></div>
                
                {/* 3D Static Glass Core (Rotation removed per request) */}
                <div className="relative w-48 h-48 border border-white/5 rounded-[4rem] flex items-center justify-center bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-[4rem]"></div>
                </div>

                {/* THE LIGHTNING & SPARKLING ELEMENTS */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Lightning SVG - Animation speed controlled in CSS via lightning-bolt class */}
                  <svg className="w-24 h-24 text-blue-400 filter drop-shadow-[0_0_20px_#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path className="lightning-bolt" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  
                  {/* Floating Sparkles - Slowed down delay/duration */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-[sparkle-flicker_4s_infinite]"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 4}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <h2 className="text-6xl font-extralight text-white mb-8 tracking-[-0.06em] leading-none">
                Interface <span className="font-bold text-blue-500">Initialized</span>.
              </h2>
              <p className="text-slate-500 max-w-lg text-base leading-relaxed mb-12 font-medium tracking-tight opacity-80">
                Direct neural-link to your n8n automation cluster. All packets are encrypted via high-grade TLS 1.3 protocol.
              </p>
              
              {!config.webhookUrl && (
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-14 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.5em] rounded-2xl transition-all shadow-lg active:scale-95"
                >
                  Establish Link
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8 pb-32">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start mb-12 reveal-3d">
              <div className="bg-white/[0.03] border border-white/5 px-10 py-8 rounded-[2.5rem] rounded-bl-none shadow-2xl backdrop-blur-2xl">
                <div className="flex gap-4">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.6s] duration-1000"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s] duration-1000"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce duration-1000"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="relative z-30 px-12 pb-16 pt-4">
        <div className="max-w-4xl mx-auto w-full">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="group relative flex items-center"
          >
            <div className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl transition-all duration-1000 group-focus-within:border-blue-500/40"></div>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.webhookUrl ? "Input directive sequence..." : "Terminal Offline - Auth Required"}
              disabled={isLoading || !config.webhookUrl}
              className="relative w-full bg-transparent text-slate-100 placeholder-slate-700 px-12 py-8 pr-32 focus:outline-none disabled:opacity-30 font-semibold text-xl tracking-tight"
            />
            
            <div className="absolute right-5">
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || !config.webhookUrl}
                className="w-16 h-16 bg-white text-slate-950 disabled:bg-white/5 disabled:text-slate-800 rounded-2xl flex items-center justify-center transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl"
              >
                {isLoading ? (
                   <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex justify-between items-center px-10 text-[9px] text-slate-800 uppercase tracking-[0.5em] font-black">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></span> Cluster Online v4.3.1</span>
            <span className="opacity-40">System Architecture: High-Availability</span>
          </div>
        </div>
      </footer>

      {isSettingsOpen && (
        <SettingsModal 
          config={config} 
          onSave={updateConfig} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
