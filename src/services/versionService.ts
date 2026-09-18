export interface VersionConfig {
  min_supported_version: number;
  latest_version: number;
  force_update: boolean;
  update_url: string;
  message_hindi: string;
  message_english: string;
}

export const CURRENT_APP_VERSION = 1.4;

const REPO_RAW_URL = 'https://raw.githubusercontent.com/ashirvadraj/saregama-carvaan/master/version_config.json';
const REPO_API_URL = 'https://api.github.com/repos/ashirvadraj/saregama-carvaan/contents/version_config.json';

// Helper to sanitize and purge any legacy Sunehre Geet / version 69 lock
function sanitizeStoredLock(): { isLocked: boolean; config: VersionConfig | null } {
  try {
    const raw = localStorage.getItem('carvaan_cached_version_config');
    if (raw && (raw.includes('sunehre-geet') || raw.includes('69') || raw.includes('69.0'))) {
      localStorage.removeItem('carvaan_app_locked');
      localStorage.removeItem('carvaan_cached_version_config');
      return { isLocked: false, config: null };
    }
    const isLocked = localStorage.getItem('carvaan_app_locked') === 'true';
    const config = raw ? JSON.parse(raw) : null;
    return { isLocked, config };
  } catch {
    return { isLocked: false, config: null };
  }
}

const initialSanitized = sanitizeStoredLock();

export const VersionService = {
  isLocked: initialSanitized.isLocked,
  cachedConfig: initialSanitized.config,

  parseConfig(content: any): VersionConfig | null {
    if (!content) return null;
    try {
      let json = typeof content === 'string' ? JSON.parse(content) : content;
      // Handle GitHub contents API base64 response
      if (json && json.content && json.encoding === 'base64') {
        const decoded = atob(json.content.replace(/\n/g, ''));
        json = JSON.parse(decoded);
      }
      if (json && typeof json.min_supported_version === 'number') {
        // Double check: if someone returns sunehre-geet or 69, reject it
        if (json.update_url && json.update_url.includes('sunehre-geet')) {
          return null;
        }
        return json as VersionConfig;
      }
    } catch {}
    return null;
  },

  applyHardLock(config?: VersionConfig): void {
    if (!config || (config.update_url && config.update_url.includes('sunehre-geet'))) {
      return;
    }
    this.isLocked = true;
    try {
      localStorage.setItem('carvaan_app_locked', 'true');
      localStorage.setItem('carvaan_cached_version_config', JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('carvaanVersionLocked', { detail: { config } }));
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.hideNotification) {
        cap.Plugins.MediaNotificationPlugin.hideNotification();
      }
    } catch {}
  },

  async checkVersion(): Promise<{ isUpdateRequired: boolean; config: VersionConfig | null }> {
    // Purge any stale legacy lock
    const current = sanitizeStoredLock();
    this.isLocked = current.isLocked;
    this.cachedConfig = current.config;

    if (this.isLocked && this.cachedConfig) {
      this.applyHardLock(this.cachedConfig);
    }

    const timestamp = Date.now();
    const urls = [
      `${REPO_RAW_URL}?_t=${timestamp}`,
      `${REPO_API_URL}?_t=${timestamp}`,
    ];

    // Method 1: Native Java HTTP via MediaNotificationPlugin (CORS bypass)
    try {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.fetchHttpUrl) {
        for (const url of urls) {
          try {
            const res = await cap.Plugins.MediaNotificationPlugin.fetchHttpUrl({ url });
            if (res && res.content && res.content.trim().length > 0) {
              const config = this.parseConfig(res.content);
              if (config && typeof config.min_supported_version === 'number') {
                const isUpdateRequired = config.force_update && CURRENT_APP_VERSION < config.min_supported_version;
                this.cachedConfig = config;
                if (isUpdateRequired) {
                  this.applyHardLock(config);
                } else {
                  localStorage.removeItem('carvaan_app_locked');
                  this.isLocked = false;
                }
                return { isUpdateRequired, config };
              }
            }
          } catch {}
        }
      }
    } catch {}

    // Method 2: Standard fetch
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const rawText = await res.text();
          const config = this.parseConfig(rawText);
          if (config && typeof config.min_supported_version === 'number') {
            const isUpdateRequired = config.force_update && CURRENT_APP_VERSION < config.min_supported_version;
            this.cachedConfig = config;
            if (isUpdateRequired) {
              this.applyHardLock(config);
            } else {
              localStorage.removeItem('carvaan_app_locked');
              this.isLocked = false;
            }
            return { isUpdateRequired, config };
          }
        }
      } catch {}
    }

    return { isUpdateRequired: this.isLocked, config: this.cachedConfig };
  },
};
