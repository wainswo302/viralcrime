import type { CaseDto } from "@/lib/types";
import { provenanceKind, provenanceLabel } from "@/lib/status";

/** The signature block: reads like an evidence tag on the case file. */
export function VerificationRecord({ c }: { c: CaseDto }) {
  const kind = provenanceKind(c.videoProvenance);
  const topClaim = c.claimReviews[0];

  return (
    <section className="record" aria-label="Verification record">
      <div className={`record__rail record__rail--${kind}`} />
      <div className="record__body">
        <p className="record__title">Verification record</p>

        <div className="record__row">
          <span className="record__key">authenticity</span>
          <span className="record__val">{provenanceLabel(c.videoProvenance)}</span>
        </div>
        {c.videoNotes && (
          <div className="record__row">
            <span className="record__key">method</span>
            <span className="record__val">{c.videoNotes}</span>
          </div>
        )}
        {topClaim && (
          <div className="record__row">
            <span className="record__key">viral claim</span>
            <span className="record__val record__val--caution">{topClaim.ratingName}</span>
          </div>
        )}
      </div>
    </section>
  );
}
