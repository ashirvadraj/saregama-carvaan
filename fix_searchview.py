code = r"""import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Disc, Music, User, Flame, History, X, Mic } from 'lucide-react';
import { SONGS } from '../data/songs';
import { ARTISTS } from '../data/artists';
import { Song, Artist } from '../types';
import { SongItem } from '../components/SongItem';

interface SearchViewProps {
  onOpenCreatePlaylist: (songId?: string) => void;
  onSelectArtist?: (artist: Artist) => void;
}

const TRENDING_SEARCHES = [
  'Yaad Aa Raha Hai',
  'Dil Deewana',
  'Lag Ja Gale',
  'Pal Pal Dil Ke Paas',
  'Ameen Sayani',
  'Chura Liya Hai Tumne',
  'Commentary',
  'Kishore Kumar',
  'Lata Mangeshkar',
  'Mohammed Rafi',
  'Mukesh',
  'Asha Bhosle',
  'Pehla Pehla Pyar',
  'Gori Tera Gaon Bada Pyara',
  'Mere Rang Mein Rangne Wali',
  'Geetmala'
];

export const SearchView: React.FC<SearchViewProps> = ({ onOpenCreatePlaylist, onSelectArtist }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(30);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('carvaan_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    const lowerT = trimmed.toLowerCase();
    const updated = [
      trimmed,
      ...recentSearches.filter((s) => {
        const lowerS = s.toLowerCase();
        return lowerS !== lowerT && !lowerT.startsWith(lowerS) && !lowerS.startsWith(lowerT);
      }),
    ].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem('carvaan_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('carvaan_recent_searches');
    } catch {}
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setDisplayLimit(30);
  };

  const handleSearchSubmit = (term: string) => {
    setQuery(term);
    setDisplayLimit(30);
    saveRecentSearch(term);
  };

  const devanagariToEnglish = (str: string): string => {
    if (!/[\u0900-\u097F]/.test(str)) return str;
    const vowels: Record<string, string> = {
      '\u0905': 'a', '\u0906': 'aa', '\u0907': 'i', '\u0908': 'ee', '\u0909': 'u', '\u090A': 'oo', '\u090B': 'ri',
      '\u090F': 'e', '\u0910': 'ai', '\u0913': 'o', '\u0914': 'au', '\u0902': 'an', '\u0903': 'ah'
    };
    const matras: Record<string, string> = {
      '\u093E': 'a', '\u093F': 'i', '\u0940': 'ee', '\u0941': 'u', '\u0942': 'oo', '\u0943': 'ri',
      '\u0947': 'e', '\u0948': 'ai', '\u094B': 'o', '\u094C': 'au', '\u0902': 'n', '\u0901': 'n', '\u0903': 'h'
    };
    const consonants: Record<string, string> = {
      '\u0915': 'k', '\u0916': 'kh', '\u0917': 'g', '\u0918': 'gh', '\u0919': 'ng',
      '\u091A': 'ch', '\u091B': 'chh', '\u091C': 'j', '\u091D': 'jh', '\u091E': 'ny',
      '\u091F': 't', '\u0920': 'th', '\u0921': 'd', '\u0922': 'dh', '\u0923': 'n',
      '\u0924': 't', '\u0925': 'th', '\u0926': 'd', '\u0927': 'dh', '\u0928': 'n',
      '\u092A': 'p', '\u092B': 'ph', '\u092C': 'b', '\u092D': 'bh', '\u092E': 'm',
      '\u092F': 'y', '\u0930': 'r', '\u0932': 'l', '\u0935': 'v', '\u0936': 'sh', '\u0937': 'sh', '\u0938': 's', '\u0939': 'h'
    };

    let res = '';
    const chars = Array.from(str);
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const next = chars[i + 1];
      if (consonants[c]) {
        const cons = consonants[c];
        if (next === '\u094D') {
          res += cons;
          i++;
        } else if (matras[next]) {
          res += cons + matras[next];
          i++;
        } else if (consonants[next] || vowels[next] || next === ' ' || !next) {
          res += cons + 'a';
        } else {
          res += cons;
        }
      } else if (vowels[c]) {
        res += vowels[c];
      } else if (matras[c]) {
        res += matras[c];
      } else {
        res += c;
      }
    }
    return res.replace(/aa+/g, 'a').replace(/ee+/g, 'ee').trim();
  };

  const handleVoiceSearch = async () => {
    try {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.startSpeechRecognition) {
        setIsListening(true);
        const res = await cap.Plugins.MediaNotificationPlugin.startSpeechRecognition();
        setIsListening(false);
        if (res?.success && res.text) {
          const spokenText = devanagariToEnglish(res.text.trim());
          if (spokenText) {
            handleSearchSubmit(spokenText);
          }
        }
        return;
      }
    } catch (e) {
      console.warn('Native speech error:', e);
      setIsListening(false);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          setIsListening(false);
          const raw = event.results[0]?.[0]?.transcript;
          if (raw && raw.trim()) {
            const transcript = devanagariToEnglish(raw.trim());
            handleSearchSubmit(transcript);
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      alert('Voice search is not supported on this device.');
    }
  };

  // Instant local filtering across all 5,026 Carvaan tracks
  const trimmed = query.trim().toLowerCase();
  const searchKeywords = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];

  const localMatchingSongs = searchKeywords.length > 0
    ? SONGS.filter((s) => {
        const combined = `${s.title} ${s.artist} ${s.movie || ''} ${s.year || ''}`.toLowerCase();
        return searchKeywords.every((kw) => combined.includes(kw));
      })
    : [];

  const localMatchingArtists = trimmed
    ? ARTISTS.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(trimmed)) ||
          (a.hindiName && a.hindiName.toLowerCase().includes(trimmed))
      )
    : [];

  const visibleSongs = localMatchingSongs.slice(0, displayLimit);

  return (
    <div className="pb-36 pt-3 px-4 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* Search Input Bar */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-retro-gold">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit(query);
            }}
            placeholder="Search 5,000 Carvaan songs, singers, geetmala..."
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-[#18112b] border border-retro-gold/30 text-retro-cream placeholder-white/40 text-sm focus:outline-none focus:border-retro-gold focus:ring-1 focus:ring-retro-gold transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 text-white/40 hover:text-white transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse scale-105'
                  : 'text-retro-gold hover:text-amber-300 hover:bg-white/10 active:scale-95'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listening Voice Indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Listening... Please speak song or singer name</span>
          </div>
        )}
      </div>

      {/* Catalog Search Scope Badge */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-retro-gold font-medium">
          <Disc className="w-4 h-4 text-retro-gold" />
          <span>Saregama Carvaan 5,000+ Collection</span>
        </div>
        <span className="text-[11px] text-white/50 font-mono">5,026 Audio Tracks</span>
      </div>

      {/* When query is empty: Suggestions & Trending */}
      {!trimmed && (
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-retro-gold uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  <span>Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-white/40 hover:text-white hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchSubmit(term)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-retro-cream text-xs border border-white/10 transition-all flex items-center gap-1"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-retro-gold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Trending Classics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSearchSubmit(term)}
                  className="px-3.5 py-1.5 rounded-full bg-[#1c1233] hover:bg-retro-gold/20 text-retro-cream text-xs border border-retro-gold/20 hover:border-retro-gold/50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* When query is typed: Show Matching Artists & Songs */}
      {trimmed && (
        <div className="space-y-5">
          {/* Matching Artists horizontal list */}
          {localMatchingArtists.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-retro-gold uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Singers / Artists ({localMatchingArtists.length})</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {localMatchingArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => {
                      saveRecentSearch(artist.name);
                      onSelectArtist?.(artist);
                    }}
                    className="flex-shrink-0 flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-[#19102f] border border-white/10 hover:border-retro-gold/40 transition-all cursor-pointer group"
                  >
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-retro-cream group-hover:text-retro-gold transition-colors line-clamp-1">
                        {artist.name}
                      </h4>
                      <p className="text-[10px] text-white/50">
                        {artist.hindiName || artist.era}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Carvaan Songs List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-retro-gold uppercase tracking-wider">
                <Music className="w-3.5 h-3.5" />
                <span>Songs & Commentary ({localMatchingSongs.length})</span>
              </div>
            </div>

            {visibleSongs.length > 0 ? (
              <div className="space-y-1">
                {visibleSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    onClickCapture={() => {
                      if (query.trim()) {
                        saveRecentSearch(query.trim());
                      }
                    }}
                  >
                    <SongItem
                      song={song}
                      index={idx}
                      playlistQueue={visibleSongs}
                      onAddToPlaylistClick={onOpenCreatePlaylist}
                    />
                  </div>
                ))}

                {displayLimit < localMatchingSongs.length && (
                  <div className="pt-3 text-center">
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + 30)}
                      className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-retro-gold/30 text-retro-gold text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      Show More (+{localMatchingSongs.length - displayLimit} remaining)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#160e28]/60 rounded-3xl border border-white/5 space-y-2">
                <Disc className="w-10 h-10 text-retro-gold/40 mx-auto" />
                <h4 className="font-bold text-sm text-retro-cream">No tracks found</h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  Please check spelling or search for another song / singer.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open("src/views/SearchView.tsx", "wb") as f:
    f.write(code.encode("utf-8"))

print("SearchView.tsx written with UTF-8 encoding!")
