import { Song } from '../types';
import { SONGS } from '../data/songs';
import { ARTISTS } from '../data/artists';

export interface ListeningLogEntry {
  songId: string;
  timestamp: number;
  duration: number; // in seconds
}

export interface WrappedStats {
  periodType: 'yearly' | 'monthly';
  periodLabel: string;
  year: number;
  month?: number;
  totalMinutes: number;
  totalSongsCount: number;
  topSongs: { song: Song; plays: number }[];
  topArtists: { artistName: string; avatarUrl: string; plays: number; topSongTitle: string }[];
  decadeBreakdown: { decade: string; percentage: number; label: string }[];
  peakHourDescription: string;
  personality: {
    title: string;
    subtitle: string;
    description: string;
    badgeEmoji: string;
    gradient: string;
    bgGlow: string;
  };
  topSong: Song | null;
  topArtist: string;
  // Enhanced Wrapped v60 stats
  longestStreak: number; // consecutive days with at least 1 play
  uniqueSongsCount: number; // total unique songs listened
  firstSongPlayed: Song | null; // first song played in this period
  mostActiveDay: string; // day of week name (e.g. "Saturday")
  genreBreakdown: { genre: string; percentage: number; emoji: string }[];
}

const STORAGE_KEY = 'sunehre_listening_history_v1';
const MAX_HISTORY_ITEMS = 5000;

export const WrappedService = {
  // Record a playback event into persistent local storage
  recordPlayback(songId: string, durationListened: number = 180): void {
    if (!songId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const history: ListeningLogEntry[] = raw ? JSON.parse(raw) : [];

      const newEntry: ListeningLogEntry = {
        songId,
        timestamp: Date.now(),
        duration: Math.max(30, Math.min(600, Math.round(durationListened))),
      };

      history.unshift(newEntry);
      if (history.length > MAX_HISTORY_ITEMS) {
        history.length = MAX_HISTORY_ITEMS;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Error recording listening history:', e);
    }
  },

  getRawHistory(): ListeningLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Get available years and months for selection
  getAvailablePeriods(): {
    years: number[];
    months: { year: number; month: number; label: string }[];
  } {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [currentYear, currentYear - 1];

    const months: { year: number; month: number; label: string }[] = [];
    // Last 6 months up to current month
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      });
    }

    return { years, months };
  },

  // Compute Wrapped analytics for Yearly or Monthly
  getWrappedStats(
    periodType: 'yearly' | 'monthly' = 'yearly',
    targetYear: number = new Date().getFullYear(),
    targetMonth: number = new Date().getMonth()
  ): WrappedStats {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const periodLabel =
      periodType === 'yearly'
        ? `${targetYear} Sunehre Geet Wrapped`
        : `${monthNames[targetMonth]} ${targetYear} Sunehre Geet Wrapped`;

    const allHistory = this.getRawHistory();

    // Filter by year & month
    const filteredHistory = allHistory.filter((entry) => {
      const d = new Date(entry.timestamp);
      if (d.getFullYear() !== targetYear) return false;
      if (periodType === 'monthly' && d.getMonth() !== targetMonth) return false;
      return true;
    });

    const songMap = new Map<string, Song>();
    for (const s of SONGS) {
      songMap.set(s.id, s);
    }

    // Tally play counts
    const songPlayCounts = new Map<string, number>();
    const artistPlayCounts = new Map<string, number>();
    const decadeCounts = new Map<string, number>();
    const genreCounts = new Map<string, number>();
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0); // 0=Sunday ... 6=Saturday
    const uniqueDates = new Set<string>(); // YYYY-MM-DD strings for streak calc
    let totalSeconds = 0;
    let firstSongId: string | null = null;
    let firstSongTimestamp = Infinity;

    for (const entry of filteredHistory) {
      const song = songMap.get(entry.songId);
      if (!song) continue;

      songPlayCounts.set(entry.songId, (songPlayCounts.get(entry.songId) || 0) + 1);

      const artistName = song.artist.split(',')[0].split('&')[0].trim();
      artistPlayCounts.set(artistName, (artistPlayCounts.get(artistName) || 0) + 1);

      const dec = song.decade || '70s';
      decadeCounts.set(dec, (decadeCounts.get(dec) || 0) + 1);

      // Genre tracking
      const genre = (song.genre || 'bollywood').toLowerCase();
      const normalizedGenre = genre.includes('romantic') || genre.includes('romance') ? 'romantic'
        : genre.includes('sad') || genre.includes('heartbreak') ? 'sad'
        : genre.includes('dance') || genre.includes('party') || genre.includes('disco') ? 'dance'
        : genre.includes('devotional') || genre.includes('bhajan') ? 'devotional'
        : genre.includes('ghazal') ? 'ghazal'
        : genre.includes('sufi') ? 'sufi'
        : genre.includes('rock') || genre.includes('pop') ? 'pop-rock'
        : genre.includes('classical') || genre.includes('raga') ? 'classical'
        : genre.includes('retro') || genre.includes('old') ? 'retro'
        : 'bollywood';
      genreCounts.set(normalizedGenre, (genreCounts.get(normalizedGenre) || 0) + 1);

      const entryDate = new Date(entry.timestamp);
      const hour = entryDate.getHours();
      hourCounts[hour]++;
      dayCounts[entryDate.getDay()]++;
      uniqueDates.add(entryDate.toISOString().split('T')[0]);

      // Track first song played
      if (entry.timestamp < firstSongTimestamp) {
        firstSongTimestamp = entry.timestamp;
        firstSongId = entry.songId;
      }

      totalSeconds += entry.duration || (song.duration ? song.duration * 0.8 : 180);
    }

    // If history is sparse (< 4 unique songs), synthesize from recent songs and golden classics
    if (songPlayCounts.size < 4) {
      // Pull recent songs from localStorage
      let recentIds: string[] = [];
      try {
        recentIds = JSON.parse(localStorage.getItem('sunehre_geet_recent') || '[]');
      } catch {}

      // Top evergreen core song pool
      const curatedMasterpieces = SONGS.filter((s) =>
        ['Kishore Kumar', 'Mohammed Rafi', 'Lata Mangeshkar', 'Mukesh', 'Asha Bhosle', 'Jagjit Singh', 'Sonu Nigam', 'KK', 'Atif Aslam', 'Kumar Sanu'].some(
          (legend) => s.artist.includes(legend)
        )
      );

      const seedIds = Array.from(new Set([...recentIds, ...curatedMasterpieces.map((s) => s.id)])).slice(0, 15);

      let mult = periodType === 'yearly' ? 18 : 6;
      seedIds.forEach((id, idx) => {
        const song = songMap.get(id);
        if (song) {
          const simulatedPlays = Math.max(2, mult - idx);
          songPlayCounts.set(id, (songPlayCounts.get(id) || 0) + simulatedPlays);

          const artistName = song.artist.split(',')[0].split('&')[0].trim();
          artistPlayCounts.set(artistName, (artistPlayCounts.get(artistName) || 0) + simulatedPlays);

          const dec = song.decade || '70s';
          decadeCounts.set(dec, (decadeCounts.get(dec) || 0) + simulatedPlays);

          totalSeconds += simulatedPlays * (song.duration || 210);
        }
      });
    }

    // Compute Top 5 Songs
    const sortedSongs = Array.from(songPlayCounts.entries())
      .map(([songId, plays]) => ({ song: songMap.get(songId)!, plays }))
      .filter((item) => item.song)
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    // Compute Top 5 Artists
    const sortedArtists = Array.from(artistPlayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artistName, plays]) => {
        const foundArtist = ARTISTS.find((a) =>
          a.name.toLowerCase().includes(artistName.toLowerCase()) ||
          artistName.toLowerCase().includes(a.name.toLowerCase())
        );

        // Find favorite song by this artist
        const topSongForArtist = sortedSongs.find((s) => s.song.artist.includes(artistName))?.song?.title ||
          SONGS.find((s) => s.artist.includes(artistName))?.title || 'Classic Hit';

        return {
          artistName: foundArtist ? foundArtist.name : artistName,
          avatarUrl: foundArtist ? foundArtist.imageUrl : '/logo.png',
          plays,
          topSongTitle: topSongForArtist,
        };
      });

    // Compute Decade Breakdown
    const totalDecadePlays = Array.from(decadeCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const decadeLabels: Record<string, string> = {
      '50s': '1950s Golden Dawn',
      '60s': '1960s Romantic Melodies',
      '70s': '1970s Retro Classics',
      '80s': '1980s Disco & Melody',
      '90s': '1990s Pure Romance',
      '2000s': '2000s Modern Nostalgia',
      '2010s': '2010s Soulful Wave',
    };

    const decadeBreakdown = Array.from(decadeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([dec, count]) => ({
        decade: dec,
        percentage: Math.round((count / totalDecadePlays) * 100),
        label: decadeLabels[dec] || `${dec} Classics`,
      }));

    // Listening Time / Peak Hour
    let peakHour = 22; // default 10 PM
    let maxHourPlays = -1;
    hourCounts.forEach((count, h) => {
      if (count > maxHourPlays) {
        maxHourPlays = count;
        peakHour = h;
      }
    });

    let peakHourDescription = 'Late Night Melodies (10 PM - 2 AM)';
    if (peakHour >= 5 && peakHour < 11) {
      peakHourDescription = 'Morning Ragas & Fresh Melodies (6 AM - 11 AM)';
    } else if (peakHour >= 11 && peakHour < 17) {
      peakHourDescription = 'Afternoon Nostalgia & Serenity (12 PM - 5 PM)';
    } else if (peakHour >= 17 && peakHour < 21) {
      peakHourDescription = 'Evening Golden Hours (5 PM - 9 PM)';
    }

    // Personality Archetype
    const topArtistName = sortedArtists[0]?.artistName || 'Kishore Kumar';
    const topSong = sortedSongs[0]?.song || null;
    const topDecade = decadeBreakdown[0]?.decade || '70s';

    let personality = {
      title: 'The Timeless Romantic',
      subtitle: 'आशिक़-ए-मौसिक़ी (Devoted to Pure Melodies)',
      description: 'Your heart beats to timeless soulful lyrics. For you, music is not background noise—it is poetry, emotion, and an escape into golden nostalgia.',
      badgeEmoji: '🌹',
      gradient: 'from-amber-600 via-rose-600 to-purple-800',
      bgGlow: 'rgba(244, 63, 94, 0.25)',
    };

    if (topArtistName.includes('Jagjit') || topArtistName.includes('Mehdi') || topArtistName.includes('Pankaj')) {
      personality = {
        title: 'The Ghazal Connoisseur',
        subtitle: 'रूहानी सुकून (The Soulful Meditator)',
        description: 'You appreciate depth, heavy poetry, and quiet evening strings. Every couplet touches your deepest thoughts.',
        badgeEmoji: '🕯️',
        gradient: 'from-amber-700 via-amber-900 to-stone-900',
        bgGlow: 'rgba(217, 119, 6, 0.25)',
      };
    } else if (topDecade === '90s' || topArtistName.includes('Sanu') || topArtistName.includes('Udit') || topArtistName.includes('Alka')) {
      personality = {
        title: 'The 90s Golden Melodist',
        subtitle: 'नवे के दशक के दीवाने (Nostalgia Addict)',
        description: 'Rain drops, cassette tape memories, and golden 90s violins define your world. You have impeccable romantic taste.',
        badgeEmoji: '📻',
        gradient: 'from-purple-600 via-indigo-600 to-blue-900',
        bgGlow: 'rgba(99, 102, 241, 0.25)',
      };
    } else if (topArtistName.includes('KK') || topArtistName.includes('Atif') || topArtistName.includes('Mohit') || topArtistName.includes('Lucky')) {
      personality = {
        title: 'The Melodic Soul Seeker',
        subtitle: 'दिलों का हमसफ़र (The Voice of Modern Soul)',
        description: 'Raw emotions, acoustic guitars, and legendary high-notes accompany your drives and late-night contemplation.',
        badgeEmoji: '🎸',
        gradient: 'from-cyan-600 via-blue-600 to-indigo-900',
        bgGlow: 'rgba(6, 182, 212, 0.25)',
      };
    } else if (topDecade === '50s' || topDecade === '60s' || topArtistName.includes('Mukesh') || topArtistName.includes('Rafi')) {
      personality = {
        title: 'The Golden Era Virtuoso',
        subtitle: 'सदाबहार पारखी (The Vintage Maestro)',
        description: 'You treasure the rarest vintage recordings. The golden era of Indian cinema lives vibrantly in your playlist.',
        badgeEmoji: '✨',
        gradient: 'from-amber-500 via-yellow-600 to-amber-900',
        bgGlow: 'rgba(234, 179, 8, 0.25)',
      };
    }

    const totalMinutes = Math.max(28, Math.round(totalSeconds / 60));
    const totalSongsCount = Math.max(12, Array.from(songPlayCounts.values()).reduce((a, b) => a + b, 0));

    // Compute Listening Streak (consecutive days with at least 1 play)
    let longestStreak = 0;
    if (uniqueDates.size > 0) {
      const sortedDates = Array.from(uniqueDates).sort();
      let currentStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
    }
    // Floor streak at 1 if user has any listening data
    longestStreak = Math.max(longestStreak, filteredHistory.length > 0 ? 1 : 0);

    // Unique songs count
    const uniqueSongsCount = songPlayCounts.size;

    // First song played in this period
    const firstSongPlayed = firstSongId ? (songMap.get(firstSongId) || null) : null;

    // Most active day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let maxDayIdx = 0;
    let maxDayCount = -1;
    dayCounts.forEach((count: number, idx: number) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        maxDayIdx = idx;
      }
    });
    const mostActiveDay = filteredHistory.length > 0 ? dayNames[maxDayIdx] : 'Saturday';

    // Genre/Mood Breakdown
    const genreEmojis: Record<string, string> = {
      'romantic': '💕',
      'sad': '😢',
      'dance': '💃',
      'devotional': '🙏',
      'ghazal': '🕯️',
      'sufi': '🌙',
      'pop-rock': '🎸',
      'classical': '🎻',
      'retro': '📻',
      'bollywood': '🎬',
    };
    const genreLabels: Record<string, string> = {
      'romantic': 'Romantic',
      'sad': 'Sad & Emotional',
      'dance': 'Dance & Party',
      'devotional': 'Devotional',
      'ghazal': 'Ghazal',
      'sufi': 'Sufi',
      'pop-rock': 'Pop & Rock',
      'classical': 'Classical',
      'retro': 'Retro Hits',
      'bollywood': 'Bollywood',
    };
    const totalGenrePlays = Array.from(genreCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const genreBreakdown = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({
        genre: genreLabels[genre] || genre,
        percentage: Math.round((count / totalGenrePlays) * 100),
        emoji: genreEmojis[genre] || '🎵',
      }));

    return {
      periodType,
      periodLabel,
      year: targetYear,
      month: targetMonth,
      totalMinutes,
      totalSongsCount,
      topSongs: sortedSongs,
      topArtists: sortedArtists,
      decadeBreakdown,
      peakHourDescription,
      personality,
      topSong,
      topArtist: topArtistName,
      longestStreak,
      uniqueSongsCount,
      firstSongPlayed,
      mostActiveDay,
      genreBreakdown,
    };
  },

  // Get full playlist queue for "Play My Wrapped"
  getWrappedPlaylist(stats: WrappedStats): Song[] {
    const list = stats.topSongs.map((s) => s.song);
    if (list.length < 15) {
      // Pad with songs from top artist
      const artistSongs = SONGS.filter((s) =>
        s.artist.toLowerCase().includes(stats.topArtist.toLowerCase())
      );
      for (const s of artistSongs) {
        if (!list.some((existing) => existing.id === s.id)) {
          list.push(s);
        }
        if (list.length >= 25) break;
      }
    }
    return list;
  },
};
