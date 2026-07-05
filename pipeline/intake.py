"""Story intake — the "structure" stage of the AI-assisted pipeline
(resolved-case-database-spec.md §6, stage 3).

Takes a raw social media link and a short note describing what's in it, and
proposes structured NEW_CASE draft fields for human review. Like every other
pipeline output, this never creates a case directly — it submits a PENDING
draft through the same human-approval queue.

Run:
    python intake.py --url <video-url> --note "<what's in the clip>"

Requires ANTHROPIC_API_KEY for automated extraction. Without one (or if the
LLM call fails), falls back to prompting you for each field directly —
slower, but the tool stays usable.
"""
from __future__ import annotations
import argparse
import json
import os
from typing import Optional

_REQUIRED_FIELDS = ("headline", "event_type", "jurisdiction_city", "jurisdiction_state")


def extract_fields(note: str, url: str) -> Optional[dict]:
    """LLM-assisted structuring. Returns None on missing key or any failure —
    the caller falls back to asking the human directly."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return None
    try:
        return _extract_llm(note, url)
    except Exception:
        return None


def _extract_llm(note: str, url: str) -> Optional[dict]:
    import anthropic  # optional dependency
    client = anthropic.Anthropic()
    prompt = (
        "You are structuring a raw note about a viral video into a fixed schema "
        "for a public-record crime-tracking site. Return strict JSON with keys: "
        "headline (string, event-framed — never a private individual's name; "
        "describe their role instead, e.g. 'a customer', 'a driver'), "
        "event_type (short lowercase category, e.g. assault, retail_theft, vandalism, robbery), "
        "jurisdiction_city (string), "
        "jurisdiction_state (2-letter USPS code), "
        "incident_date (ISO date guess from the note, or null if not stated). "
        "No prose, no markdown fences, just the JSON object.\n\n"
        f"Note: {note}\n"
        f"Video URL: {url}"
    )
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    data = json.loads(text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip())
    if not all(data.get(f) for f in _REQUIRED_FIELDS):
        return None
    return data


def prompt_for_fields() -> dict:
    """No API key (or the LLM pass failed) — ask directly instead of guessing."""
    print("No structured extraction available — fill these in yourself:")
    return {
        "headline": input("Headline (event-framed, no private names): ").strip(),
        "event_type": input("Event type (e.g. assault, retail_theft): ").strip(),
        "jurisdiction_city": input("City: ").strip(),
        "jurisdiction_state": input("State (2-letter): ").strip().upper(),
        "incident_date": input("Incident date (YYYY-MM-DD, blank if unknown): ").strip() or None,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Structure a raw story into a NEW_CASE draft")
    ap.add_argument("--url", required=True, help="the social media video/post URL")
    ap.add_argument("--note", required=True, help="a short raw description of what's in the clip")
    ap.add_argument("--yes", action="store_true", help="skip the confirmation prompt")
    ap.add_argument("--created-by", default="intake-agent")
    args = ap.parse_args()

    fields = extract_fields(args.note, args.url) or prompt_for_fields()

    print("\nProposed draft:")
    for k, v in fields.items():
        print(f"  {k}: {v}")

    if not args.yes:
        if input("\nSubmit this as a PENDING draft for review? [y/N] ").strip().lower() != "y":
            print("Not submitted.")
            return 0

    from client import submit_new_case_draft
    d = submit_new_case_draft(
        headline=fields["headline"],
        event_type=fields["event_type"],
        jurisdiction_city=fields["jurisdiction_city"],
        jurisdiction_state=fields["jurisdiction_state"],
        incident_date=fields.get("incident_date"),
        video_url=args.url,
        created_by=args.created_by,
    )
    base = os.environ.get("API_BASE_URL", "http://localhost:8080")
    print(f"\nDraft queued (id={d.get('id')}), case slug will be {d.get('caseSlug')} once approved.")
    print(f"Review it: curl {base}/api/drafts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
