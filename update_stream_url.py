with open(r'app.js', 'r', encoding='utf-8') as f:
    code = f.read()

target = "cloudBaseUrl: localStorage.getItem('carvaan_cloud_url') || '',"
replacement = "cloudBaseUrl: localStorage.getItem('carvaan_cloud_url') || 'https://archive.org/download/saregama-carvaan-5000-songs-collection',"

code = code.replace(target, replacement)

with open(r'app.js', 'w', encoding='utf-8') as f:
    f.write(code)

with open(r'www/app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated app.js with Archive.org streaming URL successfully!')
