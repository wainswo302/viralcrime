"""Pure, dependency-free disposition detection.

The monitor's core job: given a case's current legal status and freshly-fetched
docket text, decide whether the docket shows a NEW resolution worth proposing.
Kept free of network/LLM/deps so it is trivially testable and deterministic.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
import re

# Ordered longest/most-specific first so "guilty plea" wins over "guilty".
_RULES = [
    (r"\bexpunged\b|\bsealed\b",                       "EXPUNGED",  "Record expunged/sealed."),
    (r"\bacquitted\b|\bfound not guilty\b|\bnot guilty\b", "ACQUITTED", "Acquitted / found not guilty."),
    (r"\bdismissed\b|\bnolle prosequi\b|\bnol pros\b",  "DISMISSED", "Charges dismissed."),
    (r"\bpleaded guilty\b|\bpled guilty\b|\bguilty plea\b|\bfound guilty\b|\bconvicted\b", "CONVICTED", "Guilty plea or conviction entered."),
    (r"\bplea\b|\barraign",                             "PLEA",      "Plea entered / arraignment."),
    (r"\bcharged\b|\bcharges filed\b|\bindicted\b",     "CHARGED",   "Charges filed."),
]

# Rank so we only propose forward-moving or terminal changes, not regressions.
_RANK = {
    "NONE_REPORTED": 0, "CHARGED": 1, "PLEA": 2,
    "CONVICTED": 3, "ACQUITTED": 3, "DISMISSED": 3, "EXPUNGED": 4,
}


@dataclass(frozen=True)
class Proposal:
    kind: str
    proposed_legal_status: str
    proposed_disposition: str
    detail: str
    source_url: Optional[str] = None


def classify_disposition(docket_text: str) -> Optional[tuple[str, str]]:
    """Map raw docket text to (legal_status, human_disposition), or None."""
    if not docket_text:
        return None
    t = docket_text.lower()
    for pattern, status, disposition in _RULES:
        if re.search(pattern, t):
            return status, disposition
    return None


def detect_change(current_status: str, docket_text: str,
                  source_url: Optional[str] = None) -> Optional[Proposal]:
    """Return a Proposal if the docket shows a new, forward-moving status.

    Never proposes a regression (e.g. CONVICTED -> CHARGED) and never proposes
    a no-op. The monitor only ever *proposes* — a human approves via the API.
    """
    found = classify_disposition(docket_text)
    if found is None:
        return None
    status, disposition = found
    if status == current_status:
        return None
    if _RANK.get(status, 0) <= _RANK.get(current_status, 0):
        return None  # not a forward move; ignore noise
    return Proposal(
        kind="DISPOSITION_UPDATE",
        proposed_legal_status=status,
        proposed_disposition=disposition,
        detail=f"Docket now indicates {status}: {disposition} "
               f"(was {current_status}).",
        source_url=source_url,
    )
