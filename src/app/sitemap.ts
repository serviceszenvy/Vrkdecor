import type { MetadataRoute } from "next";

const routes = ["", "/our-work", "/services", "/packages", "/gallery", "/about", "/contact", "/quote", "/privacy-policy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `https://www.vrkdecor.com${r}`,
    lastModified: new Date(),
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
