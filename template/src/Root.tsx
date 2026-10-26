import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { EFFECTS, FXProps } from "./Effects";
import { FPS, W, H } from "./theme";
import { SRC_FPS, SRC_FRAMES } from "./clip.generated";

type Props = { id: string; word: string; label: string };

const Effect: React.FC<Props> = ({ id, word, label }) => {
  const t = useCurrentFrame() / FPS;
  const fx = EFFECTS[id];
  if (!fx) throw new Error(`Unknown effect "${id}". Use one of: ${Object.keys(EFFECTS).join(", ")}`);
  const p: FXProps = { t, offset: 0, word, label };
  return <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}><fx.C {...p} /></AbsoluteFill>;
};

const frames = Math.max(FPS, Math.round((SRC_FRAMES / SRC_FPS) * FPS)); // as long as your clip

export const Root: React.FC = () => (
  <Composition id="Effect" component={Effect} durationInFrames={frames} fps={FPS} width={W} height={H}
    defaultProps={{ id: "glass-widgets", word: "CLAUDE", label: "made by Claude" }} />
);
