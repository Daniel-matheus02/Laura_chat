
import React, { useState } from 'react';
import { ChatConfig } from '../types';

interface SettingsModalProps {
  config: ChatConfig;
  onSave: (config: ChatConfig) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onClose }) => {
  const [url, setUrl] = useState(config.webhookUrl);

  const handleSave = () => {
    onSave({ ...config, webhookUrl: url });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-hidden">
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-[60px]" onClick={onClose} />
      
      {/* 3D Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] overflow-hidden reveal-3d">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"></div>
        
        <div className="p-16">
          <div className="flex items-start gap-8 mb-16">
            <div className="relative group">
               <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all duration-700"></div>
               <div className="relative w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-700">
                <svg className="w-10 h-10 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Laura System</h2>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mt-3">Advanced Encryption Node Sync</p>
            </div>
          </div>
          
          <div className="space-y-12">
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5">
                Target Orchestration Endpoint (Webhook URL)
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl transition-all duration-500 group-focus-within:border-blue-500/40"></div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://n8n.instance.net/webhook-test/..."
                  className="relative w-full bg-transparent rounded-2xl px-8 py-6 text-slate-100 placeholder-slate-700 focus:outline-none font-mono text-sm tracking-tight"
                />
              </div>
            </div>

            <div className="flex gap-6 items-start bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-10">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Security Protocol</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Direct peer-to-peer transmission. The Laura orchestrator requires a <span className="text-white">Chat Trigger</span> node. Response payload must follow strict JSON formatting with top-level <code className="text-cyan-400 font-bold bg-white/5 px-1.5 rounded">"output"</code> field.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-12 px-16 bg-white/[0.02] border-t border-white/5 flex justify-end gap-8 items-center">
          <button
            onClick={onClose}
            className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-16 py-5 bg-white text-slate-950 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            Establish Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
