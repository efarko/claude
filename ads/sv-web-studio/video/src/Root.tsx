import React from "react";
import { Composition } from "remotion";
import { Ad, DURATION } from "./Ad";
import { FPS, H, W } from "./theme";

const VARIANTS = [
  { id: "SV-Ad-A", hook: "A" }, // principal: "¿Solo tienes Instagram?"
  { id: "SV-Ad-B", hook: "B" }, // variante: "Tu web S/300"
  { id: "SV-Ad-C", hook: "C" }, // variante: "Tu Instagram muestra tu negocio. Tu web lo vende."
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {VARIANTS.map((v) => (
      <Composition
        key={v.id}
        id={v.id}
        component={Ad}
        durationInFrames={DURATION}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ hook: v.hook }}
      />
    ))}
  </>
);
