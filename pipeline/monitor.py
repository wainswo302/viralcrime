"""Disposition monitor — the differentiating pipeline.

For each open case, fetch the latest docket text, detect whether it shows a new
resolution, and if so SUBMIT A DRAFT for human review. It never approves,
never names anyone, and never mutates a case directly. AI watches at scale;
humans gate every consequential change.

Run:
    python monitor.py --demo                     # offline, built-in sample dockets
    API_BASE_URL=... python monitor.py --slugs a b c   # against the live API

Wire a real docket fetcher into `fetch_docket_text` (Playwright/requests against
the court's public records). The demo path supplies canned text so the loop is
runnable end to end without a live source or backend.
"""
from __future__ import annotations
import argparse
from typing import Optional

from detect import detect_change, Proposal
from extract import classify

# Demo dockets keyed by slug — stand-ins for a real court-records fetch.
_DEMO_DOCKETS = {
    "2026-06-11-broad-st-altercation":
        "06/28/2026 Defendant pleaded guilty to summary offense; sentence imposed.",
    "2026-04-02-markley-st-retail-theft":
        "05/01/2026 Status hearing continued.",  # no new resolution -> no draft
}


def fetch_docket_text(slug: str, demo: bool) -> Optional[str]:
    if demo:
        return _DEMO_DOCKETS.get(slug)
    raise NotImplementedError("wire a real docket fetcher here (Playwright/requests)")


def propose_for_case(case: dict, demo: bool) -> Optional[Proposal]:
    """Pure: compute a draft proposal for a case, or None. No network."""
    docket = fetch_docket_text(case["slug"], demo)
    if classify(docket or "") is None:
        return None
    return detect_change(case.get("legalStatus", "NONE_REPORTED"),
                         docket or "",
                         source_url=case.get("docketUrl"))


def run(slugs: list[str], demo: bool) -> int:
    proposed = 0
    cases = _demo_cases(slugs) if demo else _live_cases(slugs)

    for case in cases:
        slug = case["slug"]
        proposal = propose_for_case(case, demo)
        if proposal is None:
            print(f"  no change for {slug}")
            continue
        proposed += 1
        if demo:
            print(f"  DRAFT (simulated) for {slug}: {proposal.proposed_legal_status} "
                  f"— {proposal.detail}")
        else:
            from client import submit_draft
            d = submit_draft(slug, kind=proposal.kind, detail=proposal.detail,
                             proposed_legal_status=proposal.proposed_legal_status,
                             proposed_disposition=proposal.proposed_disposition,
                             source_url=proposal.source_url)
            print(f"  DRAFT queued for {slug}: {d.get('proposedLegalStatus')} "
                  f"(id={d.get('id')}) — awaiting human review")

    print(f"\n{proposed} draft(s) {'simulated' if demo else 'queued for review'}.")
    return proposed


def _demo_cases(slugs: list[str]) -> list[dict]:
    return [{"slug": s, "legalStatus": "CHARGED"} for s in slugs]


def _live_cases(slugs: list[str]) -> list[dict]:
    from client import get_case
    out = []
    for s in slugs:
        c = get_case(s)
        if c:
            out.append(c)
        else:
            print(f"  skip {s}: not found")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Disposition monitor")
    ap.add_argument("--slugs", nargs="*", default=list(_DEMO_DOCKETS.keys()))
    ap.add_argument("--demo", action="store_true", help="use built-in sample dockets, no backend")
    args = ap.parse_args()
    run(args.slugs, args.demo)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
