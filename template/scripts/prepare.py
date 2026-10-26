"""Prepare your clip for the effects: frames (public/clip) + the cut-out of the person (public/matte) + src/clip.generated.ts.

Usage:
  python scripts/prepare.py path/to/video.mp4                # frames + cutout (needed for text-behind, orbit, sticker, flip, teleport, pop-art, checklist)
  python scripts/prepare.py path/to/video.mp4 --no-matte     # frames only (glass-widgets, halftone, mirror, film, glitch)
Options: --seconds 8 (how much of the clip to use), --fps 24
Needs: ffmpeg on PATH, and `pip install "rembg[cpu]" pillow numpy scipy`. The first run downloads the rembg model (~170 MB).
The cutout runs on your CPU: roughly 1-4 s per frame, so short clips (5-10 s) are best.
"""
import argparse
import glob
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1080, 1920

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("--seconds", type=float, default=8.0)
ap.add_argument("--fps", type=float, default=24.0)
ap.add_argument("--no-matte", action="store_true")
a = ap.parse_args()

clip_dir, matte_dir = os.path.join(ROOT, "public", "clip"), os.path.join(ROOT, "public", "matte")
for d in (clip_dir, matte_dir):
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, "f*.*")):
        os.remove(f)

# 1. frames, cropped to fill 9:16
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-t", str(a.seconds),
                "-vf", f"fps={a.fps},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
                "-q:v", "2", "-start_number", "0", os.path.join(clip_dir, "f%03d.jpg")], check=True)
frames = sorted(glob.glob(os.path.join(clip_dir, "f*.jpg")))
if not frames:
    sys.exit("No frames were extracted. Is the video path right?")
print(f"{len(frames)} frames at {a.fps:g} fps")

# 2. cutout of the person (rembg isnet-general-use): solid body, largest shape only, soft edge
if not a.no_matte:
    from rembg import new_session, remove
    from scipy import ndimage
    session = new_session("isnet-general-use")
    for i, p in enumerate(frames):
        img = Image.open(p).convert("RGB")
        m = np.asarray(remove(img, session=session, only_mask=True), dtype=np.float32) / 255.0
        m = np.clip((m - 0.2) / 0.35, 0, 1)
        lab, n = ndimage.label(m > 0.5)
        if n > 1:
            sizes = ndimage.sum(np.ones_like(m), lab, index=range(1, n + 1))
            m = m * (lab == 1 + int(np.argmax(sizes)))
        mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.5))
        rgba = img.convert("RGBA")
        rgba.putalpha(mask)
        rgba.save(os.path.join(matte_dir, f"f{i:03d}.png"), compress_level=3)
        if i % 24 == 0:
            print(f"cutout {i + 1}/{len(frames)}", flush=True)

with open(os.path.join(ROOT, "public", ".source"), "w", encoding="utf-8") as f:
    f.write(f"{os.path.abspath(a.video)}\nmatte: {'no' if a.no_matte else 'yes'}\nseconds: {a.seconds:g}\n")

# 3. tell the template how long the clip is
with open(os.path.join(ROOT, "src", "clip.generated.ts"), "w", encoding="utf-8") as f:
    f.write("// Written by scripts/prepare.py for the clip in public/clip (do not edit by hand).\n")
    f.write(f"export const SRC_FPS = {a.fps:g};\nexport const SRC_FRAMES = {len(frames)};\n")
print("ready. Render with:  npx remotion render src/index.ts Effect out/glass-widgets.mp4 --props=\"{\\\"id\\\":\\\"glass-widgets\\\"}\"")
