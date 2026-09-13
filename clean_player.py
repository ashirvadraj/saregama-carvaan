with open(r'src/components/Player.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

filtered_lines = []
skip_block = False

for line in lines:
    if 'videoService' in line:
        continue
    if 'isVideoMode' in line or 'videoData' in line or 'fetchVideoForSong' in line:
        continue
    filtered_lines.append(line)

with open(r'src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.writelines(filtered_lines)

print("Player.tsx cleaned successfully!")
