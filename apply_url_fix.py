import re

for filepath in ['app.js', 'www/app.js', 'android/app/src/main/assets/public/app.js']:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix 1: cloudBaseUrl default
        content = re.sub(
            r"cloudBaseUrl:\s*localStorage\.getItem\('carvaan_cloud_url'\)\s*\|\|\s*'[^']*'",
            "cloudBaseUrl: localStorage.getItem('carvaan_cloud_url') || 'https://archive.org/download/saregama-carvaan-5000-songs-collection'",
            content
        )

        # Fix 2: remove /audio/ and encode each path component safely
        old_pattern = r"audioSrc\s*=\s*`\$\{state\.cloudBaseUrl\}\/audio\/\$\{encodeURIComponent\(song\.relPath\)\}`;"
        new_replacement = """const parts = (song.relPath || '').split('/').map(p => encodeURIComponent(p));
      audioSrc = `${state.cloudBaseUrl.replace(/\\/+$/, '')}/${parts.join('/')}`;"""

        content = re.sub(old_pattern, new_replacement, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Updated {filepath} successfully!")
    except Exception as e:
        print(f"Error on {filepath}: {e}")
