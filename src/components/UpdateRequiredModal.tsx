import React from 'react';
import { Download, AlertTriangle, Disc3, Sparkles } from 'lucide-react';
import { VersionConfig, CURRENT_APP_VERSION } from '../services/versionService';

interface UpdateRequiredModalProps {
  config: VersionConfig | null;
}

export const UpdateRequiredModal: React.FC<UpdateRequiredModalProps> = ({ config }) => {
  const updateUrl = config?.update_url || 'https://github.com/ashirvadraj/sunehre-geet/releases/latest';

  const handleUpdate = () => {
    window.open(updateUrl, '_system');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-gradient-to-b from-[#0e071c] via-[#150a2b] to-[#07030e] text-white select-none">
      {/* Background glow effects */}
      <div className="absolute w-72 h-72 rounded-full bg-retro-gold/15 blur-3xl pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none -bottom-10" />

      <div className="relative w-full max-w-sm bg-[#1b1033] border-2 border-retro-gold/40 rounded-3xl p-6 shadow-2xl shadow-black text-center flex flex-col items-center space-y-5">
        {/* Animated App Disc Icon */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-600 p-1 flex items-center justify-center shadow-xl shadow-retro-gold/20">
          <div className="w-full h-full rounded-full bg-[#120a22] flex items-center justify-center">
            <Disc3 className="w-10 h-10 text-retro-gold animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-black shadow-lg">
            <AlertTriangle className="w-4 h-4 fill-black" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-retro-gold/15 text-retro-gold text-[10px] font-extrabold uppercase tracking-widest border border-retro-gold/30">
            <Sparkles className="w-3 h-3" />
            <span>वर्शन अपडेट (VERSION UPDATE)</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-retro-cream pt-1">
            ऐप अपडेट आवश्यक है
          </h2>
          <p className="text-xs text-retro-gold font-mono">
            Current v{CURRENT_APP_VERSION.toFixed(1)} → Required v{config?.min_supported_version?.toFixed(1) || '50.0'}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/10 text-left">
          <p className="text-xs text-retro-cream/90 leading-relaxed font-sans">
            {config?.message_hindi || 'यह वर्शन पुराना हो चुका है। कृपया संगीत का आनंद लेने के लिए ऐप को अपडेट करें।'}
          </p>
          <p className="text-[11px] text-white/50 leading-relaxed italic">
            {config?.message_english || 'This version is deprecated. Please update to the latest version to continue.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpdate}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-retro-gold via-amber-400 to-amber-500 text-retro-dark font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-retro-gold/25 active:scale-95 transition-all hover:brightness-110"
        >
          <Download className="w-4 h-4" />
          <span>नया वर्शन डाउनलोड करें (Update Now)</span>
        </button>

        <p className="text-[10px] text-white/40">
          सुनेहरे गीत • 100% नि:शुल्क और विज्ञापन-मुक्त
        </p>
      </div>
    </div>
  );
};
