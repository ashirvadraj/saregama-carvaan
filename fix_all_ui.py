# 1. Write src/views/ArtistsView.tsx
artists_view_code = """import React, { useState, useMemo } from 'react';
import { Play, Sparkles, ArrowLeft, Disc3, Search, User } from 'lucide-react';
import { ARTISTS } from '../data/artists';
import { SONGS } from '../data/songs';
import { Artist } from '../types';
import { SongItem } from '../components/SongItem';
import { useAudio } from '../context/AudioContext';

interface ArtistsViewProps {
  selectedArtist: Artist | null;
  onSelectArtist: (artist: Artist | null) => void;
  onOpenCreatePlaylist: (songId?: string) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({
  selectedArtist,
  onSelectArtist,
  onOpenCreatePlaylist,
}) => {
  const { playSong } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Search filtering across Carvaan legends
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return ARTISTS;
    const q = searchQuery.toLowerCase().trim();
    return ARTISTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.hindiName && a.hindiName.includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // 2. Strict artist songs retrieval when an artist is selected
  const artistSongs = useMemo(() => {
    if (!selectedArtist) return [];

    const artistId = selectedArtist.id.toLowerCase();
    const artistNameLower = selectedArtist.name.toLowerCase().trim();

    if (artistId === 'ameen-sayani' || artistNameLower.includes('ameen')) {
      return SONGS.filter((song) => {
        const txt = `${song.title} ${song.artist} ${song.movie || ''}`.toLowerCase();
        return (
          txt.includes('ameen') ||
          txt.includes('sayani') ||
          txt.includes('commentary') ||
          txt.includes('interview') ||
          txt.includes('geetmala')
        );
      });
    }

    const nameParts = artistNameLower.split(' ').filter((p) => p.length > 2);

    return SONGS.filter((song) => {
      if (song.artistId && song.artistId.toLowerCase() === artistId) {
        return true;
      }

      if (song.artists && Array.isArray(song.artists)) {
        if (song.artists.some((a) => a.toLowerCase().trim() === artistNameLower || a.toLowerCase().includes(artistNameLower))) {
          return true;
        }
      }

      const songArtist = (song.artist || '').toLowerCase();
      if (songArtist.includes(artistNameLower)) return true;

      const songTitle = (song.title || '').toLowerCase();
      if (selectedArtist.notableHits && selectedArtist.notableHits.some((h) => songTitle.includes(h.toLowerCase()))) {
        return true;
      }

      return nameParts.length > 0 && nameParts.every((p) => songArtist.includes(p));
    });
  }, [selectedArtist]);

  return (
    <div className="pb-36 pt-3 px-4 space-y-5 max-w-4xl mx-auto animate-fade-in">
      {selectedArtist ? (
        /* DISC PLAYLIST VIEW: Single Artist Discography */
        <div className="space-y-5 animate-slide-up">
          {/* Back Button */}
          <button
            onClick={() => onSelectArtist(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-retro-gold hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← सभी गायक (All Carvaan Maestros)</span>
          </button>

          {/* Artist Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#251545] via-[#160b2c] to-[#0d071b] border border-retro-gold/30 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-retro-gold via-amber-400 to-purple-600 shadow-xl flex-shrink-0">
                <img
                  src={selectedArtist.imageUrl}
                  alt={selectedArtist.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-retro-gold/20 text-retro-gold text-xs font-bold border border-retro-gold/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedArtist.era}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-retro-cream">
                  {selectedArtist.name}
                </h2>
                {selectedArtist.hindiName && (
                  <h3 className="text-sm font-medium text-retro-gold/80">
                    {selectedArtist.hindiName}
                  </h3>
                )}
                <p className="text-xs text-white/70 max-w-xl leading-relaxed">
                  {selectedArtist.bio}
                </p>

                {/* Play All Button */}
                {artistSongs.length > 0 && (
                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                    <button
                      onClick={() => playSong(artistSongs[0], artistSongs)}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play All ({artistSongs.length} Songs)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artist Discography Tracklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-retro-cream flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-retro-gold" />
                <span>लोकप्रिय गीत (Top Masterpieces)</span>
              </h3>
              <span className="text-xs text-retro-gold font-medium">
                {artistSongs.length} गीत उपलब्ध
              </span>
            </div>

            {artistSongs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#18112b]/60 border border-white/5 text-center text-xs text-white/50 space-y-1">
                <p>इस कलाकार के गीत खोजे जा रहे हैं...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {artistSongs.map((song, idx) => (
                  <SongItem
                    key={song.id}
                    song={song}
                    index={idx}
                    playlistQueue={artistSongs}
                    onAddToPlaylistClick={onOpenCreatePlaylist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GRID VIEW: All Carvaan Legends */
        <div className="space-y-4">
          {/* Search Filter Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-retro-gold">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="गायक का नाम खोजें (Search singer name)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#18112b] border border-retro-gold/20 text-retro-cream placeholder-white/40 text-xs focus:outline-none focus:border-retro-gold transition-all"
            />
          </div>

          {/* Singer Count Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif font-bold text-sm text-retro-cream flex items-center gap-1.5">
              <User className="w-4 h-4 text-retro-gold" />
              <span>सदाबहार कलाकार ({filteredArtists.length})</span>
            </h3>
            <span className="text-[11px] text-white/50 font-mono">5,026 Classic Tracks</span>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredArtists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                className="group relative overflow-hidden rounded-2xl p-3.5 bg-[#18112b] border border-white/10 hover:border-retro-gold/40 transition-all text-left flex flex-col items-center text-center space-y-2.5 shadow-md hover:scale-[1.02] active:scale-98"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-retro-gold via-amber-400 to-purple-600 shadow-lg">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>

                <div className="space-y-0.5 w-full">
                  <h4 className="font-bold text-xs text-retro-cream group-hover:text-retro-gold transition-colors truncate">
                    {artist.name}
                  </h4>
                  {artist.hindiName && (
                    <p className="text-[10px] text-retro-gold/80 truncate">
                      {artist.hindiName}
                    </p>
                  )}
                  <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 mt-1 font-mono">
                    {artist.era}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open('src/views/ArtistsView.tsx', 'wb') as f:
    f.write(artists_view_code.encode('utf-8'))

print("Saved clean src/views/ArtistsView.tsx without international tabs!")

# 2. Write src/views/HomeView.tsx cleanly with UTF-8
home_view_code = """import React, { useState } from 'react';
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
      <section className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#2a1b4e] via-[#1a0f33] to-[#0c0817] border border-retro-gold/30 shadow-2xl">
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

      {/* 2. Mood & Ras Curated Categories */}
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
              id: 'geetmala',
              title: 'बिनाका गीतमाला',
              sub: 'Ameen Sayani Flashback',
              emoji: '📻',
              bg: 'from-amber-900/80 to-yellow-950/80',
              border: 'border-amber-500/30',
              keywords: ['commentary', 'interview', 'geetmala', 'ameen', 'sayani'],
            },
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
              sub: 'Monsoon & Rain Classics',
              emoji: '🌧️',
              bg: 'from-cyan-950/80 to-blue-950/80',
              border: 'border-cyan-500/30',
              keywords: ['rimjhim', 'barish', 'sawan', 'badal', 'megha', 'barse', 'boond'],
            },
            {
              id: 'ghazal',
              title: 'शाम-ए-ग़ज़ल',
              sub: 'Jagjit & Ghazals',
              emoji: '☕',
              bg: 'from-amber-950/80 to-orange-950/80',
              border: 'border-amber-500/30',
              keywords: ['ghazal', 'jagjit', 'mehdi', 'chitra', 'hothon', 'baat', 'shaam', 'nazar'],
            },
            {
              id: 'masti',
              title: 'मस्ती और उमंग',
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
                  const moodTracks = carvaanSongs.filter((s) => {
                    const txt = `${s.title} ${s.artist} ${s.movie || ''}`.toLowerCase();
                    return m.keywords.some((k) => txt.includes(k));
                  });
                  const pool = moodTracks.length > 0 ? moodTracks : carvaanSongs;
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
                className="w-[136px] flex-shrink-0 snap-start group cursor-pointer bg-[#18112b] rounded-2xl p-2.5 border border-white/10 hover:border-retro-gold/50 transition-all shadow-md flex flex-col justify-between"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#22163d]">
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
              सुनहरे दशक एवं गीतमाला (Golden Eras)
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
"""

with open('src/views/HomeView.tsx', 'wb') as f:
    f.write(home_view_code.encode('utf-8'))

print("Saved clean src/views/HomeView.tsx with zero corrupt characters!")
