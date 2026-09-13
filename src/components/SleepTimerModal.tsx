import React from 'react';
import { Moon, X, Check } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimer, setSleepTimerDuration } = useAudio();

  if (!isOpen) return null;

  const timerOptions = [
    { label: 'Turn Off Timer', minutes: null },
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '45 Minutes', minutes: 45 },
    { label: '60 Minutes (1 Hour)', minutes: 60 },
    { label: '90 Minutes (1.5 Hours)', minutes: 90 },
  ];

  const handleSelect = (minutes: number | null) => {
    setSleepTimerDuration(minutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel bg-[#150f24] rounded-2xl p-5 border border-retro-gold/30 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-retro-gold" />
            <h3 className="font-serif font-bold text-lg text-retro-cream">Sleep Timer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-retro-muted hover:text-white bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-retro-muted mb-4">
          Music playback will automatically stop after the selected duration. Perfect for night listening.
        </p>

        <div className="space-y-2">
          {timerOptions.map((opt, idx) => {
            const isSelected = sleepTimer === opt.minutes;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt.minutes)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-retro-gold text-retro-dark font-bold shadow-md shadow-retro-gold/20'
                    : 'bg-white/5 text-retro-cream hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
