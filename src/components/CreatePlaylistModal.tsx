import React, { useState } from 'react';
import { FolderPlus, X, Plus, Check, Disc3, Music2, ListMusic } from 'lucide-react';
import { usePlaylist } from '../context/PlaylistContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSongId?: string;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  initialSongId,
}) => {
  const { playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist, getSongById } = usePlaylist();
  const [isCreatingNew, setIsCreatingNew] = useState(!initialSongId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const targetSong = initialSongId ? getSongById(initialSongId) : null;

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newPl = createPlaylist(name.trim(), description.trim());
    if (initialSongId) {
      addSongToPlaylist(newPl.id, initialSongId);
    }
    setName('');
    setDescription('');
    setIsCreatingNew(false);
    onClose();
  };

  const handleTogglePlaylistSong = (playlistId: string) => {
    if (!initialSongId) return;
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;

    if (pl.songIds.includes(initialSongId)) {
      removeSongFromPlaylist(playlistId, initialSongId);
    } else {
      addSongToPlaylist(playlistId, initialSongId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#1b122f] rounded-3xl p-5 border border-retro-gold/40 shadow-2xl space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-retro-gold" />
            <h3 className="font-serif font-bold text-base text-retro-cream">
              {targetSong ? 'प्लेलिस्ट में जोड़ें (Add to Playlist)' : 'नई प्लेलिस्ट बनाएं'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Song Preview if adding a song */}
        {targetSong && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <img
              src={targetSong.coverUrl}
              alt={targetSong.title}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-retro-cream truncate">{targetSong.title}</h4>
              <p className="text-[11px] text-retro-gold/80 truncate">{targetSong.artist}</p>
            </div>
          </div>
        )}

        {/* Existing Playlists Selection List */}
        {targetSong && !isCreatingNew && (
          <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between text-xs font-bold text-white/70 px-1">
              <span>आपकी प्लेलिस्ट ({playlists.length})</span>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="text-retro-gold hover:underline flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नई बनाएं</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {playlists.map((pl) => {
                const isAdded = initialSongId ? pl.songIds.includes(initialSongId) : false;
                return (
                  <button
                    key={pl.id}
                    onClick={() => handleTogglePlaylistSong(pl.id)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      isAdded
                        ? 'bg-retro-gold/15 border-retro-gold/60 text-retro-gold'
                        : 'bg-white/5 border-white/5 hover:border-white/20 text-retro-cream'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Disc3 className="w-4 h-4 text-retro-gold flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold truncate">{pl.name}</h5>
                        <p className="text-[10px] text-white/50">{pl.songIds.length} गीत</p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-retro-gold text-retro-dark shadow-md'
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Create New Playlist Form */}
        {(isCreatingNew || !targetSong) && (
          <form onSubmit={handleCreateNewPlaylist} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-retro-gold mb-1">
                प्लेलिस्ट का नाम (Playlist Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Favorite Retro Hits"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-retro-cream placeholder-white/40 text-xs focus:outline-none focus:border-retro-gold"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1">
                विवरण (Description, Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Kishore, Lata, and RD Burman classics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-retro-cream placeholder-white/40 text-xs focus:outline-none focus:border-retro-gold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {targetSong && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-retro-cream text-xs font-medium hover:bg-white/10"
                >
                  सूची देखें
                </button>
              )}
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-retro-gold to-amber-500 text-retro-dark text-xs font-bold shadow-md shadow-retro-gold/20 disabled:opacity-50"
              >
                प्लेलिस्ट बनाएं
              </button>
            </div>
          </form>
        )}

        {/* Done Button */}
        {targetSong && !isCreatingNew && (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-retro-gold text-retro-dark text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            पूर्ण (Done)
          </button>
        )}
      </div>
    </div>
  );
};