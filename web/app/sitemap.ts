import type { MetadataRoute } from "next";
import { listCases } from "@/lib/api";
import { allTownSlugs } from "@/lib/towns";

const SITE = process.env.SITE_URL ?? "https://viralcrime.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/cases", "/policy"].map((p) => ({
    url: `${SITE}${p}`, lastModified: now
  }));
  const towns = (await allTownSlugs()).map((s) => ({ url: `${SITE}/towns/${s}`, lastModified: now }));
  const cases = (await listCases()).map((c) => ({ url: `${SITE}/cases/${c.slug}`, lastModified: now }));
  return [...staticPages, ...towns, ...cases];
}
