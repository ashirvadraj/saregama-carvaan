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
  loginWithGoogle: () => Promise<{ success: boolean; cloudData?: BackupData; error?: string }>;
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

  const loginWithGoogle = async () => {
    setIsSyncing(true);
    try {
      let email = '';
      let name = '';
      let sub = '';

      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.startOfficialGoogleSignIn) {
        const res = await cap.Plugins.MediaNotificationPlugin.startOfficialGoogleSignIn();
        if (res?.success && res.email) {
          email = res.email;
          name = res.name || GoogleAuthService.createProfile(res.email).name;
          sub = res.sub || `g_${Date.now()}`;
        } else if (res?.error) {
          setIsSyncing(false);
          return { success: false, error: res.error };
        }
      }

      // Fallback: system accounts
      if (!email) {
        if (cap?.Plugins?.MediaNotificationPlugin?.getDeviceGoogleAccounts) {
          const res = await cap.Plugins.MediaNotificationPlugin.getDeviceGoogleAccounts();
          if (res?.accounts && Array.isArray(res.accounts) && res.accounts.length > 0) {
            email = res.accounts[0].email;
            name = res.accounts[0].name || GoogleAuthService.createProfile(res.accounts[0].email).name;
          }
        }
      }

      if (!email) {
        setIsSyncing(false);
        return { success: false, error: 'Please select a Google Account.' };
      }

      const profile = GoogleAuthService.createProfile(email, name, undefined, sub);
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