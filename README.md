# 📻 Saregama Carvaan - 5,000 Songs Edition & Real-Time Synced Lyrics

A standalone, vintage-styled mobile music player application engineered for the classic **Saregama Carvaan 5,000+ Songs collection**, featuring **Ameen Sayani's Binaca Geetmala**, Artist specials, real-time synchronized scrolling lyrics (Karaoke mode), and dual local/cloud streaming audio engines.

![License](https://img.shields.io/badge/License-MIT-gold.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA%20%7C%20Android%20APK-orange.svg)
![Songs](https://img.shields.io/badge/Songs-5%2C026%20Tracks-green.svg)

---

## ✨ Features

- 🎙️ **5,026 Classic Songs Indexed:**
  - **Artists (4,381 tracks):** Kishore Kumar, Lata Mangeshkar, Mohd. Rafi, Mukesh, Asha Bhosle, R.D. Burman, Jagjit Singh, Hemant Kumar, Manna Dey, and more.
  - **Geetmala (645 tracks):** Complete chronological countdowns with Ameen Sayani's iconic commentary and celebrity interviews (Amitabh Bachchan, Suraiya, Kishore Kumar, Meena Kumari).
- 🎛️ **Authentic Carvaan Hardware Experience:**
  - Warm leatherette & metallic gold vintage chassis.
  - Interactive rotary tuner dial with haptic feedback.
  - Glowing amber/green LCD display with real-time VU frequency equalizer animation.
- 🎤 **Synchronized Karaoke Lyrics Engine:**
  - Real-time auto-scrolling Hindi/Urdu lyrics.
  - **Tap-to-Seek:** Tap any lyric line to jump audio playback directly to that second.
  - Automatic integration with public synchronized `.lrc` databases.
- 📱 **Dual Playback Engine (Zero Laptop Required):**
  - **Offline Local Mode:** Copy the folder to your phone (`/Music/carvaan`) and play completely offline with zero internet and zero buffering.
  - **Cloud Mode:** Stream from Cloudflare R2 / AWS S3 / custom URL if hosted remotely.
- 🎧 **Mobile First & Background Audio:**
  - MediaSession API integration (Android lockscreen & notification controls).
  - PWA support: Install as a standalone mobile application via Chrome / Edge.

---

## 🚀 Quick Start

### 1. Run on Laptop
Open `index.html` in your browser:
```bash
# Open directly in browser
start index.html
```

### 2. Run Local Streaming Server (For Mobile on Home Wi-Fi)
```bash
python server.py
```
Then on your phone's browser, navigate to:
```
http://<YOUR_LAPTOP_IP>:8080
```
Tap **"Install App"** or **"Add to Home Screen"** to use it as a standalone app!

### 3. Use 100% Offline on Mobile (No Laptop Needed)
1. Copy the `carvaan` audio folder to your phone (`/Music/carvaan`).
2. Open the app on your phone.
3. Tap **"Set Folder"** at the top right and select the `carvaan` folder.
4. Enjoy all 5,026 songs with lyrics anywhere offline!

---

## 📂 Project Structure

```
├── data/
│   ├── catalog.json       # Master index of 5,026 tracks with artist & category metadata
│   └── catalog.js         # Fast offline JavaScript bundle
├── app.js                 # Core audio engine, rotary dial handler, and lyrics sync
├── index.html             # Carvaan chassis UI and responsive layout
├── style.css              # Vintage retro theme styling and animations
├── server.py              # Local HTTP audio streaming server with Range header support
├── generate_catalog.py    # Python indexing tool for raw Carvaan dumps
├── manifest.json          # PWA Mobile manifest
└── sw.js                  # Service worker for offline caching
```

---

## 📄 License
MIT License. Created for vintage Bollywood music lovers and collectors.
