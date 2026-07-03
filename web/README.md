# web — Next.js case detail page (Phase 2)

The public site. Server-rendered, SEO-first, consuming the Spring Boot API's
`GET /api/cases/{slug}`. Design direction: a verification *dossier* — ink on
paper, monospace for anything that reads like a record, and color reserved to
encode verification status, never decoration.

## Run it
```bash
npm install
API_BASE_URL=http://localhost:8080 npm run dev   # point at the Spring Boot API
# open http://localhost:3000/cases/2026-06-11-broad-st-altercation
```
If the API isn't running, the page falls back to `lib/fixture.ts` so you can
develop the frontend standalone. With the API up, live data always wins.

## What's here
- `app/cases/[slug]/page.tsx` — the case page: fetch, `generateMetadata`,
  static params, and JSON-LD injection
- `lib/schema.ts` — `NewsArticle` + `ClaimReview` JSON-LD builders (the SEO /
  AI-citability layer)
- `lib/types.ts` — mirrors the API's `CaseDto` contract exactly
- `lib/api.ts` — typed fetch with ISR + fixture fallback
- `components/` — `VerificationRecord` (the signature block), `StatusTags`,
  `CaseTimeline`, `SourceList`, `EmbedBlock`
- `app/globals.css` — the design tokens and record styling

## Contract note
`namedIndividuals` arrives already gate-filtered by the API. The frontend never
sees an ungated name, so it cannot leak one. The naming gate lives server-side
on purpose.

## Validation done
- JSON-LD builders: logic validated (14/14 checks) against the fixture.
- `lib/types.ts`, `lib/status.ts`, `lib/schema.ts`: type-clean under `tsc --strict`.
- Full `next build` should be run locally — the authoring sandbox couldn't
  install the full Next toolchain.
