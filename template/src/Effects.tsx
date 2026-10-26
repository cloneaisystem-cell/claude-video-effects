// The 12 effects. Each one is a full 1080x1920 scene: ({ t, offset, word, label }) where t = seconds since the effect started.
// Effects marked [cutout] need public/matte (scripts/prepare.py makes it; skip it with --no-matte for the others).
import React from "react";
import { Img, staticFile } from "remotion";
import { ClipFrame, ClipCutout } from "./Clip";
import { UI, INTER, TIGHT, W, H, clamp, lerp, prog, easeInOut, backOut, hash, Star } from "./theme";

export type FXProps = { t: number; offset: number; word: string; label: string };
export type FX = React.FC<FXProps>;

/** the cutout can end mid-body: fade its lower edge when the room is gone */
const FADE = (a = 1300, z = 1500): React.CSSProperties => ({ WebkitMaskImage: `linear-gradient(to bottom, #000 ${a}px, transparent ${z}px)` } as React.CSSProperties);

/* 1 · glass-widgets ------------------------------------------------------------ */
const Glass: React.FC<{ x: number; y: number; w: number; h: number; p: number; children: React.ReactNode }> = ({ x, y, w, h, p, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 44, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(22px) saturate(1.3)",
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35), 0 20px 50px rgba(0,0,0,0.25)", padding: 30, boxSizing: "border-box", opacity: clamp(p * 3),
    transform: `scale(${lerp(0.6, 1, backOut(p))})`, transformOrigin: "50% 50%", color: "#fff", fontFamily: INTER }}>{children}</div>
);
const GlassWidgets: FX = ({ t, offset, label }) => {
  const p = (i: number) => clamp((t - 0.05 - i * 0.09) / 0.35);
  const ring = clamp((t - 0.3) / 0.9);
  return (
    <>
      <ClipFrame t={t} offset={offset} />
      <Glass x={50} y={300} w={300} h={260} p={p(0)}>
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.8, letterSpacing: "0.08em" }}>CAMERA</div>
        <div style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: 130, lineHeight: 1.05 }}>1</div>
      </Glass>
      <Glass x={730} y={300} w={300} h={260} p={p(1)}>
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.8, letterSpacing: "0.08em" }}>PROMPTS</div>
        <div style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: 130, lineHeight: 1.05 }}>1</div>
      </Glass>
      <Glass x={40} y={1130} w={430} h={200} p={p(2)}>
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.8, letterSpacing: "0.08em" }}>EDITED BY</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}><Star s={60} /><span style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: 76 }}>{label.replace(/^made by /i, "") || "Claude"}</span></div>
      </Glass>
      <Glass x={600} y={1110} w={330} h={340} p={p(3)}>
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.8, letterSpacing: "0.08em" }}>EXPORT</div>
        <div style={{ fontFamily: TIGHT, fontWeight: 800, fontSize: 70, lineHeight: 1.1 }}>1080p</div>
        <svg width={120} height={120} viewBox="0 0 100 100" style={{ position: "absolute", right: 26, bottom: 26 }}>
          <circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.25)" strokeWidth={10} fill="none" />
          <circle cx={50} cy={50} r={42} stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={`${ring * 264} 264`} transform="rotate(-90 50 50)" />
        </svg>
        <div style={{ position: "absolute", left: 30, bottom: 40, fontFamily: INTER, fontWeight: 700, fontSize: 40 }}>{Math.round(ring * 100)}%</div>
      </Glass>
    </>
  );
};

/* 2 · text-behind [cutout] -------------------------------------------------------- */
const TextBehind: FX = ({ t, offset, word }) => {
  const p = prog(t, 0.04, 0.35);
  const size = Math.min(340, Math.round(1640 / Math.max(3, word.length)));
  return (
    <>
      <ClipFrame t={t} offset={offset} style={{ filter: "brightness(0.82) saturate(0.9)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 570, textAlign: "center", fontFamily: TIGHT, fontWeight: 900, fontSize: size, letterSpacing: "-0.06em", lineHeight: 1,
        color: "#fff", opacity: p, transform: `translateY(${(1 - p) * 120}px) scale(${lerp(1.15, 1, p)})`, textShadow: "0 20px 60px rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>{word}</div>
      <ClipCutout t={t} offset={offset} />
    </>
  );
};

/* 3 · halftone ------------------------------------------------------------------- */
const Halftone: FX = ({ t, offset }) => {
  const size = 15 + 3 * Math.sin(t * 6);
  const dots = `radial-gradient(circle, #000 ${size * 0.42}px, transparent ${size * 0.42 + 1}px)`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0D0B0A" }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: dots, WebkitMaskSize: `${size}px ${size}px` } as React.CSSProperties}>
        <ClipFrame t={t} offset={offset} style={{ filter: "grayscale(1) contrast(1.6) brightness(1.15) sepia(1) saturate(4) hue-rotate(-18deg)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 45% at 50% 45%, rgba(255,120,60,0.10), transparent 70%)" }} />
    </>
  );
};

/* 4 · orbit [cutout] (photos of the clip pass behind and in front of you) ---------------- */
const Orbit: FX = ({ t, offset }) => {
  const appear = prog(t, 0, 0.3);
  const items = Array.from({ length: 6 }, (_, i) => {
    const a = t * 2.1 + (i / 6) * Math.PI * 2;
    const x = 540 + Math.cos(a) * 420 * appear, y = 860 + Math.sin(a) * 150 * appear, depth = Math.sin(a);
    return { i, x, y, depth, rot: Math.cos(a) * -14, s: 0.78 + 0.28 * (depth + 1) / 2 };
  });
  const card = (it: typeof items[number]) => (
    <div key={it.i} style={{ position: "absolute", left: it.x - 115, top: it.y - 140, transform: `scale(${it.s}) rotate(${it.rot}deg)`, filter: it.depth < 0 ? "brightness(0.75)" : undefined }}>
      <div style={{ width: 230, height: 280, background: "#F7F4EE", padding: "14px 14px 52px", boxSizing: "border-box", boxShadow: "0 18px 40px rgba(0,0,0,0.45)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: -10, top: -20, width: W, height: H, transform: "scale(0.2)", transformOrigin: "0 0" }}>
            <ClipFrame t={0} offset={offset + it.i * 1.3} />
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <ClipFrame t={t} offset={offset} style={{ filter: "brightness(0.72)" }} />
      {items.filter((i) => i.depth < 0).map(card)}
      <ClipCutout t={t} offset={offset} />
      {items.filter((i) => i.depth >= 0).map(card)}
    </>
  );
};

/* 5 · sticker [cutout] (white die-cut outline, slapped on) ------------------------------ */
const outline = (c: string, r: number) =>
  [[r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]].map(([x, y]) => `drop-shadow(${x}px ${y}px 0 ${c})`).join(" ");
const Sticker: FX = ({ t, offset, label }) => {
  const slap = prog(t, 0, 0.2, backOut);
  const s2 = prog(t, 0.28, 0.18, backOut);
  const s3 = prog(t, 0.42, 0.18, backOut);
  const wob = Math.sin(t * 9) * 1.2 * (1 - clamp(t / 1.2));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 42%, #E68A6B 0%, ${UI.accent} 45%, #B9583B 100%)` }} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(70px) scale(${lerp(1.4, 0.8, slap)}) rotate(${lerp(-16, -4, slap) + wob}deg)`, opacity: clamp(slap * 4),
        filter: `${outline("#fff", 7)} drop-shadow(0 26px 30px rgba(60,20,10,0.35))` }}>
        <ClipCutout t={t} offset={offset} style={FADE(1500, 1560)} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 360, transform: `scale(${lerp(1.8, 1, s2)}) rotate(${lerp(30, 12, s2)}deg)`, opacity: clamp(s2 * 4), filter: `${outline("#fff", 6)} drop-shadow(0 12px 16px rgba(60,20,10,0.35))` }}>
        <Star s={170} color="#1F1E1D" />
      </div>
      {label && (
        <div style={{ position: "absolute", left: 80, top: 1330, transform: `scale(${lerp(1.8, 1, s3)}) rotate(${lerp(-18, -7, s3)}deg)`, opacity: clamp(s3 * 4), filter: "drop-shadow(0 12px 16px rgba(60,20,10,0.35))" }}>
          <div style={{ padding: "18px 34px", borderRadius: 26, background: "#fff", fontFamily: TIGHT, fontWeight: 900, fontSize: 64, color: "#1F1E1D", letterSpacing: "-0.02em" }}>{label}</div>
        </div>
      )}
    </>
  );
};

/* 6 · flip [cutout] (3D card flip to a B&W poster) ---------------------------------------- */
const Flip: FX = ({ t, offset }) => {
  const shrink = prog(t, 0.36, 0.22);
  const flip = prog(t, 0.44, 0.42, easeInOut);
  const s = lerp(1, 0.8, shrink) * (1 - 0.06 * Math.sin(flip * Math.PI));
  const face: React.CSSProperties = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 44 * shrink, overflow: "hidden",
    boxShadow: `0 40px 90px rgba(0,0,0,${0.55 * shrink})` } as React.CSSProperties;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 45%, #3A3532 0%, #141312 75%)" }} />
      <div style={{ position: "absolute", inset: 0, perspective: 2600 }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `scale(${s}) rotateY(${flip * 180}deg) rotateX(${3 * Math.sin(flip * Math.PI)}deg)` }}>
          <div style={face}><ClipFrame t={t} offset={offset} /></div>
          <div style={{ ...face, transform: "rotateY(180deg)", background: `radial-gradient(ellipse at 50% 35%, #E68A6B 0%, ${UI.accent} 50%, #A94F35 100%)` }}>
            <ClipCutout t={t} offset={offset} style={{ filter: "grayscale(1) contrast(1.5) brightness(1.08)", ...FADE(1250, 1480) }} />
          </div>
        </div>
      </div>
    </>
  );
};

/* 7 · mirror ---------------------------------------------------------------------------- */
const Mirror: FX = ({ t, offset }) => {
  const cell = (dx: number, dy: number, flip: boolean, toff: number) => (
    <div style={{ position: "absolute", left: dx, top: dy, width: W / 2, height: H / 2, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(0.5) ${flip ? "scaleX(-1)" : ""}`, transformOrigin: flip ? "50% 0" : "0 0", ...(flip ? { left: -W / 2 + W / 4 } : {}) }}>
        <ClipFrame t={t} offset={offset + toff} />
      </div>
    </div>
  );
  const p = prog(t, 0, 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", transform: `scale(${lerp(1.25, 1, p)})` }}>
      {cell(0, 0, false, 0)}
      {cell(W / 2, 0, true, 0)}
      {cell(0, H / 2, true, 1.0)}
      {cell(W / 2, H / 2, false, 1.0)}
      <div style={{ position: "absolute", left: W / 2 - 2, top: 0, width: 4, height: H, background: "rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: 0, top: H / 2 - 2, width: W, height: 4, background: "rgba(0,0,0,0.6)" }} />
    </div>
  );
};

/* 8 · teleport [cutout] (you, on Mars) ------------------------------------------------------ */
const STARS = Array.from({ length: 90 }, (_, i) => ({ x: hash(i) * W, y: hash(i + 99) * 1100, r: 1.5 + hash(i + 7) * 3, tw: hash(i + 31) * 6 }));
const Teleport: FX = ({ t, offset }) => {
  const flash = clamp(1 - t / 0.22);
  const rise = prog(t, 0, 0.6);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#05060B 0%, #140B0C 45%, #5A2416 72%, #C4552C 86%, #E9945C 100%)" }} />
      {STARS.map((s, i) => <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.r, height: s.r, borderRadius: s.r, background: "#fff", opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + s.tw)) }} />)}
      <div style={{ position: "absolute", left: -600, top: 1420 - rise * 60, width: 2280, height: 1400, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 0%, #D86A3A 0%, #8E3418 35%, #3A140C 70%)",
        boxShadow: "0 -30px 120px rgba(255,140,80,0.55)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-20 - 24 * Math.sin(t * 2)}px)`, filter: "drop-shadow(0 0 24px rgba(255,150,90,0.5))" }}>
        <ClipCutout t={t} offset={offset} style={{ filter: "brightness(0.95) sepia(0.12)", ...FADE(1240, 1440) }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.85 }} />
    </>
  );
};

/* 9 · film (a vertical strip running through the gate) ---------------------------------------- */
const today = () => { const d = new Date(); const m = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()]; return `${m} ${String(d.getDate()).padStart(2, "0")} '${String(d.getFullYear()).slice(2)}`; };
const Film: FX = ({ t, offset }) => {
  const FW = 820, FH = 600, PITCH = 690, X0 = (W - FW) / 2;
  const scroll = t * 520;
  const base = Math.floor(scroll / PITCH);
  const jx = (hash(Math.floor(t * 24)) - 0.5) * 8, jy = (hash(Math.floor(t * 24) + 3) - 0.5) * 6;
  const k = FW / W;
  const flicker = 0.92 + 0.08 * hash(Math.floor(t * 24) + 11);
  const date = today();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#070605" }} />
      <div style={{ position: "absolute", left: X0 - 90, top: 0, width: FW + 180, height: H, background: "#17120E", transform: `translate(${jx}px, 0)` }}>
        {[0, 1].map((side) => (
          <div key={side} style={{ position: "absolute", top: -100, [side ? "right" : "left"]: 26, width: 38, display: "flex", flexDirection: "column", gap: 48, transform: `translateY(${-(scroll % 86)}px)` } as React.CSSProperties}>
            {Array.from({ length: 26 }, (_, i) => <span key={i} style={{ width: 38, height: 38, borderRadius: 7, background: "#050403" }} />)}
          </div>
        ))}
      </div>
      {[-2, -1, 0, 1, 2, 3].map((j) => {
        const n = base + j;
        const y = 660 + j * PITCH - (scroll % PITCH) + jy;
        return (
          <div key={n} style={{ position: "absolute", left: X0 + jx, top: y - FH / 2, width: FW, height: FH, overflow: "hidden", borderRadius: 10, filter: `brightness(${flicker})` }}>
            <div style={{ position: "absolute", left: 0, top: -70, width: W, height: H, transform: `scale(${k})`, transformOrigin: "0 0" }}>
              <ClipFrame t={t} offset={offset + n * 0.45} style={{ filter: "sepia(0.5) contrast(1.15) saturate(0.85) brightness(0.95)" }} />
            </div>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
            <div style={{ position: "absolute", right: 26, bottom: 18, fontFamily: "monospace", fontWeight: 700, fontSize: 40, color: "#FFB347", textShadow: "0 0 8px rgba(255,150,40,0.8)", letterSpacing: "0.06em" }}>{date}</div>
          </div>
        );
      })}
      <Img src={staticFile("noise.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, mixBlendMode: "overlay",
        transform: `translate(${(hash(Math.floor(t * 24)) - 0.5) * 30}px, ${(hash(Math.floor(t * 24) + 5) - 0.5) * 30}px) scale(1.1)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(255,120,40,${0.18 + 0.1 * Math.sin(t * 3)}) 0%, transparent 35%)` }} />
    </>
  );
};

/* 10 · pop-art [cutout] (4 colour prints) ------------------------------------------------------ */
const POP: [string, number][] = [["#F2C14E", -38], ["#E8505B", -62], [UI.accent, -20], ["#F7E3C4", 300]];
const PopArt: FX = ({ t, offset }) => (
  <div style={{ position: "absolute", inset: 0, background: "#111" }}>
    {POP.map(([bg, hue], i) => {
      const p = prog(t, i * 0.06, 0.16, backOut);
      return (
        <div key={i} style={{ position: "absolute", left: (i % 2) * (W / 2), top: Math.floor(i / 2) * (H / 2), width: W / 2, height: H / 2, overflow: "hidden", background: bg,
          transform: `scale(${lerp(0.6, 1, p)})`, opacity: clamp(p * 3) }}>
          <div style={{ position: "absolute", left: -65, top: 130, width: W, height: H, transform: "scale(0.62)", transformOrigin: "0 0" }}>
            <ClipCutout t={t} offset={offset + i * 0.25} style={{ filter: `grayscale(1) contrast(2.6) brightness(1.12) sepia(1) saturate(6) hue-rotate(${hue}deg)` }} />
          </div>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.22) 2.5px, transparent 3.5px)", backgroundSize: "12px 12px", mixBlendMode: "multiply" }} />
        </div>
      );
    })}
  </div>
);

/* 11 · glitch (RGB split + torn slices) --------------------------------------------------------- */
const Chan: React.FC<{ color: string; dx: number; dy: number; t: number; offset: number }> = ({ color, dx, dy, t, offset }) => (
  <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", transform: `translate(${dx}px, ${dy}px)` }}>
    <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
      <ClipFrame t={t} offset={offset} />
      <div style={{ position: "absolute", inset: 0, background: color, mixBlendMode: "multiply" }} />
    </div>
  </div>
);
const RGBSplit: React.FC<{ t: number; offset: number; amp: number; seed?: number }> = ({ t, offset, amp, seed = 0 }) => {
  const f = Math.floor(t * 15) + seed;
  const d = 26 * amp;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", isolation: "isolate" }}>
      <Chan color="#f00" dx={-d * (0.6 + hash(f))} dy={0} t={t} offset={offset} />
      <Chan color="#0f0" dx={0} dy={d * 0.15 * (hash(f + 2) - 0.5)} t={t} offset={offset} />
      <Chan color="#00f" dx={d * (0.6 + hash(f + 1))} dy={0} t={t} offset={offset} />
    </div>
  );
};
const Glitch: FX = ({ t, offset }) => {
  const cyc = t % 1.2;
  const amp = cyc < 0.14 ? 1 : cyc > 0.26 && cyc < 0.34 ? 0.9 : 0.25;
  const f = Math.floor(t * 15);
  const bands = Array.from({ length: 6 }, (_, i) => ({ y: hash(f * 7 + i) * H, h: 40 + hash(f * 3 + i) * 160, dx: (hash(f * 5 + i) - 0.5) * 220 * amp }));
  return (
    <>
      <RGBSplit t={t} offset={offset} amp={amp} />
      {amp > 0.3 && bands.map((b, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, clipPath: `inset(${b.y}px 0 ${Math.max(0, H - b.y - b.h)}px 0)`, transform: `translateX(${b.dx}px)` }}>
          <RGBSplit t={t} offset={offset} amp={amp * 1.6} seed={i + 1} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 6px)", opacity: 0.5 + 0.5 * amp }} />
    </>
  );
};

/* 12 · checklist [cutout] (each step happens live) ------------------------------------------------- */
const STEPS = ["Found you in the frame", "Removed the room", "Graded the colour", "Exported in 1080p"];
const STEP_T = [0.15, 0.35, 0.55, 0.75];
const Checklist: FX = ({ t, offset, label }) => {
  const room = 1 - prog(t, STEP_T[1], 0.25);
  const grade = prog(t, STEP_T[2], 0.25);
  const face = prog(t, STEP_T[0], 0.15) * (1 - prog(t, STEP_T[1] + 0.1, 0.2));
  const title = `${(label.replace(/^made by /i, "") || "Claude")} is editing your clip`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, #4A3A30 0%, #1A1512 75%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: room }}><ClipFrame t={t} offset={offset} /></div>
      <ClipCutout t={t} offset={offset} style={{ filter: `sepia(${0.22 * grade}) saturate(${1 + 0.3 * grade}) contrast(${1 + 0.12 * grade})`, ...(room < 1 ? FADE(1260, 1460) : {}) }} />
      {face > 0 && (
        <div style={{ position: "absolute", left: 340, top: 230, width: 400, height: 520, opacity: face }}>
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
            <span key={i} style={{ position: "absolute", [x ? "right" : "left"]: 0, [y ? "bottom" : "top"]: 0, width: 64, height: 64,
              borderTop: y ? undefined : "7px solid #3FB950", borderBottom: y ? "7px solid #3FB950" : undefined, borderLeft: x ? undefined : "7px solid #3FB950", borderRight: x ? "7px solid #3FB950" : undefined } as React.CSSProperties} />
          ))}
        </div>
      )}
      <div style={{ position: "absolute", left: 60, width: 820, top: 960, borderRadius: 40, background: "rgba(24,23,21,0.88)", backdropFilter: "blur(18px)", boxShadow: `0 0 0 2px ${UI.line}, 0 30px 80px rgba(0,0,0,0.5)`,
        padding: "32px 40px", boxSizing: "border-box", opacity: prog(t, 0, 0.15), transform: `translateY(${(1 - prog(t, 0, 0.25)) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
          <Star s={46} rot={t * 200} />
          <span style={{ fontFamily: INTER, fontWeight: 600, fontSize: 42, color: UI.text }}>{title}</span>
        </div>
        {STEPS.map((s, i) => {
          const on = t >= STEP_T[i];
          const p = prog(t, STEP_T[i], 0.2, backOut);
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 20, margin: "12px 0", opacity: on || t >= STEP_T[i] - 0.2 ? 1 : 0.35 }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, background: on ? "#3FB950" : "transparent", boxShadow: on ? "none" : `inset 0 0 0 3px ${UI.text3}`, display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${on ? 0.6 + 0.4 * p : 1})` }}>
                {on && <svg width={28} height={28} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span style={{ fontFamily: INTER, fontWeight: 500, fontSize: 40, color: on ? UI.text : UI.text3 }}>{s}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const EFFECTS: Record<string, { C: FX; cutout: boolean; about: string }> = {
  "glass-widgets": { C: GlassWidgets, cutout: false, about: "frosted iOS-style stat widgets float around you" },
  "text-behind": { C: TextBehind, cutout: true, about: "a giant word sits behind you (set it with --props word)" },
  halftone: { C: Halftone, cutout: false, about: "orange print-dot halftone look" },
  orbit: { C: Orbit, cutout: true, about: "polaroids of your clip orbit around you, passing behind and in front" },
  sticker: { C: Sticker, cutout: true, about: "you become a white die-cut sticker slapped on a colour background" },
  flip: { C: Flip, cutout: true, about: "the frame turns into a 3D card and flips to a B&W poster" },
  mirror: { C: Mirror, cutout: false, about: "2x2 kaleidoscope mirror grid" },
  teleport: { C: Teleport, cutout: true, about: "flash, and you're floating above Mars" },
  film: { C: Film, cutout: false, about: "a vertical film strip running through the gate, with date stamp and grain" },
  "pop-art": { C: PopArt, cutout: true, about: "four Warhol-style colour prints of you" },
  glitch: { C: Glitch, cutout: false, about: "RGB split with torn, shifting slices and scanlines" },
  checklist: { C: Checklist, cutout: true, about: "a live checklist: finds you, removes the room, grades, exports" },
};
