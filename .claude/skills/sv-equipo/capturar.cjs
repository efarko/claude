#!/usr/bin/env node
// Abre una página como la vería un cliente (computadora y celular) y guarda capturas.
// Uso: node capturar.cjs <url> <carpeta-de-salida>
// Resultado: capturas PNG + resumen.json con lo que vive el cliente (tiempo de carga,
// si abre, si es segura, a dónde lleva el botón de contacto).
const fs = require("node:fs");
const path = require("node:path");

let playwright;
try {
  playwright = require("playwright");
} catch {
  console.error("Falta Playwright. Instálalo con: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium, devices } = playwright;

const [, , urlCruda, salida] = process.argv;
if (!urlCruda || !salida) {
  console.error("Uso: node capturar.cjs <url> <carpeta-de-salida>");
  process.exit(2);
}
const url = /^https?:\/\//i.test(urlCruda) ? urlCruda : `https://${urlCruda}`;
fs.mkdirSync(salida, { recursive: true });

const MAX_PANTALLAS = { escritorio: 4, celular: 5 };
const CONTACTO = /whats ?app|cont[aá]ct|cotiza|ll[aá]ma|escr[ií]be|agenda|reserva|pedir|ordena|comprar/i;

async function recorrer(browser, nombre, opcionesContexto) {
  const contexto = await browser.newContext({ ...opcionesContexto, locale: "es-MX", ignoreHTTPSErrors: false });
  const pagina = await contexto.newPage();
  const r = { dispositivo: nombre, capturas: [] };
  const inicio = Date.now();
  try {
    const resp = await pagina.goto(url, { waitUntil: "load", timeout: 45000 });
    r.segundosEnCargar = Number(((Date.now() - inicio) / 1000).toFixed(1));
    r.estadoHttp = resp ? resp.status() : null;
    r.urlFinal = pagina.url();
    r.segura = r.urlFinal.startsWith("https://");
    r.tituloPestana = await pagina.title();
  } catch (e) {
    r.error = `No abrió: ${String(e.message || e).split("\n")[0]}`;
    // Algunas páginas sin certificado válido: un cliente vería la advertencia del navegador.
    if (/ERR_CERT|SSL|CERT_/i.test(r.error)) r.advertenciaSeguridad = true;
    try {
      const archivo = path.join(salida, `${nombre}-error.png`);
      await pagina.screenshot({ path: archivo });
      r.capturas.push(archivo);
    } catch {}
    await contexto.close();
    return r;
  }

  await pagina.waitForTimeout(2500); // animaciones, banners de cookies, etc.

  // Recorre la página como alguien que hace scroll, una pantalla a la vez.
  const alto = opcionesContexto.viewport.height;
  const altoTotal = await pagina.evaluate(() => document.documentElement.scrollHeight);
  r.pantallasDeLargo = Number((altoTotal / alto).toFixed(1));
  for (let i = 0; i < MAX_PANTALLAS[nombre]; i++) {
    const y = i * alto;
    if (i > 0 && y >= altoTotal - 40) break;
    await pagina.evaluate((yy) => window.scrollTo(0, yy), y);
    await pagina.waitForTimeout(800);
    const archivo = path.join(salida, `${nombre}-${i + 1}.png`);
    await pagina.screenshot({ path: archivo });
    r.capturas.push(archivo);
  }
  r.pantallasCapturadas = `${r.capturas.length} de ~${Math.ceil(r.pantallasDeLargo)} (lo que no se capturó no se revisó)`;
  await pagina.evaluate(() => window.scrollTo(0, 0));

  // ¿Qué pasa si el cliente toca el botón de contacto más visible?
  try {
    const buscar = async () => {
      const candidato = pagina.getByRole("link").or(pagina.getByRole("button")).filter({ hasText: CONTACTO });
      const visibles = [];
      for (const el of await candidato.all()) {
        if (visibles.length >= 3) break;
        if (await el.isVisible()) visibles.push(el);
      }
      return visibles;
    };
    let visibles = await buscar();
    if (visibles.length === 0) {
      // En celular el contacto suele estar dentro del menú (☰): un cliente lo abriría.
      const menu = pagina.getByRole("button", { name: /men[uú]|navegaci[oó]n|navigation|abrir/i }).first();
      if (await menu.isVisible().catch(() => false)) {
        await menu.click({ timeout: 4000 }).catch(() => {});
        await pagina.waitForTimeout(1000);
        const archivo = path.join(salida, `${nombre}-menu-abierto.png`);
        await pagina.screenshot({ path: archivo }).catch(() => {});
        r.capturas.push(archivo);
        visibles = await buscar();
        if (visibles.length) r.contactoDentroDelMenu = true;
      }
    }
    if (visibles.length === 0) {
      r.botonContacto =
        "El script no encontró un botón con texto de contacto/WhatsApp (puede ser un ícono sin texto): confirmar en las capturas";
    } else {
      const el = visibles[0];
      const texto = ((await el.innerText()) || "").trim().slice(0, 60);
      const popup = contexto.waitForEvent("page", { timeout: 6000 }).catch(() => null);
      const antes = pagina.url();
      await el.click({ timeout: 5000 }).catch(() => {});
      const nueva = await popup;
      await pagina.waitForTimeout(2000);
      const destino = nueva ? nueva.url() : pagina.url();
      const archivo = path.join(salida, `${nombre}-al-tocar-contacto.png`);
      await (nueva || pagina).screenshot({ path: archivo }).catch(() => {});
      r.capturas.push(archivo);
      r.botonContacto = `Botón "${texto}" → ${destino === antes ? "no cambió de página (puede abrir algo en la misma pantalla, revisar captura)" : destino}`;
    }
  } catch (e) {
    r.botonContacto = `No se pudo probar el botón: ${String(e.message || e).split("\n")[0]}`;
  }

  await contexto.close();
  return r;
}

(async () => {
  const browser = await chromium.launch();
  const resumen = { url, revisado: new Date().toISOString(), resultados: [] };
  try {
    resumen.resultados.push(await recorrer(browser, "escritorio", { viewport: { width: 1366, height: 768 } }));
    const { defaultBrowserType, ...pixel } = devices["Pixel 7"];
    resumen.resultados.push(await recorrer(browser, "celular", pixel));
  } finally {
    await browser.close();
  }
  const archivo = path.join(salida, "resumen.json");
  fs.writeFileSync(archivo, JSON.stringify(resumen, null, 2));
  console.log(JSON.stringify(resumen, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
