import json, re

print("Reading src/data/songs.ts...")
with open('src/data/songs.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('[')
end_idx = text.rfind(']')

if start_idx != -1 and end_idx != -1:
    raw_array_str = text[start_idx:end_idx+1]
    try:
        songs_list = json.loads(raw_array_str)
    except Exception:
        cleaned = re.sub(r',\s*\]', ']', raw_array_str)
        cleaned = re.sub(r',\s*\}', '}', cleaned)
        songs_list = json.loads(cleaned)

    print(f"Parsed {len(songs_list)} songs successfully!")

    with open('src/data/songs.json', 'w', encoding='utf-8') as jf:
        json.dump(songs_list, jf, ensure_ascii=False)
    print("Written src/data/songs.json!")

    ts_content = """import { Song } from '../types';
import rawSongs from './songs.json';

export const SONGS: Song[] = rawSongs as Song[];
export const songs: Song[] = SONGS;
export default SONGS;
"""
    with open('src/data/songs.ts', 'w', encoding='utf-8') as tf:
        tf.write(ts_content)
    print("Written lightning-fast src/data/songs.ts!")
