#!/usr/bin/env python3
"""Generate responsive branding assets without changing the original images.

Run from repository root:
  python3 -m pip install --user Pillow
  python3 scripts/optimize-public-images.py

Outputs are intentionally derived, not committed. Deploy after generation.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from io import BytesIO

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow required: python3 -m pip install Pillow") from exc

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "assets" / "img"
LOGO_SRC = IMAGE_DIR / "bitmint-lab-full.webp"
LOGO_OUT = IMAGE_DIR / "bitmint-lab-full-540.webp"
NOTIQ_OUT = IMAGE_DIR / "notiq-icon-64.webp"
NOTIQ_URL = "https://notiq.bitmintlab.in/android-chrome-512x512.png"

if not LOGO_SRC.is_file():
    raise SystemExit(f"Logo source missing: {LOGO_SRC}")

with Image.open(LOGO_SRC) as original:
    original.load()
    logo = original.convert("RGBA")
    if logo.width > 540:
        logo.thumbnail((540, 540), Image.Resampling.LANCZOS)
    logo.save(LOGO_OUT, "WEBP", quality=76, method=6)

print(f"Brand logo: {LOGO_SRC.stat().st_size:,} -> {LOGO_OUT.stat().st_size:,} bytes")

try:
    request = Request(NOTIQ_URL, headers={"User-Agent": "BitmintLab-ImageOptimizer/1.0"})
    with urlopen(request, timeout=12) as response:
        data = response.read(2 * 1024 * 1024 + 1)
    if len(data) > 2 * 1024 * 1024:
        raise ValueError("Unexpectedly large NOTIQ icon")
    with Image.open(BytesIO(data)) as original:
        original.load()
        icon = original.convert("RGBA")
        icon.thumbnail((64, 64), Image.Resampling.LANCZOS)
        icon.save(NOTIQ_OUT, "WEBP", quality=80, method=6)
    print(f"NOTIQ icon: {len(data):,} -> {NOTIQ_OUT.stat().st_size:,} bytes")
except Exception as exc:
    print(f"NOTIQ icon optimization skipped ({type(exc).__name__}: {exc}). Original URL remains as fallback.")

print("Image generation finished. Verify resulting images before publishing.")
