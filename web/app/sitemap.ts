import type { MetadataRoute } from "next";
import { listCases } from "@/lib/api";
import { allTownSlugs, allLocationParams, allBlotterParams } from "@/lib/towns";
import { allTagSlugs } from "@/lib/tags";

const SITE = process.env.SITE_URL ?? "https://viralcrime.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/cases", "/towns", "/tags", "/search", "/about", "/policy"].map((p) => ({
    url: `${SITE}${p}`, lastModified: now
  }));
  const towns = (await allTownSlugs()).map((s) => ({ url: `${SITE}/towns/${s}`, lastModified: now }));
  const locations = (await allLocationParams()).map((l) => ({
    url: `${SITE}/towns/${l.slug}/${l.street}`, lastModified: now
  }));
  const blotters = (await allBlotterParams()).map((b) => ({
    url: `${SITE}/towns/${b.slug}/blotter/${b.period}`, lastModified: now
  }));
  const tags = (await allTagSlugs()).map((s) => ({ url: `${SITE}/tags/${s}`, lastModified: now }));
  const cases = (await listCases()).map((c) => ({ url: `${SITE}/cases/${c.slug}`, lastModified: now }));
  return [...staticPages, ...towns, ...locations, ...blotters, ...tags, ...cases];
}
