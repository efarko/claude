import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background, Caption, Flash, Punch, Safe, Slam, Sub, Tag, useSpring } from "./components";
import { BODY, C, DISPLAY, GRADIENT_LOGO, MONO } from "./theme";

/* ---------------------------------------------------------------------------
   0–2 s · GANCHO (3 variantes; todas con datos del BRIEF)
--------------------------------------------------------------------------- */
export type HookVariant = "A" | "B" | "C";

export const Hook: React.FC<{ variant: HookVariant }> = ({ variant }) => (
  <AbsoluteFill>
    <Background />
    <Punch at={0} dur={14} amount={26}>
      {variant === "A" && (
        <Safe gap={28}>
          <Slam at={0} size={140}>¿Solo tienes</Slam>
          <Slam at={6} size={150} gradient>
            Instagram?
          </Slam>
          <div style={{ height: 24 }} />
          <Tag tone="red" delay={30} size={34}>
            Estás perdiendo clientes
          </Tag>
        </Safe>
      )}
      {variant === "B" && (
        <Safe gap={18}>
          <Slam at={0} size={150}>Tu web</Slam>
          <Slam at={6} size={200} gradient>
            S/300
          </Slam>
          <Sub delay={16} size={40}>
            <span style={{ textDecoration: "line-through" }}>S/390</span> · precio de lanzamiento
          </Sub>
          <div style={{ height: 16 }} />
          <Tag tone="green" delay={30} size={34}>
            Lista en 3 a 5 días hábiles
          </Tag>
        </Safe>
      )}
      {variant === "C" && (
        <Punch at={26} dur={10} amount={18}>
          <Safe gap={40}>
            <Caption text="Tu Instagram muestra tu negocio." size={84} stagger={3} />
            <Slam at={26} size={150} gradient>
              Tu web lo vende.
            </Slam>
          </Safe>
        </Punch>
      )}
    </Punch>
    <Flash at={0} />
    {variant === "C" && <Flash at={26} color={C.blue} />}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------------------
   2–6 s · PROBLEMA
--------------------------------------------------------------------------- */
const Bubble: React.FC<{ text: string; delay: number; side: "l" | "r" }> = ({ text, delay, side }) => {
  const s = useSpring(delay, 320, 16);
  return (
    <div
      style={{
        alignSelf: side === "l" ? "flex-start" : "flex-end",
        background: side === "l" ? "#1a2440" : "#0d5c2c",
        color: C.text,
        fontFamily: BODY,
        fontSize: 46,
        padding: "22px 32px",
        borderRadius: side === "l" ? "8px 32px 32px 32px" : "32px 8px 32px 32px",
        opacity: s,
        transform: `scale(${0.5 + 0.5 * s})`,
        transformOrigin: side === "l" ? "left top" : "right top",
        boxShadow: "0 12px 30px -14px rgba(0,0,0,0.6)",
      }}
    >
      {text}
    </div>
  );
};

export const ProblemRepeat: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Safe gap={48}>
      <Caption text="Respondes lo mismo *todos los días*" size={88} />
      <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 18 }}>
        <Bubble text="¿Precios?" delay={6} side="l" />
        <Bubble text="¿Horarios?" delay={11} side="l" />
        <Bubble text="¿Qué hacen?" delay={16} side="l" />
        <Bubble text="¿Precios?" delay={21} side="l" />
      </div>
    </Safe>
  </AbsoluteFill>
);

export const ProblemLost: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = (frame * 38) % 300;
  return (
    <AbsoluteFill>
      <Background />
      <Safe gap={56}>
        <Caption text="Se pierden *buscando* precios y horarios" size={88} />
        <div
          style={{
            width: 600,
            height: 520,
            overflow: "hidden",
            borderRadius: 36,
            border: `2px solid ${C.borderStrong}`,
            background: C.bgAlt,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              padding: 8,
              transform: `translateY(${-scroll}px)`,
              filter: "blur(2.5px)",
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 142,
                  borderRadius: 12,
                  background: [C.navy, "#16489b", "#1a2440", "#121a33"][i % 4],
                }}
              />
            ))}
          </div>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 260,
                color: C.text,
                transform: `rotate(${Math.sin(frame / 3) * 10}deg) scale(${1 + Math.sin(frame / 2) * 0.06})`,
                textShadow: "0 10px 50px rgba(0,0,0,0.7)",
              }}
            >
              ?
            </div>
          </AbsoluteFill>
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

const Person: React.FC<{ lost: boolean; delay: number }> = ({ lost, delay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const k = lost ? t : 0;
  return (
    <div style={{ position: "relative", opacity: 1 - k * 0.75, transform: `translateY(${k * 60}px)` }}>
      <svg width="150" height="170" viewBox="0 0 150 170">
        <circle cx="75" cy="48" r="36" fill={lost ? C.crimson : C.blueLight} />
        <path d="M10 165 C10 112 40 96 75 96 C110 96 140 112 140 165 Z" fill={lost ? C.crimson : C.blueLight} />
      </svg>
    </div>
  );
};

export const ProblemClients: React.FC = () => (
  <AbsoluteFill>
    <Background hue="red" />
    <Punch at={14} dur={8} amount={12}>
      <Safe gap={60}>
        <Caption text="Sin web, *pierdes clientes* que ya estaban interesados" size={86} danger />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 150px)", gap: 36 }}>
          {[false, true, false, true, true, false].map((lost, i) => (
            <Person key={i} lost={lost} delay={14 + i * 2} />
          ))}
        </div>
      </Safe>
    </Punch>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------------------
   6–11 s · SOLUCIÓN: logo 3D + planes
--------------------------------------------------------------------------- */
const LOGO_FRAMES = 105;

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.min(frame + 1, LOGO_FRAMES);
  const glow = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background />
      <Safe gap={10}>
        <div style={{ position: "relative", width: 720, height: 720 }}>
          <AbsoluteFill
            style={{
              background: "radial-gradient(circle, rgba(45,135,255,0.55), transparent 62%)",
              opacity: glow,
              transform: `scale(${0.8 + glow * 0.3})`,
            }}
          />
          <Img
            src={staticFile(`renders/logo_anim/frame_${String(n).padStart(4, "0")}.png`)}
            style={{ width: 720, height: 720, position: "absolute" }}
          />
        </div>
        <Caption text="SV WebStudio" start={30} size={104} stagger={4} />
        <div style={{ height: 8 }} />
        <Tag tone="blue" delay={40} size={28}>
          Landing pages · Lima
        </Tag>
      </Safe>
      <Flash at={34} color={C.blue} />
    </AbsoluteFill>
  );
};

const PlanCard: React.FC<{
  name: string;
  price: string;
  before: string;
  delivery: string;
  bullets: string[];
  recommended?: boolean;
  delay: number;
}> = ({ name, price, before, delivery, bullets, recommended, delay }) => {
  const s = useSpring(delay, 240, 17);
  const p = useSpring(delay + 8, 380, 14);
  return (
    <div
      style={{
        width: 820,
        borderRadius: 40,
        padding: "40px 48px",
        background: recommended ? `linear-gradient(160deg, rgba(45,135,255,0.22), rgba(14,20,42,0.95) 55%)` : C.card,
        border: `3px solid ${recommended ? "rgba(45,135,255,0.6)" : C.borderStrong}`,
        boxShadow: recommended ? "0 30px 80px -30px rgba(45,135,255,0.6)" : "0 30px 60px -30px rgba(0,0,0,0.8)",
        opacity: s,
        transform: `translateY(${(1 - s) * 160}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.text, letterSpacing: "-0.02em" }}>{name}</div>
        {recommended && (
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.onGreen,
              background: C.green,
              borderRadius: 999,
              padding: "10px 20px",
            }}
          >
            Recomendado
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            backgroundImage: `linear-gradient(100deg, ${C.greenLight} 10%, ${C.blueLight} 92%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: `scale(${0.6 + 0.4 * p})`,
            transformOrigin: "left bottom",
            display: "inline-block",
          }}
        >
          {price}
        </div>
        <div style={{ fontFamily: BODY, fontSize: 44, color: C.muted, textDecoration: "line-through" }}>{before}</div>
      </div>
      {bullets.map((b) => (
        <div key={b} style={{ fontFamily: BODY, fontSize: 38, color: C.text, display: "flex", gap: 16 }}>
          <span style={{ color: C.green, fontWeight: 700 }}>✓</span>
          {b}
        </div>
      ))}
      <div
        style={{
          marginTop: 8,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: "0.05em",
          color: C.blue200,
          textTransform: "uppercase",
        }}
      >
        Entrega: {delivery}
      </div>
    </div>
  );
};

/** 0–45: Landing sola · 45–90: Landing se compacta arriba y entra Premium. */
export const Plans: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = useSpring(45, 200, 20);
  const both = frame >= 45;
  return (
    <AbsoluteFill>
      <Background />
      <Safe gap={0} justify="flex-start">
        <div
          style={{
            transform: `scale(${1 - 0.18 * swap}) translateY(${-30 * swap}px)`,
            transformOrigin: "center top",
            marginTop: 40 - 40 * swap,
          }}
        >
          <PlanCard
            name="Landing"
            price="S/300"
            before="S/390"
            delivery="3 a 5 días hábiles"
            bullets={["Diseño a tu medida, no plantilla", "WhatsApp integrado", "Hasta 5 secciones"]}
            delay={0}
          />
        </div>
        {both && (
          <div style={{ transform: "scale(0.82)", transformOrigin: "center top", marginTop: -110 }}>
            <PlanCard
              name="Landing Premium"
              price="S/500"
              before="S/690"
              delivery="7 a 10 días hábiles"
              bullets={["Textos escritos para vender", "Secciones según tu rubro", "3 rondas de ajustes"]}
              recommended
              delay={45}
            />
          </div>
        )}
      </Safe>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 485, paddingRight: 70 }}>
        <Sub delay={10} size={30} color={C.muted}>
          Pago único · Precio de lanzamiento válido hasta el 31/12/2026
        </Sub>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
   11–15 s · PRUEBA / BENEFICIO (solo datos del sitio)
--------------------------------------------------------------------------- */
const Badge: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const s = useSpring(delay, 300, 13);
  return (
    <div
      style={{
        width: 230,
        height: 230,
        borderRadius: 70,
        background: GRADIENT_LOGO,
        border: "3px solid rgba(45,135,255,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 130,
        color: C.text,
        transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`,
        boxShadow: "0 30px 80px -30px rgba(45,135,255,0.7)",
      }}
    >
      {children}
    </div>
  );
};

export const ProofPrice: React.FC = () => (
  <AbsoluteFill>
    <Background hue="green" />
    <Safe gap={50}>
      <Badge>✓</Badge>
      <Caption text="Precio cerrado *antes de empezar*" size={96} start={4} />
      <Tag tone="green" delay={16} size={32}>
        No cobramos por cotizar
      </Tag>
    </Safe>
  </AbsoluteFill>
);

const Avatar: React.FC<{ initials: string; delay: number }> = ({ initials, delay }) => {
  const s = useSpring(delay, 300, 14);
  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: 999,
        background: GRADIENT_LOGO,
        border: `4px solid ${C.blue}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: 80,
        color: C.text,
        transform: `scale(${s})`,
      }}
    >
      {initials}
    </div>
  );
};

export const ProofDirect: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Safe gap={46}>
      <div style={{ display: "flex", gap: 30 }}>
        <Avatar initials="JS" delay={0} />
        <Avatar initials="FV" delay={5} />
      </div>
      <Caption text="Hablas directo con *quien hace tu web*" size={92} start={6} />
      <Sub delay={18} size={40}>
        Dos dueños, sin vendedores ni intermediarios
      </Sub>
    </Safe>
  </AbsoluteFill>
);

const Project: React.FC<{ name: string; what: string; accent: string; delay: number }> = ({ name, what, accent, delay }) => {
  const s = useSpring(delay, 260, 16);
  return (
    <div
      style={{
        width: 820,
        display: "flex",
        alignItems: "center",
        gap: 28,
        background: C.card,
        border: `2px solid ${C.borderStrong}`,
        borderLeft: `12px solid ${accent}`,
        borderRadius: 28,
        padding: "26px 34px",
        opacity: s,
        transform: `translateX(${(1 - s) * 200}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: C.text, letterSpacing: "-0.02em" }}>{name}</div>
        <div style={{ fontFamily: BODY, fontSize: 34, color: C.muted }}>{what}</div>
      </div>
      <div style={{ marginLeft: "auto", fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.greenLight }}>EN LÍNEA ●</div>
    </div>
  );
};

export const ProofProjects: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Safe gap={26}>
      <Caption text="Webs *ya publicadas*" size={100} />
      <div style={{ height: 10 }} />
      <Project name="Avelino Restaurante" what="Reservas online" accent={C.amber} delay={6} />
      <Project name="Gladiadores Lima" what="Inscripción por WhatsApp" accent={C.crimson} delay={11} />
      <Project name="Kiarapersonalized" what="Catálogo + WhatsApp" accent={C.rose} delay={16} />
    </Safe>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------------------
   15–18 s · CTA
--------------------------------------------------------------------------- */
const WhatsAppIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={C.onGreen} aria-hidden>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.05c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34.18 0 .36 0 .52.01.17.01.39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.34z" />
  </svg>
);

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useSpring(12, 300, 12);
  const pulse = 1 + Math.max(0, Math.sin((frame - 24) / 5)) * 0.04 * (frame > 24 ? 1 : 0);
  const logo = useSpring(0, 200, 16);
  return (
    <AbsoluteFill>
      <Background hue="green" />
      <Punch at={0} dur={12} amount={20}>
        <Safe gap={34}>
          <Img
            src={staticFile("renders/logo_still.png")}
            style={{ width: 260, height: 260, opacity: logo, transform: `scale(${0.6 + 0.4 * logo})`, marginBottom: -20 }}
          />
          <Slam at={0} size={146} gradient>
            Escríbenos
          </Slam>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              background: C.green,
              color: C.onGreen,
              borderRadius: 999,
              padding: "30px 52px",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 62,
              letterSpacing: "-0.01em",
              boxShadow: "0 24px 70px -20px rgba(37,211,102,0.75)",
              opacity: btn,
              transform: `scale(${(0.6 + 0.4 * btn) * pulse})`,
              whiteSpace: "nowrap",
            }}
          >
            <WhatsAppIcon size={72} />
            +51 916 068 187
          </div>
          <Tag tone="neutral" delay={26} size={34}>
            IG · TikTok @sv.webstudio
          </Tag>
          <Sub delay={40} size={38}>
            Te respondemos normalmente el mismo día
          </Sub>
        </Safe>
      </Punch>
      <Flash at={0} color={C.green} />
    </AbsoluteFill>
  );
};
