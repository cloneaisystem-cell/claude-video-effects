# claude-video-effects

**One clip, 12 looks, one command each.** A Claude Code skill: type `/effects glass-widgets my-clip.mp4` and Claude cuts you out of the background, builds the scene in Remotion and renders a 9:16 video. Everything runs on your computer.

Made by [@clone.creatives](https://www.instagram.com/clone.creatives/).

## The 12 effects
| Command | What you get |
|---|---|
| `/effects glass-widgets` | frosted stat widgets float around you |
| `/effects text-behind` | a giant word sits behind you (`word="YOURNAME"`) |
| `/effects halftone` | orange print-dot halftone look |
| `/effects orbit` | polaroids of your clip orbit around you |
| `/effects sticker` | you become a white die-cut sticker (`label="your text"`) |
| `/effects flip` | the frame turns into a 3D card and flips to a B&W poster |
| `/effects mirror` | 2x2 kaleidoscope grid |
| `/effects teleport` | a flash, then you're floating above Mars |
| `/effects film` | a vertical film strip with date stamp and grain |
| `/effects pop-art` | four Warhol-style colour prints of you |
| `/effects glitch` | RGB split with torn slices |
| `/effects checklist` | a live checklist edits your clip step by step |
| `/effects all` | all 12, one file each |

## Install
You need [Claude Code](https://claude.com/claude-code), **Node 18+**, **Python 3.11+** and **ffmpeg**.

**macOS / Linux:**
```bash
git clone https://github.com/cloneaisystem-cell/claude-video-effects ~/.claude/skills/effects
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/cloneaisystem-cell/claude-video-effects "$env:USERPROFILE\.claude\skills\effects"
```

Then open Claude Code in any folder and type:
```
/effects glass-widgets ./my-clip.mp4
```
On the first run Claude installs what's missing (`npm install`, `pip install "rembg[cpu]" pillow numpy scipy`). The background-removal model (~170 MB) downloads once.

## Best results
- A **vertical** clip (it's cropped to fill 9:16), one person in the middle, **5–10 seconds**.
- For the effects that cut you out (text-behind, orbit, sticker, flip, teleport, pop-art, checklist), use a **plain background** and keep some space between you and lamps or stands. The cutout runs on your CPU at roughly 1–4 s per frame.
- The output has no sound: add your music in Instagram or TikTok.

## Without Claude (manual)
```bash
cd ~/.claude/skills/effects/template
npm install
python scripts/prepare.py /path/to/my-clip.mp4      # add --no-matte for glass-widgets, halftone, mirror, film, glitch
mkdir -p out && echo '{"id":"sticker","word":"CLAUDE","label":"made by Claude"}' > out/props.json
npx remotion render src/index.ts Effect out/sticker.mp4 --props=out/props.json
```
Preview and tweak live with `npm run studio`.

## Licences
- This code: MIT (see `LICENSE`).
- [Remotion](https://www.remotion.dev/license) is free for individuals and companies of up to 3 people. Bigger teams need a Remotion company licence.
- Cutout: [rembg](https://github.com/danielgatis/rembg) (MIT) with the isnet-general-use model.
- Fonts: Inter and Inter Tight (Google Fonts, OFL).
- Not affiliated with Anthropic. "Claude" is a trademark of Anthropic.
