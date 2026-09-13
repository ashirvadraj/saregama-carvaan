import React, { useState } from 'react';
import { Play, Sparkles, Disc } from 'lucide-react';
import { DECADES } from '../data/decades';
import { SONGS } from '../data/songs';
import { SongItem } from '../components/SongItem';
import { useAudio } from '../context/AudioContext';
import { Decade } from '../types';

interface ErasViewProps {
  initialDecade?: Decade['id'];
  onOpenCreatePlaylist: (songId?: string) => void;
}

export const ErasView: React.FC<ErasViewProps> = ({
  initialDecade = '50s',
  onOpenCreatePlaylist,
}) => {
  const [selectedDecadeId, setSelectedDecadeId] = useState<Decade['id']>(initialDecade);
  const { playSong } = useAudio();

  const currentDecade = DECADES.find((d) => d.id === selectedDecadeId) || DECADES[0];
  const eraSongs = SONGS.filter((s) => s.decade === selectedDecadeId);

  const handlePlayEra = () => {
    if (eraSongs.length > 0) {
      playSong(eraSongs[0], eraSongs);
    }
  };

  return (
    <div className="pb-36 pt-3 px-4 space-y-5 max-w-4xl mx-auto">
      {/* Decade Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DECADES.map((dec) => {
          const isSelected = dec.id === selectedDecadeId;
          return (
            <button
              key={dec.id}
              onClick={() => setSelectedDecadeId(dec.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-retro-gold to-amber-600 text-retro-dark shadow-md shadow-retro-gold/20 scale-105'
                  : 'bg-white/5 text-retro-cream hover:bg-white/10 border border-white/5'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>{dec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Era Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#2b1947] to-[#120a21] border border-retro-gold/30 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-retro-gold uppercase tracking-wider font-mono">
              {currentDecade.years}
            </span>
            <h2 className="text-2xl font-bold font-serif text-retro-cream">
              {currentDecade.title}
            </h2>
            <p className="text-xs font-serif text-retro-gold/90 font-medium">
              {currentDecade.hindiTitle}
            </p>
            <p className="text-xs text-retro-muted max-w-lg mt-1">
              {currentDecade.description}
            </p>
          </div>

          <button
            onClick={handlePlayEra}
            disabled={eraSongs.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-retro-gold text-retro-dark text-xs font-bold shadow-lg hover:scale-105 transition-all flex-shrink-0 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-retro-dark" />
            <span>Play {currentDecade.id} Radio</span>
          </button>
        </div>
      </div>

      {/* Songs in this Era */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-serif font-bold text-base text-retro-cream">
            Tracks from the {currentDecade.years}
          </h3>
          <span className="text-xs text-retro-muted">
            {eraSongs.length} {eraSongs.length === 1 ? 'Song' : 'Songs'}
          </span>
        </div>

        {eraSongs.length > 0 ? (
          <div className="space-y-1">
            {eraSongs.map((song, idx) => (
              <SongItem
                key={song.id}
                song={song}
                index={idx}
                playlistQueue={eraSongs}
                onAddToPlaylistClick={onOpenCreatePlaylist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-2xl text-retro-muted text-sm">
            No tracks found in this era yet.
          </div>
        )}
      </div>
    </div>
  );
};
