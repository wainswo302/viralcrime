"""Disposition extraction: LLM-assisted when a key is present, deterministic
heuristic otherwise. Both return the same (status, disposition) shape, so the
monitor behaves identically with or without an LLM available.

The LLM only ever *classifies text into the fixed schema* — it does not decide
to publish anything. Every result still flows through the human-review draft
queue.
"""
from __future__ import annotations
import json
import os
from typing import Optional

from detect import classify_disposition  # deterministic fallback

_ALLOWED = {"NONE_REPORTED", "CHARGED", "PLEA", "CONVICTED",
            "ACQUITTED", "DISMISSED", "EXPUNGED"}


def classify(docket_text: str) -> Optional[tuple[str, str]]:
    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            return _classify_llm(docket_text)
        except Exception:
            pass  # fall back to the deterministic path on any error
    return classify_disposition(docket_text)


def _classify_llm(docket_text: str) -> Optional[tuple[str, str]]:
    import anthropic  # optional dependency
    client = anthropic.Anthropic()
    prompt = (
        "You are classifying a court docket excerpt into a fixed schema. "
        f"Return strict JSON: {{\"status\": one of {sorted(_ALLOWED)} or null, "
        "\"disposition\": short human sentence or null}}. No prose.\n\n"
        f"Docket:\n{docket_text}"
    )
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    data = json.loads(text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip())
    status = data.get("status")
    if status not in _ALLOWED:
        return None
    return status, data.get("disposition") or status
