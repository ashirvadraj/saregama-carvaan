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
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
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
    playNext,
    playPrevious,
    seek,
    toggleShuffle,
    cycleRepeatMode,
    setIsFullPlayerOpen,
  } = useAudio();

  const { isFavorite, toggleFavorite } = usePlaylists();
  const { isDownloaded, downloadSong, deleteDownload, downloadingId } = useDownload();

  const [activeView, setActiveView] = useState<'turntable' | 'lyrics'>('turntable');
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsFontSize, setLyricsFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const [lyricsCurrentTime, setLyricsCurrentTime] = useState<number>(currentTime);

  // High-frequency 60fps ticker for Apple Music word-by-word karaoke synchronization
  useEffect(() => {
    let animFrameId: number;
    if (activeView === 'lyrics' && isPlaying) {
      const updateLyricsTimestamp = () => {
        setLyricsCurrentTime(currentTime);
        animFrameId = requestAnimationFrame(updateLyricsTimestamp);
      };
      animFrameId = requestAnimationFrame(updateLyricsTimestamp);
    }
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [activeView, isPlaying, currentTime]);

  // Load lyrics whenever song changes
  useEffect(() => {
    if (currentSong) {
      loadLyrics();
    }
  }, [currentSong?.id]);

  const loadLyrics = async (forceRefresh = false) => {
    if (!currentSong) return;
    setIsLoadingLyrics(true);
    try {
      const data = await fetchLyricsForSong(currentSong, forceRefresh);
      setLyricsData(data);
    } catch (err) {
      console.warn('Lyrics fetch failed:', err);
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
    setLyricsCurrentTime(time);
  };

  const handleLyricsLineClick = (lineTime: number) => {
    seek(lineTime);
    setLyricsCurrentTime(lineTime);
  };

  // Find active line index based on real-time playback timestamp
  let activeLineIndex = -1;
  const effectiveLyricsTime = activeView === 'lyrics' && isPlaying ? lyricsCurrentTime : currentTime;
  const calibratedLyricsTime = effectiveLyricsTime + 0.20; // 200ms vocal lead alignment

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden animate-fade-in p-5 bg-gradient-to-b from-[#2D0916] via-[#0D0407] to-[#080204]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-retro-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-retro-cream hover:bg-white/10 active:scale-95 transition-all"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* View Switcher: Turntable Record vs Synced Lyrics */}
        <div className="flex items-center p-1 rounded-full bg-black/60 border border-retro-gold/30 shadow-lg">
          <button
            onClick={() => setActiveView('turntable')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeView === 'turntable'
                ? 'bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Record</span>
            <span>Record</span>
          </button>
          <button
            onClick={() => {
              setActiveView('lyrics');
              if (!lyricsData && !isLoadingLyrics) loadLyrics();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeView === 'lyrics'
                ? 'bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark shadow-md'
                : 'text-retro-gold/90 hover:text-retro-gold hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lyrics</span>
            <span>Lyrics</span>
            {lyricsData?.isSynced && (
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
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

      {/* Center View: Turntable OR Synced Lyrics */}
      {activeView === 'turntable' ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 animate-fade-in">
          {/* Full Edge-to-Edge Rotating CD/Vinyl Disc */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center my-2 sm:my-3">
            {/* Ambient Dynamic Glow */}
            <div className="absolute inset-0 rounded-full bg-retro-gold/25 blur-3xl pointer-events-none" />

            {/* Rotating Vinyl Disc */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden border-4 border-retro-gold shadow-2xl shadow-black flex items-center justify-center vinyl-grooves"
              style={{
                animation: isPlaying ? 'spin 16s linear infinite' : 'none',
              }}
            >
              {/* Grooves and Center Album Art */}
              <div className="absolute inset-0 vinyl-sheen rounded-full pointer-events-none" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-retro-gold/80 shadow-inner">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
                <div className="absolute inset-0 rounded-full border-2 border-black/50" />
                <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-retro-dark border-2 border-retro-gold" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Apple Music Style Karaoke Synced Lyrics View */
        <div className="relative z-10 flex-1 flex flex-col my-3 overflow-hidden animate-fade-in">
          {/* Lyrics Controls Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-retro-gold" />
              <span className="text-xs font-bold text-retro-cream">
                {lyricsData?.isSynced ? 'तालमेल बोल (Synced Lyrics)' : 'गीत के बोल (Lyrics)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleFontSize}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-retro-gold text-xs font-bold flex items-center gap-1"
                title="Change Font Size"
              >
                <Type className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px]">{lyricsFontSize}</span>
              </button>

              <button
                onClick={() => loadLyrics(true)}
                disabled={isLoadingLyrics}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-retro-gold disabled:opacity-50"
                title="Reload Lyrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLyrics ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Scrolling Lyrics Container */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth text-center select-text scrollbar-thin scrollbar-thumb-retro-gold/20"
          >
            {isLoadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 py-16">
                <Loader2 className="w-8 h-8 text-retro-gold animate-spin" />
                <p className="text-sm font-medium text-retro-cream/70 animate-pulse">
                  गीत के बोल खोजे जा रहे हैं... (Fetching Lyrics)
                </p>
              </div>
            ) : lyricsData && lyricsData.lines.length > 0 ? (
              lyricsData.lines.map((line, idx) => {
                const isLineActive = idx === activeLineIndex;
                const isLinePast = idx < activeLineIndex;

                let fontSizeClass = 'text-lg sm:text-xl';
                if (lyricsFontSize === 'sm') fontSizeClass = 'text-base sm:text-lg';
                if (lyricsFontSize === 'lg') fontSizeClass = 'text-xl sm:text-2xl font-bold';

                const nextLine = lyricsData.lines[idx + 1];
                const lineDuration = nextLine ? Math.max(1, nextLine.time - line.time) : 4.0;
                const wordsWithTimings = calculateLineWords(line.text, line.time, lineDuration);

                return (
                  <div
                    key={idx}
                    ref={isLineActive ? activeLineRef : null}
                    onClick={() => lyricsData.isSynced && handleLyricsLineClick(line.time)}
                    className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-2xl ${fontSizeClass} ${
                      isLineActive
                        ? 'text-retro-gold scale-105 font-extrabold drop-shadow-[0_0_12px_rgba(243,198,77,0.6)] bg-retro-gold/10'
                        : isLinePast
                        ? 'text-white/40 font-medium hover:text-white/70'
                        : 'text-white/60 font-medium hover:text-white/90'
                    }`}
                  >
                    {isLineActive && lyricsData.isSynced ? (
                      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
                        {wordsWithTimings.map((w, wIdx) => {
                          const isWordActive =
                            calibratedLyricsTime >= w.startTime && calibratedLyricsTime <= w.endTime + 0.1;
                          const isWordPast = calibratedLyricsTime > w.endTime + 0.1;

                          return (
                            <span
                              key={wIdx}
                              className={`transition-all duration-150 inline-block ${
                                isWordActive
                                  ? 'text-amber-200 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                                  : isWordPast
                                  ? 'text-retro-gold opacity-90'
                                  : 'text-retro-gold/60'
                              }`}
                            >
                              {w.word}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      line.text
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-2 py-16 text-white/50">
                <FileText className="w-8 h-8 text-retro-gold/40 mb-1" />
                <p className="text-sm font-semibold">गीत के बोल उपलब्ध नहीं हैं</p>
                <p className="text-xs">No synchronized lyrics found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Song Metadata Details */}
      <div className="relative z-10 flex items-center justify-between mb-3 px-1">
        <div className="space-y-1 max-w-[75%]">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-retro-cream truncate">
            {currentSong.title}
          </h2>
          <p className="text-xs sm:text-sm text-retro-gold/90 truncate font-medium">
            {currentSong.artist}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-retro-muted">
            {currentSong.movie && <span>🎬 {currentSong.movie}</span>}
            {currentSong.year && <span>• {currentSong.year}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadClick}
            className={`p-2.5 rounded-full transition-all ${
              downloaded
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
            title={downloaded ? 'Downloaded Offline' : 'Download for Offline'}
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin text-retro-gold" />
            ) : downloaded ? (
              <Check className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => toggleFavorite(currentSong)}
            className={`p-2.5 rounded-full transition-all ${
              isFav
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
            title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-400 text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Scrubber / Progress Bar */}
      <div className="relative z-10 space-y-1.5 mb-2">
        <input
          type="range"
          min="0"
          max={duration || currentSong.duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-retro-gold focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-mono text-white/50 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentSong.duration || 0)}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="relative z-10 flex items-center justify-between px-2 mb-2">
        <button
          onClick={toggleShuffle}
          className={`p-2.5 rounded-full transition-all ${
            isShuffle
              ? 'text-retro-gold bg-retro-gold/15 border border-retro-gold/40'
              : 'text-white/50 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={playPrevious}
          className="p-3 text-retro-cream hover:text-retro-gold active:scale-95 transition-all"
          title="Previous Track"
        >
          <SkipBack className="w-7 h-7 fill-current" />
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-retro-gold via-amber-400 to-amber-500 text-retro-dark flex items-center justify-center shadow-xl shadow-retro-gold/30 hover:scale-105 active:scale-95 transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={playNext}
          className="p-3 text-retro-cream hover:text-retro-gold active:scale-95 transition-all"
          title="Next Track"
        >
          <SkipForward className="w-7 h-7 fill-current" />
        </button>

        <button
          onClick={cycleRepeatMode}
          className={`p-2.5 rounded-full transition-all ${
            repeatMode !== 'off'
              ? 'text-retro-gold bg-retro-gold/15 border border-retro-gold/40'
              : 'text-white/50 hover:text-white'
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
  );
};
