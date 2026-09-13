import React, { useState } from 'react';
import { Play, Sparkles, Flame, Radio, Shuffle, Download, Check, Disc3 } from 'lucide-react';
import { SONGS } from '../data/songs';
import { ARTISTS } from '../data/artists';
import { DECADES } from '../data/decades';
import { Artist, Decade, Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { useDownload } from '../context/DownloadContext';
import { RecommendationService } from '../services/recommendationService';
import { WrappedBanner } from '../components/WrappedBanner';

interface HomeViewProps {
  onSelectArtist: (artist: Artist) => void;
  onSelectDecade: (decadeId: Decade['id']) => void;
  onOpenCreatePlaylist: (songId?: string) => void;
  onOpenWrapped?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectArtist,
  onSelectDecade,
  onOpenWrapped,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { downloadSong, isDownloaded, downloadingId } = useDownload();

  // Pure Indian / Bollywood Master Collection for Home Screen (strictly no regional Bhojpuri/junk)
  const indianSongs = SONGS.filter((s) => {
    if (s.language === 'english') return false;
    const combined = `${s.title} ${s.artist} ${s.movie} ${s.genre || ''}`.toLowerCase();
    return !combined.includes('bhojpuri') && !combined.includes('khesari') && !combined.includes('nirahua');
  });

  const indianArtists = ARTISTS.filter((a) => a.category !== 'international');

  // Masterpieces algorithm prioritized for timeless golden classics (90%+ Kishore, Lata, Rafi, Mukesh, Asha, Jagjit, Sonu, KK, Sanu, Udit)
  const generateBalancedMasterpieces = (): Song[] => {
    // Top Evergreen Core Legends
    const goldenLegends = [
      'kishore', 'lata', 'rafi', 'mukesh', 'asha', 'jagjit', 'hemant', 
      'manna dey', 'talat mahmood', 'sonu nigam', 'kk', 'kumar sanu', 
      'udit narayan', 'alka yagnik', 'lucky ali', 'shreya ghoshal'
    ];

    // Singers requested to have minimal/very rare suggestion in random masterpieces
    const rareSingers = [
      'badshah', 'guru randhawa', 'mika singh', 'b praak', 
      'darshan raval', 'papon', 'yesudas', 'saigal', 'suraiya'
    ];

    const pickedSongs: Song[] = [];
    const usedIds = new Set<string>();

    // 1. Pick 18 songs strictly from the timeless Golden Era masters
    const corePool = indianSongs.filter((s) => {
      const txt = `${s.artist} ${s.title}`.toLowerCase();
      return goldenLegends.some((g) => txt.includes(g)) && !rareSingers.some((r) => txt.includes(r));
    }).sort(() => 0.5 - Math.random());

    for (const song of corePool) {
      if (!usedIds.has(song.id)) {
        pickedSongs.push(song);
        usedIds.add(song.id);
      }
      if (pickedSongs.length >= 20) break;
    }

    return pickedSongs.sort(() => 0.5 - Math.random());
  };

  // Instant initial load with zero delay
  const [randomSuggestions, setRandomSuggestions] = useState<Song[]>(() => {
    return generateBalancedMasterpieces();
  });

  const refreshRandomSuggestions = () => {
    setRandomSuggestions(generateBalancedMasterpieces());
  };

  return (
    <div className="pb-48 pt-3 px-4 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* 1. Hero Radio Banner */}
      <section className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#2a1b4e] via-[#1a0f33] to-[#0c0817] border border-retro-gold/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-retro-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2 max-w-[70%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-retro-gold/20 text-retro-gold text-[11px] font-bold tracking-wider uppercase border border-retro-gold/30">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>NON-STOP GOLDEN RADIO</span>
            </div>
            <h2 className="text-xl font-bold text-retro-cream font-serif leading-tight">
              सदाबहार रेडियो स्टेशन
            </h2>
            <p className="text-xs text-retro-cream/70 line-clamp-2">
              2,800+ अमर बॉलीवुड गीत (1950 - 2010s)। 100% विज्ञापन-मुक्त।
            </p>
          </div>

          <button
            onClick={() => {
              const randomTrack = indianSongs[Math.floor(Math.random() * indianSongs.length)];
              playSong(randomTrack, indianSongs);
            }}
            className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-xl shadow-retro-gold/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0 ml-3"
            title="Play Radio"
          >
            <Play className="w-8 h-8 fill-black ml-1" />
          </button>
        </div>
      </section>

      {/* Sunehre Geet Wrapped Banner: Strictly for the last 7 days of the year (Dec 25 - Dec 31) */}
      {onOpenWrapped && (() => {
        const now = new Date();
        const isYearEnd = now.getMonth() === 11 && now.getDate() >= 25 && now.getDate() <= 31;
        return isYearEnd ? <WrappedBanner onOpenWrapped={onOpenWrapped} periodType="yearly" /> : null;
      })()}

      {/* 2. Mood & Ras (भाव) Curated Categories */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
              मूड और भाव (Mood Playlists)
            </h3>
            <p className="text-[10px] text-white/50">आपके हर एहसास के लिए ख़ास धुनें</p>
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
          {[
            {
              id: 'romantic',
              title: 'प्यार के नग़मे',
              sub: 'Golden Romance',
              emoji: '❤️',
              bg: 'from-rose-900/80 to-amber-950/80',
              border: 'border-rose-500/30',
              keywords: ['pyaar', 'dil', 'ishq', 'mohabbat', 'sanam', 'deewana', 'tum', 'chand'],
            },
            {
              id: 'sad',
              title: 'दर्द भरे गीत',
              sub: 'Soulful & Melancholy',
              emoji: '💔',
              bg: 'from-indigo-950/80 to-slate-900/80',
              border: 'border-indigo-500/30',
              keywords: ['dard', 'gham', 'juda', 'aansoo', 'kismat', 'bewafa', 'tanhai', 'roye'],
            },
            {
              id: 'monsoon',
              title: 'बरखा ऋतू',
              sub: 'Monsoon & Rain Ragas',
              emoji: '🌧️',
              bg: 'from-cyan-950/80 to-blue-950/80',
              border: 'border-cyan-500/30',
              keywords: ['rimjhim', 'barish', 'sawan', 'badal', 'megha', 'barse', 'boond'],
            },
            {
              id: 'ghazal',
              title: 'शाम-ए-ग़ज़ल',
              sub: 'Jagjit & Soul Ghazals',
              emoji: '☕',
              bg: 'from-amber-950/80 to-orange-950/80',
              border: 'border-amber-500/30',
              keywords: ['ghazal', 'jagjit', 'mehdi', 'chitra', 'hothon', 'baat', 'shaam', 'nazar'],
            },
            {
              id: 'masti',
              title: 'मस्ती और क़व्वाली',
              sub: 'Retro Dance & Beats',
              emoji: '🕺',
              bg: 'from-emerald-950/80 to-teal-950/80',
              border: 'border-emerald-500/30',
              keywords: ['disco', 'masti', 'qawwali', 'dosti', 'dum', 'pardesiya', 'sholay'],
            },
          ].map((m) => {
            return (
              <div
                key={m.id}
                onClick={() => {
                  const moodTracks = indianSongs.filter((s) => {
                    const txt = `${s.title} ${s.artist} ${s.movie || ''}`.toLowerCase();
                    return m.keywords.some((k) => txt.includes(k));
                  });
                  const pool = moodTracks.length > 0 ? moodTracks : indianSongs;
                  const firstTrack = pool[Math.floor(Math.random() * pool.length)];
                  playSong(firstTrack, pool);
                }}
                className={`w-[130px] flex-shrink-0 snap-start cursor-pointer rounded-2xl p-3 bg-gradient-to-br ${m.bg} border ${m.border} hover:scale-105 active:scale-95 transition-all shadow-lg flex flex-col justify-between`}
              >
                <div className="text-2xl mb-2">{m.emoji}</div>
                <div>
                  <h4 className="font-bold text-xs text-white truncate font-serif">{m.title}</h4>
                  <p className="text-[9px] text-retro-gold/80 truncate mt-0.5">{m.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. रैंडम मास्टरपीस (Random Masterpieces) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
                रैंडम मास्टरपीस (Random Masterpieces)
              </h3>
              <p className="text-[10px] text-white/50">
                हर बार कुछ नया, अनोखा और सदाबहार
              </p>
            </div>
          </div>

          <button
            onClick={refreshRandomSuggestions}
            className="flex items-center gap-1 text-xs text-retro-gold hover:text-amber-300 font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-retro-gold/30 transition-all active:scale-95"
            title="Shuffle New Masterpieces"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>बदलें (New)</span>
          </button>
        </div>

        {/* Horizontal Scroll Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {randomSuggestions.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const downloaded = isDownloaded(song.id);
            const isDownloading = downloadingId === song.id;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, randomSuggestions)}
                className="w-[136px] flex-shrink-0 snap-start group cursor-pointer bg-[#18112b] rounded-2xl p-2.5 border border-white/10 hover:border-retro-gold/50 transition-all shadow-md flex flex-col justify-between"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#22163d]">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                      {isCurrent && isPlaying ? (
                        <Disc3 className="w-4 h-4 text-black animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4
                    className={`font-semibold text-xs truncate ${
                      isCurrent ? 'text-retro-gold' : 'text-retro-cream'
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p className="text-[10px] text-white/50 truncate">
                    {song.artist.split(',')[0]}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-retro-gold/90 font-mono">
                    {song.year}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDownloading && !downloaded) {
                        downloadSong(song);
                      }
                    }}
                    className="p-1 rounded-full text-white/40 hover:text-retro-gold"
                    title={downloaded ? 'Saved Offline' : 'Download'}
                  >
                    {isDownloading ? (
                      <div className="w-3 h-3 border-2 border-retro-gold border-t-transparent rounded-full animate-spin" />
                    ) : downloaded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Golden Decades (दशक) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
              सुनहरे दशक (Golden Eras)
            </h3>
            <p className="text-[10px] text-white/50">
              1950 के क्लासिक्स से लेकर 2000 के हिट्स तक
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DECADES.map((decade) => (
            <button
              key={decade.id}
              onClick={() => onSelectDecade(decade.id)}
              className="group relative overflow-hidden rounded-2xl p-4 text-left border border-white/10 hover:border-retro-gold/40 transition-all bg-[#18112b] shadow-md flex flex-col justify-between min-h-[95px]"
            >
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-bold text-retro-gold uppercase tracking-wider">
                  {decade.years}
                </span>
                <h4 className="font-serif font-bold text-sm text-retro-cream group-hover:text-retro-gold transition-colors">
                  {decade.hindiTitle}
                </h4>
              </div>
              <p className="relative z-10 text-[10px] text-white/50 line-clamp-1">
                {decade.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Top Maestros Preview (शीर्ष गायक) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream">
            शीर्ष गायक (Top Maestros)
          </h3>
          <span className="text-xs text-retro-gold/80 font-semibold">
            {indianArtists.length} गायक
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {indianArtists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className="flex-shrink-0 flex flex-col items-center space-y-1.5 group w-20 text-center snap-start"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-retro-gold/40 to-purple-500/40 group-hover:from-retro-gold group-hover:to-amber-500 transition-all shadow-md">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-bold text-retro-cream truncate w-full group-hover:text-retro-gold transition-colors">
                {artist.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
