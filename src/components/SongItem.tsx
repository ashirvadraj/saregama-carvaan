import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, ListPlus, Download, Check, Trash2, ListMusic } from 'lucide-react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { usePlaylist } from '../context/PlaylistContext';
import { useDownload } from '../context/DownloadContext';

interface SongItemProps {
  song: Song;
  index?: number;
  playlistQueue?: Song[];
  onAddToPlaylistClick?: (songId: string) => void;
  onRemoveFromPlaylist?: (songId: string) => void;
}

export const SongItem: React.FC<SongItemProps> = ({
  song,
  index,
  playlistQueue,
  onAddToPlaylistClick,
  onRemoveFromPlaylist,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { isFavorite, toggleFavorite, playlists, addSongToPlaylist, removeSongFromPlaylist } = usePlaylist();
  const { downloadSong, deleteDownload, isDownloaded, downloadingId } = useDownload();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrentSong && isPlaying;
  const isFav = isFavorite(song.id);
  const downloaded = isDownloaded(song.id);
  const isDownloading = downloadingId === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, playlistQueue, 0);
    }
  };

  const handleDownloadToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    if (downloaded) {
      deleteDownload(song.id);
    } else {
      downloadSong(song);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
        isCurrentSong
          ? 'bg-retro-gold/15 border border-retro-gold/30 shadow-md shadow-retro-gold/5 text-retro-gold'
          : 'hover:bg-white/5 border border-transparent text-retro-cream'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Track Cover & Play Overlay */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#22163d] shadow-sm">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 text-retro-gold fill-current" />
            ) : (
              <Play className="w-5 h-5 text-retro-gold fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Song Info */}
        <div className="min-w-0 flex-1">
          <h4
            className={`text-xs sm:text-sm font-semibold truncate leading-snug ${
              isCurrentSong ? 'text-retro-gold font-bold' : 'text-retro-cream'
            }`}
          >
            {song.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-white/60 truncate mt-0.5">
            <span className="truncate">{song.artist}</span>
            <span>•</span>
            <span className="truncate">{song.movie} ({song.year})</span>
          </div>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1 ml-2">
        <span className="text-xs text-white/40 hidden sm:inline-block font-mono">
          {formatDuration(song.duration)}
        </span>

        {/* Quick Add/Manage Playlist Button */}
        {onAddToPlaylistClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylistClick(song.id);
            }}
            className="p-1.5 rounded-full text-white/40 hover:text-retro-gold hover:bg-white/5 transition-all"
            title="Add to Playlist"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownloadToggle}
          className={`p-1.5 rounded-full transition-all ${
            downloaded
              ? 'text-emerald-400 hover:text-red-400 hover:bg-red-500/10'
              : 'text-white/40 hover:text-retro-gold hover:bg-white/5'
          }`}
          title={downloaded ? 'Downloaded (Tap to Delete)' : 'Download Offline'}
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
          className={`p-1.5 rounded-full transition-all ${
            isFav
              ? 'text-red-400 hover:text-red-300'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
          title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Remove directly from current playlist if viewing playlist */}
        {onRemoveFromPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromPlaylist(song.id);
            }}
            className="p-1.5 rounded-full text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remove from this playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/5"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-40 w-52 bg-[#1e1338] rounded-2xl p-2 shadow-2xl border border-retro-gold/30 text-xs space-y-1"
            >
              {onAddToPlaylistClick && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onAddToPlaylistClick(song.id);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-retro-gold/15 text-retro-gold font-bold flex items-center gap-2"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>प्लेलिस्ट में जोड़ें (Add to Playlist)</span>
                </button>
              )}

              {downloaded && (
                <button
                  onClick={() => {
                    deleteDownload(song.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-red-500/15 text-red-400 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>डाउनलोड हटाएं (Delete Download)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};