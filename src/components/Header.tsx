import React from 'react';
import { Moon, User, Cloud } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { CURRENT_APP_VERSION } from '../services/versionService';

interface HeaderProps {
  onOpenSleepTimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSleepTimer }) => {
  const { sleepTimer } = useAudio();
  const { user, isLoggedIn, setIsAccountModalOpen } = useAuth();

  return (
    <header className="sticky top-0 z-30 px-4 py-2.5 glass-panel border-b border-retro-gold/20 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-retro-gold via-amber-500 to-amber-700 shadow-md shadow-retro-gold/20 flex-shrink-0">
          <img
            src="/logo.png"
            alt="सुनहरे गीत"
            className="w-full h-full object-cover rounded-[14px]"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg tracking-wide text-[#FFF4E0] font-serif">
              सुनहरे गीत
            </h1>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-retro-gold/25 text-retro-gold font-bold uppercase tracking-wider border border-retro-gold/30">
              v{CURRENT_APP_VERSION.toFixed(1)}
            </span>
          </div>
          <p className="text-[11px] text-retro-gold/80 font-medium tracking-tight">
            सदाबहार गीतों का अनूठा संगम
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">

        {/* Sleep Timer */}
        <button
          onClick={onOpenSleepTimer}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            sleepTimer !== null
              ? 'bg-retro-gold text-retro-dark shadow-md shadow-retro-gold/30'
              : 'bg-white/5 text-retro-cream hover:bg-white/10 border border-white/10'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>{sleepTimer !== null ? `${sleepTimer}m` : 'Timer'}</span>
        </button>

        {/* Google User Profile & Cloud Sync Button */}
        <button
          onClick={() => setIsAccountModalOpen(true)}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${
            isLoggedIn
              ? 'bg-retro-gold/15 text-retro-cream border-retro-gold/40 shadow-md'
              : 'bg-white/5 text-retro-cream hover:bg-white/10 border-white/10'
          }`}
          title={isLoggedIn ? `Google Account: ${user?.name || user?.email}` : 'Google Login & Backup'}
        >
          {isLoggedIn && user ? (
            <>
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover border border-retro-gold flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-retro-gold text-retro-dark text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold max-w-[80px] sm:max-w-[120px] truncate">
                {user.name.split(' ')[0]}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            </>
          ) : (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-retro-gold" />
              <span className="text-xs font-semibold text-retro-gold hidden sm:inline">Login</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
};