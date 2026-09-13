import json
import urllib.parse
import re

with open(r'data/catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Converting {len(catalog)} songs to TypeScript...")

# Default vintage placeholder cover images per artist
ARTIST_COVERS = {
    "Kishore Kumar": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    "Lata Mangeshkar": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400",
    "Mohammed Rafi": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    "Mukesh": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400",
    "Asha Bhosle": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400",
    "R.D. Burman": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    "Ameen Sayani": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400",
    "Default": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400"
}

formatted_songs = []

for s in catalog:
    parts = s['relPath'].split('/')
    encoded_rel = '/'.join(urllib.parse.quote(p) for p in parts)
    audio_url = f"https://archive.org/download/saregama-carvaan-5000-songs-collection/{encoded_rel}"

    artist = s.get('artist', 'Vintage Classics')
    title = s.get('title', 'Unknown Track')
    cat = s.get('category', 'Artists')

    # Find cover
    cover_url = ARTIST_COVERS.get(artist, ARTIST_COVERS["Default"])

    formatted_songs.append({
        "id": str(s['id']),
        "title": title,
        "artist": artist,
        "artists": [artist],
        "movie": cat,
        "year": 1975,
        "decade": "70s",
        "duration": 210,
        "audioUrl": audio_url,
        "coverUrl": cover_url,
        "genre": "Vintage Bollywood"
    })

with open(r'src/data/songs.ts', 'w', encoding='utf-8') as f:
    f.write('import { Song } from "../types";\n\n')
    f.write('export const SONGS: Song[] = ')
    json.dump(formatted_songs, f, indent=2, ensure_ascii=False)
    f.write(';\n\n')
    f.write('export const songs = SONGS;\n')

print("Generated src/data/songs.ts with SONGS and songs exports!")
