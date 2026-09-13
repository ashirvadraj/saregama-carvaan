export interface VersionConfig {
  min_supported_version: number;
  latest_version: number;
  force_update: boolean;
  update_url: string;
  message_hindi: string;
  message_english: string;
}

export const CURRENT_APP_VERSION = 69.0;

const CLOUD_GIST_ID = 'a62d2ce04fb2cad264471951a42790da';
const RAW_GIST_URL = `https://gist.githubusercontent.com/ashirvadraj/${CLOUD_GIST_ID}/raw/app_version_config.json`;
const REPO_FALLBACK_URL = 'https://raw.githubusercontent.com/ashirvadraj/sunehre-geet/main/version_config.json';
const API_GIST_URL = `https://api.github.com/gists/${CLOUD_GIST_ID}`;

export const VersionService = {
  isLocked: localStorage.getItem('sunehre_app_locked') === 'true',
  cachedConfig: (() => {
    try {
      const raw = localStorage.getItem('sunehre_cached_version_config');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })() as VersionConfig | null,

  parseConfig(content: any): VersionConfig | null {
    if (!content) return null;
    try {
      const json = typeof content === 'string' ? JSON.parse(content) : content;
      if (json && typeof json.min_supported_version === 'number') {
        return json as VersionConfig;
      }
      if (json?.files?.['app_version_config.json']?.content) {
        return JSON.parse(json.files['app_version_config.json'].content);
      }
    } catch {}
    return null;
  },

  applyHardLock(config?: VersionConfig): void {
    this.isLocked = true;
    try {
      localStorage.setItem('sunehre_app_locked', 'true');
      if (config) {
        localStorage.setItem('sunehre_cached_version_config', JSON.stringify(config));
      }
      window.dispatchEvent(new CustomEvent('sunehreVersionLocked', { detail: { config } }));
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.MediaNotificationPlugin?.hideNotification) {
        cap.Plugins.MediaNotificationPlugin.hideNotification();
      }
    } catch {}
  },

  async checkVersion(): Promise<{ isUpdateRequired: boolean; config: VersionConfig | null }> {
    if (this.isLocked) {
      this.applyHardLock(this.cachedConfig || undefined);
    }

    const timestamp = Date.now();
    const urls = [
      `${RAW_GIST_URL}?_t=${timestamp}`,
      `${REPO_FALLBACK_URL}?_t=${timestamp}`,
      `${API_GIST_URL}?_t=${timestamp}`,
    ];

    // Method 1: Native Java HTTP via MediaNotificationPlugin (100% bypasses CORS, preflight, and webview cache)
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
                  localStorage.removeItem('sunehre_app_locked');
                  this.isLocked = false;
                }
                return { isUpdateRequired, config };
              }
            }
          } catch {}
        }
      }
    } catch {}

    // Method 2: Clean fetch WITHOUT custom headers (so NO OPTIONS preflight is sent, passing CORS *)
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
              localStorage.removeItem('sunehre_app_locked');
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
