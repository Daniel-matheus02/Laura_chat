
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} message-entrance`}>
      <div className={`group relative max-w-[80%] md:max-w-[70%] transition-all duration-500 hover:scale-[1.01] ${
        isUser ? 'items-end' : 'items-start'
      }`}>
        {/* Subtle shadow layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className={`relative px-7 py-5 rounded-3xl glass-card ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-400/20' 
            : 'bg-slate-900/40 text-slate-100 border-white/5'
        }`}>
          <div className="flex items-center justify-between gap-6 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isUser ? 'bg-blue-200' : 'bg-blue-500 animate-pulse'}`}></div>
              <span className={`text-[10px] font-extrabold uppercase tracking-[0.25em] ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                {isUser ? 'Client Node' : 'Orchestration Engine'}
              </span>
            </div>
            <span className="text-[9px] font-mono opacity-30 tracking-tighter">
              {new Date(message.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          
          <div className="text-[15px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        {/* 3D Floor Shadow */}
        <div className="mt-2 h-1 w-full bg-black/20 blur-md rounded-full transform scale-x-90 opacity-50"></div>
      </div>
    </div>
  );
};

export default ChatBubble;
