// Sunehre Geet - Smart Song Recommendation & Notification Service
import { SONGS } from '../data/songs';
import { Song } from '../types';

// Time of Day Phrases
const MORNING_PHRASES = [
  'सुहानी सुबह, गुनगुनी धूप और यह ताज़ा तराना 🌅',
  'सुबह की शुरुआत कीजिए इस सुरीले सदाबहार नगमे के संग ☕',
  'आज के दिन को बनाइए और भी हसीन... सुनिए यह मधुर गीत 🌸',
  'प्रभात की बेला में कानों में रस घोलती एक प्यारी धुन 🕊️',
  'चाय की पहली चुस्की और लता जी की मीठी आवाज़... शुभ प्रभात! ☕',
  'एक नई सुबह, एक नया अहसास... सुनिए यह अमर क्लासिक 🌻',
];

const AFTERNOON_PHRASES = [
  'दोपहर के सुकून भरे पलों में सुनिए यह अमर क्लासिक 🎶',
  'दिन की इस खूबसूरत दोपहर में एक दिलकश नगमा आपके लिए ☀️',
  'सुकून भरी दोपहर और पुरानी यादों का प्यारा सफ़र 📻',
  'काम के बीच थोड़ा सुकून... गुनगुनाइए यह सदाबहार गीत 🌼',
  'दिन के इस पहर को बनाइए और भी सुरीला... सुनिए यह ख़ास नगमा 🎧',
  'मोहम्मद रफ़ी और किशोर दा का यह सदाबहार तराना सुना क्या? 🎵',
];

const EVENING_PHRASES = [
  'शाम की चाय और यह दिलकश नगमा... क्या बात है! ☕',
  'ढलती शाम और सुरों की यह हसीन महफ़िल 🌇',
  'मौसम है सुहाना, सुनिए यह सदाबहार तराना 🎶',
  'शाम के इस हसीन वक़्त में एक सदाबहार गीत आपके नाम 🎻',
  'पुरानी यादें ताज़ा करने का वक़्त... सुनिए यह ख़ास गीत ✨',
  'दिन ढलने के साथ दिल को छू लेने वाली एक सुरीली धुन 🌆',
];

const NIGHT_PHRASES = [
  'रात की ख़ामोशी और यह सदाबहार संगीत... सुनिए अभी 🌙',
  'सोने से पहले सुनिए यह रूहानी धुन, मीठे सपनों के नाम 🌌',
  'चांदनी रात और किशोर दा-रफ़ी साहब का यह अमर गीत 🌠',
  'रात के इस शांत पहर में एक बेहद सुकून भरा नगमा 🎧',
  'ख़ामोश रात और सुरों का यह जादू... सुनिए और खो जाइए 💤',
  'सदाबहार यादों का सफ़र... एक खूबसूरत गीत आपके नाम 🎼',
];

// Weather / Season Specific Phrases
const MONSOON_RAIN_PHRASES = [
  'रिमझिम बारिश की बूंदें और यह सदाबहार तराना 🌧️',
  'बरसात का मौसम और यह रूमानी नगमा... सुनिए अभी ☔',
  'भीगी-भीगी फुहारें और चाय के साथ एक अमर क्लासिक धुन ☕🌧️',
  'बादलों की छांव और सुरों की यह मस्तानी बरसात 🌩️🎵',
];

const WINTER_PHRASES = [
  'सर्द मौसम, गुनगुनी धूप और यह दिलकश सदाबहार नगमा ❄️☕',
  'हल्की ठंड की इस महकती फिज़ा में सुनिए यह प्यारा गीत 🧣',
  'सर्दियों की इस शाम में दिल को गर्माहट देता एक सुरीला नगमा ☕🔥',
];

const GENERAL_SWEET_PHRASES = [
  'मौसम का मिज़ाज है मस्ताना... सुनिए यह सदाबहार तराना 🍃🌸',
  'दिल को छू लेने वाली एक सुरीली धुन आपके लिए 📻',
  'एक प्यारा सा गीत, जो आपके चेहरे पर मुस्कान ला दे 😊',
  'सुनहरे दौर का वो अमर गीत जो आज भी दिल धड़काता है 💖',
  'लता जी और मुकेश जी की आवाज़ का यह जादू कभी पुराना नहीं होता 🌹',
];

const STORAGE_KEY_LAST_NOTIF = 'sunehre_geet_last_recommendation_time';
const STORAGE_KEY_LAST_PHRASE = 'sunehre_geet_last_recommendation_phrase';
const MIN_INTERVAL_MS = 2 * 60 * 60 * 1000; // Minimum 2 hours between automatic notifications

export const RecommendationService = {
  /**
   * Pick a random golden masterpiece song
   */
  pickRandomMasterpiece(): Song {
    const indianSongs = SONGS.filter((s) => {
      if (s.language === 'english') return false;
      const combined = `${s.title} ${s.artist} ${s.movie}`.toLowerCase();
      return !combined.includes('bhojpuri');
    });

    const goldenLegends = [
      'kishore', 'lata', 'rafi', 'mukesh', 'asha', 'jagjit', 'hemant', 
      'sonu nigam', 'kk', 'kumar sanu', 'udit narayan', 'alka yagnik', 
      'lucky ali', 'shreya ghoshal', 'arijit singh', 'mohit chauhan'
    ];

    const corePool = indianSongs.filter((s) => {
      const txt = `${s.artist} ${s.title}`.toLowerCase();
      return goldenLegends.some((g) => txt.includes(g));
    });

    const pool = corePool.length > 0 ? corePool : indianSongs;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  },

  /**
   * Pick a context-aware phrase based on current Time of Day and Season/Weather
   */
  pickContextualPhrase(): string {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1; // 1-12

    let timePool: string[] = [];

    // 1. Time of Day Classification (Accurate local clock)
    if (hour >= 5 && hour < 12) {
      // 5:00 AM - 11:59 AM : Morning
      timePool = MORNING_PHRASES;
    } else if (hour >= 12 && hour < 17) {
      // 12:00 PM - 4:59 PM : Noon / Afternoon
      timePool = AFTERNOON_PHRASES;
    } else if (hour >= 17 && hour < 21) {
      // 5:00 PM - 8:59 PM : Evening
      timePool = EVENING_PHRASES;
    } else {
      // 9:00 PM - 4:59 AM : Night / Late Night
      timePool = NIGHT_PHRASES;
    }

    // 2. Weather & Season Mix-in
    let seasonalPool: string[] = [];
    if (month >= 6 && month <= 9) {
      // Monsoon / Rainy Months in India (June-September)
      seasonalPool = MONSOON_RAIN_PHRASES;
    } else if (month === 11 || month === 12 || month === 1 || month === 2) {
      // Winter Months (November-February)
      seasonalPool = WINTER_PHRASES;
    }

    // Combine pool: 60% time-specific, 25% seasonal/weather, 15% evergreen sweet
    const candidatePool = [...timePool, ...timePool, ...seasonalPool, ...GENERAL_SWEET_PHRASES];

    const lastPhrase = localStorage.getItem(STORAGE_KEY_LAST_PHRASE) || '';
    const filtered = candidatePool.filter((p) => p !== lastPhrase);
    const pool = filtered.length > 0 ? filtered : candidatePool;

    const selected = pool[Math.floor(Math.random() * pool.length)];
    try {
      localStorage.setItem(STORAGE_KEY_LAST_PHRASE, selected);
    } catch {}
    return selected;
  },

  /**
   * Send a rich song recommendation notification via native plugin
   */
  async sendRecommendation(customSong?: Song): Promise<boolean> {
    try {
      const song = customSong || this.pickRandomMasterpiece();
      const phrase = this.pickContextualPhrase();

      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.sendSongRecommendation) {
        await cap.Plugins.MediaNotificationPlugin.sendSongRecommendation({
          phrase,
          songTitle: song.title,
          songArtist: song.artist,
          songId: song.id,
          coverUrl: song.coverUrl,
        });

        try {
          localStorage.setItem(STORAGE_KEY_LAST_NOTIF, Date.now().toString());
        } catch {}
        return true;
      }
    } catch (e) {
      console.warn('Could not dispatch song recommendation notification:', e);
    }
    return false;
  },

  /**
   * Check and send automatic periodic recommendation if enough time has passed
   */
  checkAndSendPeriodicRecommendation(): void {
    try {
      const lastTimeStr = localStorage.getItem(STORAGE_KEY_LAST_NOTIF);
      const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
      const now = Date.now();

      if (now - lastTime >= MIN_INTERVAL_MS) {
        // Send a random recommendation after a short delay
        setTimeout(() => {
          this.sendRecommendation();
        }, 12000); // 12 seconds after launch
      }
    } catch {}
  },

  /**
   * Check and send monthly Sunehre Geet Wrapped notification between 1st and 7th of each month
   */
  async checkAndSendWrappedNotification(): Promise<boolean> {
    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth(); // 0-11
      const year = now.getFullYear();

      // Strictly only between 1st and 7th of the month
      if (day < 1 || day > 8) {
        return false;
      }

      const notifKey = `sunehre_wrapped_notif_${year}_${month}`;
      if (localStorage.getItem(notifKey)) {
        // Already notified this month
        return false;
      }

      const HINDI_MONTHS = [
        'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
        'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
      ];
      const monthHindi = HINDI_MONTHS[month] || '';

      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.sendSongRecommendation) {
        await cap.Plugins.MediaNotificationPlugin.sendSongRecommendation({
          phrase: '✨ सुनहरे गीत रैप्ड (Sunehre Geet Wrapped)',
          songTitle: `${monthHindi} का आपका संगीत सफ़र तैयार है!`,
          songArtist: 'टैप करें और देखें आपने इस महीने कौनसे गीत सुने 📻',
          songId: 'open_wrapped',
          coverUrl: '',
        });

        try {
          localStorage.setItem(notifKey, Date.now().toString());
        } catch {}
        return true;
      }
    } catch (e) {
      console.warn('Could not dispatch monthly wrapped notification:', e);
    }
    return false;
  },

  /**
   * Start periodic timer to check every 45 minutes
   */
  startScheduler(): () => void {
    this.checkAndSendPeriodicRecommendation();
    this.checkAndSendWrappedNotification();
    const interval = setInterval(() => {
      this.checkAndSendPeriodicRecommendation();
      this.checkAndSendWrappedNotification();
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }
};
