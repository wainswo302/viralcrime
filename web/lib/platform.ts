const PLATFORMS: { test: RegExp; name: string; mark: string }[] = [
  { test: /(^|\.)x\.com$|(^|\.)twitter\.com$/, name: "X", mark: "X" },
  { test: /(^|\.)tiktok\.com$/, name: "TikTok", mark: "TT" },
  { test: /(^|\.)instagram\.com$/, name: "Instagram", mark: "IG" },
  { test: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/, name: "YouTube", mark: "YT" },
  { test: /(^|\.)facebook\.com$/, name: "Facebook", mark: "FB" }
];

export function detectPlatform(url: string): { name: string; mark: string } {
  try {
    const host = new URL(url).hostname;
    const hit = PLATFORMS.find((p) => p.test.test(host));
    if (hit) return hit;
  } catch {
    // fall through to unknown
  }
  return { name: "Source video", mark: "▶" };
}
