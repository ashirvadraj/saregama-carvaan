import { Song } from '../types';

const CACHE_NAME = 'sunehre-geet-offline-v1';
const METADATA_KEY = 'sunehre_geet_downloaded_songs';

export const getDownloadedSongs = (): Song[] => {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const isSongDownloaded = (songId: string): boolean => {
  const songs = getDownloadedSongs();
  return songs.some((s) => s.id === songId);
};

export const saveSongOffline = async (song: Song): Promise<boolean> => {
  try {
    // 1. Cache the audio in CacheStorage
    const cache = await caches.open(CACHE_NAME);
    const res = await fetch(song.audioUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('Failed to fetch audio stream');
    await cache.put(song.audioUrl, res.clone());

    // 2. Also download the file to device downloads
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title} - ${song.artist}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    // 3. Save metadata to localStorage
    const existing = getDownloadedSongs();
    if (!existing.some((s) => s.id === song.id)) {
      const updated = [song, ...existing];
      localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
    }
    return true;
  } catch (err) {
    console.warn('Offline download error:', err);
    // Fallback: save metadata anyway if direct download clicked
    try {
      const a = document.createElement('a');
      a.href = song.audioUrl;
      a.download = `${song.title} - ${song.artist}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const existing = getDownloadedSongs();
      if (!existing.some((s) => s.id === song.id)) {
        const updated = [song, ...existing];
        localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
      }
      return true;
    } catch {
      return false;
    }
  }
};

export const getOfflineAudioUrl = async (audioUrl: string): Promise<string> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(audioUrl);
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.warn('Cache read exception:', e);
  }
  return audioUrl;
};

export const cacheAudioInBackground = async (audioUrl: string): Promise<void> => {
  if (!audioUrl || !audioUrl.startsWith('http')) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(audioUrl);
    if (!cached) {
      const res = await fetch(audioUrl, { mode: 'cors' });
      if (res.ok) {
        await cache.put(audioUrl, res);
      }
    }
  } catch {
    // Non-blocking background caching
  }
};

export const removeOfflineSong = async (songId: string): Promise<void> => {
  try {
    const songs = getDownloadedSongs();
    const target = songs.find((s) => s.id === songId);
    if (target) {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(target.audioUrl);
    }
    const updated = songs.filter((s) => s.id !== songId);
    localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Offline delete exception:', e);
  }
};