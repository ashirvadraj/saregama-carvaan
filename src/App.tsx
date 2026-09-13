import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { AudioProvider, useAudio } from './context/AudioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlaylistProvider } from './context/PlaylistContext';
import { DownloadProvider } from './context/DownloadContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { MiniPlayer } from './components/MiniPlayer';
import { Player } from './components/Player';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SleepTimerModal } from './components/SleepTimerModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AccountModal } from './components/AccountModal';
import { WelcomeLoginModal } from './components/WelcomeLoginModal';
import { HomeView } from './views/HomeView';
import { ErasView } from './views/ErasView';
import { ArtistsView } from './views/ArtistsView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { Artist, Decade } from './types';
import { Disc3 } from 'lucide-react';
import { RecommendationService } from './services/recommendationService';
import { VersionService, VersionConfig } from './services/versionService';
import { UpdateRequiredModal } from './components/UpdateRequiredModal';
import { WrappedModal } from './components/WrappedModal';
import { SONGS } from './data/songs';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<Decade['id']>('50s');
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [createPlaylistModal, setCreatePlaylistModal] = useState<{
    isOpen: boolean;
    songId?: string;
  }>({ isOpen: false });

  const [showExitToast, setShowExitToast] = useState(false);
  const [updateConfig, setUpdateConfig] = useState<VersionConfig | null>(null);
  const lastBackPressRef = useRef<number>(0);

  const { isFullPlayerOpen, setIsFullPlayerOpen, pause, playSong } = useAudio();
  const { isAccountModalOpen, setIsAccountModalOpen } = useAuth();

  // Check remote minimum required version on app launch, on resume, and periodically every 30s
  useEffect(() => {
    const handleCheck = () => {
      VersionService.checkVersion().then((res) => {
        if (res.isUpdateRequired && res.config) {
          setUpdateConfig(res.config);
          pause();
        }
      });
    };

    handleCheck();

    // Re-check periodically every 30 seconds
    const interval = setInterval(handleCheck, 30000);

    // Re-check on app resume / visibility change
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleCheck();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onLocked = (e: any) => {
      const config = e.detail?.config || VersionService.cachedConfig;
      if (config) {
        setUpdateConfig(config);
        pause();
      }
    };
    window.addEventListener('sunehreVersionLocked', onLocked);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('sunehreVersionLocked', onLocked);
    };
  }, [pause]);

  // Start periodic smart song recommendation notifications (with different nostalgic phrases)
  useEffect(() => {
    const cleanup = RecommendationService.startScheduler();
    return () => cleanup();
  }, []);

  // Listen for song recommendation notification clicks to autoplay target song
  useEffect(() => {
    const handlePlayRecommended = (e: any) => {
      const songId = e?.detail?.songId;
      if (songId) {
        const target = SONGS.find((s) => s.id === songId);
        if (target) {
          playSong(target, SONGS);
          setIsFullPlayerOpen(true);
        }
      }
    };
    window.addEventListener('playRecommendedSong', handlePlayRecommended);
    return () => window.removeEventListener('playRecommendedSong', handlePlayRecommended);
  }, [playSong, setIsFullPlayerOpen]);

  // Listen for Wrapped notification clicks to open Sunehre Geet Wrapped modal
  useEffect(() => {
    const handleOpenWrapped = () => {
      setIsWrappedOpen(true);
    };
    window.addEventListener('openWrappedModal', handleOpenWrapped);
    return () => window.removeEventListener('openWrappedModal', handleOpenWrapped);
  }, []);

  // Auto-dismiss Exit Toast after exactly 4 seconds
  useEffect(() => {
    if (showExitToast) {
      const timer = setTimeout(() => {
        setShowExitToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showExitToast]);

  // Handle Android Hardware Back Button (Double Back to Exit)
  useEffect(() => {
    let listener: any = null;

    const setupBackButton = async () => {
      listener = await CapApp.addListener('backButton', () => {
        // 0. If Update Required is active, completely lock down
        if (updateConfig) {
          return;
        }

        // 0.5. If Wrapped modal is open, close it
        if (isWrappedOpen) {
          setIsWrappedOpen(false);
          return;
        }

        // 1. If Full Screen Player is open, close it
        if (isFullPlayerOpen) {
          setIsFullPlayerOpen(false);
          return;
        }

        // 2. If Sleep Timer modal is open, close it
        if (isSleepTimerOpen) {
          setIsSleepTimerOpen(false);
          return;
        }

        // 3. If Account modal is open, close it
        if (isAccountModalOpen) {
          setIsAccountModalOpen(false);
          return;
        }

        // 4. If Create Playlist modal is open, close it
        if (createPlaylistModal.isOpen) {
          setCreatePlaylistModal({ isOpen: false });
          return;
        }

        // 5. If viewing an Artist discography page, go back to All Singers list
        if (selectedArtist) {
          setSelectedArtist(null);
          return;
        }

        // 6. If not on Home tab, navigate to Home tab
        if (activeTab !== 'home') {
          setActiveTab('home');
          return;
        }

        // 7. On Home screen: Double back press within 4 seconds to exit
        const now = Date.now();
        if (now - lastBackPressRef.current < 4000) {
          pause();
          try {
            const cap = (window as any).Capacitor;
            if (cap && cap.Plugins && cap.Plugins.MediaNotificationPlugin) {
              cap.Plugins.MediaNotificationPlugin.hideNotification();
            }
          } catch {}
          CapApp.exitApp();
        } else {
          lastBackPressRef.current = now;
          setShowExitToast(true);
        }
      });
    };

    setupBackButton();

    return () => {
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  }, [
    isFullPlayerOpen,
    isSleepTimerOpen,
    isWrappedOpen,
    isAccountModalOpen,
    createPlaylistModal.isOpen,
    selectedArtist,
    activeTab,
    setIsFullPlayerOpen,
    setIsAccountModalOpen,
    pause,
  ]);

  const handleSelectArtist = (artist: Artist | null) => {
    setSelectedArtist(artist);
    setActiveTab('artists');
  };

  const handleSelectDecade = (decadeId: Decade['id']) => {
    setSelectedDecade(decadeId);
    setActiveTab('eras');
  };

  const handleOpenCreatePlaylist = (songId?: string) => {
    setCreatePlaylistModal({ isOpen: true, songId });
  };

  return (
    <div className="min-h-screen bg-[#0c0817] text-[#FFF4E0] flex flex-col antialiased select-none font-sans relative">
      {/* Header with Account Button */}
      <Header
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        <ErrorBoundary>
          {activeTab === 'home' && (
            <HomeView
              onSelectArtist={handleSelectArtist}
              onSelectDecade={handleSelectDecade}
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
              onOpenWrapped={() => setIsWrappedOpen(true)}
            />
          )}

          {activeTab === 'eras' && (
            <ErasView
              initialDecade={selectedDecade}
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
            />
          )}

          {activeTab === 'artists' && (
            <ArtistsView
              selectedArtist={selectedArtist}
              onSelectArtist={setSelectedArtist}
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
              onSelectArtist={handleSelectArtist}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              onOpenCreatePlaylist={handleOpenCreatePlaylist}
              onOpenWrapped={() => setIsWrappedOpen(true)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Persistent Mini Player (Bar above navigation) */}
      <MiniPlayer />

      {/* Full-Screen Retro Vinyl Turntable Player */}
      <Player onOpenSleepTimer={() => setIsSleepTimerOpen(true)} />

      {/* Bottom Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
      />

      <CreatePlaylistModal
        isOpen={createPlaylistModal.isOpen}
        initialSongId={createPlaylistModal.songId}
        onClose={() => setCreatePlaylistModal({ isOpen: false })}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Sunehre Geet Wrapped Modal */}
      <WrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
      />

      {/* Welcome / First-Launch Screen */}
      <WelcomeLoginModal />

      {/* Double Back Press Exit Toast (Auto-dismisses in 4 seconds) */}
      {showExitToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in">
          <div className="px-4 py-2 rounded-full bg-[#1e1338]/95 border border-retro-gold/40 text-retro-cream text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Disc3 className="w-4 h-4 text-retro-gold animate-spin-slow" />
            <span>ऐप से बाहर निकलने के लिए दोबारा वापस दबाएं (Press back again to exit)</span>
          </div>
        </div>
      )}

      {/* Mandatory Remote Version Gate Modal */}
      {updateConfig && <UpdateRequiredModal config={updateConfig} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlaylistProvider>
        <DownloadProvider>
          <AudioProvider>
            <MainApp />
          </AudioProvider>
        </DownloadProvider>
      </PlaylistProvider>
    </AuthProvider>
  );
}