// Client-side API calls for the /admin dashboard. Runs in the browser, so it
// needs NEXT_PUBLIC_API_BASE_URL (plain env vars aren't visible to client code)
// and sends the admin credential explicitly on every call — no cookies/sessions.
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
