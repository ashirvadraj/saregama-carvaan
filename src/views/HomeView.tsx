import React, { useState } from 'react';
import { Play, Sparkles, Flame, Radio, Shuffle, Download, Check, Disc3 } from 'lucide-react';
import { SONGS } from '../data/songs';
import { ARTISTS } from '../data/artists';
import { DECADES } from '../data/decades';
import { Artist, Decade, Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { useDownload } from '../context/DownloadContext';
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
  const { currentSong, isPlaying, playSong } = useAudio();
  const { downloadSong, isDownloaded, downloadingId } = useDownload();

  const carvaanSongs = SONGS;
  const topArtists = ARTISTS;

  const generateBalancedMasterpieces = (): Song[] => {
    const shuffled = [...carvaanSongs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 24);
  };

  const [randomSuggestions, setRandomSuggestions] = useState<Song[]>(() => {
    return generateBalancedMasterpieces();
  });

  const refreshRandomSuggestions = () => {
    setRandomSuggestions(generateBalancedMasterpieces());
  };

  return (
    <div className="pb-48 pt-3 px-4 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* 1. Hero Radio Banner */}
      <section className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#3B0F23] via-[#240A15] to-[#0D0407] border border-retro-gold/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-retro-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2 max-w-[70%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-retro-gold/20 text-retro-gold text-[11px] font-bold tracking-wider uppercase border border-retro-gold/30">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>CARVAAN 24/7 RADIO</span>
            </div>
            <h2 className="text-xl font-bold text-retro-cream font-serif leading-tight">
              सदाबहार कारवां रेडियो
            </h2>
            <p className="text-xs text-retro-cream/70 line-clamp-2">
              5,000+ क्लासिक बॉलीवुड गीत एवं अमीन सयानी गीतमाला। 100% विज्ञापन-मुक्त।
            </p>
          </div>

          <button
            onClick={() => {
              const randomTrack = carvaanSongs[Math.floor(Math.random() * carvaanSongs.length)];
              playSong(randomTrack, carvaanSongs);
            }}
            className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-xl shadow-retro-gold/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0 ml-3"
            title="Play Radio"
          >
            <Play className="w-8 h-8 fill-black ml-1" />
          </button>
        </div>
      </section>

      {/* Carvaan Wrapped Banner */}
      {onOpenWrapped && (() => {
        const now = new Date();
        const isYearEnd = now.getMonth() === 11 && now.getDate() >= 25 && now.getDate() <= 31;
        return isYearEnd ? <WrappedBanner onOpenWrapped={onOpenWrapped} periodType="yearly" /> : null;
      })()}

      {/* 2. Ameen Sayani Geetmala & Interviews Special Feature */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-md">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
                अमीन सयानी: बिनाका गीतमाला एवं इंटरव्यू
              </h3>
              <p className="text-[10px] text-retro-gold/80">
                650+ ऐतिहासिक काउंटडाउन, कमेंट्री एवं दिग्गज कलाकारों के इंटरव्यू
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const geetmalaTracks = carvaanSongs.filter((s) => s.decade === 'geetmala' || s.artist.toLowerCase().includes('sayani') || s.title.toLowerCase().includes('commentary'));
              if (geetmalaTracks.length > 0) {
                const randomG = geetmalaTracks[Math.floor(Math.random() * geetmalaTracks.length)];
                playSong(randomG, geetmalaTracks);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-md active:scale-95 transition-all flex-shrink-0"
            title="Play Geetmala Radio"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>गीतमाला रेडियो</span>
          </button>
        </div>

        {/* Featured Geetmala & Interview Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => {
              const interviewTracks = carvaanSongs.filter((s) =>
                s.title.toLowerCase().includes('commentary') ||
                s.title.toLowerCase().includes('interview') ||
                s.movie.toLowerCase().includes('commentary')
              );
              const pool = interviewTracks.length > 0 ? interviewTracks : carvaanSongs;
              playSong(pool[0], pool);
            }}
            className="cursor-pointer rounded-2xl p-3.5 bg-gradient-to-br from-[#3b151e] to-[#1d070e] border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🎙️</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">580+ ऑडियो</span>
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-white group-hover:text-retro-gold transition-colors">
                इंटरव्यू व फ्लैशबैक कमेंट्री
              </h4>
              <p className="text-[10px] text-white/50 mt-0.5">
                लता, रफ़ी, किशोर व मुकेश के दुर्लभ संस्मरण
              </p>
            </div>
          </div>

          <div
            onClick={() => onSelectDecade('geetmala')}
            className="cursor-pointer rounded-2xl p-3.5 bg-gradient-to-br from-[#360B1B] to-[#120822] border border-retro-gold/30 hover:border-retro-gold/60 transition-all shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">📻</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-retro-gold/20 text-retro-gold font-mono font-bold">1952-1994</span>
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-white group-hover:text-retro-gold transition-colors">
                बिनाका वार्षिक गीतमाला
              </h4>
              <p className="text-[10px] text-white/50 mt-0.5">
                वर्ष-दर-वर्ष शीर्ष 1 पायदान के सरताज नग़मे
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Carvaan Special Curated Collections */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
              कारवां विशेष संग्रह (Carvaan Specials)
            </h3>
            <p className="text-[10px] text-white/50">5,000 गीतों के ख़ज़ाने से चुनिंदा श्रेणियां</p>
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
          {[
            {
              id: 'duets',
              title: 'सदाबहार युगल गीत',
              sub: 'Immortal Duets',
              emoji: '👫',
              bg: 'from-rose-950/80 to-amber-950/80',
              border: 'border-rose-500/30',
              filter: (s: Song) => s.artists && s.artists.length > 1,
            },
            {
              id: 'romantic',
              title: 'प्यार के तराने',
              sub: 'Golden Romance',
              emoji: '❤️',
              bg: 'from-red-950/80 to-pink-950/80',
              border: 'border-red-500/30',
              filter: (s: Song) => {
                const txt = `${s.title} ${s.movie || ''}`.toLowerCase();
                return ['pyaar', 'dil', 'ishq', 'mohabbat', 'sanam', 'deewana', 'chand', 'humsafar', 'nazar'].some((k) => txt.includes(k));
              },
            },
            {
              id: 'ghazal',
              title: 'शाम-ए-ग़ज़ल',
              sub: 'Jagjit & Soulful Nazms',
              emoji: '☕',
              bg: 'from-amber-950/80 to-orange-950/80',
              border: 'border-amber-500/30',
              filter: (s: Song) => {
                const txt = `${s.title} ${s.artist} ${s.movie || ''}`.toLowerCase();
                return ['ghazal', 'jagjit', 'chitra', 'mehdi', 'ghulam', 'hothon', 'baat', 'shaam'].some((k) => txt.includes(k));
              },
            },
            {
              id: 'sad',
              title: 'दर्द भरी दास्तां',
              sub: 'Soulful & Melancholy',
              emoji: '💔',
              bg: 'from-indigo-950/80 to-slate-900/80',
              border: 'border-indigo-500/30',
              filter: (s: Song) => {
                const txt = `${s.title} ${s.movie || ''}`.toLowerCase();
                return ['dard', 'gham', 'juda', 'aansoo', 'kismat', 'bewafa', 'tanhai', 'yaad', 'roye'].some((k) => txt.includes(k));
              },
            },
            {
              id: 'masti',
              title: 'रेट्रो मस्ती व जश्न',
              sub: 'Retro Beats & Energy',
              emoji: '🕺',
              bg: 'from-emerald-950/80 to-teal-950/80',
              border: 'border-emerald-500/30',
              filter: (s: Song) => {
                const txt = `${s.title} ${s.artist} ${s.movie || ''}`.toLowerCase();
                return ['masti', 'disco', 'dosti', 'dum', 'hungama', 'qawwali', 'jashn', 'sholay'].some((k) => txt.includes(k));
              },
            },
            {
              id: 'bhajan',
              title: 'भक्ति एवं प्रार्थना',
              sub: 'Devotional Classics',
              emoji: '🪔',
              bg: 'from-yellow-950/80 to-amber-900/80',
              border: 'border-yellow-500/30',
              filter: (s: Song) => {
                const txt = `${s.title} ${s.movie || ''}`.toLowerCase();
                return ['stuti', 'bhajan', 'ram', 'krishna', 'shri', 'om', 'ganesh', 'vandanam', 'aarti', 'prarthana'].some((k) => txt.includes(k));
              },
            },
          ].map((m) => {
            return (
              <div
                key={m.id}
                onClick={() => {
                  const matched = carvaanSongs.filter(m.filter);
                  const pool = matched.length > 0 ? matched : carvaanSongs;
                  const firstTrack = pool[Math.floor(Math.random() * pool.length)];
                  playSong(firstTrack, pool);
                }}
                className={`w-[135px] flex-shrink-0 snap-start cursor-pointer rounded-2xl p-3 bg-gradient-to-br ${m.bg} border ${m.border} hover:scale-105 active:scale-95 transition-all shadow-lg flex flex-col justify-between`}
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

      {/* 3. रैंडम मास्टरपीस */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
                रैंडम कारवां मास्टरपीस (Random Picks)
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
                className="w-[136px] flex-shrink-0 snap-start group cursor-pointer bg-[#1C0810] rounded-2xl p-2.5 border border-white/10 hover:border-retro-gold/50 transition-all shadow-md flex flex-col justify-between"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#2C0D1A]">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
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
                    {song.artist}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-retro-gold/90 font-mono">
                    {song.year || 'Retro'}
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

      {/* 4. Golden Decades */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-retro-gold/15 border border-retro-gold/30 flex items-center justify-center text-retro-gold flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream leading-tight">
              सदाबहार दशक एवं गीतमाला (Golden Eras)
            </h3>
            <p className="text-[10px] text-white/50">
              1950 के क्लासिक्स से लेकर बिनाका गीतमाला तक
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DECADES.map((decade) => (
            <button
              key={decade.id}
              onClick={() => onSelectDecade(decade.id)}
              className="group relative overflow-hidden rounded-2xl p-4 text-left border border-white/10 hover:border-retro-gold/40 transition-all bg-[#1C0810] shadow-md flex flex-col justify-between min-h-[95px]"
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

      {/* 5. Top Maestros Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm sm:text-base text-retro-cream">
            शीर्ष कलाकार एवं गायक (Top Maestros)
          </h3>
          <span className="text-xs text-retro-gold/80 font-semibold">
            {topArtists.length} कलाकार
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {topArtists.map((artist) => (
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
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
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
