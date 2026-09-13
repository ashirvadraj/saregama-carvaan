import json, urllib.parse

with open(r'data/catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

print(f"Loaded {len(catalog)} songs from data/catalog.json")

formatted_songs = []

for s in catalog:
    parts = s['relPath'].split('/')
    encoded_rel = '/'.join(urllib.parse.quote(p) for p in parts)
    audio_url = f"https://archive.org/download/saregama-carvaan-5000-songs-collection/{encoded_rel}"

    artist = s.get('artist', 'Vintage Classics')
    title = s.get('title', 'Unknown Track')
    cat = s.get('category', 'Artists')

    # Portrait mapping
    cover_url = "/logo.png"
    if "ameen" in artist.lower():
        cover_url = "/artists/ameen-sayani.jpg"

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

# 1. Write src/data/songs.json
with open(r'src/data/songs.json', 'w', encoding='utf-8') as jf:
    json.dump(formatted_songs, jf, ensure_ascii=False)

print("Saved src/data/songs.json!")

# 2. Write src/data/songs.ts
ts_code = """import { Song } from '../types';
import rawSongs from './songs.json';

export const SONGS: Song[] = rawSongs as Song[];
export const songs: Song[] = SONGS;
export default SONGS;
"""

with open(r'src/data/songs.ts', 'w', encoding='utf-8') as tf:
    tf.write(ts_code)

print("Saved src/data/songs.ts!")
