// The clip as an image sequence: video frames (public/clip) and the cutout (public/matte) share one index, so they never drift.
import React from "react";
import { Img, staticFile } from "remotion";
import { W, H } from "./theme";
import { SRC_FPS, SRC_FRAMES } from "./clip.generated";

export const srcIndex = (t: number, offset: number) => {
  const i = Math.floor((offset + Math.max(0, t)) * SRC_FPS);
  return ((i % SRC_FRAMES) + SRC_FRAMES) % SRC_FRAMES;
};
const pad = (i: number) => String(i).padStart(3, "0");

/** full frame of the clip (room included) */
export const ClipFrame: React.FC<{ t: number; offset: number; style?: React.CSSProperties }> = ({ t, offset, style }) => (
  <Img src={staticFile(`clip/f${pad(srcIndex(t, offset))}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", ...style }} />
);
/** the person only (transparent background), same frame index */
export const ClipCutout: React.FC<{ t: number; offset: number; style?: React.CSSProperties }> = ({ t, offset, style }) => (
  <Img src={staticFile(`matte/f${pad(srcIndex(t, offset))}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", ...style }} />
);
