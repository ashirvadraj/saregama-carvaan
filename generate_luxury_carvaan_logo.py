import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 1. Luxury Royal Midnight Emerald & Teal Gradient Background
for y in range(size):
    factor = y / size
    # Rich deep emerald gradient from (10, 42, 38) to (3, 20, 18)
    r = int(12 * (1 - factor) + 4 * factor)
    g = int(48 * (1 - factor) + 20 * factor)
    b = int(44 * (1 - factor) + 18 * factor)
    draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

# Create rounded mask with smooth 110px radius
mask = Image.new("L", (size, size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=110, fill=255)
img.putalpha(mask)

# 2. Dual Concentric 24K Champagne Gold Borders with metallic sheen
border_draw = ImageDraw.Draw(img)
# Outer gold trim
border_draw.rounded_rectangle([(8, 8), (size - 9, size - 9)], radius=102, outline=(212, 175, 55, 255), width=5)
# Inner gold accent line
border_draw.rounded_rectangle([(16, 16), (size - 17, size - 17)], radius=94, outline=(243, 229, 171, 140), width=2)

# Corner metallic rivets / accents
corners = [(32, 32), (size - 32, 32), (32, size - 32), (size - 32, size - 32)]
for cx, cy in corners:
    border_draw.ellipse([(cx - 5, cy - 5), (cx + 5, cy + 5)], fill=(212, 175, 55, 240), outline=(255, 245, 200, 255), width=1)

# 3. Vintage Carvaan Radio Speaker Grille & Tuning Dial in Upper/Center
center_x = size // 2
center_y = size // 2 - 25

# Vintage Radio Dial Arch
dial_r = 170
border_draw.arc([(center_x - dial_r, center_y - dial_r), (center_x + dial_r, center_y + dial_r)], start=200, end=340, fill=(212, 175, 55, 220), width=4)

# Radio Frequency Tick Marks along Arch
for angle_deg in range(205, 340, 9):
    rad = math.radians(angle_deg)
    x1 = center_x + math.cos(rad) * (dial_r - 2)
    y1 = center_y + math.sin(rad) * (dial_r - 2)
    x2 = center_x + math.cos(rad) * (dial_r - 18 if angle_deg % 18 == 0 else dial_r - 10)
    y2 = center_y + math.sin(rad) * (dial_r - 18 if angle_deg % 18 == 0 else dial_r - 10)
    border_draw.line([(x1, y1), (x2, y2)], fill=(243, 229, 171, 230), width=2)

# 4. Polished 24K Gold Vinyl Disc with Grooves
vr = 135
# Vinyl grooves
for r in range(vr, 25, -1):
    alpha = 255
    if r % 5 == 0:
        c_val = (28, 22, 12, alpha)
    elif r % 5 == 2:
        c_val = (48, 38, 18, alpha)
    else:
        c_val = (16, 12, 8, alpha)
    border_draw.ellipse([(center_x - r, center_y - r), (center_x + r, center_y + r)], outline=c_val, width=1)

# Outer Gold Rim of Vinyl
border_draw.ellipse([(center_x - vr, center_y - vr), (center_x + vr, center_y + vr)], outline=(212, 175, 55, 255), width=4)

# Center Emerald & Gold Label of Vinyl
label_r = 52
for r in range(label_r, 0, -1):
    f = r / label_r
    lr = int(14 * f + 8 * (1 - f))
    lg = int(64 * f + 32 * (1 - f))
    lb = int(54 * f + 28 * (1 - f))
    border_draw.ellipse([(center_x - r, center_y - r), (center_x + r, center_y + r)], fill=(lr, lg, lb, 255))

border_draw.ellipse([(center_x - label_r, center_y - label_r), (center_x + label_r, center_y + label_r)], outline=(243, 229, 171, 255), width=2)

# Center Spindle Hole
border_draw.ellipse([(center_x - 10, center_y - 10), (center_x + 10, center_y + 10)], fill=(5, 18, 16, 255), outline=(212, 175, 55, 255), width=2)

# Vinyl Light Sheen (Dual Angled Highlights)
sheen = Image.new("RGBA", (size, size), (0, 0, 0, 0))
s_draw = ImageDraw.Draw(sheen)
s_draw.polygon([(center_x, center_y), (center_x - 90, center_y - 120), (center_x - 60, center_y - 130)], fill=(255, 255, 255, 40))
s_draw.polygon([(center_x, center_y), (center_x + 90, center_y + 120), (center_x + 60, center_y + 130)], fill=(255, 255, 255, 40))
img = Image.alpha_composite(img, sheen)

# 5. Vintage Curved Radio Tonearm with Stylus Needle
arm_draw = ImageDraw.Draw(img)
# Pivot Base
arm_draw.ellipse([(center_x + 105, center_y - 105), (center_x + 135, center_y - 75)], fill=(180, 140, 40, 255), outline=(243, 229, 171, 255), width=2)
# Metallic Arm Rod
arm_draw.line([(center_x + 120, center_y - 90), (center_x + 40, center_y - 25)], fill=(243, 229, 171, 255), width=4)
# Stylus Head
arm_draw.polygon([(center_x + 40, center_y - 25), (center_x + 28, center_y - 18), (center_x + 32, center_y - 10), (center_x + 44, center_y - 17)], fill=(212, 175, 55, 255))

# 6. Bottom Plaque / Banner "CARVAAN"
final_draw = ImageDraw.Draw(img)
banner_rect = [(45, size - 110), (size - 45, size - 42)]
final_draw.rounded_rectangle(banner_rect, radius=18, fill=(8, 30, 26, 240), outline=(212, 175, 55, 255), width=3)
final_draw.rounded_rectangle([(49, size - 106), (size - 49, size - 46)], radius=14, outline=(243, 229, 171, 100), width=1)

# Add Decorative Musical Wave Bar in Banner
bar_w = 6
bar_y = size - 76
for i, h in enumerate([8, 16, 26, 36, 44, 36, 26, 16, 8, 16, 26, 36, 44, 36, 26, 16, 8]):
    bx = 90 + i * 20
    final_draw.rounded_rectangle([(bx, bar_y - h // 2), (bx + bar_w, bar_y + h // 2)], radius=3, fill=(243, 229, 171, 230))

# Save logo.png & favicon.png
img.save("public/logo.png", "PNG")
img.resize((192, 192), Image.Resampling.LANCZOS).save("public/favicon.png", "PNG")
print("Saved luxury emerald & gold logo.png and favicon.png!")

# Generate all Android App Mipmap Launcher Icons
android_res = "android/app/src/main/res"
mipmap_sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

import os
for folder, px in mipmap_sizes.items():
    fpath = os.path.join(android_res, folder)
    if os.path.exists(fpath):
        resized = img.resize((px, px), Image.Resampling.LANCZOS)
        resized.save(os.path.join(fpath, "ic_launcher.png"), "PNG")
        resized.save(os.path.join(fpath, "ic_launcher_round.png"), "PNG")
        print(f"Generated {folder} ({px}x{px}) launcher icon!")
