"""Thin API client for the ViralCrime Spring Boot service."""
from __future__ import annotations
import os
from typing import Any, Optional
import requests

BASE = os.environ.get("API_BASE_URL", "http://localhost:8080")
TIMEOUT = 15

# Everything under /api/drafts/** requires the shared admin credential;
# GET /api/cases/** stays public and needs no auth.
_ADMIN_AUTH = (os.environ.get("ADMIN_USERNAME", ""), os.environ.get("ADMIN_PASSWORD", ""))


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
    r = requests.post(f"{BASE}/api/cases/{slug}/drafts", json=payload, auth=_ADMIN_AUTH, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def submit_new_case_draft(*, headline: str, event_type: str,
                          jurisdiction_city: str, jurisdiction_state: str,
                          video_url: str,
                          incident_date: Optional[str] = None,
                          created_by: str = "intake-agent") -> dict[str, Any]:
    """Propose a brand-new case from a video link. Lands as a PENDING draft;
    approving it creates the case SURFACED, for a human to verify and promote."""
    payload = {
        "headline": headline,
        "eventType": event_type,
        "jurisdictionCity": jurisdiction_city,
        "jurisdictionState": jurisdiction_state,
        "incidentDate": incident_date,
        "videoUrl": video_url,
        "createdBy": created_by,
    }
    r = requests.post(f"{BASE}/api/drafts/new-case", json=payload, auth=_ADMIN_AUTH, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()
