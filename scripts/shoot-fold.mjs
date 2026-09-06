import { chromium } from "playwright";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-background-networking", "--force-color-profile=srgb"],
});
for (const [name, vp, dsf] of [["home-desktop-fold", { width: 1440, height: 900 }, 2], ["home-mobile-fold", { width: 390, height: 844 }, 3]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dsf, isMobile: vp.width < 700, hasTouch: vp.width < 700 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3210/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(3200);
  await p.screenshot({ path: `shots/${name}.png` });
  await ctx.close();
}
await b.close();
console.log("fold shots done");
