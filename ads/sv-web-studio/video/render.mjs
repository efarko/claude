// Renderiza las 3 versiones del anuncio y normaliza el audio a -14 LUFS / -1,5 dBTP
// (la referencia habitual de TikTok e Instagram).
//   node render.mjs            -> las tres
//   node render.mjs SV-Ad-A    -> solo una
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, "..", "out");
const BROWSER = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const NAMES = {
  "SV-Ad-A": "sv-webstudio_reel_A_principal",
  "SV-Ad-B": "sv-webstudio_reel_B_precio",
  "SV-Ad-C": "sv-webstudio_reel_C_instagram-vende",
};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(NAMES);
const stills = process.env.STILLS ? process.env.STILLS.split(",").map(Number) : [];

mkdirSync(OUT, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts") });

const loudnorm = (input, output) => {
  const filter = "loudnorm=I=-14:TP=-1.5:LRA=11";
  // 1.ª pasada: medir (loudnorm imprime el JSON en stderr)
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", input, "-af", `${filter}:print_format=json`, "-f", "null", "-"], {
    encoding: "utf8",
  });
  const m = JSON.parse(stderr.slice(stderr.lastIndexOf("{")));
  // 2.ª pasada: aplicar con las medidas, en modo lineal
  const second = `${filter}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", input,
    "-c:v", "copy",
    "-af", second, "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    output,
  ]);
};

for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable: BROWSER });
  if (stills.length) {
    for (const frame of stills) {
      await renderStill({
        composition, serveUrl, frame, browserExecutable: BROWSER,
        output: path.join(OUT, "previews", `${id}_${String(frame).padStart(3, "0")}.png`),
      });
    }
    console.log(`${id}: stills ${stills.join(",")}`);
    continue;
  }
  const tmp = path.join(OUT, `${id}.tmp.mp4`);
  await renderMedia({
    composition, serveUrl, codec: "h264", outputLocation: tmp, browserExecutable: BROWSER,
    crf: 18, pixelFormat: "yuv420p", audioCodec: "aac", concurrency: 4,
    onProgress: ({ progress }) => process.stdout.write(`\r${id} ${(progress * 100).toFixed(0)}%   `),
  });
  const final = path.join(OUT, `${NAMES[id]}.mp4`);
  loudnorm(tmp, final);
  rmSync(tmp);
  console.log(`\n${id} -> ${final}`);
}
