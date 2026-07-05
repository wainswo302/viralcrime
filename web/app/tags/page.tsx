import type { Metadata } from "next";
import { allTags } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Tags | ViralCrime",
  description: "Browse cases by event type and topic."
};

export default async function TagsIndex() {
  const tags = await allTags();
  return (
    <main className="wrap">
      <p className="eyebrow">Tag index</p>
      <h1 className="headline">Tags</h1>
      <ul className="incidents">
        {tags.map((t) => (
          <a className="incident" key={t.slug} href={`/tags/${t.slug}`}>
            <span className="incident__t">{t.label}</span>
            <span className="incident__m">{t.count} case{t.count === 1 ? "" : "s"}</span>
          </a>
        ))}
      </ul>
    </main>
  );
}
