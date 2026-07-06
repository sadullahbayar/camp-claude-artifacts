// Carousel → PNG export function
// Boots headless Chromium, renders the posted HTML, screenshots ONE slide per call
// (per-slide calls keep request/response under Netlify's ~6MB payload limits).

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const TARGET_W = 1080;
const TARGET_H = 1350;
const RATIO = TARGET_W / TARGET_H;

const KNOWN_SELECTORS = ["[data-slide]", ".slide", ".carousel-slide", ".post"];

let browserPromise = null; // reused across warm invocations

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1400, height: 1600, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }
  return browserPromise;
}

async function prepare(page, html, selector) {
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 20000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img =>
      img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
  });
  await new Promise(r => setTimeout(r, 300)); // let bundler scripts settle

  // tag slides, return count + first slide width
  return page.evaluate(({ selector, KNOWN_SELECTORS, RATIO }) => {
    const fits = el => {
      const r = el.getBoundingClientRect();
      return r.width >= 300 && r.height >= 300 && Math.abs(r.width / r.height - RATIO) < 0.03;
    };
    let els = [];
    if (selector) els = [...document.querySelectorAll(selector)];
    if (!els.length) {
      for (const s of KNOWN_SELECTORS) {
        els = [...document.querySelectorAll(s)].filter(fits);
        if (els.length) break;
      }
    }
    if (!els.length) {
      const c = [...document.querySelectorAll("body *")].filter(fits);
      els = c.filter(el => !c.some(o => o !== el && o.contains(el)));
    }
    els.forEach((el, i) => el.setAttribute("data-export-slide", i));
    return { count: els.length, width: els.length ? els[0].getBoundingClientRect().width : 0 };
  }, { selector: selector || null, KNOWN_SELECTORS, RATIO });
}

export default async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const { html, slide = 0, selector } = await req.json();
  if (!html) return new Response(JSON.stringify({ error: "missing html" }), { status: 400 });

  const browser = await getBrowser();
  const page = await (await browser).newPage();
  try {
    let info = await prepare(page, html, selector);
    if (!info.count) {
      return Response.json({ error: "No 4:5 slides found", count: 0 });
    }

    // re-render at exact scale so output is 1080x1350
    const scale = TARGET_W / info.width;
    if (Math.abs(scale - 1) > 0.001) {
      await page.setViewport({ width: 1400, height: 1600, deviceScaleFactor: scale });
      info = await prepare(page, html, selector);
    }

    const el = await page.$(`[data-export-slide="${slide}"]`);
    if (!el) return Response.json({ error: `slide ${slide} not found`, count: info.count });
    await el.scrollIntoView();
    await new Promise(r => setTimeout(r, 100));
    const png = await el.screenshot({ type: "png", encoding: "base64" });

    return Response.json({ count: info.count, slide, png });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  } finally {
    await page.close();
  }
};

export const config = { path: "/api/export" };
