
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
        content: `Critical Error: Workflow communication severed. [${error.message}]`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Executing system clear. Proceed with archival?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    }
  };

  const updateConfig = (newConfig: ChatConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Global Header */}
      <header className="relative z-30 flex items-center justify-between px-10 py-6 premium-blur border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center transform rotate-2 group-hover:rotate-0 transition-all duration-500 shadow-2xl">
              <svg className="w-7 h-7 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
              ORCHESTRATOR <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400 font-mono tracking-normal">v4.0.0</span>
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${config.webhookUrl ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-red-500'}`}></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">System Status: {config.webhookUrl ? 'Operational' : 'Input Required'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleClearChat}
            className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-500 border border-transparent hover:border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="group relative flex items-center gap-3 px-6 py-3 bg-white text-slate-950 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95"
          >
            Configuration
          </button>
        </div>
      </header>

      {/* Primary Interaction Space */}
      <main 
        ref={scrollRef}
        className="relative z-20 flex-1 overflow-y-auto custom-scrollbar px-6 py-12 md:px-20"
      >
        <div className="max-w-5xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
              <div className="mb-12 relative group">
                <div className="absolute -inset-8 bg-blue-600/10 rounded-full blur-[60px] group-hover:bg-blue-600/20 transition-all duration-700"></div>
                <div className="w-32 h-32 border border-white/10 rounded-[3rem] flex items-center justify-center transform rotate-6 hover:rotate-0 transition-all duration-1000 bg-slate-900/50 backdrop-blur-xl floating-ui">
                  <svg className="w-14 h-14 text-slate-600 group-hover:text-blue-500 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl font-extralight text-white mb-6 tracking-[-0.03em] leading-tight">
                Welcome to the <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Execution Interface.</span>
              </h2>
              <p className="text-slate-500 max-w-lg text-base leading-relaxed mb-12 font-medium">
                Establish a secure link with your n8n workflows. All commands are processed through your private automation layer.
              </p>
              {!config.webhookUrl && (
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:scale-105 active:scale-95"
                >
                  Link Webhook Node
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-20">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start mb-12 animate-fade-in-up">
              <div className="bg-slate-900/60 border border-white/5 px-8 py-6 rounded-3xl rounded-bl-none shadow-2xl backdrop-blur-2xl">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* High-Performance Input Terminal */}
      <footer className="relative z-30 p-10 pb-12 bg-slate-950/40 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-5xl mx-auto w-full">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="group relative flex items-center"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.webhookUrl ? "Transmit directive..." : "System locked - check config..."}
              disabled={isLoading || !config.webhookUrl}
              className="relative w-full bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-600 rounded-[1.8rem] px-8 py-6 pr-24 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all disabled:opacity-30 font-semibold text-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />
            
            <div className="absolute right-5 flex items-center">
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || !config.webhookUrl}
                className="w-14 h-14 bg-white text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl group-hover:shadow-white/10"
              >
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex justify-center items-center gap-10 text-[9px] text-slate-700 uppercase tracking-[0.5em] font-black">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
              <span>Encrypted Protocol AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
              <span>Latency: 24ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
              <span>Direct n8n Bridge</span>
            </div>
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
