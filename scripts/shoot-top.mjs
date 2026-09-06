import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-background-networking", "--force-color-profile=srgb", "--font-render-hinting=none"],
});
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto("http://localhost:3210/", { waitUntil: "domcontentloaded" });
await p.waitForLoadState("load").catch(() => {});
await p.waitForTimeout(3400);
await p.screenshot({ path: "shots/home-desktop-top.png" });
console.log("errors:", errs.length ? errs.slice(0, 3) : "none");
await b.close();
