// Client-side API calls for the /admin dashboard. Runs in the browser, so it
// needs NEXT_PUBLIC_API_BASE_URL (plain env vars aren't visible to client code)
// and sends the admin credential explicitly on every call — no cookies/sessions.
import type { CaseDto, CaseSummaryDto } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export interface DraftDto {
  id: string;
  caseSlug: string;
  kind: string;
  status: string;
  proposedLegalStatus: string | null;
  proposedDisposition: string | null;
  detail: string;
  sourceUrl: string | null;
  createdBy: string;
  proposedHeadline: string | null;
  proposedEmbedUrl: string | null;
}

async function adminFetch(path: string, authHeader: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: authHeader }
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
}

/** Returns true if the credential is valid, without caring what it returns. */
export async function verifyCredentials(authHeader: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/drafts`, { headers: { Authorization: authHeader } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPendingDrafts(authHeader: string): Promise<DraftDto[]> {
  const res = await adminFetch("/api/drafts", authHeader);
  return res.json();
}

export async function approveDraft(id: string, authHeader: string, reviewer: string): Promise<DraftDto> {
  const res = await adminFetch(`/api/drafts/${id}/approve`, authHeader, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewer })
  });
  return res.json();
}

export async function rejectDraft(id: string, authHeader: string, reviewer: string): Promise<DraftDto> {
  const res = await adminFetch(`/api/drafts/${id}/reject`, authHeader, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewer })
  });
  return res.json();
}

export interface NewCaseDraftInput {
  headline: string;
  eventType: string;
  jurisdictionCity: string;
  jurisdictionState: string;
  videoUrl: string;
  incidentDate?: string; // YYYY-MM-DD, omit if unknown
}

export async function submitNewCaseDraft(input: NewCaseDraftInput, authHeader: string, createdBy: string): Promise<DraftDto> {
  const res = await adminFetch("/api/drafts/new-case", authHeader, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, createdBy })
  });
  return res.json();
}

/** Every case regardless of state — the public list only shows published ones. */
export async function fetchAllCases(authHeader: string): Promise<CaseSummaryDto[]> {
  const res = await adminFetch("/api/admin/cases", authHeader);
  return res.json();
}

/** Full case detail is public — no auth needed to read it, editing is what's gated. */
export async function fetchCase(slug: string): Promise<CaseDto | null> {
  const res = await fetch(`${API_BASE}/api/cases/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export interface CaseEditInput {
  headline: string;
  summary: string | null;
  eventType: string;
  jurisdictionCity: string;
  jurisdictionCounty: string | null;
  jurisdictionState: string;
  incidentDate: string | null;
  locationBlock: string | null;
  videoProvenance: string;
  videoNotes: string | null;
  legalStatus: string;
  disposition: string | null;
  monitoringActive: boolean;
  tags: string[];
}

export async function updateCase(slug: string, input: CaseEditInput, authHeader: string): Promise<CaseDto> {
  const res = await adminFetch(`/api/admin/cases/${slug}`, authHeader, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return res.json();
}

/** Throws with the guard's message (e.g. "Cannot move to RESOLVED without a
 * recorded disposition") if the lifecycle service rejects the transition. */
export async function transitionCase(slug: string, targetState: string, authHeader: string): Promise<CaseDto> {
  const res = await fetch(`${API_BASE}/api/admin/cases/${slug}/transition`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ targetState })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `${res.status} ${res.statusText}`);
  return body;
}

export async function addEmbed(slug: string, url: string, authHeader: string): Promise<CaseDto> {
  const res = await adminFetch(`/api/admin/cases/${slug}/embed`, authHeader, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  return res.json();
}
