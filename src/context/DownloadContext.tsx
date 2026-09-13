import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song } from '../types';
import {
  getDownloadedSongs,
  saveSongOffline,
  removeOfflineSong,
  isSongDownloaded as checkIsDownloaded,
} from '../services/offlineService';

interface DownloadContextType {
  downloadedSongs: Song[];
  downloadSong: (song: Song) => Promise<boolean>;
  deleteDownload: (songId: string) => Promise<void>;
  clearAllDownloads: () => Promise<void>;
  isDownloaded: (songId: string) => boolean;
  downloadingId: string | null;
  storageUsageText: string;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setDownloadedSongs(getDownloadedSongs());
  }, []);

  const downloadSong = async (song: Song): Promise<boolean> => {
    setDownloadingId(song.id);
    const success = await saveSongOffline(song);
    if (success) {
      setDownloadedSongs(getDownloadedSongs());
    }
    setDownloadingId(null);
    return success;
  };

  const deleteDownload = async (songId: string): Promise<void> => {
    await removeOfflineSong(songId);
    setDownloadedSongs(getDownloadedSongs());
  };

  const clearAllDownloads = async (): Promise<void> => {
    const list = getDownloadedSongs();
    for (const s of list) {
      await removeOfflineSong(s.id);
    }
    setDownloadedSongs([]);
  };

  const isDownloaded = (songId: string): boolean => {
    return checkIsDownloaded(songId);
  };

  const storageUsageText = `${(downloadedSongs.length * 4.5).toFixed(1)} MB (${downloadedSongs.length} गीत)`;

  return (
    <DownloadContext.Provider
      value={{
        downloadedSongs,
        downloadSong,
        deleteDownload,
        clearAllDownloads,
        isDownloaded,
        downloadingId,
        storageUsageText,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) throw new Error('useDownload must be used within DownloadProvider');
  return context;
};

export const useDownloads = useDownload;