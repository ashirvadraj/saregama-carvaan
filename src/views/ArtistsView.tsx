import React, { useState, useMemo } from 'react';
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
