"use client";

import { useState } from "react";
import { useAdminAuth } from "@/components/AdminAuth";
import { submitNewCaseDraft, type DraftDto } from "@/lib/adminApi";

const initialForm = {
  videoUrl: "",
  headline: "",
  eventType: "",
  jurisdictionCity: "",
  jurisdictionState: "",
  incidentDate: ""
};

export default function NewStoryPage() {
  const { session } = useAdminAuth();
  const [form, setForm] = useState(initialForm);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DraftDto | null>(null);

  function set<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const draft = await submitNewCaseDraft(
        {
          videoUrl: form.videoUrl,
          headline: form.headline,
          eventType: form.eventType,
          jurisdictionCity: form.jurisdictionCity,
          jurisdictionState: form.jurisdictionState.toUpperCase(),
          incidentDate: form.incidentDate || undefined
        },
        session.header,
        session.username
      );
      setResult(draft);
      setForm(initialForm);
    } catch {
      setError("Submission failed — check the fields and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="headline" style={{ fontSize: "2rem" }}>New story</h1>
      <p className="lede" style={{ fontSize: "1rem" }}>
        Submits a <code>NEW_CASE</code> draft — nothing is created until it's approved from the
        review queue. For AI-assisted extraction from a raw note instead of filling this in by
        hand, use <code>pipeline/intake.py</code>.
      </p>

      {error && <p className="error-text">{error}</p>}
      {result && (
        <p className="admin-card" style={{ borderColor: "var(--ok)" }}>
          Draft queued (id={result.id}). Case slug will be <strong>{result.caseSlug}</strong> once
          approved — review it in the <a href="/admin">review queue</a>.
        </p>
      )}

      <form onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">Video / post URL</span>
          <input
            className="field__input"
            required
            value={form.videoUrl}
            onChange={(e) => set("videoUrl", e.target.value)}
            placeholder="https://x.com/someone/status/123"
          />
        </label>
        <label className="field">
          <span className="field__label">Headline (event-framed, no private names)</span>
          <input
            className="field__input"
            required
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Event type</span>
          <input
            className="field__input"
            required
            value={form.eventType}
            onChange={(e) => set("eventType", e.target.value)}
            placeholder="assault, retail_theft, vandalism…"
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 6rem", gap: "1rem" }}>
          <label className="field">
            <span className="field__label">City</span>
            <input
              className="field__input"
              required
              value={form.jurisdictionCity}
              onChange={(e) => set("jurisdictionCity", e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">State</span>
            <input
              className="field__input"
              required
              maxLength={2}
              value={form.jurisdictionState}
              onChange={(e) => set("jurisdictionState", e.target.value)}
              placeholder="PA"
            />
          </label>
        </div>
        <label className="field">
          <span className="field__label">Incident date (optional)</span>
          <input
            className="field__input"
            type="date"
            value={form.incidentDate}
            onChange={(e) => set("incidentDate", e.target.value)}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit as draft"}
        </button>
      </form>
    </>
  );
}
