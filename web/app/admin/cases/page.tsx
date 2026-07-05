"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/AdminAuth";
import { fetchAllCases } from "@/lib/adminApi";
import type { CaseSummaryDto } from "@/lib/types";

export default function AdminCasesPage() {
  const { session } = useAdminAuth();
  const [cases, setCases] = useState<CaseSummaryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchAllCases(session.header)
      .then(setCases)
      .catch(() => setError("Failed to load cases."));
  }, [session]);

  return (
    <>
      <h1 className="headline" style={{ fontSize: "2rem" }}>Cases</h1>
      <p className="lede" style={{ fontSize: "1rem" }}>
        Every case regardless of state — the public site only shows published ones.
      </p>

      {error && <p className="error-text">{error}</p>}
      {cases === null && !error && <p>Loading…</p>}
      {cases !== null && cases.length === 0 && <p>No cases yet.</p>}

      <ul className="incidents">
        {cases?.map((c) => (
          <a className="incident" key={c.slug} href={`/admin/cases/${c.slug}`}>
            <span className="incident__t">{c.headline}</span>
            <span className="incident__m">
              {c.state} · {c.jurisdictionCity}, {c.jurisdictionState}
            </span>
          </a>
        ))}
      </ul>
    </>
  );
}
