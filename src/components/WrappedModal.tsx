import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Play,
  Pause,
  Share2,
  Calendar,
  Clock,
  Music,
  Disc3,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Check,
  Flame,
  Radio,
  Volume2
} from 'lucide-react';
import { WrappedService, WrappedStats } from '../services/wrappedService';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';

interface WrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WrappedModal: React.FC<WrappedModalProps> = ({ isOpen, onClose }) => {
  const { playSong } = useAudio();

  // Period state
  const [periodType, setPeriodType] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Available options
  const [periods, setPeriods] = useState(() => WrappedService.getAvailablePeriods());

  // Stats for the active selection
  const [stats, setStats] = useState<WrappedStats>(() =>
    WrappedService.getWrappedStats(periodType, selectedYear, selectedMonth)
  );

  // View mode: 'story' or 'summary'
  const [viewMode, setViewMode] = useState<'story' | 'summary'>('story');

  // Story slides state (0 to 9 — 10 slides total)
  const [currentSlide, setCurrentSlide] = useState(0);
  const TOTAL_SLIDES = 10;
  const [isPaused, setIsPaused] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Auto-play music state
  const [wrappedMusicStarted, setWrappedMusicStarted] = useState(false);
  const [highlightReelIndex, setHighlightReelIndex] = useState(0);

  // Slide transition direction
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');

  // Recalculate stats whenever period changes
  useEffect(() => {
    const updated = WrappedService.getWrappedStats(periodType, selectedYear, selectedMonth);
    setStats(updated);
    setCurrentSlide(0);
  }, [periodType, selectedYear, selectedMonth]);

  // Story Auto-advance Timer (variable timing per slide)
  useEffect(() => {
    if (!isOpen || viewMode !== 'story' || isPaused) return;

    // Highlight reel gets more time, genre gets a bit more too
    const slideDuration = currentSlide === 4 ? 10000 : currentSlide === 7 ? 8000 : 6500;

    const timer = setTimeout(() => {
      if (currentSlide < TOTAL_SLIDES - 1) {
        setSlideDirection('right');
        setCurrentSlide((prev) => prev + 1);
      }
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [isOpen, viewMode, currentSlide, isPaused, TOTAL_SLIDES]);

  // Auto-play #1 song when entering slide 1
  useEffect(() => {
    if (!isOpen || viewMode !== 'story') return;
    if (currentSlide === 1 && !wrappedMusicStarted && stats.topSong) {
      const playlist = WrappedService.getWrappedPlaylist(stats);
      playSong(stats.topSong, playlist.length > 0 ? playlist : [stats.topSong]);
      setWrappedMusicStarted(true);
    }
  }, [currentSlide, isOpen, viewMode, wrappedMusicStarted]);

  // Highlight Reel auto-cycle (slide 4): cycle through top 3 songs with 3s each
  useEffect(() => {
    if (!isOpen || viewMode !== 'story' || currentSlide !== 4 || isPaused) return;
    setHighlightReelIndex(0);

    const interval = setInterval(() => {
      setHighlightReelIndex((prev) => {
        const next = prev + 1;
        if (next < Math.min(3, stats.topSongs.length)) {
          // Play the next snippet
          const nextSong = stats.topSongs[next]?.song;
          if (nextSong) {
            playSong(nextSong, stats.topSongs.map(s => s.song));
          }
          return next;
        }
        return prev;
      });
    }, 3000);

    // Play first song of highlight reel immediately
    if (stats.topSongs[0]?.song) {
      playSong(stats.topSongs[0].song, stats.topSongs.map(s => s.song));
    }

    return () => clearInterval(interval);
  }, [currentSlide, isOpen, viewMode, isPaused]);

  if (!isOpen) return null;

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentSlide < TOTAL_SLIDES - 1) {
      setSlideDirection('right');
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentSlide > 0) {
      setSlideDirection('left');
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handlePlayWrappedMix = () => {
    const playlist = WrappedService.getWrappedPlaylist(stats);
    if (playlist.length > 0) {
      playSong(playlist[0], playlist);
      onClose();
    }
  };

  const handleShare = async () => {
    const shareText = `🎵 My Sunehre Geet ${stats.periodLabel}!\n⏱️ ${stats.totalMinutes.toLocaleString()} minutes of golden melodies\n🏆 Top Song: ${stats.topSong?.title || 'Evergreen Classic'}\n🎤 Top Singer: ${stats.topArtist}\n✨ Personality: ${stats.personality.title} (${stats.personality.badgeEmoji})\n\nExplore timeless Bollywood on Sunehre Geet!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Sunehre Geet ${stats.periodLabel}`,
          text: shareText,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4 animate-fade-in select-none">
      <div className="relative w-full h-full sm:max-w-md sm:h-[92vh] sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#180d2b] via-[#100820] to-[#0a0515] border sm:border-retro-gold/30 shadow-2xl flex flex-col">
        
        {/* Top Control Bar */}
        <div className="relative z-20 px-4 pt-3 pb-2 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 font-serif flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>सुनहरे गीत रैप्ड</span>
            </span>

            {/* Mode Switcher */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setViewMode('story')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  viewMode === 'story' ? 'bg-amber-400 text-black shadow' : 'text-white/70'
                }`}
              >
                Stories
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  viewMode === 'summary' ? 'bg-amber-400 text-black shadow' : 'text-white/70'
                }`}
              >
                Summary
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'story' && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Period Selector (Available in both modes) */}
        <div className="relative z-20 px-4 py-2 bg-black/20 flex items-center justify-between gap-2 border-b border-white/5">
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1 rounded-lg transition-all ${
                periodType === 'yearly'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1 rounded-lg transition-all ${
                periodType === 'monthly'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Year or Month Selector Dropdown */}
          {periodType === 'yearly' ? (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#1f1538] text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-amber-500/30 outline-none"
            >
              {periods.years.map((yr) => (
                <option key={yr} value={yr} className="bg-[#180d2b] text-white">
                  {yr} Year
                </option>
              ))}
            </select>
          ) : (
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
              className="bg-[#1f1538] text-rose-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-rose-500/30 outline-none"
            >
              {periods.months.map((item) => (
                <option
                  key={`${item.year}-${item.month}`}
                  value={`${item.year}-${item.month}`}
                  className="bg-[#180d2b] text-white"
                >
                  {item.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* STORY MODE VIEW */}
        {viewMode === 'story' && (
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Story Progress Segment Bars at Top */}
            <div className="relative z-30 px-3 pt-2 pb-1 flex gap-1.5">
              {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                  onClick={() => setCurrentSlide(idx)}
                >
                  <div
                    className={`h-full bg-amber-400 transition-all ${
                      idx < currentSlide
                        ? 'w-full'
                        : idx === currentSlide
                        ? 'w-full animate-[progress_6.5s_linear_forwards]'
                        : 'w-0'
                    }`}
                    style={{
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Invisible Tap Areas for Left/Right Navigation */}
            <div
              className="absolute inset-y-12 left-0 w-1/3 z-20 cursor-pointer"
              onClick={prevSlide}
            />
            <div
              className="absolute inset-y-12 right-0 w-1/3 z-20 cursor-pointer"
              onClick={nextSlide}
            />

            {/* Slide Container */}
            <div key={currentSlide} className={`relative flex-1 p-6 flex flex-col justify-between overflow-y-auto ${
              slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}>
              
              {/* SLIDE 0: INTRO */}
              {currentSlide === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                  <div className="relative w-48 h-48 rounded-full p-2 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-2xl animate-pulse">
                    <div className="w-full h-full rounded-full bg-[#0a0515] p-3 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/40 animate-spin-slow" />
                      <Disc3 className="w-24 h-24 text-amber-400 animate-spin-slow" />
                      <Sparkles className="w-8 h-8 text-rose-400 absolute top-4 right-4 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-widest border border-amber-500/30">
                      Sunehre Geet Wrapped
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#FFF4E0] font-serif leading-tight">
                      {stats.periodLabel}
                    </h2>
                    <p className="text-xs text-amber-100/70 leading-relaxed">
                      Ready to relive the melodies, memories, and legends that accompanied you?
                    </p>
                  </div>

                  <button
                    onClick={nextSlide}
                    className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Tap to Begin Your Story</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* SLIDE 1: TOTAL MINUTES & SONGS + ENHANCED STATS */}
              {currentSlide === 1 && (
                <div className="flex-1 flex flex-col justify-center space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Listening Time
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Music that stayed with you
                    </h2>
                  </div>

                  <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2a1340] to-[#120722] border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-3">
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-3 text-amber-400">
                      <Clock className="w-5 h-5" />
                      <span className="text-xs uppercase tracking-wider font-bold">Total Time Streamed</span>
                    </div>

                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 font-mono">
                      {stats.totalMinutes.toLocaleString()}
                      <span className="text-base font-bold text-amber-200 ml-2">Minutes</span>
                    </div>

                    <p className="text-[11px] text-retro-cream/80 leading-relaxed">
                      That is roughly <strong className="text-amber-300">{Math.round(stats.totalMinutes / 60)} hours</strong> spent with timeless melodies.
                    </p>

                    <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-white/50">Tracks Played</span>
                        <span className="font-bold text-amber-400">{stats.totalSongsCount} Songs</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/50">Unique Songs</span>
                        <span className="font-bold text-cyan-400">{stats.uniqueSongsCount} Tracks</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/50">🔥 Listening Streak</span>
                        <span className="font-bold text-rose-400">{stats.longestStreak} Day{stats.longestStreak !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/50">Most Active Day</span>
                        <span className="font-bold text-purple-400">{stats.mostActiveDay}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 text-[11px]">
                      <span className="text-white/50">Peak Listening Vibe:</span>
                      <span className="font-semibold text-rose-300 ml-1">{stats.peakHourDescription}</span>
                    </div>

                    {stats.firstSongPlayed && (
                      <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                        <img src={stats.firstSongPlayed.coverUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0 text-[11px]">
                          <span className="text-white/50">First Song of the Period: </span>
                          <span className="font-bold text-amber-300 truncate block">{stats.firstSongPlayed.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SLIDE 2: TOP SONG (#1) */}
              {currentSlide === 2 && stats.topSong && (
                <div className="flex-1 flex flex-col justify-center space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-widest">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Your #1 Song of the Period</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Your Anthem & Favorite Track
                    </h2>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#301648] via-[#1f0d33] to-[#120622] border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
                    <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/50">
                      <img
                        src={stats.topSong.coverUrl}
                        alt={stats.topSong.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-amber-400 text-black font-black text-xs px-2 py-0.5 rounded-full shadow">
                        #1
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-[#FFF4E0] font-serif line-clamp-1">
                        {stats.topSong.title}
                      </h3>
                      <p className="text-xs text-amber-300 font-semibold">
                        {stats.topSong.artist}
                      </p>
                      <p className="text-[11px] text-white/60">
                        {stats.topSong.movie} ({stats.topSong.year})
                      </p>
                    </div>

                    <div className="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs">
                      Played {stats.topSongs[0]?.plays || 18} times
                    </div>

                    <button
                      onClick={() => playSong(stats.topSong!, [stats.topSong!])}
                      className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Play Track</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 3: TOP 5 SONGS COUNTDOWN */}
              {currentSlide === 3 && (
                <div className="flex-1 flex flex-col justify-center space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                      Top 5 Songs
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Your Heavy Rotation
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {stats.topSongs.slice(0, 5).map((item, idx) => (
                      <div
                        key={item.song.id}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all"
                      >
                        <span className={`w-6 text-center font-black text-sm ${
                          idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-rose-400' : 'text-white/60'
                        }`}>
                          #{idx + 1}
                        </span>

                        <img
                          src={item.song.coverUrl}
                          alt={item.song.title}
                          className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.song.title}
                          </h4>
                          <p className="text-[10px] text-amber-200/80 truncate">
                            {item.song.artist}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-semibold">
                            {item.plays}x
                          </span>
                          <button
                            onClick={() => playSong(item.song, stats.topSongs.map(s => s.song))}
                            className="p-1.5 rounded-full bg-amber-400 text-black hover:scale-110 active:scale-95 transition-all shadow"
                          >
                            <Play className="w-3 h-3 fill-black" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE 4: HIGHLIGHT REEL MASHUP (NEW) */}
              {currentSlide === 4 && (
                <div className="flex-1 flex flex-col justify-center space-y-5 animate-fade-in">
                  <div className="space-y-1 text-center">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Your Highlight Reel</span>
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Top 3 Hits Mashup
                    </h2>
                    <p className="text-[11px] text-white/60">
                      Rapid-fire previews of your most-played songs
                    </p>
                  </div>

                  <div className="relative p-5 rounded-3xl bg-gradient-to-br from-[#2a0f3a] via-[#1a0826] to-[#0f0518] border border-rose-500/40 shadow-2xl overflow-hidden">
                    {/* Animated background glow */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-rose-500 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Active song display */}
                    <div className="relative z-10 flex flex-col items-center space-y-4">
                      {stats.topSongs.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.song.id}
                          className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-500 ${
                            idx === highlightReelIndex
                              ? 'bg-white/15 border border-rose-400/50 scale-105 shadow-lg shadow-rose-500/20'
                              : 'bg-white/5 border border-white/10 opacity-50 scale-95'
                          }`}
                        >
                          <div className={`relative flex-shrink-0 ${idx === highlightReelIndex ? 'animate-pulse' : ''}`}>
                            <img
                              src={item.song.coverUrl}
                              alt={item.song.title}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-white/20"
                            />
                            {idx === highlightReelIndex && (
                              <div className="absolute inset-0 rounded-xl border-2 border-rose-400 animate-ping opacity-40" />
                            )}
                            <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-rose-400 text-white' : 'bg-purple-400 text-white'
                            }`}>
                              #{idx + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{item.song.title}</h4>
                            <p className="text-[11px] text-white/70 truncate">{item.song.artist.split(',')[0]}</p>
                          </div>

                          {idx === highlightReelIndex && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map(bar => (
                                  <div
                                    key={bar}
                                    className="w-0.5 bg-rose-400 rounded-full animate-bounce"
                                    style={{
                                      height: `${8 + Math.random() * 12}px`,
                                      animationDelay: `${bar * 0.15}s`,
                                      animationDuration: '0.6s'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Progress dots */}
                    <div className="relative z-10 flex justify-center gap-2 mt-4">
                      {stats.topSongs.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === highlightReelIndex ? 'w-6 bg-rose-400' : 'w-1.5 bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 5: TOP ARTISTS / LEGENDS */}
              {currentSlide === 5 && (
                <div className="flex-1 flex flex-col justify-center space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                      Top Artists
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Your Musical Companions
                    </h2>
                  </div>

                  {/* Top #1 Artist Featured */}
                  {stats.topArtists[0] && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-950/60 border border-purple-400/40 flex items-center gap-4">
                      <img
                        src={stats.topArtists[0].avatarUrl}
                        alt={stats.topArtists[0].artistName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-lg flex-shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                          #1 Most Listened Singer
                        </span>
                        <h3 className="text-base font-bold text-white truncate">
                          {stats.topArtists[0].artistName}
                        </h3>
                        <p className="text-xs text-purple-200/80 truncate">
                          Top hit: {stats.topArtists[0].topSongTitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Artists 2 to 5 */}
                  <div className="grid grid-cols-2 gap-2">
                    {stats.topArtists.slice(1, 5).map((artist, idx) => (
                      <div
                        key={artist.artistName}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5"
                      >
                        <span className="text-xs font-bold text-white/50">#{idx + 2}</span>
                        <img
                          src={artist.avatarUrl}
                          alt={artist.artistName}
                          className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">
                            {artist.artistName}
                          </h5>
                          <span className="text-[10px] text-amber-400/80 font-semibold">
                            {artist.plays} plays
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE 6: DECADES & ERAS */}
              {currentSlide === 6 && (
                <div className="flex-1 flex flex-col justify-center space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Decades & Eras
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Your Journey Through Time
                    </h2>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#201038] to-[#0f071d] border border-amber-500/30 space-y-4">
                    <p className="text-xs text-retro-cream/80">
                      Your tastes span across golden eras of Indian music:
                    </p>

                    <div className="space-y-3">
                      {stats.decadeBreakdown.map((item) => (
                        <div key={item.decade} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-white">{item.label}</span>
                            <span className="text-amber-400 font-mono">{item.percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-1000"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 7: GENRE / MOOD BREAKDOWN (NEW) */}
              {currentSlide === 7 && (
                <div className="flex-1 flex flex-col justify-center space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Your Music Mood</span>
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Genre & Mood Map
                    </h2>
                  </div>

                  <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0f1e3a] via-[#0d1528] to-[#0a0b18] border border-cyan-500/30 space-y-3">
                    <p className="text-[11px] text-white/70">
                      The moods and genres that colored your listening:
                    </p>

                    <div className="space-y-3">
                      {stats.genreBreakdown.map((item, idx) => (
                        <div key={item.genre} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <span className="text-base">{item.emoji}</span>
                              <span>{item.genre}</span>
                            </span>
                            <span className={`font-bold font-mono ${
                              idx === 0 ? 'text-cyan-400' : idx === 1 ? 'text-purple-400' : 'text-white/70'
                            }`}>{item.percentage}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                idx === 0 ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                                : idx === 1 ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                                : idx === 2 ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                : 'bg-gradient-to-r from-white/40 to-white/20'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {stats.genreBreakdown[0] && (
                      <div className="pt-3 border-t border-white/10 text-center">
                        <p className="text-[11px] text-white/60">
                          Your dominant mood is <strong className="text-cyan-300">{stats.genreBreakdown[0].emoji} {stats.genreBreakdown[0].genre}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SLIDE 8: MUSICAL PERSONALITY REVEAL */}
              {currentSlide === 8 && (
                <div className="flex-1 flex flex-col justify-center space-y-5 animate-fade-in">
                  <div className="space-y-1 text-center">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                      Your Musical Archetype
                    </span>
                    <h2 className="text-2xl font-bold text-white font-serif">
                      Who You Are In Music
                    </h2>
                  </div>

                  <div
                    className={`p-6 rounded-3xl bg-gradient-to-br ${stats.personality.gradient} border border-white/20 shadow-2xl text-center space-y-4 text-white relative overflow-hidden`}
                  >
                    <div className="text-5xl">{stats.personality.badgeEmoji}</div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-extrabold font-serif">
                        {stats.personality.title}
                      </h3>
                      <p className="text-xs font-semibold text-white/90 italic">
                        {stats.personality.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {stats.personality.description}
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 9: COMPLETE SUMMARY CARD / SHAREABLE POSTER */}
              {currentSlide === 9 && (
                <div className="flex-1 flex flex-col justify-between space-y-4 animate-fade-in">
                  <div className="space-y-1 text-center">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Your Wrapped Poster
                    </span>
                    <h2 className="text-xl font-bold text-white font-serif">
                      {stats.periodLabel}
                    </h2>
                  </div>

                  {/* Shareable Infographic Card */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-[#2a1345] via-[#1b0a2e] to-[#0c0516] border border-amber-400/40 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Disc3 className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-xs text-amber-300 font-serif">Sunehre Geet</span>
                      </div>
                      <span className="text-[10px] text-white/60 font-semibold">{stats.periodLabel}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-white/60 block">Total Streamed</span>
                        <strong className="text-base text-amber-300 font-mono">{stats.totalMinutes} Mins</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-white/60 block">Personality</span>
                        <strong className="text-xs text-rose-300 font-bold block truncate">{stats.personality.title}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Top 3 Songs:
                      </span>
                      {stats.topSongs.slice(0, 3).map((item, i) => (
                        <div key={item.song.id} className="flex items-center justify-between text-xs">
                          <span className="text-white truncate max-w-[200px]">
                            {i + 1}. {item.song.title}
                          </span>
                          <span className="text-white/60 text-[10px]">{item.song.artist.split(',')[0]}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-white/60">Top Singer:</span>
                      <span className="text-amber-300 font-bold">{stats.topArtist}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handlePlayWrappedMix}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Play My Wrapped Mix ({stats.topSongs.length} Songs)</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full py-2.5 rounded-2xl bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/15 transition-all border border-white/10"
                    >
                      {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{shareCopied ? 'Stats Copied to Clipboard!' : 'Share Your Wrapped'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Nav Stepper */}
              <div className="relative z-30 pt-4 flex items-center justify-between">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`p-2 rounded-full bg-white/10 text-white/70 hover:text-white transition-all ${
                    currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-[11px] text-white/50 font-mono">
                  {currentSlide + 1} / {TOTAL_SLIDES}
                </span>

                <button
                  onClick={nextSlide}
                  disabled={currentSlide === TOTAL_SLIDES - 1}
                  className={`p-2 rounded-full bg-white/10 text-white/70 hover:text-white transition-all ${
                    currentSlide === TOTAL_SLIDES - 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY DASHBOARD VIEW */}
        {viewMode === 'summary' && (
          <div className="relative flex-1 p-4 overflow-y-auto space-y-4">
            {/* Header summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-950/20 border border-amber-500/30">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Total Listened
                </span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {stats.totalMinutes} <span className="text-xs font-normal text-amber-200">Mins</span>
                </div>
                <span className="text-[10px] text-white/60">{stats.totalSongsCount} total tracks</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-950/20 border border-rose-500/30">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  Personality
                </span>
                <div className="text-sm font-bold text-white mt-1 line-clamp-1">
                  {stats.personality.badgeEmoji} {stats.personality.title}
                </div>
                <span className="text-[10px] text-rose-200/70 line-clamp-1">{stats.personality.subtitle}</span>
              </div>
            </div>

            {/* Play Mix Button */}
            <button
              onClick={handlePlayWrappedMix}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play {stats.periodLabel} Mix</span>
            </button>

            {/* Top Songs List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Top Songs</span>
              </h4>

              <div className="space-y-1.5">
                {stats.topSongs.map((item, idx) => (
                  <div
                    key={item.song.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all"
                  >
                    <span className="w-5 text-center font-bold text-xs text-amber-400">
                      {idx + 1}
                    </span>
                    <img
                      src={item.song.coverUrl}
                      alt={item.song.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{item.song.title}</div>
                      <div className="text-[10px] text-white/60 truncate">{item.song.artist}</div>
                    </div>
                    <button
                      onClick={() => playSong(item.song, stats.topSongs.map(s => s.song))}
                      className="p-1.5 rounded-full bg-amber-400 text-black flex-shrink-0"
                    >
                      <Play className="w-3 h-3 fill-black" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists Row */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>Top Artists</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {stats.topArtists.map((artist, idx) => (
                  <div
                    key={artist.artistName}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5"
                  >
                    <img
                      src={artist.avatarUrl}
                      alt={artist.artistName}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{artist.artistName}</div>
                      <div className="text-[10px] text-amber-400 font-semibold">{artist.plays} plays</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eras Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Era Breakdown
              </h4>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                {stats.decadeBreakdown.map((d) => (
                  <div key={d.decade} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/80">{d.label}</span>
                      <span className="text-amber-400 font-bold">{d.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-2xl bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 hover:bg-white/15 transition-all"
            >
              {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{shareCopied ? 'Stats Copied to Clipboard!' : 'Share Your Wrapped'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
