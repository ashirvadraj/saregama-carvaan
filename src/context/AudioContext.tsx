import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { SONGS } from '../data/songs';
import { getOfflineAudioUrl, cacheAudioInBackground } from '../services/offlineService';
import { fetchLyricsForSong } from '../services/lyricsService';
import { WrappedService } from '../services/wrappedService';
import { VersionService } from '../services/versionService';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Song[];
  isFullPlayerOpen: boolean;
  sleepTimer: number | null;
  playSong: (song: Song, playlistQueue?: Song[], startTime?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setIsFullPlayerOpen: (open: boolean) => void;
  setSleepTimerDuration: (minutes: number | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const LAST_PLAYBACK_KEY = 'sunehre_geet_last_playback_session';

// SINGLETON AUDIO INSTANCE
export const singletonAudio: HTMLAudioElement = typeof window !== 'undefined' ? new Audio() : (null as any);
if (singletonAudio) {
  singletonAudio.preload = 'auto';
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restore saved playback state on app startup
  const initialSession = useRef<any>(null);
  if (initialSession.current === null) {
    try {
      const saved = localStorage.getItem(LAST_PLAYBACK_KEY);
      if (saved) initialSession.current = JSON.parse(saved);
    } catch {}
  }

  const restoredSong: Song | null = initialSession.current?.song || SONGS[0] || null;
  const restoredTime: number = initialSession.current?.currentTime || 0;
  const restoredDuration: number = initialSession.current?.duration || (restoredSong?.duration || 0);

  const [currentSong, setCurrentSong] = useState<Song | null>(restoredSong);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(restoredTime);
  const [duration, setDuration] = useState<number>(restoredDuration);
  const [volume, setVolumeState] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [queue, setQueue] = useState<Song[]>(() => {
    if (initialSession.current?.queue && initialSession.current.queue.length > 0) {
      return initialSession.current.queue;
    }
    return SONGS.slice(0, 50);
  });
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  const sleepTimerIntervalRef = useRef<any>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const currentSongRef = useRef<Song | null>(currentSong);
  const queueRef = useRef<Song[]>(queue);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>(repeatMode);
  const currentTimeRef = useRef<number>(currentTime);
  const pendingSeekTimeRef = useRef<number>(restoredTime);

  currentSongRef.current = currentSong;
  queueRef.current = queue;
  isShuffleRef.current = isShuffle;
  repeatModeRef.current = repeatMode;
  currentTimeRef.current = currentTime;

  // Send metadata to Native Android Notification Service
  const updateNativeNotification = (song: Song | null, playing: boolean) => {
    if (!song) return;
    try {
      const cap = (window as any).Capacitor;
      if (cap && cap.Plugins && cap.Plugins.MediaNotificationPlugin) {
        cap.Plugins.MediaNotificationPlugin.updateNotification({
          title: song.title,
          artist: song.artist,
          coverUrl: song.coverUrl,
          isPlaying: playing,
        });
      }
    } catch (e) {
      console.warn('Native notification error:', e);
    }
  };

  // Persist current song & exact second timestamp
  const savePlaybackState = (song: Song | null, time: number, dur: number, songQueue: Song[]) => {
    if (!song) return;
    try {
      localStorage.setItem(
        LAST_PLAYBACK_KEY,
        JSON.stringify({
          song,
          currentTime: Math.floor(time),
          duration: Math.floor(dur),
          queue: songQueue.slice(0, 50),
          savedAt: Date.now(),
        })
      );
    } catch {}
  };

  // SINGLETON AUDIO LISTENERS (Mounted ONCE on startup)
  useEffect(() => {
    if (!singletonAudio) return;

    // Load initial restored track without autoplay
    if (restoredSong) {
      getOfflineAudioUrl(restoredSong.audioUrl).then((url) => {
        if (singletonAudio) {
          singletonAudio.src = url;
          singletonAudio.load();
        }
      });
    }

    const onTimeUpdate = () => {
      const cur = singletonAudio.currentTime;
      setCurrentTime(cur);
      currentTimeRef.current = cur;

      const now = Date.now();
      if (now - lastSaveTimeRef.current > 1500) {
        lastSaveTimeRef.current = now;
        savePlaybackState(currentSongRef.current, cur, singletonAudio.duration || 0, queueRef.current);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(singletonAudio.duration || 0);
      // If there is a pending saved timestamp from previous session, restore it now
      if (pendingSeekTimeRef.current > 0) {
        try {
          singletonAudio.currentTime = pendingSeekTimeRef.current;
        } catch {}
      }
    };

    const onEnded = () => {
      const mode = repeatModeRef.current;
      if (mode === 'one') {
        singletonAudio.currentTime = 0;
        setCurrentTime(0);
        singletonAudio.play().catch(() => {});
      } else if (mode === 'all') {
        playNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        updateNativeNotification(currentSongRef.current, false);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      pendingSeekTimeRef.current = 0;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      if (currentSongRef.current) {
        updateNativeNotification(currentSongRef.current, true);
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      if (currentSongRef.current) {
        updateNativeNotification(currentSongRef.current, false);
        savePlaybackState(currentSongRef.current, singletonAudio.currentTime, singletonAudio.duration || 0, queueRef.current);
      }
    };

    singletonAudio.addEventListener('timeupdate', onTimeUpdate);
    singletonAudio.addEventListener('loadedmetadata', onLoadedMetadata);
    singletonAudio.addEventListener('ended', onEnded);
    singletonAudio.addEventListener('play', onPlay);
    singletonAudio.addEventListener('pause', onPause);

    // Save exact position when app is minimized, closed or hidden
    const onVisibilityChange = () => {
      if (document.hidden && currentSongRef.current) {
        savePlaybackState(currentSongRef.current, singletonAudio.currentTime, singletonAudio.duration || 0, queueRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', () => {
      if (currentSongRef.current) {
        savePlaybackState(currentSongRef.current, singletonAudio.currentTime, singletonAudio.duration || 0, queueRef.current);
      }
    });

        const onNativeMediaAction = (event: any) => {
      const action = event.detail?.action;
      if (!singletonAudio) return;

      if (VersionService.isLocked || localStorage.getItem('sunehre_app_locked') === 'true') {
        singletonAudio.pause();
        singletonAudio.src = '';
        setIsPlaying(false);
        updateNativeNotification(null, false);
        return;
      }

      if (action === 'com.sunehregeet.app.ACTION_PLAY') {
        if (singletonAudio.paused) {
          singletonAudio.play().then(() => {
            setIsPlaying(true);
            updateNativeNotification(currentSongRef.current, true);
          }).catch(() => {});
        }
      } else if (action === 'com.sunehregeet.app.ACTION_PAUSE') {
        if (!singletonAudio.paused) {
          singletonAudio.pause();
          setIsPlaying(false);
          updateNativeNotification(currentSongRef.current, false);
        }
      } else if (action === 'com.sunehregeet.app.ACTION_NEXT') {
        const q = queueRef.current;
        const cur = currentSongRef.current;
        if (cur && q.length > 0) {
          let nextIndex = 0;
          const currentIndex = q.findIndex((s) => s.id === cur.id);
          if (isShuffleRef.current) {
            nextIndex = Math.floor(Math.random() * q.length);
          } else {
            nextIndex = (currentIndex + 1) % q.length;
          }
          playSong(q[nextIndex], undefined, 0);
        }
      } else if (action === 'com.sunehregeet.app.ACTION_PREV') {
        const q = queueRef.current;
        const cur = currentSongRef.current;
        if (cur && q.length > 0) {
          if (singletonAudio.currentTime > 4) {
            singletonAudio.currentTime = 0;
            return;
          }
          const currentIndex = q.findIndex((s) => s.id === cur.id);
          const prevIndex = (currentIndex - 1 + q.length) % q.length;
          playSong(q[prevIndex], undefined, 0);
        }
      }
    };
    window.addEventListener('nativeMediaAction', onNativeMediaAction);

    const onVersionLocked = () => {
      if (singletonAudio) {
        singletonAudio.pause();
        singletonAudio.src = '';
      }
      setIsPlaying(false);
      updateNativeNotification(null, false);
    };
    window.addEventListener('sunehreVersionLocked', onVersionLocked);

    const onStalled = () => {
      if (singletonAudio && currentSongRef.current) {
        // Auto-resume if Android WebView paused or stalled the buffer in background
        if (singletonAudio.paused) {
          singletonAudio.play().catch(() => {});
        }
      }
    };
    singletonAudio.addEventListener('stalled', onStalled);
    singletonAudio.addEventListener('waiting', onStalled);

    return () => {
      singletonAudio.removeEventListener('timeupdate', onTimeUpdate);
      singletonAudio.removeEventListener('loadedmetadata', onLoadedMetadata);
      singletonAudio.removeEventListener('ended', onEnded);
      singletonAudio.removeEventListener('play', onPlay);
      singletonAudio.removeEventListener('pause', onPause);
      singletonAudio.removeEventListener('stalled', onStalled);
      singletonAudio.removeEventListener('waiting', onStalled);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('nativeMediaAction', onNativeMediaAction);
      window.removeEventListener('sunehreVersionLocked', onVersionLocked);
    };
  }, []);

  useEffect(() => {
    if (currentSong) {
      updateNativeNotification(currentSong, isPlaying);

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: `${currentSong.movie} (${currentSong.year})`,
          artwork: [
            { src: currentSong.coverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            seek(details.seekTime);
          }
        });
      }
    }
  }, [currentSong, isPlaying, duration]);

  useEffect(() => {
    if (sleepTimer !== null && sleepTimer > 0) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = setInterval(() => {
        setSleepTimer((prev) => {
          if (prev === null || prev <= 1) {
            pause();
            return null;
          }
          return prev - 1;
        });
      }, 60000);
    } else {
      clearInterval(sleepTimerIntervalRef.current);
    }

    return () => clearInterval(sleepTimerIntervalRef.current);
  }, [sleepTimer]);

  // PLAY A SONG: Immediately stops previous song and starts new song from requested position
  const playSong = async (song: Song, playlistQueue?: Song[], startTime: number = 0) => {
    if (!song || !singletonAudio) return;

    // Hard Killswitch: If version is locked, permanently block playback
    if (VersionService.isLocked || localStorage.getItem('sunehre_app_locked') === 'true') {
      singletonAudio.pause();
      singletonAudio.src = '';
      setIsPlaying(false);
      updateNativeNotification(null, false);
      return;
    }

    // 1. Immediately pause previous audio without tearing down the pipeline
    singletonAudio.pause();
    setIsPlaying(false);

    // 2. Set UI state
    setCurrentSong(song);
    setCurrentTime(startTime);
    pendingSeekTimeRef.current = startTime;
    setIsFullPlayerOpen(true);

    const targetQueue = playlistQueue && playlistQueue.length > 0 ? playlistQueue : queueRef.current;
    if (playlistQueue && playlistQueue.length > 0) {
      setQueue(playlistQueue);
    }

    try {
      // 3. Fetch direct audio URL (or cached offline blob)
      const playbackUrl = await getOfflineAudioUrl(song.audioUrl);

      // 4. Assign new URL to singleton audio
      singletonAudio.preload = 'auto';
      if (singletonAudio.src !== playbackUrl) {
        singletonAudio.src = playbackUrl;
      }

      if (startTime > 0) {
        singletonAudio.currentTime = startTime;
      }

      // 5. Start playback immediately (optimistic UI update + non-blocking promise)
      setIsPlaying(true);
      pendingSeekTimeRef.current = 0;
      updateNativeNotification(song, true);
      savePlaybackState(song, startTime, song.duration, playlistQueue || queueRef.current);

      singletonAudio.play()
        .then(() => {
          setIsPlaying(true);
          updateNativeNotification(song, true);
        })
        .catch((err) => {
          console.warn('Play audio error:', err);
          setIsPlaying(false);
        });

      // Background caching delayed by 4s to give 100% bandwidth to initial playback
      setTimeout(() => {
        cacheAudioInBackground(song.audioUrl);
        if (targetQueue && targetQueue.length > 0) {
          const curIdx = targetQueue.findIndex((s) => s.id === song.id);
          const nextSong = targetQueue[(curIdx + 1) % targetQueue.length];
          if (nextSong && nextSong.id !== song.id) {
            cacheAudioInBackground(nextSong.audioUrl);
          }
        }
      }, 4000);

      // Record to Recently Played & Wrapped Listening History
      try {
        window.dispatchEvent(new CustomEvent('sunehreSongPlayed', { detail: { song } }));
        const curRecent = JSON.parse(localStorage.getItem('sunehre_geet_recent') || '[]');
        const updatedRecent = [song.id, ...curRecent.filter((id: string) => id !== song.id)].slice(0, 50);
        localStorage.setItem('sunehre_geet_recent', JSON.stringify(updatedRecent));
        WrappedService.recordPlayback(song.id, song.duration || 180);
      } catch {}

      // Background Pre-fetch Lyrics for 0ms instant display
      setTimeout(() => {
        fetchLyricsForSong(song).catch(() => {});
      }, 50);
    } catch (err) {
      console.warn('Play song error:', err);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!singletonAudio) return;

    if (VersionService.isLocked || localStorage.getItem('sunehre_app_locked') === 'true') {
      singletonAudio.pause();
      singletonAudio.src = '';
      setIsPlaying(false);
      updateNativeNotification(null, false);
      return;
    }

    if (isPlaying) {
      singletonAudio.pause();
      setIsPlaying(false);
      updateNativeNotification(currentSong, false);
    } else {
      const resumePos = currentTimeRef.current > 0 ? currentTimeRef.current : (pendingSeekTimeRef.current > 0 ? pendingSeekTimeRef.current : 0);

      if (!singletonAudio.src && currentSong) {
        getOfflineAudioUrl(currentSong.audioUrl).then((url) => {
          if (singletonAudio) {
            singletonAudio.src = url;
            singletonAudio.load();
            if (resumePos > 0) {
              singletonAudio.currentTime = resumePos;
            }
            singletonAudio.play().then(() => {
              setIsPlaying(true);
              pendingSeekTimeRef.current = 0;
              updateNativeNotification(currentSong, true);
            }).catch(() => {});
          }
        });
        return;
      }

      // If resuming a loaded track, guarantee it resumes at the exact saved second
      if (resumePos > 0 && Math.abs(singletonAudio.currentTime - resumePos) > 2) {
        try {
          singletonAudio.currentTime = resumePos;
        } catch {}
      }

      singletonAudio.play()
        .then(() => {
          setIsPlaying(true);
          pendingSeekTimeRef.current = 0;
          updateNativeNotification(currentSong, true);
        })
        .catch((err) => {
          console.warn('Playback resume error:', err);
          setIsPlaying(false);
        });
    }
  };

  const pause = () => {
    if (singletonAudio) {
      singletonAudio.pause();
      setIsPlaying(false);
      updateNativeNotification(currentSong, false);
      if (currentSong) {
        savePlaybackState(currentSong, singletonAudio.currentTime, singletonAudio.duration || 0, queueRef.current);
      }
    }
  };

  const playNext = () => {
    const q = queueRef.current;
    const cur = currentSongRef.current;
    if (!cur || q.length === 0) return;

    let nextIndex = 0;
    const currentIndex = q.findIndex((s) => s.id === cur.id);

    if (isShuffleRef.current) {
      nextIndex = Math.floor(Math.random() * q.length);
    } else {
      nextIndex = (currentIndex + 1) % q.length;
    }

    playSong(q[nextIndex], undefined, 0);
  };

  const playPrevious = () => {
    const q = queueRef.current;
    const cur = currentSongRef.current;
    if (!cur || q.length === 0) return;

    if (singletonAudio && singletonAudio.currentTime > 4) {
      seek(0);
      return;
    }
    const currentIndex = q.findIndex((s) => s.id === cur.id);
    const prevIndex = (currentIndex - 1 + q.length) % q.length;

    playSong(q[prevIndex], undefined, 0);
  };

  const seek = (seconds: number) => {
    if (singletonAudio) {
      singletonAudio.currentTime = seconds;
      setCurrentTime(seconds);
      currentTimeRef.current = seconds;
      pendingSeekTimeRef.current = seconds;
      if (currentSong) {
        savePlaybackState(currentSong, seconds, duration, queueRef.current);
      }
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (singletonAudio) {
      singletonAudio.volume = vol;
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const setSleepTimerDuration = (minutes: number | null) => {
    setSleepTimer(minutes);
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        queue,
        isFullPlayerOpen,
        sleepTimer,
        playSong,
        togglePlay,
        pause,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleShuffle,
        cycleRepeatMode,
        setIsFullPlayerOpen,
        setSleepTimerDuration,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};