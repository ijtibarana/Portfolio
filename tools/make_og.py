#!/usr/bin/env python3
"""
Build the 1200x630 Open Graph image from the real portrait.
Re-run this after replacing assets/img/ijtiba-rana.jpg:

    python3 tools/make_og.py
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTRAIT = os.path.join(ROOT, "assets/img/ijtiba-rana.jpg")
OUT = os.path.join(ROOT, "assets/img/og-image.png")
W, H = 1200, 630

FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
def font(sz, bold=True):
    p = FONTS[0] if bold else FONTS[-1]
    try:
        return ImageFont.truetype(p, sz)
    except Exception:
        return ImageFont.load_default()

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

img = Image.new("RGB", (W, H), (5, 6, 13))
d = ImageDraw.Draw(img, "RGBA")

# base diagonal gradient
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=lerp((7, 9, 20), (12, 10, 28), t))

# glow blobs
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for cx, cy, rad, col in [
    (120, 40, 460, (34, 211, 238, 90)),
    (1080, 120, 520, (139, 92, 246, 100)),
    (640, 660, 420, (244, 114, 182, 55)),
]:
    gd.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=col)
glow = glow.filter(ImageFilter.GaussianBlur(150))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
d = ImageDraw.Draw(img, "RGBA")

# subtle grid
for x in range(0, W, 60):
    d.line([(x, 0), (x, H)], fill=(255, 255, 255, 9))
for y in range(0, H, 60):
    d.line([(0, y), (W, y)], fill=(255, 255, 255, 9))

# ---------- portrait panel (right) ----------
PW, PH = 396, 470
px, py = W - PW - 62, (H - PH) // 2

if os.path.exists(PORTRAIT):
    ph = Image.open(PORTRAIT).convert("RGB")
    # cover-crop to panel ratio
    tr = PW / PH
    sr = ph.width / ph.height
    if sr > tr:
        nw = int(ph.height * tr)
        ph = ph.crop(((ph.width - nw) // 2, 0, (ph.width + nw) // 2, ph.height))
    else:
        nh = int(ph.width / tr)
        top = int((ph.height - nh) * 0.12)   # bias to upper body / face
        ph = ph.crop((0, top, ph.width, top + nh))
    ph = ph.resize((PW, PH), Image.LANCZOS)

    # rounded mask
    mask = Image.new("L", (PW, PH), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, PW, PH], 34, fill=255)

    # outer glow behind panel
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(halo).rounded_rectangle(
        [px - 20, py - 20, px + PW + 20, py + PH + 20], 52, fill=(139, 92, 246, 120))
    halo = halo.filter(ImageFilter.GaussianBlur(45))
    img = Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")

    img.paste(ph, (px, py), mask)
    d.rounded_rectangle([px, py, px + PW, py + PH], 34,
                        outline=(255, 255, 255, 70), width=2)
else:
    d.rounded_rectangle([px, py, px + PW, py + PH], 34,
                        fill=(255, 255, 255, 16), outline=(255, 255, 255, 60), width=2)
    f = font(28)
    d.text((px + 60, py + PH // 2 - 16), "PHOTO", font=f, fill=(255, 255, 255, 200))

# ---------- left text ----------
x = 68

# eyebrow pill
pill_f = font(19)
label = "PORTFOLIO  ·  2026"
tw = d.textbbox((0, 0), label, font=pill_f)[2]
d.rounded_rectangle([x, 112, x + tw + 44, 158], 23,
                    fill=(255, 255, 255, 18), outline=(255, 255, 255, 46))
d.ellipse([x + 18, 130, x + 28, 140], fill=(34, 211, 238, 255))
d.text((x + 36, 124), label, font=pill_f, fill=(215, 222, 245, 255))

# name — big
name_f = font(78)
d.text((x, 192), "IJTIBA RANA", font=name_f, fill=(255, 255, 255, 255))

# gradient underline
uy = 292
for i in range(300):
    t = i / 300
    d.line([(x + i, uy), (x + i, uy + 6)], fill=lerp((34, 211, 238), (139, 92, 246), t))

# role line
role_f = font(29)
d.text((x, 330), "Web Developer  •  SEO Expert", font=role_f, fill=(198, 208, 235, 255))
d.text((x, 372), "AI Agent Builder", font=role_f, fill=(198, 208, 235, 255))

# supporting line
sub_f = font(21, bold=False)
d.text((x, 438), "Websites, applications, SEO systems and", font=sub_f, fill=(150, 160, 190, 255))
d.text((x, 468), "AI-powered business automation.", font=sub_f, fill=(150, 160, 190, 255))

# chips
chip_f = font(17)
cx = x
for c in ["AI Agents", "Automation", "WooCommerce", "Next.js"]:
    cw = d.textbbox((0, 0), c, font=chip_f)[2] + 32
    d.rounded_rectangle([cx, 528, cx + cw, 570], 21,
                        fill=(255, 255, 255, 14), outline=(255, 255, 255, 38))
    d.text((cx + 16, 539), c, font=chip_f, fill=(196, 205, 232, 255))
    cx += cw + 11

# corner mark
m = font(22)
d.rounded_rectangle([W - 96, 40, W - 40, 96], 16, fill=(139, 92, 246, 230))
d.text((W - 84, 56), "IR", font=m, fill=(4, 7, 15, 255))

img.save(OUT, "PNG", optimize=True)
print("wrote", OUT, img.size, f"{os.path.getsize(OUT)/1024:.0f}KB")
