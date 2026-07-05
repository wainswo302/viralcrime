"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/AdminAuth";
import { fetchPendingDrafts, approveDraft, rejectDraft, type DraftDto } from "@/lib/adminApi";

export default function ReviewQueuePage() {
  const { session } = useAdminAuth();
  const [drafts, setDrafts] = useState<DraftDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function load() {
    if (!session) return;
    try {
      setDrafts(await fetchPendingDrafts(session.header));
    } catch {
      setError("Failed to load the review queue.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function act(id: string, action: "approve" | "reject") {
    if (!session) return;
    setActingOn(id);
    setError(null);
    try {
      const fn = action === "approve" ? approveDraft : rejectDraft;
      await fn(id, session.header, session.username);
      await load();
    } catch {
      setError(`Failed to ${action} draft ${id}.`);
    } finally {
      setActingOn(null);
    }
  }

  return (
    <>
      <h1 className="headline" style={{ fontSize: "2rem" }}>Review queue</h1>
      <p className="lede" style={{ fontSize: "1rem" }}>
        Pending drafts from the pipeline and the intake form. Approving a <code>NEW_CASE</code> draft
        creates the case <code>SURFACED</code> — still needs to be verified and promoted by hand.
      </p>

      {error && <p className="error-text">{error}</p>}

      {drafts === null && !error && <p>Loading…</p>}
      {drafts !== null && drafts.length === 0 && <p>Nothing pending.</p>}

      {drafts?.map((d) => (
        <div className="admin-card" key={d.id}>
          <div className="admin-card__row">
            <div>
              <p style={{ margin: 0, fontWeight: 500 }}>{d.proposedHeadline ?? d.detail}</p>
              <p className="incident__m" style={{ marginTop: "0.3rem" }}>
                {d.kind} · case: {d.caseSlug} · by {d.createdBy}
              </p>
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "var(--ink-soft)", margin: "0 0 0.4rem" }}>{d.detail}</p>
          {d.sourceUrl && (
            <p style={{ fontSize: "13px" }}>
              <a href={d.sourceUrl} target="_blank" rel="noreferrer">{d.sourceUrl}</a>
            </p>
          )}
          {d.proposedLegalStatus && (
            <p className="incident__m">Proposed legal status: {d.proposedLegalStatus}</p>
          )}
          <div className="admin-card__actions">
            <button
              className="btn btn--ok"
              disabled={actingOn === d.id}
              onClick={() => act(d.id, "approve")}
            >
              {actingOn === d.id ? "Working…" : "Approve"}
            </button>
            <button
              className="btn btn--danger"
              disabled={actingOn === d.id}
              onClick={() => act(d.id, "reject")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
