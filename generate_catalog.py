import os
import json
import re
from pathlib import Path

CARVAAN_DIR = r"I:\carvaan"
OUTPUT_JSON = r"C:\Users\ASHIR\.gemini\antigravity\scratch\saregama-carvaan-app\data\catalog.json"
OUTPUT_JS = r"C:\Users\ASHIR\.gemini\antigravity\scratch\saregama-carvaan-app\data\catalog.js"

ARTIST_KEYWORDS = {
    "Kishore Kumar": ["kishore", "kishor"],
    "Lata Mangeshkar": ["lata"],
    "Mohammed Rafi": ["rafi"],
    "Mukesh": ["mukesh"],
    "Asha Bhosle": ["asha"],
    "R.D. Burman": ["r.d. burman", "rd burman", "pancham", "burman"],
    "Manna Dey": ["manna dey", "manna"],
    "Hemant Kumar": ["hemant"],
    "Talat Mahmood": ["talat"],
    "Geeta Dutt": ["geeta dutt", "geeta"],
    "Jagjit Singh": ["jagjit"],
    "Kalyanji Anandji": ["kalyanji"],
    "Laxmikant Pyarelal": ["laxmikant"],
    "Anuradha Paudwal": ["anuradha"],
    "Kumar Sanu": ["kumar sanu", "sanu"],
    "Alka Yagnik": ["alka"],
    "Udit Narayan": ["udit"],
    "Sonu Nigam": ["sonu nigam", "sonu"]
}

def clean_title(raw_name):
    return re.sub(r'^\d+', '', raw_name).strip()

def detect_artist(title, default="Vintage Classics"):
    lower_t = title.lower()
    for artist, keywords in ARTIST_KEYWORDS.items():
        for kw in keywords:
            if kw in lower_t:
                return artist
    return default

def main():
    songs = []
    artist_dir = os.path.join(CARVAAN_DIR, "ARTIST")
    geetmala_dir = os.path.join(CARVAAN_DIR, "GEETMALA")

    song_id = 1

    if os.path.exists(artist_dir):
        for f in sorted(os.listdir(artist_dir)):
            if f.lower().endswith(('.mp3', '.m4a', '.flac', '.wav')):
                raw_title = Path(f).stem
                clean_t = clean_title(raw_title)
                artist = detect_artist(clean_t, default="Vintage Classics")
                
                songs.append({
                    "id": song_id,
                    "title": clean_t,
                    "artist": artist,
                    "category": "Artists",
                    "folder": "ARTIST",
                    "filename": f,
                    "relPath": f"ARTIST/{f}"
                })
                song_id += 1

    if os.path.exists(geetmala_dir):
        for f in sorted(os.listdir(geetmala_dir)):
            if f.lower().endswith(('.mp3', '.m4a', '.flac', '.wav')):
                raw_title = Path(f).stem
                clean_t = clean_title(raw_title)
                
                is_interview = "Interview" in clean_t
                is_commentary = "Commentary" in clean_t
                
                artist = "Ameen Sayani"
                if is_interview:
                    match = re.search(r'Interview\s*\((.*?)\)', clean_t)
                    if match:
                        artist = f"Ameen Sayani ft. {match.group(1)}"
                
                songs.append({
                    "id": song_id,
                    "title": clean_t,
                    "artist": artist,
                    "category": "Geetmala",
                    "folder": "GEETMALA",
                    "filename": f,
                    "relPath": f"GEETMALA/{f}",
                    "isInterview": is_interview,
                    "isCommentary": is_commentary
                })
                song_id += 1

    print(f"Total songs parsed: {len(songs)}")

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(songs, f, indent=2, ensure_ascii=False)

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write("window.CARVAAN_CATALOG = ")
        json.dump(songs, f, ensure_ascii=False)
        f.write(";\n")

    print("Generated catalog.json and catalog.js successfully!")

if __name__ == "__main__":
    main()
