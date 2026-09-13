import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleAuthService, GoogleUserProfile } from '../services/googleAuthService';
import { CloudSyncService, BackupData } from '../services/cloudSyncService';
import { Playlist } from '../types';

interface AuthContextType {
  user: GoogleUserProfile | null;
  isLoggedIn: boolean;
  isSyncing: boolean;
  isAccountModalOpen: boolean;
  isWelcomeModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  setIsWelcomeModalOpen: (open: boolean) => void;
  loginWithGoogle: (explicitEmail?: string, explicitName?: string) => Promise<{ success: boolean; cloudData?: BackupData; error?: string }>;
  syncNow: (data: { likedSongIds: string[]; playlists: Playlist[]; recentSongIds: string[]; likedSongs?: any[] }) => Promise<boolean>;
  logout: () => void;
  dismissWelcome: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUserProfile | null>(() => GoogleAuthService.getStoredSession());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    return !GoogleAuthService.getStoredSession() && GoogleAuthService.isFirstTimeLaunch();
  });

  const dismissWelcome = () => {
    GoogleAuthService.markWelcomeSeen();
    setIsWelcomeModalOpen(false);
  };

  const loginWithGoogle = async (explicitEmail?: string, explicitName?: string) => {
    setIsSyncing(true);
    try {
      let email = (explicitEmail || '').trim().toLowerCase();
      let name = (explicitName || '').trim();
      let sub = '';

      if (!email) {
        const cap = (window as any).Capacitor;
        if (cap?.Plugins?.MediaNotificationPlugin?.startOfficialGoogleSignIn) {
          try {
            const res = await cap.Plugins.MediaNotificationPlugin.startOfficialGoogleSignIn();
            if (res?.success && res.email) {
              email = res.email.toLowerCase().trim();
              name = res.name || GoogleAuthService.createProfile(res.email).name;
              sub = res.sub || `g_${Date.now()}`;
            }
          } catch {}
        }
      }

      if (!email) {
        setIsSyncing(false);
        return { success: false, error: 'Please enter your Google / Gmail address.' };
      }

      const profile = GoogleAuthService.createProfile(email, name || undefined, undefined, sub || undefined);
      setUser(profile);
      dismissWelcome();

      // Retrieve persistent cloud backup
      const cloudData = await CloudSyncService.fetchCloudBackup(profile.email);
      setIsSyncing(false);
      return { success: true, cloudData: cloudData || undefined };
    } catch (e: any) {
      setIsSyncing(false);
      return { success: false, error: e.message || 'Google Sign-In failed.' };
    }
  };

  const syncNow = useCallback(
    async (data: { likedSongIds: string[]; playlists: Playlist[]; recentSongIds: string[] }) => {
      if (!user) return false;
      setIsSyncing(true);
      try {
        const ok = await CloudSyncService.syncToGoogleCloud(user, data);
        setIsSyncing(false);
        return ok;
      } catch {
        setIsSyncing(false);
        return false;
      }
    },
    [user]
  );

  const logout = () => {
    GoogleAuthService.logout();
    setUser(null);
    setIsAccountModalOpen(false);
    setIsWelcomeModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isSyncing,
        isAccountModalOpen,
        isWelcomeModalOpen,
        setIsAccountModalOpen,
        setIsWelcomeModalOpen,
        loginWithGoogle,
        syncNow,
        logout,
        dismissWelcome,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};