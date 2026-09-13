import React from 'react';
import { Sparkles, ChevronRight, Trophy } from 'lucide-react';

interface WrappedBannerProps {
  onOpenWrapped: () => void;
  periodType?: 'monthly' | 'yearly';
}

export const WrappedBanner: React.FC<WrappedBannerProps> = ({
  onOpenWrapped,
  periodType = 'monthly',
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });

  const HINDI_MONTHS = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  const currentMonthHindi = HINDI_MONTHS[currentMonth] || currentMonthName;

  return (
    <section className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-[#2a1036] via-[#1a0e2e] to-[#0c1626] border border-amber-500/30 shadow-xl group hover:border-amber-500/60 transition-all">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 text-[10px] font-bold tracking-wider uppercase border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>सुनहरे गीत रैप्ड • SUNEHRE GEET WRAPPED</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#FFF4E0] font-serif leading-snug truncate">
            {periodType === 'yearly'
              ? `${currentYear} सुनहरे गीत रैप्ड (Yearly Wrapped)`
              : `${currentMonthHindi} का संगीत सफ़र (${currentMonthName} Wrapped)`}
          </h3>

          <p className="text-[11px] text-amber-100/70 line-clamp-1">
            {periodType === 'yearly'
              ? 'पूरे साल के आपके शीर्ष सदाबहार नगमे, पसंदीदा गायक और संगीत सफ़र!'
              : 'इस महीने के आपके शीर्ष गीत, पसंदीदा गायक और सुनने के कुल पल देखें!'}
          </p>
        </div>

        <button
          onClick={onOpenWrapped}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-200" />
          <span>देखें</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/80" />
        </button>
      </div>
    </section>
  );
};
