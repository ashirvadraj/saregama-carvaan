import React from 'react';
import { Play } from 'lucide-react';
import { Artist } from '../types';
import { SONGS } from '../data/songs';
import { useAudio } from '../context/AudioContext';

interface ArtistCardProps {
  artist: Artist;
  onClick: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  const { playSong } = useAudio();

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const artistSongs = SONGS.filter(
      (s) => s.artist.includes(artist.name) || s.artists.includes(artist.name)
    );
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center text-center p-3 rounded-2xl glass-card hover:border-retro-gold/40 transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-retro-gold via-amber-500/40 to-transparent shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-300">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full h-full rounded-full object-cover"
        />
        <button
          onClick={handleQuickPlay}
          className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-retro-gold text-retro-dark flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
          title={`Play top tracks of ${artist.name}`}
        >
          <Play className="w-4 h-4 fill-retro-dark ml-0.5" />
        </button>
      </div>

      <h3 className="mt-3 font-serif font-bold text-sm text-retro-cream group-hover:text-retro-gold transition-colors line-clamp-1">
        {artist.name}
      </h3>
      <span className="text-[11px] font-serif text-retro-gold/80 font-medium">
        {artist.hindiName}
      </span>
      <span className="text-[10px] text-retro-muted mt-0.5">{artist.era}</span>
    </div>
  );
};
