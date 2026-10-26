// 9:16 1080x1920, 30 fps. Fonts load from Google Fonts at render time.
import { Easing } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadTight } from "@remotion/google-fonts/InterTight";

export const INTER = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const TIGHT = loadTight("normal", { weights: ["700", "800", "900"], subsets: ["latin"] }).fontFamily;

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const UI = {
  text: "#F5F4EE", text3: "#9C9A92", line: "rgba(222,220,209,0.14)", accent: "#D97757",
};

export const clamp = (v: number, a = 0, z = 1) => Math.min(z, Math.max(a, v));
export const lerp = (a: number, z: number, t: number) => a + (z - a) * t;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const prog = (t: number, t0: number, dur: number, e = easeOut) => e(clamp((t - t0) / dur));
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** generic 8-point sparkle (not a brand logo) */
import React from "react";
export const Star: React.FC<{ s: number; rot?: number; color?: string }> = ({ s, rot = 0, color = UI.accent }) =>
  React.createElement("svg", { viewBox: "-50 -50 100 100", width: s, height: s, style: { transform: `rotate(${rot}deg)`, display: "block" } },
    React.createElement("path", {
      fill: color,
      d: Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const r = i % 2 ? 14 : 48; return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`; }).join(" ") + "Z",
    }));
