
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'} reveal-3d`} style={{ animationDuration: '1s' }}>
      <div className={`group relative max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'} transform-gpu`} style={{ transformStyle: 'preserve-3d' }}>
        <div className={`relative px-10 py-7 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border transition-all duration-500 ease-out transform-gpu neural-shimmer ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white border-white/60 rounded-br-lg' 
            : 'bg-white/[0.06] text-white border-white/60 backdrop-blur-3xl rounded-bl-lg'
        } group-hover:translate-y-[-5px] group-hover:translateZ(20px) group-hover:border-white/80`}>
          
          <div className="flex items-center justify-between gap-16 mb-4 border-b border-white/10 pb-4 transform-gpu" style={{ transform: 'translateZ(10px)' }}>
            <span className={`text-[9px] font-black uppercase tracking-[0.5em] ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
              {isUser ? 'Neural Output' : 'Sequence Receive'}
            </span>
            <span className="text-[8px] font-mono opacity-40 tracking-[0.2em] font-bold">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>
          
          <div className="text-[17px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap break-words transform-gpu" style={{ transform: 'translateZ(5px)' }}>
            {message.content}
          </div>
        </div>
        
        {/* Subtle reflection under the bubble */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-blue-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};

export default ChatBubble;
