import React, { useState, useMemo, useEffect } from 'react';
import { Play, Sparkles, ArrowLeft, Disc3, Search, Globe, Music2 } from 'lucide-react';
import { ARTISTS } from '../data/artists';
import { SONGS } from '../data/songs';
import { Artist, Song } from '../types';
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
  const [selectedCategory, setSelectedCategory] = useState<'indian' | 'international'>(() => {
    return selectedArtist?.category === 'international' ? 'international' : 'indian';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Sync category with the selected artist if an artist was opened (e.g. from Search or Recommendations)
  useEffect(() => {
    if (selectedArtist?.category) {
      setSelectedCategory(selectedArtist.category);
    }
  }, [selectedArtist]);

  // 1. Filter artists by category
  const categoryArtists = useMemo(() => {
    return ARTISTS.filter((a) => {
      if (selectedCategory === 'international') {
        return a.category === 'international';
      }
      return a.category !== 'international';
    });
  }, [selectedCategory]);

  // 2. Search filtering within current category
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return categoryArtists;
    const q = searchQuery.toLowerCase().trim();
    return categoryArtists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.hindiName && a.hindiName.includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q))
    );
  }, [categoryArtists, searchQuery]);

  // 3. Strict artist songs retrieval when an artist is selected
  const artistSongs = useMemo(() => {
    if (!selectedArtist) return [];

    const artistId = selectedArtist.id.toLowerCase();
    const artistNameLower = selectedArtist.name.toLowerCase().trim();

    return SONGS.filter((song) => {
      // Direct artistId link
      if (song.artistId && song.artistId.toLowerCase() === artistId) {
        return true;
      }

      // Strict name isolation for Indian artists
      if (artistId === 'kk') {
        return (
          song.artistId === 'kk' ||
          (song.artist.includes('KK') &&
            !song.artist.includes('Kavita') &&
            !song.artist.includes('Krishnamurthy'))
        );
      }

      if (artistId === 'kavita-krishnamurthy') {
        return (
          song.artistId === 'kavita-krishnamurthy' ||
          song.artist.includes('Kavita Krishnamurthy') ||
          song.artist.includes('Kavita')
        );
      }

      if (artistId === 'rahat-fateh-ali-khan') {
        return (
          song.artistId === 'rahat-fateh-ali-khan' ||
          (song.artist.includes('Rahat') && !song.artist.includes('Nusrat Fateh'))
        );
      }

      if (artistId === 'nusrat-fateh-ali-khan') {
        return (
          song.artistId === 'nusrat-fateh-ali-khan' ||
          song.artist.includes('Nusrat')
        );
      }

      if (artistId === 'sia') {
        return (
          song.artistId === 'sia' ||
          song.artists?.some((a) => a.toLowerCase().trim() === 'sia')
        );
      }

      // General matching
      if (song.artists && Array.isArray(song.artists)) {
        return song.artists.some((a) => a.toLowerCase().trim() === artistNameLower || a.toLowerCase().includes(artistNameLower));
      }

      return song.artist && song.artist.toLowerCase().includes(artistNameLower);
    });
  }, [selectedArtist]);

  return (
    <div className="pb-36 pt-3 px-4 space-y-5 max-w-4xl mx-auto animate-fade-in">
      {selectedArtist ? (
        /* DISC PLAYLIST VIEW: Single Artist Discography */
        <div className="space-y-5 animate-slide-up">
          {/* Back Button */}
          <button
            onClick={() => {
              if (selectedArtist?.category) {
                setSelectedCategory(selectedArtist.category);
              }
              onSelectArtist(null);
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-retro-gold hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              ← Back to {selectedArtist?.category === 'international' || selectedCategory === 'international' ? 'International Singers (अंतर्राष्ट्रीय गायक)' : 'Bollywood Singers (बॉलीवुड गायक)'}
            </span>
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
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
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
                <p>इस कलाकार के गीत लोड हो रहे हैं...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {artistSongs.map((song, index) => (
                  <SongItem
                    key={song.id}
                    song={song}
                    index={index}
                    playlistQueue={artistSongs}
                    onAddToPlaylistClick={onOpenCreatePlaylist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ARTISTS SELECTION GRID */
        <div className="space-y-5">
          {/* Header Title */}
          <div>
            <h2 className="font-serif font-bold text-xl text-retro-cream">
              महान गायक (Legendary Voices)
            </h2>
            <p className="text-xs text-retro-muted">
              Explore 120+ Indian Bollywood Maestros and International Legends
            </p>
          </div>

          {/* Category Switcher: Bollywood vs Global */}
          <div className="grid grid-cols-2 rounded-2xl bg-white/5 p-1 border border-white/10 text-xs font-semibold gap-1">
            <button
              onClick={() => {
                setSelectedCategory('indian');
                setSearchQuery('');
              }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedCategory === 'indian'
                  ? 'bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark shadow-lg font-bold'
                  : 'text-retro-muted hover:text-retro-cream'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>🇮🇳 Bollywood</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('international');
                setSearchQuery('');
              }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedCategory === 'international'
                  ? 'bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark shadow-lg font-bold'
                  : 'text-retro-muted hover:text-retro-cream'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌍 Global</span>
            </button>
          </div>

          {/* Search Bar for current category */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-retro-gold/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any singer (e.g. Taio Cruz, Guru Randhawa, Kishore, Badshah, Sia)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#18112b] border border-white/10 text-xs text-retro-cream placeholder-white/40 focus:outline-none focus:border-retro-gold/50 transition-colors"
            />
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredArtists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => {
                  if (artist.category) {
                    setSelectedCategory(artist.category);
                  }
                  onSelectArtist(artist);
                }}
                className="p-4 rounded-2xl bg-[#160e29] border border-white/5 hover:border-retro-gold/40 transition-all text-center space-y-3 group shadow-md hover:bg-[#1f143a]"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto p-0.5 bg-gradient-to-tr from-retro-gold via-amber-400 to-purple-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-retro-cream group-hover:text-retro-gold transition-colors truncate">
                    {artist.name}
                  </h4>
                  {artist.hindiName && (
                    <p className="text-[11px] text-retro-gold/80 truncate">
                      {artist.hindiName}
                    </p>
                  )}
                  <p className="text-[10px] text-white/40 pt-1 truncate">
                    {artist.era}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};