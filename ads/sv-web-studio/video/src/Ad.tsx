import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import {
  CTA,
  Hook,
  HookVariant,
  LogoReveal,
  Plans,
  ProblemClients,
  ProblemLost,
  ProblemRepeat,
  ProofDirect,
  ProofPrice,
  ProofProjects,
} from "./scenes";

/**
 * Línea de tiempo a 30 fps (540 fotogramas = 18 s). Un corte cada 1,3–2 s.
 *   0– 60  GANCHO
 *  60–180  PROBLEMA   (3 cortes de 40)
 * 180–330  SOLUCIÓN   (logo 3D 60 · planes 90, con un cambio a los 45)
 * 330–450  PRUEBA     (3 cortes de 40)
 * 450–540  CTA
 */
export const TIMELINE = [
  { from: 0, dur: 60, C: null },
  { from: 60, dur: 40, C: ProblemRepeat },
  { from: 100, dur: 40, C: ProblemLost },
  { from: 140, dur: 40, C: ProblemClients },
  { from: 180, dur: 60, C: LogoReveal },
  { from: 240, dur: 90, C: Plans },
  { from: 330, dur: 40, C: ProofPrice },
  { from: 370, dur: 40, C: ProofDirect },
  { from: 410, dur: 40, C: ProofProjects },
  { from: 450, dur: 90, C: CTA },
] as const;

export const DURATION = 540;

type Sfx = { at: number; file: string; volume: number };

const hookSfx = (v: HookVariant): Sfx[] =>
  v === "C"
    ? [
        { at: 0, file: "whoosh", volume: 0.7 },
        { at: 26, file: "impact", volume: 0.9 },
      ]
    : [
        { at: 0, file: "impact", volume: 0.9 },
        { at: 6, file: "whoosh2", volume: 0.5 },
      ];

const SFX: Sfx[] = [
  // cortes
  ...[60, 100, 140, 180, 240, 330, 370, 410].map((at) => ({ at: at - 3, file: at % 2 ? "whoosh2" : "whoosh", volume: 0.5 })),
  { at: 154, file: "impact2", volume: 0.55 }, // clientes que se pierden
  { at: 214, file: "impact", volume: 0.8 }, // el logo se asienta
  { at: 248, file: "pop", volume: 0.7 }, // S/300
  { at: 282, file: "whoosh", volume: 0.5 }, // entra Premium
  { at: 293, file: "pop", volume: 0.7 }, // S/500
  { at: 330, file: "pop", volume: 0.6 },
  { at: 416, file: "pop", volume: 0.5 },
  { at: 450, file: "impact", volume: 0.9 }, // Escríbenos
  { at: 462, file: "pop", volume: 0.7 }, // botón WhatsApp
];

export const Ad: React.FC<{ hook: HookVariant }> = ({ hook }) => (
  <AbsoluteFill style={{ backgroundColor: "#070a14" }}>
    {TIMELINE.map(({ from, dur, C }) => (
      <Sequence key={from} from={from} durationInFrames={dur}>
        {C ? <C /> : <Hook variant={hook} />}
      </Sequence>
    ))}

    <Audio
      src={staticFile("audio/music.wav")}
      volume={(f) =>
        interpolate(f, [0, 4, DURATION - 20, DURATION], [0.6, 0.55, 0.55, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {[...hookSfx(hook), ...SFX].map((s, i) => (
      <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={45}>
        <Audio src={staticFile(`audio/${s.file}.wav`)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
