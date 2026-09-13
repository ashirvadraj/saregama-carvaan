import React from 'react';
import { Play, Pause, Heart, MoreVertical, Disc3, Download, Check } from 'lucide-react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { usePlaylist } from '../context/PlaylistContext';
import { useDownload } from '../context/DownloadContext';

interface SongListProps {
  songs: Song[];
  onOpenCreatePlaylist?: (songId: string) => void;
  showIndex?: boolean;
}

export const SongList: React.FC<SongListProps> = ({
  songs,
  onOpenCreatePlaylist,
  showIndex = true,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { isFavorite, toggleFavorite } = usePlaylist();
  const { downloadSong, isDownloaded, downloadingId } = useDownload();

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-retro-gold/60">
        <Disc3 className="w-12 h-12 mx-auto mb-3 opacity-40 animate-spin-slow" />
        <p className="font-semibold text-sm">No songs found in this section</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {songs.map((song, index) => {
        const isCurrent = currentSong?.id === song.id;
        const isFav = isFavorite(song.id);
        const downloaded = isDownloaded(song.id);
        const isDownloading = downloadingId === song.id;

        return (
          <div
            key={song.id}
            onClick={() => {
              if (isCurrent) {
                togglePlay();
              } else {
                playSong(song, songs);
              }
            }}
            className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer group ${
              isCurrent
                ? 'bg-retro-gold/15 border border-retro-gold/30 text-retro-gold shadow-md'
                : 'hover:bg-white/5 border border-transparent text-retro-cream'
            }`}
          >
            {showIndex && (
              <div className="w-6 text-center text-xs font-semibold text-white/40 group-hover:hidden">
                {isCurrent && isPlaying ? (
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-retro-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-retro-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2.5 bg-retro-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  index + 1
                )}
              </div>
            )}

            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#22163d] flex-shrink-0">
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                  isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {isCurrent && isPlaying ? (
                  <Pause className="w-5 h-5 text-retro-gold fill-current" />
                ) : (
                  <Play className="w-5 h-5 text-retro-gold fill-current ml-0.5" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-xs truncate leading-snug ${
                  isCurrent ? 'text-retro-gold' : 'text-retro-cream'
                }`}
              >
                {song.title}
              </h4>
              <p className="text-[11px] text-white/60 truncate mt-0.5">
                {song.artist}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                <span className="truncate max-w-[120px]">{song.movie}</span>
                <span>•</span>
                <span>{song.year}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Download Offline Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!downloaded && !isDownloading) {
                    downloadSong(song);
                  }
                }}
                className={`p-2 rounded-full transition-all ${
                  downloaded
                    ? 'text-emerald-400'
                    : 'text-white/40 hover:text-retro-gold hover:bg-white/5'
                }`}
                title={downloaded ? 'Downloaded Offline' : 'Download Offline'}
              >
                {isDownloading ? (
                  <div className="w-3.5 h-3.5 border-2 border-retro-gold border-t-transparent rounded-full animate-spin" />
                ) : downloaded ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(song.id, song);
                }}
                className={`p-2 rounded-full transition-all ${
                  isFav
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              </button>

              {onOpenCreatePlaylist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCreatePlaylist(song.id);
                  }}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full"
                  title="Add to Playlist"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};