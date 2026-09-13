import { Song, Decade } from '../types';
import { decryptMediaUrl } from '../utils/crypto';

export class MusicService {
  private static decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  private static mapDecade(year: number): Decade['id'] {
    if (year < 1960) return '50s';
    if (year < 1970) return '60s';
    if (year < 1980) return '70s';
    if (year < 1990) return '80s';
    if (year < 2000) return '90s';
    return '2000s';
  }

  /**
   * Search songs with live pagination and automatic direct stream decryption
   */
  public static async searchSongs(query: string, page = 1, limit = 50): Promise<Song[]> {
    try {
      const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=${page}&q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!data || !data.results || !Array.isArray(data.results)) {
        return [];
      }

      const pids = data.results.map((r: any) => r.id).filter(Boolean);
      if (pids.length === 0) return [];

      // Fetch details with media URLs
      const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${pids.join(',')}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();

      const songs: Song[] = [];
      for (const item of data.results) {
        const fullDetail = detailData[item.id] || item;
        const decryptedAudio = decryptMediaUrl(fullDetail.encrypted_media_url);

        let audioUrl = decryptedAudio;
        if (!audioUrl && fullDetail.media_preview_url) {
          audioUrl = fullDetail.media_preview_url.replace('_96_p.mp4', '_160.mp4');
        }

        if (audioUrl) {
          const year = parseInt(fullDetail.year) || 1980;
          const cover = (fullDetail.image || item.image || '')
            .replace('150x150', '500x500')
            .replace('50x50', '500x500');

          songs.push({
            id: `saavn-${fullDetail.id}`,
            title: this.decodeHtml(fullDetail.song || item.title || 'Untitled Track'),
            artist: this.decodeHtml(fullDetail.primary_artists || item.more_info?.singers || 'Classic Artist'),
            artists: (fullDetail.primary_artists || '')
              .split(',')
              .map((s: string) => this.decodeHtml(s.trim()))
              .filter(Boolean),
            movie: this.decodeHtml(fullDetail.album || item.more_info?.album || 'Golden Masterpiece'),
            year: year,
            decade: this.mapDecade(year),
            duration: parseInt(fullDetail.duration) || 260,
            audioUrl: audioUrl,
            coverUrl: cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
            genre: fullDetail.language || 'Hindi',
            composer: this.decodeHtml(fullDetail.music || fullDetail.music_director || ''),
            lyricist: this.decodeHtml(fullDetail.singers || ''),
          });
        }
      }

      return songs;
    } catch (error) {
      console.warn('Error querying music API:', error);
      return [];
    }
  }

  /**
   * Fetch top 100+ songs of a specific singer
   */
  public static async fetchTop100ForArtist(artistName: string): Promise<Song[]> {
    try {
      // Query page 1 (50 items) and page 2 (50 items)
      const [batch1, batch2] = await Promise.all([
        this.searchSongs(`${artistName} Hindi songs`, 1, 50),
        this.searchSongs(`${artistName} hits`, 2, 50),
      ]);

      const map = new Map<string, Song>();
      for (const s of [...batch1, ...batch2]) {
        if (!map.has(s.title.toLowerCase())) {
          map.set(s.title.toLowerCase(), s);
        }
      }

      return Array.from(map.values());
    } catch (err) {
      console.warn('Failed to fetch 100 songs for artist:', err);
      return [];
    }
  }
}