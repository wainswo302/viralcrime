import type { CaseDto } from "./types";

export type StatusKind = "ok" | "caution" | "bad" | "neutral";

/** Verification status of the video maps to a color family. Meaning, not decoration. */
export function provenanceKind(p: CaseDto["videoProvenance"]): StatusKind {
  switch (p) {
    case "AUTHENTIC": return "ok";
    case "MISCAPTIONED":
    case "RECIRCULATED":
    case "STAGED": return "caution";
    case "AI_GENERATED": return "bad";
    default: return "neutral"; // UNVERIFIED
  }
}

export function provenanceLabel(p: CaseDto["videoProvenance"]): string {
  switch (p) {
    case "AUTHENTIC": return "Video verified authentic";
    case "MISCAPTIONED": return "Video miscaptioned";
    case "RECIRCULATED": return "Old video recirculated";
    case "STAGED": return "Staged content";
    case "AI_GENERATED": return "AI-generated video";
    default: return "Video unverified";
  }
}

const LEGAL_LABELS: Record<string, string> = {
  NONE_REPORTED: "No charges reported",
  CHARGED: "Charges filed",
  PLEA: "Plea entered",
  CONVICTED: "Convicted",
  ACQUITTED: "Acquitted",
  DISMISSED: "Dismissed",
  EXPUNGED: "Record expunged"
};
export function legalLabel(s: string): string {
  return LEGAL_LABELS[s] ?? s;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
