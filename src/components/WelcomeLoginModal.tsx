import React, { useState } from 'react';
import { Disc, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlaylist } from '../context/PlaylistContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const WelcomeLoginModal: React.FC = () => {
  const {
    isLoggedIn,
    isWelcomeModalOpen,
    dismissWelcome,
    loginWithGoogle,
    isSyncing,
  } = useAuth();

  const { restoreUserData, restoreFromCloud } = usePlaylist();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  if (!isWelcomeModalOpen || isLoggedIn) return null;

  const handleSignInWithEmail = async (emailToUse: string) => {
    const clean = emailToUse.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMsg('कृपया वैध Google / Gmail ईमेल दर्ज करें (e.g. name@gmail.com)');
      return;
    }

    setErrorMsg(null);
    const res = await loginWithGoogle(clean);
    if (res.success) {
      if (res.cloudData && res.cloudData.likedSongIds.length > 0) {
        restoreUserData(res.cloudData.likedSongIds, res.cloudData.playlists, res.cloudData.recentSongIds, res.cloudData.likedSongs);
      } else {
        await restoreFromCloud(clean);
      }
    } else {
      setErrorMsg(res.error || 'Google Sign-In failed. Please try again.');
    }
  };

  const handleButtonClick = async () => {
    setErrorMsg(null);
    if (googleEmail.trim()) {
      await handleSignInWithEmail(googleEmail);
      return;
    }

    // Try auto sign-in via native plugin
    const res = await loginWithGoogle();
    if (res.success) {
      if (res.cloudData && res.cloudData.likedSongIds.length > 0) {
        restoreUserData(res.cloudData.likedSongIds, res.cloudData.playlists, res.cloudData.recentSongIds, res.cloudData.likedSongs);
      }
    } else {
      // If auto-detection fails, expand direct Gmail input
      setShowEmailInput(true);
      setErrorMsg('कृपया अपना Google / Gmail खाता दर्ज करें:');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#2D0916] via-[#1C0810] to-[#0D0407] text-retro-cream rounded-3xl border border-retro-gold/40 shadow-2xl p-6 flex flex-col items-center text-center animate-slide-up">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-600 p-0.5 shadow-2xl shadow-retro-gold/20 mb-3 flex items-center justify-center">
          <div className="w-full h-full bg-[#1C0810] rounded-[14px] flex items-center justify-center">
            <Disc className="w-8 h-8 text-retro-gold animate-spin-slow" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1 mb-5">
          <h2 className="text-xl font-bold font-serif text-retro-cream">
            Welcome to सारेगामा कारवां
          </h2>
          <p className="text-xs text-retro-gold font-medium">
            5,000 क्लासिक्स एवं गीतमाला संग्रह
          </p>
          <p className="text-[11px] text-white/60 max-w-xs pt-1">
            अपने पसंदीदा गीत और प्लेलिस्ट को क्लाउड पर सुरक्षित रखने के लिए Google खाते से जुड़ें।
          </p>
        </div>

        {errorMsg && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Controls */}
        <div className="w-full space-y-3">
          {showEmailInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignInWithEmail(googleEmail);
              }}
              className="space-y-2.5"
            >
              <div className="relative">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0D0407] border border-retro-gold/50 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-retro-gold"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-retro-gold via-amber-400 to-amber-500 text-retro-dark font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Google</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <GoogleSignInButton
              onClick={handleButtonClick}
              disabled={isSyncing}
            />
          )}

          {isSyncing && !showEmailInput && (
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