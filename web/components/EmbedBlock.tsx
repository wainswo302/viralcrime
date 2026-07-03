import type { CaseDto } from "@/lib/types";

/**
 * Renders native platform embeds when present. Until the pipeline populates
 * embed refs, shows the placeholder — and the copy states the policy: embeds
 * are served by the platform and never rehosted here.
 */
export function EmbedBlock({ c }: { c: CaseDto }) {
  if (c.embedRefs.length === 0) {
    return (
      <div className="embed">
        <p className="embed__label">
          Native platform embed — original post, served by the platform.
          <br />
          Deletable at source. Never rehosted here.
        </p>
      </div>
    );
  }
  return (
    <div className="embed">
      {c.embedRefs.map((url) => (
        <p key={url} className="embed__label">
          <a href={url}>{url}</a>
        </p>
      ))}
    </div>
  );
}
