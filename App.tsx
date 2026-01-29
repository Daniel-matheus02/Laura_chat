
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message, ChatConfig } from './types';
import ChatBubble from './components/ChatBubble';
import SettingsModal from './components/SettingsModal';
import { sendToN8n } from './services/n8nService';

const SparkleSwarm: React.FC<{ 
  containerRef: React.RefObject<HTMLElement | null>, 
  count?: number, 
  sizeRange?: [number, number], 
  opacityMultiplier?: number,
  spread?: number,
  interactiveScale?: number
}> = ({ containerRef, count = 12, sizeRange = [1, 3], opacityMultiplier = 1, spread = 40, interactiveScale = 1 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize to center to avoid starting at 0,0 (left side)
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;
      setMousePos({ x: centerX, y: centerY });
      lastPos.current = { x: centerX, y: centerY };
    }

    const handleMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // STRICT check for "isInside" to control intensity
        const inside = (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        );
        setIsInside(inside);
        
        // Calculate relative position based on viewport
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        // CLAMP position to container bounds so it "follows" but is "limited"
        const clampedX = Math.max(0, Math.min(relX, rect.width));
        const clampedY = Math.max(0, Math.min(relY, rect.height));

        // Calculate velocity based on clamped movement
        const dx = clampedX - lastPos.current.x;
        const dy = clampedY - lastPos.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        setVelocity(Math.min(speed * 0.15, 6)); // Dampened velocity
        
        // Update state
        setMousePos({ x: clampedX, y: clampedY });
        lastPos.current = { x: clampedX, y: clampedY };
      }
    };
    
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [containerRef]);

  const sparkles = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      id: i,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
      size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
      baseOffset: {
        x: (Math.random() - 0.5) * spread * 1.5,
        y: (Math.random() - 0.5) * spread * 1.5,
      },
      lag: 0.1 + (i * 0.05) * (1 / interactiveScale),
      zBase: Math.random() * 20
    }));
  }, [count, spread, sizeRange, interactiveScale]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] transform-gpu" style={{ perspective: '1000px' }}>
      {sparkles.map((s) => {
        // Magnetic pull is always active now because we clamp the mouse position
        const attractionStrength = isInside ? 0.3 : 0.8; // Stronger pull when outside to keep them clustered at edge
        
        const finalX = mousePos.x + (s.baseOffset.x * attractionStrength);
        const finalY = mousePos.y + (s.baseOffset.y * attractionStrength);
        
        // Dynamic Z-depth based on activity
        const finalZ = (isInside ? 30 : 10) + s.zBase + (velocity * 3);

        return (
          <div 
            key={s.id}
            className="absolute bg-white rounded-full sparkle-anim transform-gpu"
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              left: 0,
              top: 0,
              transform: `translate3d(${finalX}px, ${finalY}px, ${finalZ}px)`,
              transition: `transform ${0.6 + s.lag}s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.5s ease`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,0.9), 0 0 ${s.size * 6}px rgba(59, 130, 246, 0.4)`,
              // Ensure visibility even when outside (dimmed but visible)
              opacity: (isInside ? 0.9 : 0.4) * opacityMultiplier
            }}
          ></div>
        );
      })}
    </div>
  );
};

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
  const boxRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const configBtnRef = useRef<HTMLButtonElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    else setIsSettingsOpen(true);

    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    const handleMouseMove = (e: MouseEvent) => {
      setTilt({ 
        x: (e.clientY / window.innerHeight - 0.5) * 0.4, 
        y: (e.clientX / window.innerWidth - 0.5) * -0.4 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return;
    if (!config.webhookUrl) { setIsSettingsOpen(true); return; }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendToN8n(text, config);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Neural sync interrupted. [${error.message}]`, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (newConfig: ChatConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  };

  const lightningPath = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden transition-transform duration-1000 ease-out transform-gpu"
      style={{ 
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, 
        transformStyle: 'preserve-3d'
      }}
    >
      <header 
        ref={headerRef}
        className="relative z-40 flex items-center justify-between px-10 py-5 glass-panel border-b border-white/10 reveal-3d"
        style={{ transform: 'translateZ(60px)' }}
      >
        {/* Unified Header Swarm: Reduced count, smaller size range for subtlety */}
        <SparkleSwarm containerRef={headerRef} count={20} sizeRange={[1, 2]} opacityMultiplier={0.6} spread={150} interactiveScale={1.5} />
        
        <div className="flex items-center gap-6 relative z-10 transform-gpu" style={{ transform: 'translateZ(40px)' }}>
          <div ref={logoRef} className="group relative w-10 h-10 bg-white/[0.1] border border-white/25 rounded-xl flex items-center justify-center shadow-xl overflow-visible transition-all duration-500 hover:scale-110">
            {/* Minimal focal swarm for Logo */}
            <SparkleSwarm containerRef={logoRef} count={6} sizeRange={[1, 1.5]} spread={20} opacityMultiplier={0.8} />
            <svg className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-500 relative z-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[14px] font-black uppercase tracking-[0.6em] text-white leading-none">Laura <span className="text-blue-500 font-bold italic">chat</span></h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-1.5 h-1.5 rounded-full ${config.webhookUrl ? 'bg-blue-400' : 'bg-red-500/60'} animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]`}></span>
              <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-[0.3em]">{config.webhookUrl ? 'ORCHESTRATOR ONLINE' : 'NODE OFFLINE'}</p>
            </div>
          </div>
        </div>

        <button 
          ref={configBtnRef}
          onClick={() => setIsSettingsOpen(true)} 
          className="group relative z-10 px-6 py-3 bg-white/[0.04] border border-white/10 hover:border-white/50 text-white/70 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-[0.35em] hover-lift transform-gpu overflow-visible" 
          style={{ transform: 'translateZ(30px)' }}
        >
          {/* Subtle focal swarm for Configuration */}
          <SparkleSwarm containerRef={configBtnRef} count={5} sizeRange={[1, 1.5]} spread={30} opacityMultiplier={0.5} />
          <span className="relative z-20">Configuration</span>
        </button>
      </header>

      <main ref={scrollRef} className="relative z-20 flex-1 overflow-y-auto custom-scrollbar px-6 md:px-24 py-12 transform-gpu" style={{ transform: 'translateZ(0px)' }}>
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center reveal-3d">
              <div className="mb-14 relative group transform-gpu" style={{ transform: 'translateZ(80px)' }}>
                <div className="absolute -inset-60 bg-blue-600/10 rounded-full blur-[140px] animate-[pulse-energy_12s_infinite]"></div>
                <div ref={boxRef} className="relative w-56 h-56 border border-white/15 rounded-[4.5rem] flex items-center justify-center bg-white/[0.02] backdrop-blur-3xl shadow-[0_50px_120px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-1000 transform hover:scale-105 active:scale-95 group">
                  <SparkleSwarm containerRef={boxRef} count={35} sizeRange={[1, 3]} spread={100} />
                  <svg className="relative z-10 w-28 h-28 pointer-events-none transform scale-125 transition-transform duration-700 group-hover:scale-135" viewBox="0 0 24 24" fill="none">
                    <path d={lightningPath} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" filter="url(#lightning-base-shadow)" />
                    <path d={lightningPath} className="lightning-bolt-anim" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" filter="url(#energy-glow)" />
                  </svg>
                </div>
              </div>
              <h2 className="text-8xl font-extralight text-white mb-6 tracking-[-0.08em] transform-gpu" style={{ transform: 'translateZ(50px)' }}>Laura <span className="font-bold text-blue-500 italic">chat</span></h2>
              <p className="text-slate-400 max-w-sm text-base leading-relaxed mb-16 opacity-75 tracking-tight transform-gpu" style={{ transform: 'translateZ(30px)' }}>Secure neural orchestrator. Direct high-fidelity synchronization with the n8n ecosystem.</p>
              {!config.webhookUrl && <button onClick={() => setIsSettingsOpen(true)} className="px-20 py-7 btn-primary-action text-[12px] font-black uppercase tracking-[0.5em] rounded-2xl shadow-4xl transform hover:scale-110">Link Neural Interface</button>}
            </div>
          ) : (
            <div className="space-y-12 pb-44">{messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}</div>
          )}
          {isLoading && (
            <div className="flex justify-start mb-12 transform-gpu" style={{ transform: 'translateZ(30px)' }}>
              <div className="bg-white/[0.03] border border-white/20 px-8 py-5 rounded-[2rem] rounded-bl-none backdrop-blur-3xl shadow-lg">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full loading-dot" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full loading-dot" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full loading-dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-40 px-10 pb-16 pt-4 transform-gpu" style={{ transform: 'translateZ(100px)' }}>
        <div className="max-w-4xl mx-auto w-full">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="group relative flex items-center transform-gpu">
            <div className="absolute inset-0 bg-white/[0.02] border border-white/15 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl transition-all duration-700 group-focus-within:border-blue-500/50 group-focus-within:bg-white/[0.04] group-hover:border-white/30"></div>
            <input 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              placeholder={config.webhookUrl ? "Establish Context..." : "NODE OFFLINE - CHECK CONFIG"} 
              disabled={isLoading || !config.webhookUrl} 
              className="relative w-full bg-transparent text-white placeholder-slate-600 px-14 py-11 pr-44 focus:outline-none disabled:opacity-30 font-bold text-2xl tracking-tight transition-all duration-500" 
            />
            <div className="absolute right-8">
              <button 
                ref={sendBtnRef} 
                type="submit" 
                disabled={!inputValue.trim() || isLoading || !config.webhookUrl} 
                className="w-20 h-20 btn-primary-action rounded-[2.4rem] flex items-center justify-center shadow-4xl overflow-hidden relative group/send"
              >
                {/* Send Button Swarm: Reduced count and size for less intrusion */}
                <SparkleSwarm containerRef={sendBtnRef} count={12} sizeRange={[1.5, 3]} opacityMultiplier={1.0} spread={50} interactiveScale={2.0} />
                <div className="relative z-10 transform-gpu transition-transform duration-300 group-hover/send:scale-110">
                  {isLoading ? (
                    <svg className="animate-spin h-8 w-8 text-slate-950" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </form>
          <div className="mt-10 flex justify-between items-center px-14 text-[10px] text-slate-700 uppercase tracking-[0.8em] font-black">
            <span className="opacity-50 flex items-center gap-3"><span className="w-2.5 h-2.5 bg-blue-500/60 rounded-full animate-pulse"></span> LAURA VOLUMETRIC v2.3</span>
            <span className="opacity-30">P2P NEURAL CHANNEL ENCRYPTED</span>
          </div>
        </div>
      </footer>

      {isSettingsOpen && <SettingsModal config={config} onSave={updateConfig} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;
