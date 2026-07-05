"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/AdminAuth";
import { fetchCase, updateCase, transitionCase, addEmbed, type CaseEditInput } from "@/lib/adminApi";
import type { CaseDto } from "@/lib/types";

const LEGAL_STATUSES = ["NONE_REPORTED", "CHARGED", "PLEA", "CONVICTED", "ACQUITTED", "DISMISSED", "EXPUNGED"];
const VIDEO_PROVENANCES = ["AUTHENTIC", "MISCAPTIONED", "RECIRCULATED", "STAGED", "AI_GENERATED", "UNVERIFIED"];
const CASE_STATES = ["SURFACED", "VERIFYING", "PUBLISHED_OPEN", "MONITORING", "RESOLVED", "CORRECTED", "RETRACTED"];

function toEditInput(c: CaseDto): CaseEditInput {
  return {
    headline: c.headline,
    summary: c.summary,
    eventType: c.eventType,
    jurisdictionCity: c.jurisdictionCity,
    jurisdictionCounty: c.jurisdictionCounty,
    jurisdictionState: c.jurisdictionState,
    incidentDate: c.incidentDate,
    locationBlock: c.locationBlock,
    videoProvenance: c.videoProvenance,
    videoNotes: c.videoNotes,
    legalStatus: c.legalStatus,
    disposition: c.disposition,
    monitoringActive: true,
    tags: c.tags
  };
}

function parseTags(text: string): string[] {
  return text.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
}

export default function AdminCaseEditPage({ params }: { params: { slug: string } }) {
  const { session } = useAdminAuth();
  const [caseData, setCaseData] = useState<CaseDto | null>(null);
  const [form, setForm] = useState<CaseEditInput | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [targetState, setTargetState] = useState("");
  const [newEmbedUrl, setNewEmbedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const c = await fetchCase(params.slug);
    if (c) {
      setCaseData(c);
      setForm(toEditInput(c));
      setTagsText(c.tags.join(", "));
    } else {
      setError("Case not found.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  function set<K extends keyof CaseEditInput>(key: K, value: CaseEditInput[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !form) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateCase(params.slug, { ...form, tags: parseTags(tagsText) }, session.header);
      setCaseData(updated);
      setForm(toEditInput(updated));
      setTagsText(updated.tags.join(", "));
      setNotice("Saved.");
    } catch {
      setError("Save failed.");
    } finally {
      setPending(false);
    }
  }

  async function onTransition() {
    if (!session || !targetState) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await transitionCase(params.slug, targetState, session.header);
      setCaseData(updated);
      setForm(toEditInput(updated));
      setNotice(`Moved to ${updated.state}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transition failed.");
    } finally {
      setPending(false);
    }
  }

  async function onAddEmbed() {
    if (!session || !newEmbedUrl.trim()) return;
    setPending(true);
    setError(null);
    try {
      const updated = await addEmbed(params.slug, newEmbedUrl.trim(), session.header);
      setCaseData(updated);
      setNewEmbedUrl("");
      setNotice("Embed added.");
    } catch {
      setError("Failed to add embed.");
    } finally {
      setPending(false);
    }
  }

  if (error && !caseData) return <p className="error-text">{error}</p>;
  if (!caseData || !form) return <p>Loading…</p>;

  return (
    <>
      <h1 className="headline" style={{ fontSize: "2rem" }}>{caseData.slug}</h1>
      <p className="incident__m" style={{ marginBottom: "1.5rem" }}>Current state: {caseData.state}</p>

      {error && <p className="error-text">{error}</p>}
      {notice && <p style={{ color: "var(--ok)" }}>{notice}</p>}

      <h2 className="section-title">Fields</h2>
      <form onSubmit={onSave}>
        <label className="field">
          <span className="field__label">Headline</span>
          <input className="field__input" value={form.headline} onChange={(e) => set("headline", e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Summary</span>
          <textarea className="field__textarea" value={form.summary ?? ""} onChange={(e) => set("summary", e.target.value)} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 6rem", gap: "1rem" }}>
          <label className="field">
            <span className="field__label">City</span>
            <input className="field__input" value={form.jurisdictionCity} onChange={(e) => set("jurisdictionCity", e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">County</span>
            <input className="field__input" value={form.jurisdictionCounty ?? ""} onChange={(e) => set("jurisdictionCounty", e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">State</span>
            <input className="field__input" maxLength={2} value={form.jurisdictionState} onChange={(e) => set("jurisdictionState", e.target.value.toUpperCase())} />
          </label>
        </div>
        <label className="field">
          <span className="field__label">Location block</span>
          <input className="field__input" value={form.locationBlock ?? ""} onChange={(e) => set("locationBlock", e.target.value)} placeholder="400 block of Main St" />
        </label>
        <label className="field">
          <span className="field__label">Incident date</span>
          <input className="field__input" type="date" value={form.incidentDate ?? ""} onChange={(e) => set("incidentDate", e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Video provenance</span>
          <select className="field__select" value={form.videoProvenance} onChange={(e) => set("videoProvenance", e.target.value)}>
            {VIDEO_PROVENANCES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Video notes</span>
          <textarea className="field__textarea" value={form.videoNotes ?? ""} onChange={(e) => set("videoNotes", e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Legal status</span>
          <select className="field__select" value={form.legalStatus} onChange={(e) => set("legalStatus", e.target.value)}>
            {LEGAL_STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Disposition</span>
          <textarea className="field__textarea" value={form.disposition ?? ""} onChange={(e) => set("disposition", e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Tags (comma-separated)</span>
          <input className="field__input" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="viral, video-verified" />
        </label>
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
      </form>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>Lifecycle</h2>
      <p className="incident__m">Transitions are guarded — an invalid move (e.g. RESOLVED without a disposition) is rejected with an error, not silently applied.</p>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", margin: "0.8rem 0" }}>
        <select className="field__select" style={{ width: "auto" }} value={targetState} onChange={(e) => setTargetState(e.target.value)}>
          <option value="">Move to…</option>
          {CASE_STATES.filter((s) => s !== caseData.state).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" disabled={!targetState || pending} onClick={onTransition}>Transition</button>
      </div>

      <h2 className="section-title" style={{ marginTop: "2rem" }}>Embeds</h2>
      <ul className="incidents">
        {caseData.embedRefs.map((url) => (
          <li className="incident" key={url}><a href={url} target="_blank" rel="noreferrer">{url}</a></li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "0.6rem", margin: "0.8rem 0" }}>
        <input className="field__input" value={newEmbedUrl} onChange={(e) => setNewEmbedUrl(e.target.value)} placeholder="https://..." />
        <button className="btn" disabled={!newEmbedUrl.trim() || pending} onClick={onAddEmbed}>Add embed</button>
      </div>
    </>
  );
}
