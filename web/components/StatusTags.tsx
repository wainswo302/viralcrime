import type { CaseDto } from "@/lib/types";
import { provenanceKind, provenanceLabel, legalLabel } from "@/lib/status";

export function StatusTags({ c }: { c: CaseDto }) {
  const pKind = provenanceKind(c.videoProvenance);
  const misattributed = c.claimReviews.some((r) => r.ratingValue < 5);

  return (
    <div className="tags">
      <span className={`tag tag--${pKind}`}>
        <span className="dot" aria-hidden="true" />
        {provenanceLabel(c.videoProvenance)}
      </span>
      {misattributed && (
        <span className="tag tag--caution">
          <span className="dot" aria-hidden="true" />
          Viral claim partly misleading
        </span>
      )}
      <span className="tag tag--neutral">
        <span className="dot" aria-hidden="true" />
        {legalLabel(c.legalStatus)}
      </span>
    </div>
  );
}
