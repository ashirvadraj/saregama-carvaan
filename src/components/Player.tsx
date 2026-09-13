import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ChevronDown,
  Moon,
  Download,
  Check,
  Disc,
  FileText,
  Loader2,
  RefreshCw,
  Type,
  Music2,
  Sparkles,
  Tv,
  Film,
  Maximize2,
  Minimize2,
  ExternalLink,
  Video,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { useAudio, singletonAudio } from '../context/AudioContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useDownload } from '../context/DownloadContext';
import { fetchLyricsForSong, LyricsData, calculateLineWords } from '../services/lyricsService';

interface PlayerProps {
  onOpenSleepTimer: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const Player: React.FC<PlayerProps> = ({ onOpenSleepTimer }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isFullPlayerOpen,
    sleepTimer,
    togglePlay,
    pause,
    playNext,
    playPrevious,
    seek,
    toggleShuffle,
    cycleRepeatMode,
    setIsFullPlayerOpen,
  } = useAudio();

  const { isFavorite, toggleFavorite } = usePlaylists();
  const { isDownloaded, downloadSong, deleteDownload, downloadingId } = useDownload();

  const [activeView, setActiveView] = useState<'turntable' | 'lyrics' | 'video'>('turntable');
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsFontSize, setLyricsFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > window.innerHeight;
    }
    return false;
  });
  const [showControls, setShowControls] = useState(true);

  const videoIframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const [lyricsCurrentTime, setLyricsCurrentTime] = useState<number>(currentTime);

  // High-frequency 60fps ticker for Apple Music word-by-word karaoke synchronization
  useEffect(() => {
    if (activeView !== 'lyrics' || !isPlaying) {
      setLyricsCurrentTime(currentTime);
      return;
    }

    let animFrameId: number;
    const tick = () => {
      if (singletonAudio && !singletonAudio.paused) {
        setLyricsCurrentTime(singletonAudio.currentTime);
      }
      animFrameId = requestAnimationFrame(tick);
    };
    animFrameId = requestAnimationFrame(tick);
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [activeView, isPlaying, currentTime]);

  // Auto-detect screen orientation (portrait vs landscape rotation)
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, []);

  // Restore portrait orientation if user switches away from video view or closes player
  useEffect(() => {
    if (activeView !== 'video' || !isFullPlayerOpen) {
      if (isFullscreen) {
        setIsFullscreen(false);
      }
      try {
        const cap = (window as any).Capacitor;
        if (cap?.Plugins?.MediaNotificationPlugin?.setScreenOrientation) {
          cap.Plugins.MediaNotificationPlugin.setScreenOrientation({ orientation: 'portrait' });
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  }, [activeView, isFullPlayerOpen, isFullscreen]);

  // Load lyrics & video whenever current song changes
  useEffect(() => {
    if (currentSong) {
      setLyricsData(null);
      setVideoData(null);
      setVideoCurrentTime(Math.max(0, Math.floor(currentTime)));
      setVideoDuration(currentSong.duration || 180);
      setIsVideoPlaying(true);
      loadLyrics();
      loadVideo();
      if (activeView === 'video') {
        pause();
      }
    }
  }, [currentSong?.id]);

  const loadLyrics = async () => {
    if (!currentSong) return;
    setIsLoadingLyrics(true);
    try {
      const data = await fetchLyricsForSong(currentSong);
      setLyricsData(data);
    } catch {
      setLyricsData(null);
    }
    setIsLoadingLyrics(false);
  };

  const loadVideo = async () => {
    if (!currentSong) return;
    setIsLoadingVideo(true);
    try {
      setVideoData(data);
    } catch {
      setVideoData(null);
    }
    setIsLoadingVideo(false);
  };

  const switchToAudioView = (view: 'turntable' | 'lyrics') => {
    if (activeView === 'video') {
      if (videoCurrentTime > 0) {
        seek(videoCurrentTime);
      }
      if (!isPlaying) {
        togglePlay();
      }
    }
    setActiveView(view);
    if (view === 'lyrics' && !lyricsData && !isLoadingLyrics) {
      loadLyrics();
    }
  };

  const switchToVideoView = () => {
    setActiveView('video');
    if (currentTime > 0) {
      setVideoCurrentTime(Math.floor(currentTime));
    }
    if (isPlaying) pause();
    setIsVideoPlaying(true);
      loadVideo();
      setTimeout(() => {
        sendIframeCommand('playVideo');
      }, 300);
    }
  };

  // Video postMessage commander
  const sendIframeCommand = (command: string, args: any = '') => {
    if (videoIframeRef.current?.contentWindow) {
      videoIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args }),
        '*'
      );
    }
  };

  const toggleVideoPlay = () => {
    if (isVideoPlaying) {
      sendIframeCommand('pauseVideo');
      setIsVideoPlaying(false);
    } else {
      sendIframeCommand('playVideo');
      setIsVideoPlaying(true);
    }
    handleUserActivity();
  };

  const seekVideo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(videoDuration || duration || currentSong?.duration || 300, seconds));
    sendIframeCommand('seekTo', [clamped, true]);
    setVideoCurrentTime(clamped);
    handleUserActivity();
  };

  const toggleVideoMute = () => {
    if (isMuted) {
      sendIframeCommand('unMute');
      setIsMuted(false);
    } else {
      sendIframeCommand('mute');
      setIsMuted(true);
    }
    handleUserActivity();
  };

  const toggleVideoFullscreen = () => {
    try {
      const cap = (window as any).Capacitor;
      if (!isFullscreen && !isLandscape) {
        setIsFullscreen(true);
        if (cap?.Plugins?.MediaNotificationPlugin?.setScreenOrientation) {
          cap.Plugins.MediaNotificationPlugin.setScreenOrientation({ orientation: 'landscape' });
        }
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        setIsFullscreen(false);
        if (cap?.Plugins?.MediaNotificationPlugin?.setScreenOrientation) {
          cap.Plugins.MediaNotificationPlugin.setScreenOrientation({ orientation: 'portrait' });
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {}
    handleUserActivity();
  };

  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500);
  };

  // Real-time Video Timer Ticker (ensures timer & scrubber update every second with 100% reliability)
  useEffect(() => {
    let timer: any = null;
      // Send handshake listening event to iframe
      if (videoIframeRef.current?.contentWindow) {
        try {
          videoIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
        } catch {}
      }

      timer = setInterval(() => {
        setVideoCurrentTime((prev) => {
          const maxDur = videoDuration || duration || currentSong?.duration || 300;
          if (prev >= maxDur && maxDur > 10) {
            playNext();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };

  // Listen to video postMessage status updates (syncs exact timestamp whenever delivered)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'infoDelivery' && data.info) {
            if (typeof data.info.currentTime === 'number' && data.info.currentTime > 0) {
              setVideoCurrentTime(Math.floor(data.info.currentTime));
            }
            if (typeof data.info.duration === 'number' && data.info.duration > 0) {
              setVideoDuration(Math.floor(data.info.duration));
            }
            if (typeof data.info.playerState === 'number') {
              setIsVideoPlaying(data.info.playerState === 1);
              if (data.info.playerState === 0) {
                // Video ended -> auto advance to next song in playlist
                playNext();
              }
            }
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playNext]);

  // Find active line index based on real-time playback timestamp with 200ms vocal lead alignment
  let activeLineIndex = -1;
  const effectiveLyricsTime = activeView === 'lyrics' && isPlaying ? lyricsCurrentTime : currentTime;
  const calibratedLyricsTime = effectiveLyricsTime + 0.20; // 200ms vocal lead alignment for both line and word highlights

  if (lyricsData?.isSynced && lyricsData.lines.length > 0) {
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (calibratedLyricsTime >= lyricsData.lines[i].time) {
        activeLineIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth Auto-scroll to keep active line centered in view
  useEffect(() => {
    if (activeView === 'lyrics' && activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, activeView]);

  if (!isFullPlayerOpen || !currentSong) return null;

  const isFav = isFavorite(currentSong.id);
  const downloaded = isDownloaded(currentSong.id);
  const isDownloading = downloadingId === currentSong.id;

  const handleDownloadClick = () => {
    if (downloaded) {
      deleteDownload(currentSong.id);
    } else {
      downloadSong(currentSong);
    }
  };

  const toggleFontSize = () => {
    setLyricsFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'));
  };

  const isCinemaFullscreen = activeView === 'video' && (isFullscreen || isLandscape);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden animate-fade-in ${
        isCinemaFullscreen
          ? 'p-0 bg-black'
          : 'p-5 bg-gradient-to-b from-[#1b1033] via-[#0e071e] to-[#06030c]'
      }`}
    >
      {/* Background Ambient Glow (only in normal mode) */}
      {!isCinemaFullscreen && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-retro-gold/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Top Header Bar (hidden in cinema fullscreen) */}
      {!isCinemaFullscreen && (
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setIsFullPlayerOpen(false)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-retro-cream hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* View Switcher: Turntable Record vs Lyrics vs Video */}
          <div className="flex items-center p-1 rounded-full bg-black/60 border border-retro-gold/30 shadow-lg">
            <button
              onClick={() => switchToAudioView('turntable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeView === 'turntable'
                  ? 'bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">रिकॉर्ड</span>
              <span>Record</span>
            </button>
            <button
              onClick={() => switchToAudioView('lyrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeView === 'lyrics'
                  ? 'bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark shadow-md'
                  : 'text-retro-gold/90 hover:text-retro-gold hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">बोल</span>
              <span>Lyrics</span>
              {lyricsData?.isSynced && (
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              )}
            </button>
            <button
              onClick={switchToVideoView}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeView === 'video'
                  ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-retro-gold text-retro-dark shadow-md'
                  : 'text-rose-300/90 hover:text-rose-300 hover:bg-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">वीडियो</span>
              <span>Video</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-400/30 text-rose-200 font-black">HD</span>
              )}
            </button>
          </div>

          <button
            onClick={onOpenSleepTimer}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              sleepTimer !== null
                ? 'bg-retro-gold text-retro-dark'
                : 'bg-white/5 text-retro-cream hover:bg-white/10'
            }`}
            title="Sleep Timer"
          >
            <Moon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Center View: Turntable OR Synced Lyrics OR HD Music Video */}
      {activeView === 'turntable' ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 animate-fade-in">
          {/* Full Edge-to-Edge Rotating CD Album Disc */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center my-2 sm:my-3">
            {/* Ambient Dynamic Glow */}
            <div className="absolute inset-0 rounded-full bg-retro-gold/25 blur-3xl pointer-events-none" />

            {/* Rotating Full Album Art CD Disc */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden border-4 border-retro-gold shadow-2xl shadow-black flex items-center justify-center"
              style={{
                animation: isPlaying ? 'spin 16s linear infinite' : 'none',
              }}
            >
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
                }}
              />

              {/* Holographic Radial Sheen & CD Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-white/20 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-retro-gold/35 pointer-events-none" />
              <div className="absolute inset-24 rounded-full border border-white/10 pointer-events-none" />

              {/* Delicate Golden Center Spindle Hole */}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#120a22] border-2 border-retro-gold shadow-xl flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#06030c] border border-white/60 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Quick Switch Action Pills */}
          <div className="mt-4 flex items-center gap-2.5">
            <button
              onClick={() => switchToAudioView('lyrics')}
              className="px-3.5 py-1.5 rounded-full bg-[#1e1338]/90 border border-retro-gold/30 hover:border-retro-gold text-retro-gold text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>गीत के बोल (Lyrics)</span>
            </button>

            <button
              onClick={switchToVideoView}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-900/60 to-purple-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            >
              <Tv className="w-3.5 h-3.5 text-rose-400" />
              <span>वीडियो देखें (Watch Video)</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-400/30 text-rose-200 font-extrabold">HD</span>
              )}
            </button>
          </div>
        </div>
      ) : activeView === 'lyrics' ? (
        /* REAL-TIME SYNCED KARAOKE LYRICS VIEW */
        <div className="relative z-10 flex-1 flex flex-col my-2 overflow-hidden animate-fade-in bg-black/30 rounded-3xl border border-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-retro-gold" />
              <span className="text-xs font-bold text-retro-cream">
                {lyricsData?.isSynced ? 'लाइव सिंक बोल (Live Synced Lyrics)' : 'गीत के बोल (Lyrics)'}
              </span>
              {lyricsData?.isSynced && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-retro-gold/30 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  Apple Music Karaoke
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleFontSize}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
                title="Change Font Size"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={loadLyrics}
                disabled={isLoadingLyrics}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                title="Refresh Lyrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLyrics ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto py-6 space-y-4 text-center scrollbar-none"
          >
            {isLoadingLyrics ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-retro-gold animate-spin" />
                <p className="text-xs text-white/60">गीत के बोल लोड हो रहे हैं...</p>
              </div>
            ) : lyricsData && lyricsData.lines.length > 0 ? (
              lyricsData.lines.map((line, idx) => {
                const isSynced = lyricsData.isSynced;
                const isActive = isSynced && idx === activeLineIndex;
                const isPast = isSynced && idx < activeLineIndex;

                const sizeClass =
                  lyricsFontSize === 'sm'
                    ? 'text-sm'
                    : lyricsFontSize === 'lg'
                    ? 'text-xl'
                    : 'text-base sm:text-lg';

                if (isSynced && isActive) {
                  const words = calculateLineWords(line, lyricsData.lines[idx + 1]);
                  return (
                    <div
                      key={idx}
                      ref={activeLineRef}
                      onClick={() => seek(line.time)}
                      className="transition-all duration-300 cursor-pointer px-4 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-retro-gold/25 to-amber-500/20 border border-amber-400/50 shadow-xl shadow-amber-500/15 scale-105 my-3 backdrop-blur-md"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 leading-relaxed">
                        {words.length > 0 ? (
                          words.map((w, wIdx) => {
                            const isWordPast = calibratedLyricsTime >= w.endTime;
                            const isWordCurrent = calibratedLyricsTime >= w.startTime && calibratedLyricsTime < w.endTime;
                            return (
                              <span
                                key={wIdx}
                                className={`transition-all duration-150 inline-block ${
                                  isWordCurrent
                                    ? `${sizeClass} font-black text-amber-200 scale-110 drop-shadow-[0_0_18px_rgba(251,191,36,0.95)] animate-pulse`
                                    : isWordPast
                                    ? `${sizeClass} font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]`
                                    : `${sizeClass} font-medium text-white/45`
                                }`}
                              >
                                {w.word}
                              </span>
                            );
                          })
                        ) : (
                          <span className={`${sizeClass} font-bold text-amber-300`}>{line.text}</span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isSynced) {
                        seek(line.time);
                      }
                    }}
                    className={`transition-all duration-300 ${isSynced ? 'cursor-pointer' : ''} px-3 py-1.5 rounded-2xl ${
                      isPast
                        ? `${sizeClass} font-medium text-white/40 hover:text-white/70`
                        : `${sizeClass} font-medium text-white/75 hover:text-white`
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2.5 py-12 text-center px-4">
                <div className="w-14 h-14 rounded-full bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold mb-1">
                  <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
                </div>
                <h4 className="font-serif font-bold text-base text-retro-gold">
                  यह एक दुर्लभ और अनमोल गीत है
                </h4>
                <p className="text-xs text-white/70 max-w-xs leading-relaxed">
                  इस दुर्लभ क्लासिक के बोल डिजिटाइज़ किए जा रहे हैं।
                </p>
                <div className="pt-2.5 border-t border-white/10 w-52 mt-1">
                  <p className="text-[11px] font-semibold text-amber-200/80 italic">
                    "This is a Rare Vintage Masterpiece"
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    Lyrics are currently being archived. Enjoy the music!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HIGH DEFINITION OFFICIAL MUSIC VIDEO VIEW */
        <div
          ref={videoContainerRef}
          onMouseMove={handleUserActivity}
          onTouchStart={handleUserActivity}
          className={`relative z-10 flex flex-col overflow-hidden animate-fade-in ${
            isCinemaFullscreen
              ? 'fixed inset-0 w-screen h-screen z-50 bg-black flex-1 items-center justify-center p-0 m-0'
              : 'flex-1 my-2 bg-black/80 rounded-3xl border border-retro-gold/40 p-3 sm:p-4 backdrop-blur-md shadow-2xl justify-center items-center'
          }`}
        >
          {/* Cinema Header (shown only in portrait mode) */}
          {!isCinemaFullscreen && (
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/10 z-30">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 flex-shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-retro-cream truncate block font-serif">
                      सुनहरे गीत सिनेमा
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 border border-amber-500/40 font-black">
                      HD CINEMA
                    </span>
                  </div>
                  <span className="text-[10px] text-white/60 font-medium truncate block">
                    {currentSong.title} • {currentSong.artist}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={toggleVideoFullscreen}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={loadVideo}
                  disabled={isLoadingVideo}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  title="Refresh Video Stream"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVideo ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Video Frame Display */}
          {isLoadingVideo ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-retro-gold/30 border-t-retro-gold animate-spin" />
                <Tv className="w-5 h-5 text-retro-gold absolute inset-0 m-auto" />
              </div>
              <p className="text-xs font-semibold text-retro-cream">सिनेमा वीडियो लोड हो रहा है...</p>
              <p className="text-[10px] text-white/50">Streaming High-Definition Classic...</p>
            </div>
            <div
              className={`relative flex items-center justify-center bg-black overflow-hidden shadow-2xl ${
                isCinemaFullscreen
                  ? 'w-full h-full max-w-full max-h-screen'
                  : 'w-full aspect-video max-w-md mx-auto rounded-2xl border border-white/15'
              }`}
            >
              {/* 1. Precision Cinema Viewport Cropper (Shifts YouTube top bar & bottom watermark out of view) */}
              <div
                className={`absolute overflow-hidden pointer-events-none ${
                  isCinemaFullscreen
                    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[124vw] min-h-[124vh] w-[124%] h-[124%] aspect-video'
                    : '-top-[14%] -left-[7%] w-[114%] h-[128%]'
                }`}
              >
                <iframe
                  ref={videoIframeRef}
                  title="Sunehre Geet Cinema Video"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    sendIframeCommand('listening');
                    sendIframeCommand('playVideo');
                  }}
                  className="w-full h-full border-0 pointer-events-none"
                />
              </div>

              {/* 2. Top Anti-Watermark Cinema Gradient Shield */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

              {/* 3. Bottom Anti-Watermark Cinema Gradient Shield */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

              {/* Instant 1-Tap Play Center Indicator (visible when paused or unstarted) */}
              {!isVideoPlaying && (
                <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/75 border-2 border-retro-gold/90 flex items-center justify-center text-retro-gold shadow-2xl backdrop-blur-md transition-transform active:scale-95 animate-pulse">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* 4. Touch Barrier Shield (Captures single-tap play/pause, prevents external redirects) */}
              <div
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={() => {
                  toggleVideoPlay();
                  handleUserActivity();
                }}
                title="Tap to Play/Pause"
              />

              {/* 5. Custom Cinema Floating Control Overlay (Auto-hiding on activity) */}
              <div
                className={`absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 transition-opacity duration-300 pointer-events-none ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Top Bar in Cinema */}
                <div className="flex items-center justify-between text-retro-cream pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold drop-shadow-md truncate max-w-[60vw]">
                      {currentSong.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-retro-gold border border-retro-gold/30 font-bold backdrop-blur-md">
                      HD Cinema
                    </span>
                  </div>

                  {isCinemaFullscreen && (
                    <button
                      onClick={toggleVideoFullscreen}
                      className="px-3 py-1 rounded-full bg-black/80 text-white hover:text-retro-gold border border-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Exit Fullscreen</span>
                    </button>
                  )}
                </div>

                {/* Center Playback & Skip Controls */}
                <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPrevious();
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 border border-white/20 text-white hover:text-retro-gold hover:scale-110 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md shadow-lg"
                    title="Previous Track"
                  >
                    <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      seekVideo(videoCurrentTime - 10);
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 border border-white/20 text-white hover:text-retro-gold hover:scale-110 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md shadow-lg"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoPlay();
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-600 text-retro-dark flex items-center justify-center shadow-2xl shadow-retro-gold/40 hover:scale-105 active:scale-95 transition-all"
                    title={isVideoPlaying ? 'Pause' : 'Play'}
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      seekVideo(videoCurrentTime + 10);
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 border border-white/20 text-white hover:text-retro-gold hover:scale-110 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md shadow-lg"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playNext();
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 border border-white/20 text-white hover:text-retro-gold hover:scale-110 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md shadow-lg"
                    title="Next Track"
                  >
                    <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  </button>
                </div>

                {/* Bottom Cinema Scrub Bar & Audio/Fullscreen Buttons */}
                <div className="space-y-1.5 pointer-events-auto bg-black/80 p-2.5 sm:p-3 rounded-2xl border border-white/10 backdrop-blur-md max-w-3xl w-full mx-auto">
                  {/* Scrub Slider */}
                  <input
                    type="range"
                    min="0"
                    max={videoDuration || duration || 300}
                    value={videoCurrentTime}
                    onChange={(e) => seekVideo(parseFloat(e.target.value))}
                    className="w-full h-1 sm:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-retro-gold"
                  />

                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/80">
                    <div className="font-mono text-retro-gold font-bold">
                      <span>{formatTime(videoCurrentTime)}</span>
                      <span className="text-white/40 mx-1">/</span>
                      <span className="text-white/60">{formatTime(videoDuration || duration || 0)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoMute();
                        }}
                        className="text-white/80 hover:text-retro-gold transition-colors flex items-center gap-1 text-xs"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoFullscreen();
                        }}
                        className="text-white/80 hover:text-retro-gold transition-colors flex items-center gap-1 text-xs font-semibold"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2.5 p-6 text-center max-w-sm">
              <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-1">
                <Tv className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-sm text-retro-gold">
                इस गीत का वीडियो उपलब्ध नहीं है
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                यह एक दुर्लभ स्टूडियो रिकॉर्डिंग है। मूल उच्च-गुणवत्ता ऑडियो का आनंद लें।
              </p>
              <button
                onClick={() => switchToAudioView('turntable')}
                className="mt-2 px-4 py-1.5 rounded-full bg-retro-gold/20 text-retro-gold text-xs font-bold border border-retro-gold/30 hover:bg-retro-gold/30 transition-all"
              >
                रिकॉर्ड मोड पर लौटें (Back to Record)
              </button>
            </div>
          )}

          {/* Portrait Subtext Hint */}
            <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px] text-white/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>पूरा स्क्रीन देखने के लिए फोन घुमाएं (Rotate for Fullscreen Cinema)</span>
            </div>
          )}
        </div>
      )}

      {/* Song Details & Actions (hidden in cinema fullscreen) */}
      {!isCinemaFullscreen && (
        <div className="relative z-10 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-lg sm:text-xl font-bold font-serif text-retro-cream truncate leading-tight">
              {currentSong.title}
            </h2>
            <p className="text-xs text-retro-gold font-medium truncate mt-0.5">
              {currentSong.artist} • {currentSong.movie} ({currentSong.year})
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
              className={`p-2.5 rounded-full transition-all ${
                downloaded
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
              title={downloaded ? 'Downloaded' : 'Download Song'}
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-retro-gold border-t-transparent rounded-full animate-spin" />
              ) : downloaded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(currentSong.id, currentSong)}
              className={`p-2.5 rounded-full transition-all ${
                isFav
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={(activeView === 'video' ? videoDuration : duration) || currentSong.duration || 100}
            value={activeView === 'video' ? videoCurrentTime : currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (activeView === 'video') {
                seekVideo(val);
              } else {
                seek(val);
              }
            }}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-retro-gold"
          />
          <div className="flex justify-between text-[11px] text-white/50 font-mono">
            <span>{formatTime(activeView === 'video' ? videoCurrentTime : currentTime)}</span>
            <span>{formatTime((activeView === 'video' ? videoDuration : duration) || currentSong.duration || 0)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-all ${
              isShuffle ? 'text-retro-gold' : 'text-white/40 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={playPrevious}
            className="p-3 text-retro-cream hover:text-retro-gold active:scale-95 transition-all"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={activeView === 'video' ? toggleVideoPlay : togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-600 text-retro-dark flex items-center justify-center shadow-xl shadow-retro-gold/20 active:scale-95 transition-all"
            title={
              activeView === 'video'
                ? isVideoPlaying ? 'Pause Video' : 'Play Video'
                : isPlaying ? 'Pause' : 'Play'
            }
          >
            {(activeView === 'video' ? isVideoPlaying : isPlaying) ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={playNext}
            className="p-3 text-retro-cream hover:text-retro-gold active:scale-95 transition-all"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          {/* Repeat Mode */}
          <button
            onClick={cycleRepeatMode}
            className={`p-2.5 rounded-full transition-all ${
              repeatMode !== 'off' ? 'text-retro-gold' : 'text-white/40 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      )}
    </div>
  );
};