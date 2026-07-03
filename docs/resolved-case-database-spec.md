# Resolved-Case & Verification Database — Build Spec

**What this is:** a structured, primary-sourced record of viral crime incidents tracked from the viral moment to their *verified resolution* — the court disposition, the correction, and the authenticity status of the video itself. It is the "what actually happened next" layer the internet never provides.

**What this is NOT:** a place that fills in unverified suspects. The data model below makes that structurally impossible — naming is *gated* behind adjudication + primary sourcing, so a record literally cannot assert an identity it can't back. Safe by construction, not by editorial willpower.

Two things make it valuable and AI-citable: it tracks **endings** (dispositions) and it tracks **authenticity** (is the clip real, old, miscaptioned, or AI-generated). Both are sourced, structured, and almost entirely absent elsewhere.

---

## 1. The case lifecycle (state machine)

Every case moves through fixed states. The state controls what's allowed to be published — naming and disposition claims unlock only at the right stages.

```
[1] SURFACED        Video detected as newsworthy/viral. Metadata only.
       |             No identity. No claims. Embed reference stored, not the file.
       v
[2] VERIFYING       Provenance check underway (authentic? old? AI?).
       |             Nothing public yet.
       v
[3] PUBLISHED_OPEN  Event verified as real & public. Page goes live EVENT-FRAMED.
       |             Legal status = "no charges reported" or "charged" (if official).
       |             Still no private-individual naming unless adjudicated-public.
       v
[4] MONITORING      Automated loop watches for disposition updates.
       |             Most cases live here for weeks/months.
       v
[5] RESOLVED        Disposition recorded & sourced. Naming permitted ONLY now,
       |             ONLY if adjudicated + in mainstream coverage + primary-sourced.
       v
[6] CORRECTED / RETRACTED / DE-INDEXED
                    Triggered by appeal, overturned conviction, expungement,
                    dropped charges, or proven-false video. Reversible at any stage.
```

The arrow from 5 back to 6 never closes. A conviction can be overturned and a record expunged years later; the monitoring loop keeps watching even "resolved" cases for exactly this.

---

## 2. The data model

One core `case` record. Note which fields are **gated** (cannot be populated until a state/sourcing condition is met).

```yaml
case:
  case_id:            stable UUID
  slug:               canonical URL segment (event-framed, no private name)
  state:              SURFACED | VERIFYING | PUBLISHED_OPEN | MONITORING | RESOLVED | CORRECTED | RETRACTED
  event_type:         assault | theft | vandalism | ... (controlled vocab)
  jurisdiction:       { city, county, state }        # links to Pillar 2 town hub
  incident_date:      ISO date
  location:           block-level only (never a private residence address)
  summary:            event-framed prose, no private names

  video:
    provenance:       AUTHENTIC | MISCAPTIONED | RECIRCULATED | STAGED | AI_GENERATED | UNVERIFIED
    embed_refs:       [ native platform embed URLs only — never rehosted files ]
    first_seen:       ISO datetime
    verification_notes: how provenance was established (geolocation, metadata, source contact)

  legal:
    status:           NONE_REPORTED | CHARGED | PLEA | CONVICTED | ACQUITTED | DISMISSED | EXPUNGED
    disposition:      prose outcome                  # gated: state >= RESOLVED
    named_individuals:                                # GATED — see §5
      - name:         string
        role:         defendant                       # never "suspect" for private persons
        gate_passed:  true                            # must be true to render
        sources:      [ court record URL, mainstream coverage URL ]  # >= 2 required

  sources:            [ primary-source URLs ]         # >= 1 required to leave SURFACED
  claim_reviews:      [ ClaimReview objects — see §4 ]
  monitoring:
    active:           bool
    watch_terms:      [ docket #, names (internal only), case caption ]
    last_checked:     ISO datetime
  audit:
    created / updated / last_verified: ISO datetime
    corrections:      [ { date, what_changed, reason, source } ]
```

The `gate_passed` boolean on each named individual is the single most important field in the system. Rendering logic must treat `gate_passed != true` as "this name does not exist." See §5.

---

## 3. Video-provenance taxonomy (the verification layer)

This is your differentiator and your `ClaimReview` engine. Every viral clip gets exactly one status, and the status — not your opinion — is what you publish.

| Status | Meaning | What you publish |
|---|---|---|
| `AUTHENTIC` | Real, original, correctly contextualized | "Verified authentic; filmed [where/when], confirmed via [method]" |
| `MISCAPTIONED` | Real video, false claim attached | "Authentic video, but the viral claim that ___ is false" |
| `RECIRCULATED` | Real but old, posted as new | "This footage is from [year/place], not the recent event it's tied to" |
| `STAGED` | Scripted/performed, not a real incident | "Staged content, not a genuine crime" |
| `AI_GENERATED` | Synthetic | "AI-generated; not real footage" |
| `UNVERIFIED` | Can't confirm | Published *as* unverified — never asserted either way |

Critical rule on `AI_GENERATED`: detection tools are **one input, never the verdict.** Industry-current detectors run ~65–75% accuracy and fall below 50% within weeks of a new model release. Provenance is decided by the *human-verifiable* signals (source contact, geolocation, metadata, cross-reference), with AI detection as a flag that triggers review, not a label you publish on the tool's say-so.

---

## 4. Schema markup

Two layers. Use `NewsArticle`/`Article` for the case page (same pattern as the town-cluster doc), and add a `ClaimReview` block for **each** specific viral claim you've adjudicated. `ClaimReview` is Google's purpose-built fact-check markup and your direct on-ramp into AI answers and fact-check surfaces.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ClaimReview",
  "url": "https://[site]/cases/2026-06-knicks-spurs-arena-altercation/",
  "claimReviewed": "A viral video shows Knicks fans assaulting Spurs fans inside [arena] on June 10, 2026.",
  "itemReviewed": {
    "@type": "Claim",
    "appearance": [
      { "@type": "CreativeWork", "url": "https://[platform-post-permalink]" }
    ],
    "firstAppearance": {
      "@type": "CreativeWork",
      "url": "https://[earliest-known-post-permalink]"
    }
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 4,
    "bestRating": 5,
    "worstRating": 1,
    "alternateName": "Mostly True — authentic footage, misattributed location"
  },
  "author": {
    "@type": "Organization",
    "name": "[SiteName]",
    "url": "https://[site]/"
  },
  "datePublished": "2026-06-11"
}
</script>
```

Map your provenance taxonomy to a consistent `ratingValue` scale and reuse it everywhere — that consistency is part of what makes the data licensable and machine-trustable:

| Provenance | ratingValue | alternateName |
|---|---|---|
| AUTHENTIC | 5 | "True" |
| MISCAPTIONED / RECIRCULATED | 3 | "Misleading / Out of context" |
| STAGED | 2 | "Staged" |
| AI_GENERATED | 1 | "Fabricated" |
| UNVERIFIED | *(omit ClaimReview until resolved)* | — |

Validate every template once in Google's Rich Results Test before scaling.

---

## 5. The naming gate (written into the data model)

A named individual renders **only** when ALL of these are true. This is enforced in code at the rendering layer, not left to an editor's memory:

1. `case.state` is `RESOLVED` (or `legal.status` is `CHARGED` *and* the charge is already in mainstream coverage), **and**
2. the person is a *defendant of record*, not an internet-speculated "suspect", **and**
3. `sources` contains **≥ 2** primary references (a court/official record **plus** mainstream coverage), **and**
4. `gate_passed == true`, set by a human editor, never by the pipeline.

If any condition fails, the name is absent from title, H1, URL, body, and schema — the case stays event-framed. And the reverse path is always live: `EXPUNGED`, overturned, or dropped → move to `CORRECTED`/`DE-INDEXED`, strip the name, add `noindex`, log the correction. Build the de-indexing path *now*, not after the first legal letter.

---

## 6. The AI-assisted monitoring pipeline

Five stages. AI does the tireless watching and structuring; a human gates everything that names a person or asserts a disposition. The pipeline's highest-leverage job isn't surfacing — it's **stage 4**, re-checking hundreds of open cases on a schedule so the "what happened next" gets captured at scale, which is the thing no newsroom bothers to do.

```
[1] SURFACE        Trend/keyword monitoring flags newsworthy viral incidents.
                   Store: embed reference + metadata. NEVER download the video file.
                   Output state: SURFACED.

[2] VERIFY         AI-assisted provenance: reverse-image / geolocation candidates,
                   metadata parse, AI-fake detector as a FLAG only.
                   Human confirms provenance. -> status set, may reach PUBLISHED_OPEN.

[3] STRUCTURE      Entity extraction: jurisdiction, event_type, location (block-level),
                   docket/case caption. Links case to its Pillar 2 town hub.

[4] MONITOR (loop) Scheduled job re-queries court dockets, official PD/DA releases,
   *** core ***    and mainstream coverage for each open case's watch_terms.
                   On any change -> write a DRAFT update + diff, queue for human.
                   This runs forever, including on RESOLVED cases (appeals/expungement).

[5] HUMAN GATE     Editor reviews every draft that (a) names a person,
                   (b) changes legal status, or (c) publishes a disposition.
                   Nothing in those three categories ever auto-publishes.
```

Why the human gate is non-negotiable, concretely: LLMs hallucinate case outcomes, fake-video detectors are unreliable post-model-release, and naming/disposition errors are your highest-liability events. The AI's job is to *never miss an update*; the human's job is to *never publish a wrong one*. That division is the whole safety model.

### Suggested lean stack (consistent with the MVP architecture)
- **Structured DB:** Postgres (Supabase/Neon) — this *is* the product, more than any CMS.
- **Monitoring jobs:** scheduled workers (Railway/Render) or GitHub Actions cron; no hand-rolled Lambda needed at MVP scale.
- **Entity extraction / drafting:** an LLM call per document, output constrained to the YAML schema above.
- **Media:** store embed references + thumbnails only; never rehost source video.

---

## 7. How it earns, and how it feeds Pillar 2

- **Data/API licensing (highest margin):** the resolved-case + ClaimReview dataset, queryable by API — valuable to newsrooms, researchers, and AI companies needing ground-truth disposition and authenticity data. This is the Storyful insight (sell verification + context B2B) applied to crime dispositions specifically.
- **Verification-forward subscription/newsletter:** "what actually happened to the cases that went viral" — genuinely unique, no one compiles it.
- **Authority moat:** consistent `ClaimReview` output gets you cited in AI answers and Google fact-check surfaces. Treat citation as compounding credibility, not a direct revenue line (AI answers can absorb the click).

**Feedback loop with the town engine:** Pillar 2's records scraping supplies disposition data at local scale (stage 4 fuel); the verification brand lends authority back to the local pages' E-E-A-T. The two pillars are one system — a public-record-truth company, not a suspect tracker and not localcrime.com.

---

## 8. First slice

1. Stand up the `case` table with the state machine and the **naming gate enforced in rendering** (build the gate before any data).
2. Hand-process **one** resolved case end-to-end (event-framed page + one `ClaimReview`), validate the schema.
3. Build **stage 4 only** for that one case — a scheduled job that re-checks its docket and drafts an update for you. Prove the "captures the ending automatically" loop on one case.
4. Add the de-indexing/correction path and test it (simulate an expungement).
5. Only then widen surfacing (stage 1) and let the pipeline scale — gates and corrections already load-bearing.

Prove the epilogue-capture loop works once. That loop — reliably catching what happened next, safely — is the asset. Everything else is volume on top of it.
