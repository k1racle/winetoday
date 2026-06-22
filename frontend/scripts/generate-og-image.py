#!/usr/bin/env python3
"""Generate a landscape Open Graph image (1200x630) for winemaking-today.ru."""

from PIL import Image, ImageDraw, ImageFont
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(BASE_DIR, "public", "og-image.jpg")
FONT_DIR = os.path.join(os.path.dirname(BASE_DIR), "fonts")

WIDTH = 1200
HEIGHT = 630
BG = "#f6f8f3"
FG = "#0d1710"
ACCENT = "#0c3f24"
SUBTITLE = "#3a4a3e"

TITLE = "Виноделие сегодня"
SUBTITLE_TEXT = "Русскоязычный портал о вине, виноградарстве и виноделии"
DOMAIN = "winemaking-today.ru"


def load_font(name: str, size: int):
    path = os.path.join(FONT_DIR, name)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Decorative accent shapes
    draw.rounded_rectangle([(-40, HEIGHT - 160), (340, HEIGHT + 40)], radius=80, fill=ACCENT)
    draw.ellipse([WIDTH - 280, -120, WIDTH + 80, 240], fill="#e8ede6")

    title_font = load_font("Lato-Black.ttf", 96)
    subtitle_font = load_font("Lato-Regular.ttf", 38)
    domain_font = load_font("Lato-Bold.ttf", 26)

    margin_x = 80
    max_text_width = WIDTH - margin_x * 2

    title_lines = wrap_text(draw, TITLE, title_font, max_text_width)
    subtitle_lines = wrap_text(draw, SUBTITLE_TEXT, subtitle_font, max_text_width)

    y = 170
    line_height_title = int(title_font.size * 1.05)
    for line in title_lines:
        draw.text((margin_x, y), line, font=title_font, fill=FG)
        y += line_height_title

    y += 24
    line_height_sub = int(subtitle_font.size * 1.25)
    for line in subtitle_lines:
        draw.text((margin_x, y), line, font=subtitle_font, fill=SUBTITLE)
        y += line_height_sub

    # Domain at bottom-right
    bbox = draw.textbbox((0, 0), DOMAIN, font=domain_font)
    domain_w = bbox[2] - bbox[0]
    draw.text((WIDTH - margin_x - domain_w, HEIGHT - 70), DOMAIN, font=domain_font, fill=ACCENT)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    img.save(OUT_PATH, "JPEG", quality=92, optimize=True)
    print(f"Saved {OUT_PATH} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
