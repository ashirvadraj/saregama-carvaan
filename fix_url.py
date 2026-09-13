// Fix URL resolution in app.js
with open(r'app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace audio URL resolver logic
old_logic = """    // 2. Check Cloud URL if configured
    else if (state.cloudBaseUrl) {
      audioSrc = `${state.cloudBaseUrl}/audio/${encodeURIComponent(song.relPath)}`;
    } """

new_logic = """    // 2. Check Cloud URL if configured
    else if (state.cloudBaseUrl) {
      const parts = (song.relPath || '').split('/').map(p => encodeURIComponent(p));
      audioSrc = `${state.cloudBaseUrl.replace(/\\/+$/, '')}/${parts.join('/')}`;
    } """

if old_logic in code:
    code = code.replace(old_logic, new_logic)
else:
    # Alternative direct replacement
    code = code.replace(
        "audioSrc = `${state.cloudBaseUrl}/audio/${encodeURIComponent(song.relPath)}`;",
        "const parts = (song.relPath || '').split('/').map(p => encodeURIComponent(p));\n      audioSrc = `${state.cloudBaseUrl.replace(/\\/+$/, '')}/${parts.join('/')}`;"
    )

with open(r'app.js', 'w', encoding='utf-8') as f:
    f.write(code)

with open(r'www/app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated app.js with correct Archive.org streaming URL path!")
