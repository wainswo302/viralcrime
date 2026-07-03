import type { CaseDto } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  OFFICIAL_RECORD: "official record",
  MAINSTREAM_COVERAGE: "mainstream coverage",
  OTHER: "source"
};

export function SourceList({ c }: { c: CaseDto }) {
  if (c.sources.length === 0) return null;
  return (
    <section>
      <h2 className="section-title">Sources</h2>
      <ul className="sources">
        {c.sources.map((s) => (
          <li className="source" key={s.url}>
            <span className="source__type">{TYPE_LABEL[s.type] ?? s.type}</span>
            <a href={s.url}>{s.label ?? s.url}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
