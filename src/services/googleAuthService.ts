export interface GoogleUserProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified?: boolean;
  provider: 'google';
  lastLoginAt: number;
}

const STORAGE_KEY = 'sunehre_geet_google_session';
const FIRST_TIME_KEY = 'sunehre_geet_has_seen_welcome';

export function formatNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) return 'Google User';
  let userPart = email.split('@')[0].toLowerCase();
  userPart = userPart.replace(/[0-9]/g, '');
  userPart = userPart.replace(/[._\-+]/g, ' ');

  const words = userPart.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Google User';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const GoogleAuthService = {
  getStoredSession(): GoogleUserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveSession(profile: GoogleUserProfile | null) {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(FIRST_TIME_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  isFirstTimeLaunch(): boolean {
    return !localStorage.getItem(FIRST_TIME_KEY);
  },

  markWelcomeSeen() {
    localStorage.setItem(FIRST_TIME_KEY, 'true');
  },

  createProfile(email: string, explicitName?: string, photoUrl?: string, subId?: string): GoogleUserProfile {
    const cleanEmail = email.toLowerCase().trim();
    const name = explicitName || formatNameFromEmail(cleanEmail);
    const photo = photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eab308&color=120a24&bold=true`;
    const sub = subId || `g_${Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(36)}`;

    const profile: GoogleUserProfile = {
      sub,
      email: cleanEmail,
      name,
      picture: photo,
      emailVerified: true,
      provider: 'google',
      lastLoginAt: Date.now(),
    };

    this.saveSession(profile);
    return profile;
  },

  logout() {
    this.saveSession(null);
  },
};