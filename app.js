// Saregama Carvaan - Complete Audio & Lyrics Engine

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
    
    // Audio Source
    sourceType: localStorage.getItem('carvaan_source_type') || 'local',
    cloudBaseUrl: localStorage.getItem('carvaan_cloud_url') || '',
    localDirectoryHandle: null,
    localFileMap: new Map(),
    
    // Lyrics State
    lyrics: [],
    currentLyricIndex: -1
  };

  // DOM Elements
  const audio = document.getElementById('audio-engine');
  const songListEl = document.getElementById('song-list');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const playlistCountEl = document.getElementById('playlist-count');
  
  const playIcon = document.getElementById('play-icon');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const btnShuffle = document.getElementById('btn-shuffle');
  const seekBar = document.getElementById('seek-bar');
  
  const currentTitleEl = document.getElementById('current-song-title');
  const currentArtistEl = document.getElementById('current-song-artist');
  const trackNumEl = document.getElementById('lcd-track-num');
  const currentTimeEl = document.getElementById('lcd-current-time');
  const modeBadgeEl = document.getElementById('lcd-mode-badge');
  const vinylIcon = document.getElementById('vinyl-icon');
  const rotaryDial = document.getElementById('rotary-dial');
  
  const lyricsContainer = document.getElementById('lyrics-container');
  const sourceModal = document.getElementById('source-modal');
  const btnSource = document.getElementById('btn-source');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnPickFolder = document.getElementById('btn-pick-folder');
  const btnSaveCloud = document.getElementById('btn-save-cloud');
  const cloudUrlInput = document.getElementById('cloud-url-input');
  const localStatus = document.getElementById('local-status');

  // INIT
  function init() {
    state.filteredList = [...state.catalog];
    renderSongList();
    bindEvents();
    setupMediaSession();
    updateLcdMode();
  }

  // EVENT BINDINGS
  function bindEvents() {
    btnPlayPause.addEventListener('click', togglePlayPause);
    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);
    
    btnShuffle.addEventListener('click', () => {
      state.isShuffle = !state.isShuffle;
      btnShuffle.classList.toggle('active', state.isShuffle);
    });

    // Rotary Dial Interaction
    let dialRotation = 0;
    rotaryDial.addEventListener('click', () => {
      dialRotation += 60;
      rotaryDial.style.transform = `rotate(${dialRotation}deg)`;
      playNext();
    });

    // Seek Bar
    seekBar.addEventListener('input', () => {
      if (audio.duration) {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
      }
    });

    // Audio Engine Events
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onSongEnded);
    audio.addEventListener('play', () => {
      state.isPlaying = true;
      playIcon.className = 'fa-solid fa-pause';
      vinylIcon.classList.add('playing');
    });
    audio.addEventListener('pause', () => {
      state.isPlaying = false;
      playIcon.className = 'fa-solid fa-play';
      vinylIcon.classList.remove('playing');
    });

    // Search
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

    // Mode Toggles
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentMode = btn.dataset.mode;
        updateLcdMode();
        applyFilters();
      });
    });

    // Artist Chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentArtist = chip.dataset.artist;
        applyFilters();
      });
    });

    // Source Modal
    btnSource.addEventListener('click', () => sourceModal.classList.add('open'));
    btnCloseModal.addEventListener('click', () => sourceModal.classList.remove('open'));
    
    // Directory Picker for Offline Local Audio
    btnPickFolder.addEventListener('click', async () => {
      try {
        if ('showDirectoryPicker' in window) {
          const dirHandle = await window.showDirectoryPicker();
          state.localDirectoryHandle = dirHandle;
          localStatus.textContent = `Linked: ${dirHandle.name}`;
          localStatus.style.color = '#50e37b';
          state.sourceType = 'local';
          localStorage.setItem('carvaan_source_type', 'local');
          sourceModal.classList.remove('open');
        } else {
          // Fallback input element
          const input = document.createElement('input');
          input.type = 'file';
          input.webkitdirectory = true;
          input.onchange = (e) => {
            for (const file of e.target.files) {
              state.localFileMap.set(file.name.toLowerCase(), file);
            }
            localStatus.textContent = `Loaded ${state.localFileMap.size} files`;
            localStatus.style.color = '#50e37b';
            sourceModal.classList.remove('open');
          };
          input.click();
        }
      } catch (err) {
        console.warn("Folder picker error or cancelled", err);
      }
    });

    btnSaveCloud.addEventListener('click', () => {
      const url = cloudUrlInput.value.trim().replace(/\/+$/, '');
      if (url) {
        state.cloudBaseUrl = url;
        state.sourceType = 'cloud';
        localStorage.setItem('carvaan_cloud_url', url);
        localStorage.setItem('carvaan_source_type', 'cloud');
        sourceModal.classList.remove('open');
      }
    });
  }

  // FILTERING LOGIC
  function applyFilters() {
    let list = [...state.catalog];

    // Filter by Mode
    if (state.currentMode === 'geetmala') {
      list = list.filter(s => s.category === 'Geetmala' && !s.isInterview);
    } else if (state.currentMode === 'interviews') {
      list = list.filter(s => s.isInterview);
    } else if (state.currentMode === 'artists') {
      list = list.filter(s => s.category === 'Artists');
    } else if (state.currentMode === 'favorites') {
      list = list.filter(s => state.favorites.includes(s.id));
    }

    // Filter by Artist Chip
    if (state.currentArtist !== 'ALL') {
      list = list.filter(s => s.artist.toLowerCase().includes(state.currentArtist.toLowerCase()));
    }

    // Filter by Search Query
    if (state.searchQuery) {
      list = list.filter(s => 
        s.title.toLowerCase().includes(state.searchQuery) ||
        s.artist.toLowerCase().includes(state.searchQuery) ||
        (s.filename && s.filename.toLowerCase().includes(state.searchQuery))
      );
    }

    state.filteredList = list;
    playlistCountEl.textContent = `Showing ${list.length.toLocaleString()} Songs`;
    renderSongList();
  }

  // RENDER SONG LIST (Virtual sliced for 5000+ speed)
  function renderSongList() {
    songListEl.innerHTML = '';
    
    if (state.filteredList.length === 0) {
      songListEl.innerHTML = `<div style="text-align:center; padding:30px; color:#888;">No songs found matching criteria</div>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    // Render top 150 matching tracks at once for performance
    const renderLimit = Math.min(state.filteredList.length, 150);

    for (let i = 0; i < renderLimit; i++) {
      const song = state.filteredList[i];
      const isCurrent = state.currentSong && state.currentSong.id === song.id;
      const isFav = state.favorites.includes(song.id);

      const item = document.createElement('div');
      item.className = `song-item ${isCurrent ? 'active' : ''}`;
      item.innerHTML = `
        <div class="song-info">
          <div class="song-title">${song.title}</div>
          <div class="song-sub"><i class="fa-solid fa-microphone"></i> ${song.artist} • ${song.category}</div>
        </div>
        <div class="song-actions">
          <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${song.id}">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn')) return;
        playSong(song);
      });

      const favBtn = item.querySelector('.fav-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(song.id, favBtn);
      });

      fragment.appendChild(item);
    }

    songListEl.appendChild(fragment);
  }

  // PLAY AUDIO
  async function playSong(song) {
    state.currentSong = song;
    state.currentSongIndex = state.filteredList.findIndex(s => s.id === song.id);

    // Update Display
    currentTitleEl.textContent = song.title;
    currentArtistEl.textContent = `${song.artist} • ${song.category}`;
    trackNumEl.textContent = `CH ${String(song.id).padStart(4, '0')}`;

    // Highlight in list
    document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
    renderSongList();

    // Resolve Audio Source
    let audioUrl = null;

    if (state.sourceType === 'cloud' && state.cloudBaseUrl) {
      audioUrl = `${state.cloudBaseUrl}/audio/${encodeURIComponent(song.relPath)}`;
    } else if (state.localFileMap.has(song.filename.toLowerCase())) {
      const file = state.localFileMap.get(song.filename.toLowerCase());
      audioUrl = URL.createObjectURL(file);
    } else {
      // Default to direct local server relative path
      audioUrl = `audio/${encodeURIComponent(song.relPath)}`;
    }

    audio.src = audioUrl;
    try {
      await audio.play();
    } catch (e) {
      console.log("Auto-play prevented or source waiting user action:", e);
    }

    // Load Synced Lyrics
    fetchAndDisplayLyrics(song);
  }

  function togglePlayPause() {
    if (!state.currentSong && state.filteredList.length > 0) {
      playSong(state.filteredList[0]);
      return;
    }
    if (audio.paused) {
      audio.play();
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

  // TIME & SEEK & LYRICS SYNC
  function onTimeUpdate() {
    if (!audio.duration) return;
    
    const cur = audio.currentTime;
    const dur = audio.duration;
    
    seekBar.value = (cur / dur) * 100;
    currentTimeEl.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;

    // Sync Lyrics
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
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // LYRICS ENGINE
  async function fetchAndDisplayLyrics(song) {
    state.lyrics = [];
    state.currentLyricIndex = -1;
    lyricsContainer.innerHTML = `<div class="lyrics-placeholder"><i class="fa-solid fa-spinner fa-spin"></i><p>Synchronizing lyrics for "${song.title}"...</p></div>`;

    try {
      // 1. Try public LRCLIB synced lyrics API
      const cleanTitle = song.title.replace(/[_\d\-]/g, ' ').trim();
      const cleanArtist = song.artist.replace(/Ameen Sayani|Various Artists/g, '').trim();
      
      const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
      const res = await fetch(`https://lrclib.net/api/search?q=${query}`);
      const data = await res.json();

      if (data && data.length > 0 && data[0].syncedLyrics) {
        parseLrcLyrics(data[0].syncedLyrics);
        renderLyrics();
        return;
      }
    } catch (e) {
      console.log("Online lyrics fetch fallback:", e);
    }

    // Fallback: Display title & artist sing-along cards
    lyricsContainer.innerHTML = `
      <div class="lyrics-line active">🎵 ${song.title}</div>
      <div class="lyrics-line">🎙️ Artist: ${song.artist}</div>
      <div class="lyrics-line">📻 Collection: Saregama Carvaan</div>
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
      lineEl.className = 'lyrics-line';
      lineEl.id = `lyric-${index}`;
      lineEl.textContent = l.text;
      
      // Tap to jump audio to that exact moment
      lineEl.addEventListener('click', () => {
        audio.currentTime = l.time;
      });

      fragment.appendChild(lineEl);
    });

    lyricsContainer.appendChild(fragment);
  }

  function highlightActiveLyric(index) {
    document.querySelectorAll('.lyrics-line').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`lyric-${index}`);
    if (activeEl) {
      activeEl.classList.add('active');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // FAVORITES
  function toggleFavorite(id, btn) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
      btn.classList.remove('active');
      btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    } else {
      state.favorites.push(id);
      btn.classList.add('active');
      btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }
    localStorage.setItem('carvaan_favs', JSON.stringify(state.favorites));
  }

  function updateLcdMode() {
    const modeNames = {
      'all': 'ALL 5000 SONGS',
      'artists': 'ARTIST SPECIAL',
      'geetmala': 'BINAACA GEETMALA',
      'interviews': 'AMEEN SAYANI INTERVIEWS',
      'favorites': 'MY FAVORITES'
    };
    modeBadgeEl.innerHTML = `<i class="fa-solid fa-radio"></i> ${modeNames[state.currentMode] || 'CARVAAN'}`;
  }

  // MEDIA SESSION API (Android Lock Screen Controls)
  function setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }

  // START
  init();
})();
