import React, { useState } from 'react';
import {
  X,
  Check,
  Cloud,
  LogOut,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlaylist } from '../context/PlaylistContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isLoggedIn,
    isSyncing,
    loginWithGoogle,
    syncNow,
    logout,
  } = useAuth();

  const { likedSongIds, favorites, playlists, recentSongIds, restoreUserData, restoreFromCloud } = usePlaylist();
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const showMsg = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleGoogleLogin = async () => {
    const res = await loginWithGoogle();
    if (res.success) {
      if (res.cloudData && res.cloudData.likedSongIds.length > 0) {
        restoreUserData(res.cloudData.likedSongIds, res.cloudData.playlists, res.cloudData.recentSongIds, res.cloudData.likedSongs);
        showMsg(`Welcome, ${res.cloudData.user?.name || 'User'}! ${res.cloudData.likedSongIds.length} songs restored from Cloud.`, 'success');
      } else {
        const cloudRes = await restoreFromCloud(res.cloudData?.user?.email || user?.email);
        if (cloudRes.success && cloudRes.count > 0) {
          showMsg(`Welcome! ${cloudRes.count} songs restored from Cloud.`, 'success');
        } else {
          showMsg('Google Account connected & cloud backup active.', 'success');
        }
      }
    } else {
      showMsg(res.error || 'Google login failed.', 'error');
    }
  };

  const handleRestoreClick = async () => {
    showMsg('क्लाउड से गीत रीस्टोर किए जा रहे हैं...', 'success');
    const res = await restoreFromCloud(user?.email);
    if (res.success && res.count > 0) {
      showMsg(`✅ ${res.count} पसंदीदा गीत रीस्टोर हो गए!`, 'success');
    } else {
      showMsg('ℹ️ कोई बैकअप नहीं मिला।', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#18112b] text-retro-cream rounded-t-3xl sm:rounded-3xl border border-retro-gold/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <h2 className="text-base font-bold font-serif tracking-wide text-retro-cream">
              Google Account & Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-xl text-xs font-semibold text-center ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-none">
          {isLoggedIn && user ? (
            /* SECTION 4: AUTHENTICATED USER PROFILE */
            <div className="space-y-5 animate-fade-in">
              {/* Profile Card */}
              <div className="p-4 rounded-3xl bg-[#23153d] border border-retro-gold/40 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-retro-gold shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-600 text-retro-dark font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-retro-cream truncate">{user.name}</h3>
                    <p className="text-xs text-retro-gold/90 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Google Cloud Sync Active</span>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 ml-2">
                  <Check className="w-4 h-4" />
                </div>
              </div>

              {/* Cloud Sync Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xs text-white/50 block">Favorites (पसंदीदा)</span>
                  <strong className="text-lg text-retro-gold font-mono">{likedSongIds.length}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xs text-white/50 block">Playlists (प्लेलिस्ट)</span>
                  <strong className="text-lg text-retro-gold font-mono">{playlists.length}</strong>
                </div>
              </div>

              {/* Action Buttons: Backup Now & Restore from Cloud */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => syncNow({ likedSongIds, playlists, recentSongIds, likedSongs: favorites })}
                  disabled={isSyncing}
                  className="py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-retro-gold/40 text-retro-gold text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Backup Now'}</span>
                </button>

                <button
                  onClick={handleRestoreClick}
                  disabled={isSyncing}
                  className="py-3 px-2 rounded-2xl bg-gradient-to-r from-retro-gold/20 via-amber-500/20 to-retro-gold/20 hover:bg-retro-gold/30 border border-retro-gold/60 text-retro-gold text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>रीस्टोर (Restore)</span>
                </button>
              </div>

              {/* Google User ID Metadata */}
              <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-[10px] text-white/40 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Google User ID:</span>
                  <span className="truncate max-w-[150px]">{user.sub}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scopes:</span>
                  <span>openid, email, profile</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Google Account</span>
              </button>
            </div>
          ) : (
            /* UNREGISTERED / PROMPT GOOGLE SIGN IN */
            <div className="space-y-5 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-retro-gold/30 flex items-center justify-center mx-auto shadow-inner text-retro-gold">
                <Cloud className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-retro-cream">
                  Sign in with Google
                </h3>
                <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
                  Backup and restore your playlists and favorite music seamlessly across your devices.
                </p>
              </div>

              {/* Single Official Google Button */}
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                disabled={isSyncing}
              />

              {isSyncing && (
                <div className="flex items-center justify-center gap-2 text-xs text-retro-gold pt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in with Google...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};