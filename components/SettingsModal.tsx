
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        
        <div className="p-12">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3">
              <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Core Config</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">System Integration Parameters</p>
            </div>
          </div>
          
          <div className="space-y-10">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                Production Webhook Node
              </label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://n8n.your-enterprise.com/webhook/..."
                  className="relative w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-mono text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-8">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Implementation Schema</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                The orchestrator expects a <span className="text-white">POST</span> endpoint. Ensure your n8n workflow returns a valid JSON response containing the <code className="bg-white/5 px-2 py-0.5 rounded text-cyan-400">output</code> key. Default cross-origin policies apply.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-10 px-12 bg-black/40 border-t border-white/5 flex justify-end gap-6">
          <button
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-12 py-4 bg-white hover:bg-slate-200 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_15px_30px_rgba(255,255,255,0.05)] active:scale-95"
          >
            Sync Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
