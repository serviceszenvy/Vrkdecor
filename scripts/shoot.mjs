import { chromium } from "playwright";
import fs from "node:fs";

/**
 * Full-page capture by stitching viewport tiles.
 *
 * A single fullPage screenshot is unreliable here: the design leans on
 * backdrop-filter, and Chromium's capture-beyond-viewport path drops those
 * composited layers, so large stretches come back blank. Scrolling and
 * stitching renders every tile normally.
 */
const BASE = process.env.BASE || "http://localhost:3210";
const routes = (process.env.ROUTES || "/").split(",");

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: [
    "--no-sandbox",
    "--force-color-profile=srgb",
    "--font-render-hinting=none",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--no-first-run",
    "--disable-features=Translate,OptimizationHints",
  ],
});

async function shoot(name, route, viewport, dsf) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: dsf,
    isMobile: viewport.width < 700,
    hasTouch: viewport.width < 700,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(1000);

  // walk the page once so every scroll reveal and count-up has fired
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(900);

  const total = await page.evaluate(() => document.body.scrollHeight);
  const vh = viewport.height;
  const tiles = [];
  const stride = vh - 140; // overlap so seam artefacts get overwritten by the next tile
  for (let y = 0; y < total; y += stride) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(650);
    // the sticky header would repeat in every tile after the first
    if (y > 0) await page.evaluate(() => (document.querySelector("header").style.visibility = "hidden"));
    const buf = await page.screenshot({ animations: "disabled" });
    const real = await page.evaluate(() => window.scrollY);
    tiles.push({ buf, y: real });
  }
  await page.evaluate(() => (document.querySelector("header").style.visibility = ""));

  fs.mkdirSync(`shots/.tiles-${name}`, { recursive: true });
  tiles.forEach((t, i) => fs.writeFileSync(`shots/.tiles-${name}/${String(i).padStart(3, "0")}_${t.y}.png`, t.buf));
  fs.writeFileSync(
    `shots/.tiles-${name}/manifest.json`,
    JSON.stringify({ total, vh, dsf, width: viewport.width, ys: tiles.map((t) => t.y) })
  );

  if (errors.length) console.log(`[${name}] page errors:`, errors.slice(0, 3));
  await ctx.close();
}

for (const route of routes) {
  const slug = route === "/" ? "home" : route.replace(/\//g, "").replace(/\?.*/, "");
  await shoot(`${slug}-desktop`, route, { width: 1440, height: 900 }, 2);
  await shoot(`${slug}-mobile`, route, { width: 390, height: 844 }, 3);
}

await browser.close();
console.log("tiles captured");
