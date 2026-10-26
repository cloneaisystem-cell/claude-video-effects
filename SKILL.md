---
name: effects
description: Apply one of 12 video effects to a clip with one command, e.g. "/effects glass-widgets clip.mp4". Effects - glass-widgets, text-behind, halftone, orbit, sticker, flip, mirror, teleport, film, pop-art, glitch, checklist (or "all"). Renders a 9:16 1080x1920 MP4 locally with Remotion; cuts the person out of the background with rembg. Use when the user types /effects or asks to put one of these looks on a video.
---

# /effects: 12 one-command video effects

Usage: `/effects <effect> <path-to-video> [word="..."] [label="..."]`, or `/effects all <path-to-video>`.

The Remotion project lives in `template/` next to this file. Every path below is relative to `template/`.

## 1. First run only: set up (skip the parts that are already done)
- `node --version` must be 18 or newer. If `template/node_modules` is missing, run `npm install` in `template/`.
- Check `ffmpeg -version`. If it is missing, tell the user how to install it (macOS `brew install ffmpeg`, Windows `winget install ffmpeg`) and stop.
- Check `python -c "import rembg, PIL, numpy, scipy"`. If it fails, run `pip install "rembg[cpu]" pillow numpy scipy`.
- The first cutout downloads the rembg model (~170 MB) automatically. Say so once.

## 2. Understand the request
- **Effect:** match the user's word to one of the 12 names below (ignore case, allow small typos). If none matches, list the 12 and ask.
- **Video:** if no path was given, ask for one. Clips that work best are vertical, with one person in the middle, 5–10 seconds long.
- **Options:** `word` is the giant text for text-behind (default `CLAUDE`, keep it short, 3–8 letters). `label` is the sticker text and the name used in glass-widgets/checklist (default `made by Claude`).

| Effect | Needs the cutout | What it does |
|---|---|---|
| glass-widgets | no | frosted stat widgets float around the person |
| text-behind | yes | a giant word sits behind the person |
| halftone | no | orange print-dot halftone look |
| orbit | yes | polaroids of the clip orbit around the person |
| sticker | yes | the person becomes a white die-cut sticker |
| flip | yes | the frame becomes a 3D card and flips to a B&W poster |
| mirror | no | 2x2 kaleidoscope grid |
| teleport | yes | a flash, then the person floats above Mars |
| film | no | a vertical film strip running through the gate |
| pop-art | yes | four Warhol-style colour prints |
| glitch | no | RGB split with torn slices |
| checklist | yes | a live checklist edits the clip step by step |

## 3. Prepare the clip
Run from `template/`:
- needs the cutout: `python scripts/prepare.py "<video>"`
- doesn't need it: `python scripts/prepare.py "<video>" --no-matte` (much faster)

Skip this step if `public/.source` already names the same video (and `matte: yes` when the effect needs the cutout). For a longer clip, add `--seconds 15`. The cutout takes about 1–4 s per frame on a CPU, so tell the user roughly how long it will take.

## 4. Render
Write `out/props.json`, for example `{"id": "glass-widgets", "word": "CLAUDE", "label": "made by Claude"}`, then run:

`npx remotion render src/index.ts Effect out/<effect>.mp4 --props=out/props.json`

For `all`: prepare once with the cutout, then render the 12 one after another into `out/`.

## 5. Report
Give the output path(s) and say that it's 9:16 1080x1920 at 30 fps with no sound. The user adds music in Instagram/TikTok. If a cutout effect shows bits of the background, suggest a clip with a plainer background or the person further from objects.
