// Saregama Carvaan - Luxury Hi-Fi Audio & Synced Lyrics Engine

(function() {
  const state = {
    catalog: window.CARVAAN_CATALOG || [],
    filteredList: [],
    currentSongIndex: -1,
    currentSong: null,
    isPlaying: false,
    isShuffle: false,
    currentMode: 'all', // 'all', 'artists', 'geetmala', 'interviews', 'favorites'
    currentArtist: 'ALL',
    searchQuery: '',
    favorites: JSON.parse(localStorage.getItem('carvaan_favs') || '[]'),
    
    // Audio Source (Default: Archive.org 0MB Cloud Stream)
    cloudBaseUrl: localStorage.getItem('carvaan_cloud_url') || 'https://archive.org/download/saregama-carvaan-5000-songs-collection',
    localDirectoryHandle: null,
    localFileMap: new Map(),
    
    // Lyrics State
    lyrics: [],
    currentLyricIndex: -1
  };

  const ARTIST_ROSTER = [
    { name: "ALL", label: "All Artists", icon: "fa-music" },
    { name: "Kishore Kumar", label: "Kishore", icon: "fa-microphone" },
    { name: "Lata Mangeshkar", label: "Lata", icon: "fa-star" },
    { name: "Mohammed Rafi", label: "Rafi", icon: "fa-compact-disc" },
    { name: "Mukesh", label: "Mukesh", icon: "fa-heart" },
    { name: "Asha Bhosle", label: "Asha", icon: "fa-wand-magic-sparkles" },
    { name: "R.D. Burman", label: "Pancham", icon: "fa-guitar" },
    { name: "Ameen Sayani", label: "Geetmala", icon: "fa-radio" },
    { name: "Jagjit Singh", label: "Jagjit", icon: "fa-feather" }
  ];

  // DOM Elements
  const audio = document.getElementById('audio-engine');
  const songListEl = document.getElementById('song-list');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const catalogCountBadge = document.getElementById('catalog-count-badge');
  const btnPlayAllShuffled = document.getElementById('btn-play-all-shuffled');
  
  const playIcon = document.getElementById('play-icon');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnFavCurrent = document.getElementById('btn-fav-current');
  const heroFavIcon = document.getElementById('hero-fav-icon');
  
  const seekBar = document.getElementById('seek-bar');
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');
  
  const trackTitleEl = document.getElementById('track-title');
  const trackArtistEl = document.getElementById('track-artist');
  const oledChannelEl = document.getElementById('oled-channel-badge');
  const oledModeEl = document.getElementById('oled-mode-badge');
  const oledEq = document.getElementById('oled-eq');
  
  const vinylDisc = document.getElementById('vinyl-disc');
  const tonearm = document.getElementById('tonearm');
  const rotaryKnob = document.getElementById('rotary-knob');
  const artistAvatarsContainer = document.getElementById('artist-avatars');
  const lyricsContainer = document.getElementById('lyrics-container');
  
  const sourceModal = document.getElementById('source-modal');
  const btnSource = document.getElementById('btn-source');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnPickFolder = document.getElementById('btn-pick-folder');
  const localStatusMsg = document.getElementById('local-status-msg');

  // INIT
  function init() {
    state.filteredList = [...state.catalog];
    renderArtistAvatars();
    renderSongList();
    bindEvents();
    setupMediaSession();
    updateLcdMode();
  }

  // RENDER ARTIST SPOTLIGHT CHIPS
  function renderArtistAvatars() {
    artistAvatarsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    ARTIST_ROSTER.forEach(artist => {
      const card = document.createElement('div');
      card.className = `artist-card ${state.currentArtist === artist.name ? 'active' : ''}`;
      card.innerHTML = `
        <div class="avatar-ring">
          <i class="fa-solid ${artist.icon}"></i>
        </div>
        <span class="artist-name-label">${artist.label}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.artist-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.currentArtist = artist.name;
        applyFilters();
      });

      fragment.appendChild(card);
    });

    artistAvatarsContainer.appendChild(fragment);
  }

  // BIND ALL EVENTS
  function bindEvents() {
    btnPlayPause.addEventListener('click', togglePlayPause);
    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);
    
    btnShuffle.addEventListener('click', () => {
      state.isShuffle = !state.isShuffle;
      btnShuffle.classList.toggle('active', state.isShuffle);
    });

    btnPlayAllShuffled.addEventListener('click', () => {
      state.isShuffle = true;
      btnShuffle.classList.add('active');
      playNext();
    });

    btnFavCurrent.addEventListener('click', () => {
      if (state.currentSong) {
        toggleFavorite(state.currentSong.id);
        updateHeroFavIcon();
      }
    });

    // Rotary Knob Interactive Tuning
    let knobDeg = 0;
    rotaryKnob.addEventListener('click', () => {
      knobDeg += 45;
      rotaryKnob.style.transform = `rotate(${knobDeg}deg)`;
      playNext();
    });

    // Seek Bar Scrubbing
    seekBar.addEventListener('input', () => {
      if (audio.duration) {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
      }
    });

    // Audio Engine Handlers
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onSongEnded);
    audio.addEventListener('play', () => {
      state.isPlaying = true;
      playIcon.className = 'fa-solid fa-pause';
      vinylDisc.classList.add('spinning');
      tonearm.classList.add('on-record');
      oledEq.classList.add('active');
    });
    audio.addEventListener('pause', () => {
      state.isPlaying = false;
      playIcon.className = 'fa-solid fa-play';
      vinylDisc.classList.remove('spinning');
      tonearm.classList.remove('on-record');
      oledEq.classList.remove('active');
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      applyFilters();
    });
    
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      btnClearSearch.style.display = 'none';
      applyFilters();
    });

    // Channel Pills (Mode Toggles)
    document.querySelectorAll('.channel-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.channel-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentMode = btn.dataset.mode;
        updateLcdMode();
        applyFilters();
      });
    });

    // Settings Modal
    btnSource.addEventListener('click', () => sourceModal.classList.add('open'));
    btnCloseModal.addEventListener('click', () => sourceModal.classList.remove('open'));
    
    // Pick Local Folder
    btnPickFolder.addEventListener('click', async () => {
      try {
        if ('showDirectoryPicker' in window && window.isSecureContext) {
          const dirHandle = await window.showDirectoryPicker();
          state.localDirectoryHandle = dirHandle;
          state.localFileMap.clear();
          await scanDirectoryHandle(dirHandle);
          const count = state.localFileMap.size;
          localStatusMsg.textContent = `Linked ${count} files from "${dirHandle.name}"`;
          sourceModal.classList.remove('open');
          if (state.currentSong) playSong(state.currentSong);
        } else {
          alert("To use local storage mode, open the app over HTTPS or use the default 24/7 Cloud Streaming.");
        }
      } catch (err) {
        console.warn("Folder picker note:", err);
      }
    });
  }

  async function scanDirectoryHandle(dirHandle, path = "") {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const name = entry.name.toLowerCase();
        if (name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.flac') || name.endsWith('.wav')) {
          state.localFileMap.set(name, entry);
        }
      } else if (entry.kind === 'directory') {
        await scanDirectoryHandle(entry, `${path}${entry.name}/`);
      }
    }
  }

  // FILTERING LOGIC
  function applyFilters() {
    let list = [...state.catalog];

    if (state.currentMode === 'geetmala') {
      list = list.filter(s => s.category === 'Geetmala' && !s.isInterview);
    } else if (state.currentMode === 'interviews') {
      list = list.filter(s => s.isInterview);
    } else if (state.currentMode === 'artists') {
      list = list.filter(s => s.category === 'Artists');
    } else if (state.currentMode === 'favorites') {
      list = list.filter(s => state.favorites.includes(s.id));
    }

    if (state.currentArtist !== 'ALL') {
      list = list.filter(s => s.artist.toLowerCase().includes(state.currentArtist.toLowerCase()));
    }

    if (state.searchQuery) {
      list = list.filter(s => 
        s.title.toLowerCase().includes(state.searchQuery) ||
        s.artist.toLowerCase().includes(state.searchQuery) ||
        (s.filename && s.filename.toLowerCase().includes(state.searchQuery))
      );
    }

    state.filteredList = list;
    catalogCountBadge.textContent = `${list.length.toLocaleString()} Songs Available`;
    renderSongList();
  }

  // RENDER SONG LIST
  function renderSongList() {
    songListEl.innerHTML = '';
    
    if (state.filteredList.length === 0) {
      songListEl.innerHTML = `<div style="text-align:center; padding:40px 10px; color:#777;"><i class="fa-solid fa-magnifying-glass fa-2x" style="margin-bottom:10px; opacity:0.4;"></i><p>No songs found matching your filter</p></div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    const renderLimit = Math.min(state.filteredList.length, 120);

    for (let i = 0; i < renderLimit; i++) {
      const song = state.filteredList[i];
      const isCurrent = state.currentSong && state.currentSong.id === song.id;
      const isFav = state.favorites.includes(song.id);

      const card = document.createElement('div');
      card.className = `song-card ${isCurrent ? 'active' : ''}`;
      card.innerHTML = `
        <div class="card-left">
          <div class="card-index">${String(song.id).padStart(4, '0')}</div>
          <div class="card-info">
            <div class="card-title">${song.title}</div>
            <div class="card-sub"><i class="fa-solid fa-microphone"></i> ${song.artist} • ${song.category}</div>
          </div>
        </div>
        <div class="card-right">
          <button class="fav-action-btn ${isFav ? 'active' : ''}" data-id="${song.id}">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-action-btn')) return;
        playSong(song);
      });

      const favBtn = card.querySelector('.fav-action-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(song.id);
        favBtn.classList.toggle('active', state.favorites.includes(song.id));
        favBtn.innerHTML = `<i class="fa-${state.favorites.includes(song.id) ? 'solid' : 'regular'} fa-heart"></i>`;
        updateHeroFavIcon();
      });

      fragment.appendChild(card);
    }

    songListEl.appendChild(fragment);
  }

  // PLAY SONG WITH DIRECT CLOUD STREAMING
  async function playSong(song) {
    state.currentSong = song;
    state.currentSongIndex = state.filteredList.findIndex(s => s.id === song.id);

    // Update Display
    trackTitleEl.textContent = song.title;
    trackArtistEl.textContent = `${song.artist} • ${song.category}`;
    oledChannelEl.textContent = `CH ${String(song.id).padStart(4, '0')}`;
    updateHeroFavIcon();

    // Highlight active card
    document.querySelectorAll('.song-card').forEach(el => el.classList.remove('active'));
    renderSongList();

    let audioSrc = null;
    const cleanFileName = (song.filename || "").toLowerCase();

    // 1. Local storage check
    if (state.localFileMap.has(cleanFileName)) {
      const entry = state.localFileMap.get(cleanFileName);
      if (entry.getFile) {
        const file = await entry.getFile();
        audioSrc = URL.createObjectURL(file);
      }
    } 
    // 2. Direct Archive.org 0MB Cloud Streaming
    else if (state.cloudBaseUrl) {
      const parts = (song.relPath || '').split('/').map(p => encodeURIComponent(p));
      audioSrc = `${state.cloudBaseUrl.replace(/\/+$/, '')}/${parts.join('/')}`;
    }

    if (audioSrc) {
      audio.src = audioSrc;
      try {
        await audio.play();
      } catch (e) {
        console.log("Audio start notice:", e);
      }
    }

    // Synchronize Karaoke Lyrics
    fetchAndDisplayLyrics(song);
  }

  function togglePlayPause() {
    if (!state.currentSong && state.filteredList.length > 0) {
      playSong(state.filteredList[0]);
      return;
    }
    if (audio.paused) {
      audio.play().catch(e => console.log(e));
    } else {
      audio.pause();
    }
  }

  function playNext() {
    if (state.filteredList.length === 0) return;
    let nextIndex = 0;
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.filteredList.length);
    } else {
      nextIndex = (state.currentSongIndex + 1) % state.filteredList.length;
    }
    playSong(state.filteredList[nextIndex]);
  }

  function playPrev() {
    if (state.filteredList.length === 0) return;
    let prevIndex = (state.currentSongIndex - 1 + state.filteredList.length) % state.filteredList.length;
    playSong(state.filteredList[prevIndex]);
  }

  function onSongEnded() {
    playNext();
  }

  // TIME & LYRICS SYNC
  function onTimeUpdate() {
    if (!audio.duration) return;
    const cur = audio.currentTime;
    const dur = audio.duration;
    
    seekBar.value = (cur / dur) * 100;
    currentTimeEl.textContent = formatTime(cur);
    totalDurationEl.textContent = formatTime(dur);

    if (state.lyrics.length > 0) {
      let activeIndex = -1;
      for (let i = 0; i < state.lyrics.length; i++) {
        if (cur >= state.lyrics[i].time) {
          activeIndex = i;
        } else {
          break;
        }
      }

      if (activeIndex !== state.currentLyricIndex && activeIndex !== -1) {
        state.currentLyricIndex = activeIndex;
        highlightActiveLyric(activeIndex);
      }
    }
  }

  function formatTime(secs) {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // KARAOKE LYRICS ENGINE
  async function fetchAndDisplayLyrics(song) {
    state.lyrics = [];
    state.currentLyricIndex = -1;
    lyricsContainer.innerHTML = `<div class="lyrics-empty-state"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--gold-primary);"></i><p>Synchronizing karaoke lyrics for "${song.title}"...</p></div>`;

    try {
      const cleanTitle = song.title.replace(/[_\d\-]/g, ' ').trim();
      const cleanArtist = song.artist.replace(/Ameen Sayani|Various Artists|ft\..*/g, '').trim();
      
      const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
      const res = await fetch(`https://lrclib.net/api/search?q=${query}`);
      const data = await res.json();

      if (data && data.length > 0 && data[0].syncedLyrics) {
        parseLrcLyrics(data[0].syncedLyrics);
        renderLyrics();
        return;
      }
    } catch (e) {
      console.log("Online lyrics note:", e);
    }

    lyricsContainer.innerHTML = `
      <div class="lyric-item active">🎵 ${song.title}</div>
      <div class="lyric-item">🎙️ Singer: ${song.artist}</div>
      <div class="lyric-item">📻 Collection: Saregama Carvaan 5000 Gold Edition</div>
    `;
  }

  function parseLrcLyrics(lrcText) {
    const lines = lrcText.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = min * 60 + sec + (ms > 99 ? ms / 1000 : ms / 100);
        const text = line.replace(timeRegex, '').trim();
        if (text) {
          result.push({ time, text });
        }
      }
    }
    state.lyrics = result;
  }

  function renderLyrics() {
    lyricsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    state.lyrics.forEach((l, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'lyric-item';
      lineEl.id = `lyric-${index}`;
      lineEl.textContent = l.text;
      
      lineEl.addEventListener('click', () => {
        audio.currentTime = l.time;
      });

      fragment.appendChild(lineEl);
    });

    lyricsContainer.appendChild(fragment);
  }

  function highlightActiveLyric(index) {
    document.querySelectorAll('.lyric-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`lyric-${index}`);
    if (activeEl) {
      activeEl.classList.add('active');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // FAVORITES
  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push(id);
    }
    localStorage.setItem('carvaan_favs', JSON.stringify(state.favorites));
  }

  function updateHeroFavIcon() {
    if (state.currentSong && state.favorites.includes(state.currentSong.id)) {
      btnFavCurrent.classList.add('favorited');
      heroFavIcon.className = 'fa-solid fa-heart';
    } else {
      btnFavCurrent.classList.remove('favorited');
      heroFavIcon.className = 'fa-regular fa-heart';
    }
  }

  function updateLcdMode() {
    const modeNames = {
      'all': 'ALL 5,000 CLASSICS',
      'artists': 'ARTIST SPOTLIGHT',
      'geetmala': 'BINACA GEETMALA',
      'interviews': 'AMEEN SAYANI INTERVIEWS',
      'favorites': 'MY FAVORITES'
    };
    oledModeEl.innerHTML = `<i class="fa-solid fa-tower-broadcast"></i> ${modeNames[state.currentMode] || 'CARVAAN'}`;
  }

  function setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }

  init();
})();
