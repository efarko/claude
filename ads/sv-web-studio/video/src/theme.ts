import { continueRender, delayRender, staticFile } from "remotion";

// Colores tal cual en css/style.css de sv-web-studio.vercel.app (ver BRIEF.md)
export const C = {
  navy: "#0e142a",
  blue: "#2d87ff",
  blueDark: "#1c5cc6",
  blueLight: "#5aa3ff",
  blue200: "#bcd9ff",
  green: "#25d366",
  greenLight: "#5ce08d",
  onGreen: "#06170d",
  bg: "#070a14",
  bgAlt: "#0a0f1d",
  card: "#0e142a",
  text: "#f8f8fa",
  muted: "#a3a3ae",
  amber: "#f5a524",
  rose: "#f472b6",
  crimson: "#ef4444",
  border: "rgba(255, 255, 255, 0.09)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
} as const;

export const GRADIENT_TEXT = `linear-gradient(100deg, ${C.greenLight} 10%, ${C.blueLight} 92%)`;
export const GRADIENT_LOGO = `linear-gradient(118deg, ${C.navy} 8%, ${C.blueDark} 52%, ${C.blue} 92%)`;

export const DISPLAY = "'Bricolage Grotesque', sans-serif";
export const BODY = "'Instrument Sans', sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/**
 * Zona segura para TikTok e Instagram Reels.
 * Arriba: pestañas / cabecera (~250 px). Abajo: descripción, audio y barra (~470 px).
 * Derecha: columna de botones (me gusta, comentar, compartir) (~150 px).
 */
export const SAFE = { top: 260, bottom: 470, left: 80, right: 150 } as const;

const FONTS: [string, string, string][] = [
  ["Bricolage Grotesque", "fonts/BricolageGrotesque-Bold.ttf", "700"],
  ["Bricolage Grotesque", "fonts/BricolageGrotesque-Regular.ttf", "400"],
  ["Instrument Sans", "fonts/InstrumentSans-Regular.ttf", "400"],
  ["Instrument Sans", "fonts/InstrumentSans-Bold.ttf", "700"],
  ["JetBrains Mono", "fonts/JetBrainsMono-Bold.ttf", "700"],
];

const handle = delayRender("Cargando fuentes de la marca");
Promise.all(
  FONTS.map(([family, file, weight]) =>
    new FontFace(family, `url(${staticFile(file)})`, { weight })
      .load()
      .then((f) => document.fonts.add(f)),
  ),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
