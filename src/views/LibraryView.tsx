import React, { useState } from 'react';
import { Heart, ListMusic, History, Download, Play, Plus, Trash2, Disc3, Sparkles } from 'lucide-react';
import { usePlaylist } from '../context/PlaylistContext';
import { useAudio } from '../context/AudioContext';
import { useDownload } from '../context/DownloadContext';
import { SongItem } from '../components/SongItem';
import { Song } from '../types';
import { SONGS } from '../data/songs';
import { WrappedBanner } from '../components/WrappedBanner';

interface LibraryViewProps {
  onOpenCreatePlaylist: (songId?: string) => void;
  onOpenWrapped?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenCreatePlaylist, onOpenWrapped }) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'playlists' | 'recent' | 'downloads'>('favorites');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const [restoreMsg, setRestoreMsg] = useState<{ text: string; success: boolean } | null>(null);

  const {
    likedSongIds,
    favorites,
    playlists,
    recentSongIds,
    deletePlaylist,
    removeSongFromPlaylist,
    restoreUserData,
    restoreFromCloud,
    getSongById,
  } = usePlaylist();

  const { playSong } = useAudio();
  const { downloadedSongs } = useDownload();

  const recentSongs = recentSongIds
    .map((id) => getSongById(id))
    .filter(Boolean) as Song[];

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistSongs = selectedPlaylist
    ? (selectedPlaylist.songIds.map((id) => getSongById(id)).filter(Boolean) as Song[])
    : [];

  const handleRestorePersonalBackup = async () => {
    setRestoreMsg({ text: 'बैकअप खोजा जा रहा है...', success: true });
    const res = await restoreFromCloud();
    if (res.success && res.count > 0) {
      setRestoreMsg({ text: `✅ बैकअप सफलतापूर्वक लोड हुआ (${res.count} गीत मिले)!`, success: true });
    } else {
      setRestoreMsg({ text: 'ℹ️ कोई बैकअप फ़ाइल नहीं मिली।', success: false });
    }
    setTimeout(() => setRestoreMsg(null), 4000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        if (json) {
          restoreUserData(json.likedSongIds, json.playlists, json.recentSongIds, json.likedSongs);
          const count = json.likedSongIds?.length || json.likedSongs?.length || 0;
          setRestoreMsg({ text: `✅ फ़ाइल से ${count} गीत सफलतापूर्वक लोड हुए!`, success: true });
        }
      } catch (err) {
        setRestoreMsg({ text: '❌ अमान्य बैकअप फ़ाइल', success: false });
      }
      setTimeout(() => setRestoreMsg(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-48 pt-3 px-4 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-serif font-bold text-2xl text-retro-cream truncate">
            Your Library
          </h2>
          <p className="text-xs text-white/50 truncate">
            Liked songs, playlists & history
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Manual File Pick Button */}
          <label
            className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 text-xs font-medium transition-all active:scale-95 shadow-sm"
            title="Select a backup file from Downloads"
          >
            <Download className="w-3.5 h-3.5 text-retro-gold" />
            <span>फ़ाइल चुनें</span>
            <input
              type="file"
              accept=".json,application/json,text/plain"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>

          {/* Auto Restore Button */}
          <button
            onClick={handleRestorePersonalBackup}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-retro-gold/20 hover:bg-retro-gold/30 border border-retro-gold/40 text-retro-gold text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Auto-scan phone storage for backups"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>रीस्टोर</span>
          </button>
        </div>
      </div>

      {/* Restore Status Toast */}
      {restoreMsg && (
        <div
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all animate-fade-in ${
            restoreMsg.success
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-500/20 border-amber-500/30 text-amber-200'
          }`}
        >
          <span>{restoreMsg.text}</span>
          <button onClick={() => setRestoreMsg(null)} className="text-white/60 hover:text-white ml-2 text-sm font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#18112b] rounded-2xl border border-white/10">
        <button
          onClick={() => {
            setActiveTab('favorites');
            setSelectedPlaylistId(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'favorites'
              ? 'bg-retro-gold text-retro-dark shadow-md font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Liked ({likedSongIds.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('playlists');
            setSelectedPlaylistId(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'playlists'
              ? 'bg-retro-gold text-retro-dark shadow-md font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('recent');
            setSelectedPlaylistId(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'recent'
              ? 'bg-retro-gold text-retro-dark shadow-md font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recent ({recentSongs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('downloads');
            setSelectedPlaylistId(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'downloads'
              ? 'bg-retro-gold text-retro-dark shadow-md font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Offline</span>
        </button>
      </div>

      {/* Sunehre Geet Wrapped Banner: Only visible 1st-7th of each month (Monthly) or Dec 25-31 (Yearly) */}
      {onOpenWrapped && (() => {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth();
        const isMonthly = day >= 1 && day <= 8;
        const isYearEnd = month === 11 && day >= 25 && day <= 31;
        if (!isMonthly && !isYearEnd) return null;
        return (
          <WrappedBanner
            onOpenWrapped={onOpenWrapped}
            periodType={isYearEnd ? 'yearly' : 'monthly'}
          />
        );
      })()}

      {/* TAB 1: Liked Songs */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-retro-cream font-serif">
              Liked Songs ({favorites.length})
            </h3>
            {favorites.length > 0 && (
              <button
                onClick={() => playSong(favorites[0], favorites)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-retro-gold text-retro-dark font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-14 px-4 bg-[#18112b]/80 rounded-3xl border border-white/10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-retro-gold/10 border border-retro-gold/30 flex items-center justify-center mx-auto text-retro-gold">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-retro-cream font-serif">
                  No Liked Songs Yet
                </h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  Tap the ❤️ heart icon on any song to save it to your Liked Songs.
                </p>
              </div>

              {/* Instant Personal Backup Restorer */}
              <div className="pt-2">
                <button
                  onClick={handleRestorePersonalBackup}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-retro-gold via-amber-400 to-amber-600 text-retro-dark font-bold text-xs shadow-xl flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>अपने पसंदीदा गीत रीस्टोर करें (Restore My Liked Songs)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {favorites.map((song: Song, idx: number) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={idx}
                  playlistQueue={favorites}
                  onAddToPlaylistClick={onOpenCreatePlaylist}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          {!selectedPlaylist ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-retro-cream font-serif">Your Playlists</h3>
                <button
                  onClick={() => onOpenCreatePlaylist()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-retro-gold text-retro-dark font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Playlist</span>
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#18112b]/60 rounded-3xl border border-white/5 space-y-3">
                  <ListMusic className="w-12 h-12 text-retro-gold/40 mx-auto" />
                  <h4 className="font-bold text-sm text-retro-cream">No Playlists Created</h4>
                  <p className="text-xs text-white/50 max-w-xs mx-auto">
                    Create custom playlists of your favorite tracks.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className="p-4 rounded-2xl bg-[#18112b] border border-white/10 hover:border-retro-gold/40 transition-all text-left space-y-2 group shadow-md"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-retro-gold/30 to-purple-600/30 flex items-center justify-center text-retro-gold group-hover:scale-105 transition-transform">
                        <Disc3 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-retro-cream truncate font-serif">
                          {pl.name}
                        </h4>
                        <p className="text-[10px] text-white/50 mt-0.5">
                          {pl.songIds.length} songs
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedPlaylistId(null)}
                  className="text-xs text-retro-gold font-semibold hover:underline"
                >
                  ← Back to all playlists
                </button>
                {selectedPlaylist.isCustom && (
                  <button
                    onClick={() => {
                      deletePlaylist(selectedPlaylist.id);
                      setSelectedPlaylistId(null);
                    }}
                    className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#22133d] to-[#140b26] border border-retro-gold/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-retro-cream font-serif">
                    {selectedPlaylist.name}
                  </h3>
                  <p className="text-xs text-retro-gold/80 mt-0.5">
                    {selectedPlaylist.songIds.length} songs
                  </p>
                </div>
                {playlistSongs.length > 0 && (
                  <button
                    onClick={() => playSong(playlistSongs[0], playlistSongs)}
                    className="px-4 py-2 rounded-full bg-retro-gold text-retro-dark text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {playlistSongs.length === 0 ? (
                <div className="text-center py-12 px-4 bg-[#18112b]/60 rounded-3xl border border-white/5 space-y-2">
                  <Disc3 className="w-8 h-8 text-retro-gold/40 mx-auto" />
                  <p className="text-xs text-white/50">This playlist is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {playlistSongs.map((song, idx) => (
                    <SongItem
                      key={song.id}
                      song={song}
                      index={idx}
                      playlistQueue={playlistSongs}
                      onAddToPlaylistClick={onOpenCreatePlaylist}
                      onRemoveFromPlaylist={(songId) => removeSongFromPlaylist(selectedPlaylist.id, songId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Recently Played */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-retro-cream font-serif">
              Recently Played ({recentSongs.length})
            </h3>
            {recentSongs.length > 0 && (
              <button
                onClick={() => playSong(recentSongs[0], recentSongs)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-retro-gold text-retro-dark font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {recentSongs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#18112b]/60 rounded-3xl border border-white/5 space-y-3">
              <History className="w-12 h-12 text-retro-gold/40 mx-auto" />
              <h4 className="font-bold text-sm text-retro-cream">No Recent History</h4>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                Songs you play will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentSongs.map((song: Song, idx: number) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={idx}
                  playlistQueue={recentSongs}
                  onAddToPlaylistClick={onOpenCreatePlaylist}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Downloads / Offline */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-retro-cream font-serif">
              Offline Downloads ({downloadedSongs.length})
            </h3>
            {downloadedSongs.length > 0 && (
              <button
                onClick={() => playSong(downloadedSongs[0], downloadedSongs)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-retro-gold text-retro-dark font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {downloadedSongs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#18112b]/60 rounded-3xl border border-white/5 space-y-3">
              <Download className="w-12 h-12 text-retro-gold/40 mx-auto" />
              <h4 className="font-bold text-sm text-retro-cream">No Offline Downloads</h4>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                Tap the download icon on any song to listen without internet.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {downloadedSongs.map((song, idx) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={idx}
                  playlistQueue={downloadedSongs}
                  onAddToPlaylistClick={onOpenCreatePlaylist}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};