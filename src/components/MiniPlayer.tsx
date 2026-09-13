import React from 'react';
import { Play, Pause, SkipForward, Heart, ChevronUp, Disc3 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { usePlaylist } from '../context/PlaylistContext';

export const MiniPlayer: React.FC = () => {
  const { currentSong, isPlaying, togglePlay, playNext, currentTime, duration, setIsFullPlayerOpen } = useAudio();
  const { isLiked, toggleLike } = usePlaylist();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.id);

  return (
    <div
      onClick={() => setIsFullPlayerOpen(true)}
      className="fixed bottom-[65px] left-2 right-2 z-30 bg-[#160e28] rounded-2xl border-2 border-retro-gold/40 shadow-2xl shadow-black p-2.5 flex items-center justify-between cursor-pointer transition-all hover:border-retro-gold/70"
      style={{ opacity: 1 }}
    >
      {/* Mini Progress Bar Line */}
      <div className="absolute top-0 left-3 right-3 h-[2px] bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-retro-gold to-amber-500 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Song Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-retro-gold/30 shadow-md bg-[#23153d]">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-retro-gold animate-spin-slow" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-retro-cream truncate font-serif">
            {currentSong.title}
          </h4>
          <p className="text-xs text-retro-gold truncate font-medium">
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentSong.id, currentSong);
          }}
          className={`p-2 rounded-full transition-colors ${
            liked ? 'text-red-500' : 'text-retro-muted hover:text-retro-cream'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="p-2.5 rounded-full bg-gradient-to-tr from-retro-gold to-amber-600 text-retro-dark shadow-md shadow-retro-gold/20 hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-retro-dark" />
          ) : (
            <Play className="w-4 h-4 fill-retro-dark ml-0.5" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            playNext();
          }}
          className="p-2 text-retro-muted hover:text-retro-cream rounded-full transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullPlayerOpen(true)}
          className="p-1.5 text-retro-gold/70 hover:text-retro-gold rounded-full"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};