import type { MetadataRoute } from "next";
import { allFixtureSlugs } from "@/lib/api";
import { allTownSlugs } from "@/lib/towns";

const SITE = process.env.SITE_URL ?? "https://viralcrime.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/cases", "/policy"].map((p) => ({
    url: `${SITE}${p}`, lastModified: now
  }));
  const towns = allTownSlugs().map((s) => ({ url: `${SITE}/towns/${s}`, lastModified: now }));
  const cases = allFixtureSlugs().map((s) => ({ url: `${SITE}/cases/${s}`, lastModified: now }));
  return [...staticPages, ...towns, ...cases];
}
