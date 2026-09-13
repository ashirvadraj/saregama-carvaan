export interface Song {
  id: string;
  artistId?: string;
  title: string;
  artist: string;
  artists: string[];
  movie: string;
  year: number;
  decade: '50s' | '60s' | '70s' | '80s' | '90s' | '2000s' | string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  composer?: string;
  lyricist?: string;
  genre?: string;
  language?: 'hindi' | 'english';
  lyrics?: string;
}

export interface Artist {
  id: string;
  name: string;
  hindiName?: string;
  era: string;
  imageUrl: string;
  bio: string;
  birthYear?: string;
  deathYear?: string;
  notableHits?: string[];
  popularTracks?: string[];
  songCount?: number;
  genre?: string;
  category?: 'indian' | 'international';
}

export interface Decade {
  id: '50s' | '60s' | '70s' | '80s' | '90s' | '2000s';
  title: string;
  hindiTitle: string;
  years: string;
  description: string;
  imageUrl: string;
  color: string;
  iconName: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  songIds: string[];
  isCustom?: boolean;
  createdAt: number;
}