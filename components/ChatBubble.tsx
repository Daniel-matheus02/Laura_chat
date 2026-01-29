
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-12 ${isUser ? 'justify-end' : 'justify-start'} reveal-3d`} style={{ animationDuration: '1.5s' }}>
      <div className={`group relative max-w-[85%] md:max-w-[70%] flex flex-col ${
        isUser ? 'items-end' : 'items-start'
      }`}>
        {/* Subtle Fluid Aura */}
        <div className={`absolute -inset-4 bg-blue-500/0 rounded-[3rem] blur-2xl group-hover:bg-blue-500/[0.03] transition-all duration-1000`}></div>
        
        <div className={`relative px-10 py-8 rounded-[2.5rem] shadow-2xl border transition-all duration-700 ease-out ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white border-blue-400/20 rounded-br-lg' 
            : 'bg-white/[0.03] text-slate-100 border-white/5 backdrop-blur-3xl rounded-bl-lg'
        } group-hover:translate-y-[-2px]`}>
          
          <div className="flex items-center justify-between gap-12 mb-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isUser ? 'text-blue-200' : 'text-slate-600'}`}>
                {isUser ? 'Neural Input' : 'Core Response'}
              </span>
            </div>
            <span className="text-[8px] font-mono opacity-20 tracking-widest uppercase">
              {new Date(message.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          
          <div className="text-[16px] leading-relaxed font-light tracking-tight whitespace-pre-wrap break-words opacity-90">
            {message.content}
          </div>

          {!isUser && (
            <div className="mt-5 flex items-center gap-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <div className="h-px flex-1 bg-white"></div>
              <span className="text-[7px] font-black tracking-[0.8em] uppercase">Verified Flow</span>
            </div>
          )}
        </div>
        
        {/* Soft Fluid Shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-black/40 blur-2xl rounded-full opacity-0 group-hover:opacity-20 transition-all duration-1000 scale-x-75 group-hover:scale-x-100"></div>
      </div>
    </div>
  );
};

export default ChatBubble;
