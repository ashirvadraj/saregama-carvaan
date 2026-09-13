import os

files = ['postcss.config.js', 'tailwind.config.js', 'vite.config.ts', 'tsconfig.json', 'package.json']
for f in files:
    if os.path.exists(f):
        with open(f, 'rb') as fp:
            data = fp.read()
        if data.startswith(b'\xef\xbb\xbf'):
            data = data[3:]
            with open(f, 'wb') as fp:
                fp.write(data)
            print(f"Removed BOM from {f}")

print("Cleaned all config BOMs!")
