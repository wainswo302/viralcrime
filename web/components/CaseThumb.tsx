import type { CaseSummaryDto } from "@/lib/types";
import { detectPlatform } from "@/lib/platform";

/**
 * Homepage grid card. The mark is a platform badge, not a scraped video
 * frame — embeds are native-platform-only and never rehosted (see
 * EmbedBlock), so there's no thumbnail image to pull from our own storage.
 */
export function CaseThumb({ c }: { c: CaseSummaryDto }) {
  const platform = c.embedRefs.length > 0 ? detectPlatform(c.embedRefs[0]) : null;

  return (
    <a className="thumb" href={`/cases/${c.slug}`}>
      <div className="thumb__media">
        {platform ? (
          <>
            <span className="thumb__mark">{platform.mark}</span>
            <span className="thumb__platform">{platform.name}</span>
          </>
        ) : (
          <span className="thumb__platform thumb__platform--muted">No media yet</span>
        )}
      </div>
      <div className="thumb__body">
        <p className="thumb__headline">{c.headline}</p>
        <p className="thumb__meta">{c.jurisdictionCity}, {c.jurisdictionState}</p>
      </div>
    </a>
  );
}
