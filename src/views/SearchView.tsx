import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Disc, Music, User, Flame, History, X, Loader2, Globe, Mic, MicOff } from 'lucide-react';
import { SONGS } from '../data/songs';
import { ARTISTS } from '../data/artists';
import { Song, Artist } from '../types';
import { SongItem } from '../components/SongItem';
import CryptoJS from 'crypto-js';

interface SearchViewProps {
  onOpenCreatePlaylist: (songId?: string) => void;
  onSelectArtist?: (artist: Artist) => void;
}

const TRENDING_SEARCHES = [
  'Pehli Nazar Mein',
  'Lag Ja Gale',
  'Pal Pal Dil Ke Paas',
  'Chaudhvin Ka Chand',
  'Tum Hi Ho',
  'Kal Ho Naa Ho',
  'Aadat',
  'Chura Liya Hai Tumne',
  'O Sanam',
  'Dil Diyan Gallan',
  'Pehla Nasha',
  'Zara Sa',
  'Tere Bina Zindagi Se',
  'Jeena Jeena',
  'Kya Hua Tera Wada',
  'Tujhe Dekha To'
];

function decryptSaavnUrl(encrypted: string | null | undefined): string | null {
  if (!encrypted) return null;
  if (encrypted.startsWith('http')) return encrypted;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      encrypted,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const decStr = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decStr || !decStr.startsWith('http')) return null;
    return decStr
      .replace('_96.mp4', '_320.mp4')
      .replace('_160.mp4', '_320.mp4')
      .replace('_96.m4a', '_320.mp4')
      .replace('_48.mp4', '_320.mp4');
  } catch (e) {
    return null;
  }
}

async function nativeFetchText(targetUrl: string): Promise<string | null> {
  try {
    const cap = (window as any).Capacitor;
    if (cap?.Plugins?.MediaNotificationPlugin?.fetchHttpUrl) {
      const res = await cap.Plugins.MediaNotificationPlugin.fetchHttpUrl({ url: targetUrl });
      if (res && res.content && res.content.trim().length > 0) {
        return res.content;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch(targetUrl);
    if (res.ok) return await res.text();
  } catch (e) {}

  return null;
}

export const SearchView: React.FC<SearchViewProps> = ({ onOpenCreatePlaylist, onSelectArtist }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [onlineResults, setOnlineResults] = useState<Song[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(30);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sunehre_geet_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    const lowerT = trimmed.toLowerCase();
    // Filter out identical or substring/prefix duplicates
    const updated = [
      trimmed,
      ...recentSearches.filter((s) => {
        const lowerS = s.toLowerCase();
        return lowerS !== lowerT && !lowerT.startsWith(lowerS) && !lowerS.startsWith(lowerT);
      }),
    ].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem('sunehre_geet_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('sunehre_geet_recent_searches');
    } catch {}
  };

  // Perform Live Online Search via JioSaavn API
  const performOnlineSearch = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean || clean.length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    setIsSearchingOnline(true);
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=25&p=1&q=${encodeURIComponent(clean)}`;
      const text = await nativeFetchText(url);
      if (!text) {
        setOnlineResults([]);
        return;
      }
      const data = JSON.parse(text);

      if (data && data.results && Array.isArray(data.results)) {
        const parsed: Song[] = [];
        for (const item of data.results) {
          if (!item) continue;
          const directAudio = decryptSaavnUrl(item.more_info?.encrypted_media_url);
          if (!directAudio) continue;

          const titleClean = String(item.title || '')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .trim();

          const yr = parseInt(item.year || item.more_info?.year || '2010', 10) || 2010;
          const artistName = String(item.subtitle || item.more_info?.singers || 'Bollywood Playback');
          const albumName = String(item.more_info?.album || 'Original Soundtrack').replace(/&amp;/g, '&');

          parsed.push({
            id: `online-${item.id}`,
            title: titleClean,
            artist: artistName,
            artists: artistName.split(',').map((s) => s.trim()),
            movie: albumName,
            year: yr,
            decade: yr < 1960 ? '50s' : yr < 1970 ? '60s' : yr < 1980 ? '70s' : yr < 1990 ? '80s' : yr < 2000 ? '90s' : '2000s',
            duration: parseInt(item.more_info?.duration || item.duration || '240', 10) || 240,
            audioUrl: directAudio,
            coverUrl: (item.image || '').replace('150x150', '500x500') || '/artists/arijit-singh.jpg',
            genre: item.language || 'Hindi',
            composer: String(item.more_info?.music || '').replace(/&amp;/g, '&'),
            lyricist: String(item.more_info?.singers || '').replace(/&amp;/g, '&')
          });
        }
        setOnlineResults(parsed);
      } else {
        setOnlineResults([]);
      }
    } catch (err) {
      console.warn('Online search error:', err);
      setOnlineResults([]);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setDisplayLimit(30);
    clearTimeout(searchTimeoutRef.current);
    if (val.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performOnlineSearch(val);
      }, 400);
    } else {
      setOnlineResults([]);
      setIsSearchingOnline(false);
    }
  };

  const handleSearchSubmit = (term: string) => {
    setQuery(term);
    setDisplayLimit(30);
    saveRecentSearch(term);
    performOnlineSearch(term);
  };

  const [isListening, setIsListening] = useState(false);

  const devanagariToEnglish = (str: string): string => {
    if (!/[\u0900-\u097F]/.test(str)) return str;
    const vowels: Record<string, string> = {
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
      'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah'
    };
    const matras: Record<string, string> = {
      'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
      'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h'
    };
    const consonants: Record<string, string> = {
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
      'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
      'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
      'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
      'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
      'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
      'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f'
    };

    let res = '';
    const chars = Array.from(str);
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const next = chars[i + 1];
      if (consonants[c]) {
        const cons = consonants[c];
        if (next === '्') {
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
    // 1. Try Native Android Speech Recognition via MediaNotificationPlugin
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

    // 2. Web Speech API fallback (Set to English - India for Hindi songs in English script)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          setIsListening(false);
          const raw = event.results[0]?.[0]?.transcript;
          if (raw && raw.trim()) {
            const transcript = devanagariToEnglish(raw.trim());
            handleSearchSubmit(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          console.warn('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
        console.warn('Web speech failed:', err);
      }
    } else {
      alert('Voice search is not supported on this device/browser.');
    }
  };

  // Local matching songs
  const trimmed = query.trim().toLowerCase();
  const localMatchingSongs = trimmed
    ? SONGS.filter(
        (s) =>
          (s.title && s.title.toLowerCase().includes(trimmed)) ||
          (s.artist && s.artist.toLowerCase().includes(trimmed)) ||
          (s.movie && s.movie.toLowerCase().includes(trimmed))
      )
    : [];

  const localMatchingArtists = trimmed
    ? ARTISTS.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(trimmed)) ||
          (a.hindiName && a.hindiName.toLowerCase().includes(trimmed))
      )
    : [];

  // Deduplicate online results with local results
  const seenIds = new Set(localMatchingSongs.map((s) => (s.title || '').toLowerCase()));
  const extraOnlineSongs = onlineResults.filter(
    (s) => !seenIds.has((s.title || '').toLowerCase())
  );

  const totalCombinedSongs = [...localMatchingSongs, ...extraOnlineSongs];
  const visibleSongs = totalCombinedSongs.slice(0, displayLimit);

  return (
    <div className="pb-36 pt-3 px-4 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* Search Input Bar with Mic */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-retro-gold">
            {isSearchingOnline ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit(query);
            }}
            placeholder="Search any song, singer, movie (e.g. Pehli Nazar Mein, Rafi, DDLJ)..."
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-[#18112b] border border-retro-gold/30 text-retro-cream placeholder-white/40 text-sm focus:outline-none focus:border-retro-gold focus:ring-1 focus:ring-retro-gold transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setOnlineResults([]);
                }}
                className="p-1.5 text-white/40 hover:text-white transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {/* Mic / Voice Search Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse scale-105'
                  : 'text-retro-gold hover:text-amber-300 hover:bg-white/10 active:scale-95'
              }`}
              title="बोलकर खोजें (Voice Search)"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listening Voice Indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>🎙️ सुन रहे हैं... गाने या गायक का नाम बोलिए (Listening...)</span>
          </div>
        )}
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
                  <span>हालिया खोज (Recent Searches)</span>
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
              <span>लोकप्रिय खोज (Trending Classics)</span>
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
                <span>गायक / कलाकार ({localMatchingArtists.length})</span>
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
                    />
                    <div>
                      <h4 className="text-xs font-bold text-retro-cream group-hover:text-retro-gold transition-colors line-clamp-1">
                        {artist.name}
                      </h4>
                      <p className="text-[10px] text-white/50">
                        {artist.hindiName || artist.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combined Songs List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-retro-gold uppercase tracking-wider">
                <Music className="w-3.5 h-3.5" />
                <span>गीत ({totalCombinedSongs.length})</span>
              </div>
              {isSearchingOnline && (
                <span className="text-[10px] text-amber-300 flex items-center gap-1">
                  <Globe className="w-3 h-3 animate-spin" />
                  <span>Searching online...</span>
                </span>
              )}
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

                {displayLimit < totalCombinedSongs.length && (
                  <div className="pt-3 text-center">
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + 30)}
                      className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-retro-gold/30 text-retro-gold text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      और गीत देखें (Show More • +{totalCombinedSongs.length - displayLimit} remaining)
                    </button>
                  </div>
                )}
              </div>
            ) : !isSearchingOnline ? (
              <div className="text-center py-12 bg-[#160e28]/60 rounded-3xl border border-white/5 space-y-2">
                <Disc className="w-10 h-10 text-retro-gold/40 mx-auto" />
                <h4 className="font-bold text-sm text-retro-cream">कोई गीत नहीं मिला</h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  कृपया स्पेलिंग जांचें या दूसरा नाम खोजें।
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};