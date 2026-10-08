import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY, C, DISPLAY, GRADIENT_TEXT, MONO, SAFE } from "./theme";

/** Fondo de la marca: navy profundo, rejilla sutil y dos halos (azul / verde) como en la imagen OG. */
export const Background: React.FC<{ hue?: "blue" | "red" | "green" }> = ({ hue = "blue" }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 40;
  const glowA = hue === "red" ? "rgba(239, 68, 68, 0.22)" : "rgba(45, 135, 255, 0.30)";
  const glowB = hue === "red" ? "rgba(239, 68, 68, 0.10)" : "rgba(37, 211, 102, 0.20)";
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${180 + drift}px ${260 - drift}px, ${glowA}, transparent 70%),
            radial-gradient(800px 800px at ${980 - drift}px ${1700 + drift}px, ${glowB}, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `0 ${(frame * 1.2) % 72}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Caja con la zona segura aplicada: todo el contenido vive aquí dentro. */
export const Safe: React.FC<{ children: React.ReactNode; justify?: React.CSSProperties["justifyContent"]; gap?: number }> = ({
  children,
  justify = "center",
  gap = 36,
}) => (
  <AbsoluteFill
    style={{
      paddingTop: SAFE.top,
      paddingBottom: SAFE.bottom,
      paddingLeft: SAFE.left,
      paddingRight: SAFE.right,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: justify,
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const useSpring = (delay = 0, stiffness = 220, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { stiffness, damping, mass: 0.8 } });
};

/**
 * Subtítulo grande, palabra por palabra.
 * Las palabras entre *asteriscos* llevan el degradado de texto de la marca (verde → azul),
 * o rojo si `danger`.
 */
export const Caption: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  size?: number;
  danger?: boolean;
  font?: string;
  color?: string;
}> = ({ text, start = 0, stagger = 3, size = 92, danger = false, font = DISPLAY, color = C.text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let hl = false;
  const words = text.split(" ").map((raw) => {
    const opens = raw.startsWith("*");
    const closes = raw.endsWith("*");
    if (opens) hl = true;
    const w = { word: raw.replace(/\*/g, ""), hl };
    if (closes) hl = false;
    return w;
  });
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.26,
        rowGap: size * 0.02,
        maxWidth: 850,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - start - i * stagger, fps, config: { stiffness: 260, damping: 15, mass: 0.7 } });
        return (
          <span
            key={i}
            style={{
              fontFamily: font,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: w.hl && danger ? C.crimson : color,
              backgroundImage: w.hl && !danger ? GRADIENT_TEXT : undefined,
              WebkitBackgroundClip: w.hl && !danger ? "text" : undefined,
              WebkitTextFillColor: w.hl && !danger ? "transparent" : undefined,
              display: "inline-block",
              opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
              textShadow: w.hl ? undefined : "0 6px 30px rgba(0,0,0,0.45)",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

/** Etiqueta en mayúsculas con JetBrains Mono, como las píldoras de la imagen OG. */
export const Tag: React.FC<{ children: React.ReactNode; tone?: "green" | "blue" | "neutral" | "red"; delay?: number; size?: number }> = ({
  children,
  tone = "blue",
  delay = 0,
  size = 30,
}) => {
  const s = useSpring(delay);
  const tones = {
    green: { bg: "rgba(37, 211, 102, 0.14)", border: "rgba(37, 211, 102, 0.45)", fg: C.greenLight },
    blue: { bg: "rgba(45, 135, 255, 0.16)", border: "rgba(45, 135, 255, 0.45)", fg: C.blue200 },
    neutral: { bg: "rgba(255,255,255,0.06)", border: C.borderStrong, fg: C.text },
    red: { bg: "rgba(239, 68, 68, 0.14)", border: "rgba(239, 68, 68, 0.5)", fg: "#fca5a5" },
  }[tone];
  return (
    <div
      style={{
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: tones.fg,
        background: tones.bg,
        border: `2px solid ${tones.border}`,
        borderRadius: 999,
        padding: `${size * 0.45}px ${size * 0.9}px`,
        opacity: s,
        transform: `scale(${0.8 + 0.2 * s})`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Sub: React.FC<{ children: React.ReactNode; delay?: number; size?: number; color?: string }> = ({
  children,
  delay = 0,
  size = 44,
  color = C.muted,
}) => {
  const s = useSpring(delay, 180, 18);
  return (
    <div
      style={{
        fontFamily: BODY,
        fontSize: size,
        lineHeight: 1.25,
        color,
        textAlign: "center",
        maxWidth: 820,
        opacity: s,
        transform: `translateY(${(1 - s) * 24}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Golpe de cámara: sacudida y zoom que se asientan en `dur` fotogramas. */
export const Punch: React.FC<{ children: React.ReactNode; at?: number; dur?: number; amount?: number }> = ({
  children,
  at = 0,
  dur = 12,
  amount = 22,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const k = t >= 0 && t < dur ? 1 - t / dur : 0;
  const x = Math.sin(t * 2.7) * amount * k;
  const y = Math.cos(t * 3.3) * amount * k;
  const z = 1 + 0.12 * k;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${z})` }}>{children}</AbsoluteFill>;
};

export const Flash: React.FC<{ at?: number; color?: string }> = ({ at = 0, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - at, [0, 1, 7], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, pointerEvents: "none" }} />;
};

export const Slam: React.FC<{ children: React.ReactNode; at?: number; size?: number; gradient?: boolean; color?: string }> = ({
  children,
  at = 0,
  size = 150,
  gradient = false,
  color = C.text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { stiffness: 420, damping: 20, mass: 0.6 } });
  const visible = frame >= at;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: "-0.04em",
        textAlign: "center",
        color,
        backgroundImage: gradient ? GRADIENT_TEXT : undefined,
        WebkitBackgroundClip: gradient ? "text" : undefined,
        WebkitTextFillColor: gradient ? "transparent" : undefined,
        opacity: visible ? 1 : 0,
        transform: `scale(${interpolate(s, [0, 1], [2.6, 1])})`,
        filter: `blur(${(1 - s) * 10}px)`,
        maxWidth: 860,
        padding: "0 6px",
      }}
    >
      {children}
    </div>
  );
};
