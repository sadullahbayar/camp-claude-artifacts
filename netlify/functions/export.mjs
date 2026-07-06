// HTML → image export function v2
// Modes:
//   { html, inspect: true, force? }                          -> { groups, fontErrors }
//   { html, slide: "4x5-2", scale?, img?, quality?, force? } -> { data: base64, img: png|jpeg }
// One slide per render call keeps payloads under Netlify's ~6MB limits.

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const FORMATS = {
  "4x5":  { label: "Portrait 4:5",     ratio: 4 / 5,   w: 1080, h: 1350 },
  "1x1":  { label: "Square 1:1",       ratio: 1,       w: 1080, h: 1080 },
  "9x16": { label: "Story/Reel 9:16",  ratio: 9 / 16,  w: 1080, h: 1920 },
  "wide": { label: "Landscape 1.91:1", ratio: 1.91,    w: 1200, h: 627 },
};

// Lambda Chromium ships with NO system fonts, so glyphs missing from the
// design's webfonts (→ ✦ ★ ✓ …) render as tofu. We install fallback fonts once
// per instance; Chromium then borrows glyphs from them automatically, like a
// desktop browser. chromium.font() symlinks the file into $HOME/.fonts BEFORE
// launch. These fonts are BUNDLED with the function (netlify.toml included_files)
// so there is no cold-start network dependency; a corrected remote URL is kept
// only as a last resort if the bundled file can't be located at runtime.
// Coverage (verified via fonttools): DejaVu Sans covers →/✦/✓/★/•; Noto Sans
// Symbols adds arrows/misc, Noto Sans Symbols 2 adds dingbats/geometric shapes.
const FONTS = [
  { file: "DejaVuSans.ttf",
    url: "https://raw.githubusercontent.com/matplotlib/matplotlib/main/lib/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf" },
  { file: "NotoSansSymbols.ttf",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssymbols/NotoSansSymbols%5Bwght%5D.ttf" },
  { file: "NotoSansSymbols2-Regular.ttf",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssymbols2/NotoSansSymbols2-Regular.ttf" },
];

let fontsPromise = null;
let browserPromise = null;
let fontStatus = []; // QA: which fonts loaded, and from where

function localFontPath(file) {
  let here = null;
  try { here = fileURLToPath(new URL("./fonts/" + file, import.meta.url)); } catch {}
  const candidates = [
    join(process.cwd(), "fonts", file),
    process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, "fonts", file) : null,
    here,
    join("/var/task/fonts", file),
  ].filter(Boolean);
  return candidates.find(p => existsSync(p)) || null;
}

function installFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(FONTS.map(async ({ file, url }) => {
      const local = localFontPath(file);
      const src = local || url;
      try {
        await chromium.font(src);
        fontStatus.push({ font: file, source: local ? "bundled" : "remote", ok: true });
      } catch (e) {
        fontStatus.push({ font: file, source: local ? "bundled" : "remote", ok: false, error: String(e) });
        console.warn("font install failed:", file, "via", local ? "bundled" : "remote", String(e));
      }
    }));
  }
  return fontsPromise;
}

async function getBrowser() {
  if (!browserPromise) {
    await installFonts();
    browserPromise = puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1500, height: 2100, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }
  return browserPromise;
}

const DETECT = ({ FORMATS, force }) => {
  const tol = force ? 0.12 : 0.04;
  const entries = force ? [[force, FORMATS[force]]] : Object.entries(FORMATS);
  const match = el => {
    const r = el.getBoundingClientRect();
    if (r.width < 200 || r.height < 200) return null;
    const ratio = r.width / r.height;
    for (const [key, f] of entries)
      if (Math.abs(ratio / f.ratio - 1) < tol) return key;
    return null;
  };
  let cands = [...document.querySelectorAll("body *")]
    .map(el => ({ el, key: match(el) })).filter(c => c.key);
  const els = cands.map(c => c.el);
  cands = cands.filter(c => !els.some(o => o !== c.el && o.contains(c.el)));
  const byKey = {};
  cands.forEach(c => (byKey[c.key] ??= []).push(c));
  const groups = [];
  for (const [key, list] of Object.entries(byKey)) {
    list.forEach((c, i) => c.el.setAttribute("data-export-slide", `${key}-${i}`));
    groups.push({
      key,
      count: list.length,
      width: list[0].el.getBoundingClientRect().width,
      slides: list.map(c => {
        const sr = c.el.getBoundingClientRect();
        let ov = 0;
        for (const d of c.el.querySelectorAll("*")) {
          if (![...d.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          if (d.closest("[data-bleed]")) continue;
          const cs = getComputedStyle(d);
          const m = cs.color.match(/rgba?\(([^)]+)\)/);
          const alpha = m && m[1].split(",")[3] !== undefined ? parseFloat(m[1].split(",")[3]) : 1;
          if (parseFloat(cs.opacity) * alpha < 0.35) continue;
          const r = d.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          ov = Math.max(ov, r.right - sr.right, sr.left - r.left,
            r.bottom - sr.bottom, sr.top - r.top);
        }
        return { overflow: Math.max(0, Math.round(ov)),
          alt: c.el.getAttribute("data-alt") || null };
      }),
    });
  }
  groups.sort((a, b) => b.count - a.count);
  const fontErrors = [...new Set([...document.fonts]
    .filter(f => f.status === "error").map(f => f.family))];
  return { groups, fontErrors };
};

async function prepare(page, html, force) {
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 20000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img =>
      img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
  });
  await new Promise(r => setTimeout(r, 300));
  return page.evaluate(DETECT, { FORMATS, force: force || null });
}

export default async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const { html, inspect, slide, scale = 1, img = "png", quality = 92, force } = await req.json();
  if (!html) return Response.json({ error: "missing html" }, { status: 400 });

  const browser = await getBrowser();
  const page = await (await browser).newPage();
  try {
    let info = await prepare(page, html, force);

    if (inspect) {
      info.groups.forEach(g => {
        g.label = FORMATS[g.key].label;
        g.outW = FORMATS[g.key].w;
        g.outH = FORMATS[g.key].h;
      });
      info.systemFonts = fontStatus;
      return Response.json(info);
    }

    const key = String(slide).split("-")[0];
    const fmt = FORMATS[key];
    const group = info.groups.find(g => g.key === key);
    if (!fmt || !group) return Response.json({ error: `no slides for format ${key}` });

    const mult = Math.min(Math.max(Number(scale) || 1, 0.5), 3);
    const dsf = (fmt.w * mult) / group.width;
    if (Math.abs(dsf - 1) > 0.001) {
      await page.setViewport({ width: 1500, height: 2100, deviceScaleFactor: dsf });
      await prepare(page, html, force);
    }

    const el = await page.$(`[data-export-slide="${slide}"]`);
    if (!el) return Response.json({ error: `slide ${slide} not found` });
    await el.scrollIntoView();
    await new Promise(r => setTimeout(r, 100));

    let type = img === "jpeg" ? "jpeg" : "png";
    const opts = type === "jpeg"
      ? { type, quality: Math.min(Math.max(Number(quality) || 92, 40), 100) }
      : { type };
    let data = await el.screenshot({ ...opts, encoding: "base64" });
    let note = null;
    if (type === "png" && data.length > 4_800_000) {
      data = await el.screenshot({ type: "jpeg", quality: 92, encoding: "base64" });
      type = "jpeg";
      note = "png too large for serverless response — returned jpeg q92";
    }
    return Response.json({ slide, img: type, data, note, w: Math.round(fmt.w * mult), h: Math.round(fmt.h * mult) });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  } finally {
    await page.close();
  }
};

export const config = { path: "/api/export" };
