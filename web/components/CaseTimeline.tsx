import type { CaseDto } from "@/lib/types";
import { formatDate, legalLabel } from "@/lib/status";

interface Step { label: string; meta: string; pending?: boolean; }

/**
 * A docket-style timeline derived from the case's state and legal status.
 * (A fuller event log will come from the audit table in a later phase.)
 */
function buildSteps(c: CaseDto): Step[] {
  const steps: Step[] = [];
  const d = formatDate(c.incidentDate);

  steps.push({ label: "Surfaced & verified", meta: `${d} — footage confirmed, event framed` });

  if (["CHARGED", "PLEA", "CONVICTED", "ACQUITTED", "DISMISSED"].includes(c.legalStatus)) {
    steps.push({ label: legalLabel(c.legalStatus), meta: "per official record" });
  }

  if (c.state === "RESOLVED" && c.disposition) {
    steps.push({ label: "Resolved", meta: c.disposition });
  } else if (c.state !== "RETRACTED") {
    steps.push({ label: "Awaiting disposition", meta: "monitoring docket — updates automatically", pending: true });
  }
  return steps;
}

export function CaseTimeline({ c }: { c: CaseDto }) {
  const steps = buildSteps(c);
  return (
    <section>
      <h2 className="section-title">Case timeline</h2>
      <ol className="timeline">
        {steps.map((s, i) => (
          <li className="tl" key={i}>
            <div className="tl__rail">
              <span className={`tl__dot ${s.pending ? "tl__dot--pending" : ""}`} aria-hidden="true" />
              <span className="tl__line" aria-hidden="true" />
            </div>
            <div>
              <p className={`tl__label ${s.pending ? "tl__label--pending" : ""}`}>{s.label}</p>
              <p className="tl__meta">{s.meta}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
