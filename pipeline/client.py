"""Thin API client for the ViralCrime Spring Boot service."""
from __future__ import annotations
import os
from typing import Any, Optional
import requests

BASE = os.environ.get("API_BASE_URL", "http://localhost:8080")
TIMEOUT = 15


def get_case(slug: str) -> Optional[dict[str, Any]]:
    r = requests.get(f"{BASE}/api/cases/{slug}", timeout=TIMEOUT)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()


def submit_draft(slug: str, *, kind: str, detail: str,
                 proposed_legal_status: Optional[str] = None,
                 proposed_disposition: Optional[str] = None,
                 source_url: Optional[str] = None,
                 created_by: str = "monitor") -> dict[str, Any]:
    """Submit a PENDING draft. This never mutates a case — a human approves it."""
    payload = {
        "kind": kind,
        "detail": detail,
        "proposedLegalStatus": proposed_legal_status,
        "proposedDisposition": proposed_disposition,
        "sourceUrl": source_url,
        "createdBy": created_by,
    }
    r = requests.post(f"{BASE}/api/cases/{slug}/drafts", json=payload, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()
