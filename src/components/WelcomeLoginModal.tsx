import React, { useState } from 'react';
import { Disc, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlaylist } from '../context/PlaylistContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const WelcomeLoginModal: React.FC = () => {
  const {
    isLoggedIn,
    isWelcomeModalOpen,
    dismissWelcome,
    loginWithGoogle,
    syncNow,
    isSyncing,
  } = useAuth();

  const { likedSongIds, favorites, playlists, recentSongIds, restoreUserData, restoreFromCloud } = usePlaylist();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isWelcomeModalOpen || isLoggedIn) return null;

  const handleContinueWithGoogle = async () => {
    setErrorMsg(null);
    const res = await loginWithGoogle();
    if (res.success) {
      if (res.cloudData && res.cloudData.likedSongIds.length > 0) {
        restoreUserData(res.cloudData.likedSongIds, res.cloudData.playlists, res.cloudData.recentSongIds, res.cloudData.likedSongs);
      } else {
        await restoreFromCloud(res.cloudData?.user?.email);
      }
    } else {
      setErrorMsg(res.error || 'Google Authentication failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1e1236] via-[#140b26] to-[#0c0618] text-retro-cream rounded-3xl border border-retro-gold/40 shadow-2xl p-7 flex flex-col items-center text-center animate-slide-up">
        {/* App Logo */}
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-600 p-0.5 shadow-2xl shadow-retro-gold/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-[#120a22] rounded-[14px] flex items-center justify-center">
            <Disc className="w-9 h-9 text-retro-gold animate-spin-slow" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5 mb-6">
          <h2 className="text-xl font-bold font-serif text-retro-cream">
            Welcome to सुनहरे गीत
          </h2>
          <p className="text-xs text-retro-gold font-medium">
            Your personal music player
          </p>
          <p className="text-[11px] text-white/50 max-w-xs pt-1">
            Connect your Google account to automatically backup and sync your playlists and favorite songs across all your devices.
          </p>
        </div>

        {errorMsg && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Official Continue with Google Button */}
        <div className="w-full space-y-4">
          <GoogleSignInButton
            onClick={handleContinueWithGoogle}
            disabled={isSyncing}
          />

          {isSyncing && (
            <div className="flex items-center justify-center gap-2 text-xs text-retro-gold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to Google Account...</span>
            </div>
          )}

          {/* Continue without account (Guest mode) */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={dismissWelcome}
              className="w-full py-2.5 text-xs text-white/60 hover:text-white transition-colors font-medium rounded-xl hover:bg-white/5 active:scale-98"
            >
              Continue without account (Guest Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};