# Implementation Guide

A phased build plan for ViralCrime, written for a junior Java developer building a portfolio-grade full-stack project. The goal: ship something real and live, that demonstrably shows range, without drowning in infrastructure before you have a single page.

---

## The stack, and the honest reasoning

You have two competing goals — **ship an MVP fast** and **build an impressive portfolio piece**. These pull in slightly different directions, and the stack below is tuned to serve both, with the tradeoffs named.

### Java + Spring Boot — the backend API

This is your portfolio centerpiece and it plays directly to your existing Java skill. Spring Boot is the most in-demand Java skill on the market, so deepening it is career-aligned. The API you build here is not throwaway scaffolding — it *is* the licensable product from the database spec (the queryable case dataset). You'll demonstrate: REST design, a real domain model, Spring Data JPA, validation, and — the part that makes reviewers take notice — a **state machine and a rendering gate** that encode real business rules. That's senior-flavored work a junior rarely shows.

Tradeoff: a separate Java API is more moving parts than a single full-stack JavaScript app. For a portfolio piece that's a *feature* (it shows you can design across services); for raw speed it's a cost. We accept it because the Java showcase is the point.

### PostgreSQL — the database

Relational is the right model: the case data is structured and relational (cases → sources, cases → claim_reviews, audit log), and the naming gate is fundamentally a constraint problem. Use JSONB columns for the genuinely flexible bits (embed references, source arrays) so you get relational rigor without fighting the schema. Manage changes with Flyway migrations from day one — versioned schema is itself a portfolio signal.

### TypeScript + Next.js — the frontend

The public site lives or dies on SEO, so you need server-side rendering / static generation — Next.js is purpose-built for this and makes structured-data (`NewsArticle`, `ClaimReview`) injection straightforward. TypeScript signals discipline. This also rounds out the portfolio: you're not "a backend dev who can't do UI," you're full-stack.

### Python — the data pipeline

Scraping and LLM-assisted extraction is Python's home turf (Playwright/BeautifulSoup/Scrapy, plus clean LLM SDKs). Keeping it a separate service is architecturally honest — it has a different runtime cadence (scheduled jobs) than the request-serving API. Three languages, each justified — a deliberately polyglot, service-oriented design that reads as intentional, not scattered.

> If you wanted the *fastest possible* MVP and cared less about the Java showcase, the minimal alternative is a single Next.js app (API routes + Postgres) and skip Spring Boot. It's faster but a weaker portfolio story. Given your goal, build the Spring Boot version.

---

## Phase 0 — foundations (before any feature)

1. **Repo + monorepo layout.** Create the structure from the README (`/api`, `/web`, `/pipeline`, `/db`, `/docs`). A clean repo is the first thing a reviewer sees.
2. **Postgres in Docker.** A `docker-compose.yml` with a Postgres service. Local parity with production from the start.
3. **Flyway migration V1.** The `cases` table and its lifecycle `state` enum, plus `sources`, `claim_reviews`, `named_individuals`, and an `audit`/corrections table. Model the schema from the database spec.
4. **Spring Boot skeleton.** Spring Initializr with: Web, Spring Data JPA, PostgreSQL driver, Validation, Flyway. Get it booting against the DB and returning an empty `GET /api/cases`.

Deliverable: an empty but running three-tier stack. Commit it. This alone is a credible portfolio start.

## Phase 1 — the case API and the gate (the heart)

This is where you build the thing that makes the project special. Do this before any scraping or AI.

1. **Domain model.** JPA entities for `Case`, `Source`, `ClaimReview`, `NamedIndividual`, mirroring the spec. Use an enum for lifecycle state.
2. **The lifecycle state machine.** Enforce legal transitions (you can't go to `RESOLVED` without a disposition; `CORRECTED`/`RETRACTED` reachable from anywhere). Keep this in one well-tested service class — it's the most interview-worthy code in the repo.
3. **The naming gate.** A method that decides whether a `NamedIndividual` is renderable: requires `state` past the threshold, defendant-of-record role, ≥2 sources, and an explicit human `gate_passed` flag. The API must **never** serialize a name that fails the gate. Unit-test this hard — these tests are a portfolio asset in themselves.
4. **Read endpoints.** `GET /api/cases`, `GET /api/cases/{slug}`, filtered list by jurisdiction. This is your future licensable API.
5. **Seed one case by hand** through the lifecycle so you have real data to render.

Deliverable: a tested API that structurally cannot leak an ungated name. Write the gate tests well; they tell the whole story.

## Phase 2 — the public site

1. **Next.js app**, TypeScript, fetching from the Java API.
2. **Three page types:** town hub, incident/case detail, location page (mirror the mockups and the SEO cluster doc).
3. **Structured data.** Inject `NewsArticle` on case pages and `ClaimReview` on verified ones. Validate in Google's Rich Results Test.
4. **Static generation** for case/hub pages (`generateStaticParams` / ISR) so they're fast and crawlable.
5. **The disclosure/corrections policy page**, linked from every hub and case footer.

Deliverable: a live, fast, indexable site rendering your seeded case. Lighthouse score is a portfolio talking point — aim high.

## Phase 3 — the Python pipeline

1. **One scraper.** Target one municipality's public records. Output structured records matching the API's input shape. Respect robots.txt and rate-limit politely.
2. **LLM extraction.** One model call per document, output constrained to your schema (jurisdiction, event type, block-level location). Validate before writing.
3. **The disposition monitor (the differentiator).** A scheduled job that re-queries open cases' dockets and, on any change, writes a **draft** update + diff for human review. Build this even at small scale — it's the unique part.
4. **Human-review gate.** Drafts that name a person or change legal status queue for approval; they never auto-publish.

Deliverable: data flowing in automatically, with humans gating the dangerous writes.

## Phase 4 — polish for the portfolio

- Tests: keep the gate + state-machine coverage high and visible.
- A clean README (done) and an architecture diagram (done) at the repo root.
- CI with GitHub Actions: build + test on push (itself a resume signal).
- A short "design decisions" doc in `/docs` explaining the naming gate and why it exists — reviewers love seeing judgment, not just code.

---

## Deployment

You're open to AWS or Vercel; here's the pragmatic split. The principle: **deploy each piece where it's easiest, and have it actually live.** A working URL beats an impressive-on-paper architecture that never shipped.

| Component | Recommended (MVP) | AWS option (resume flex) |
|---|---|---|
| Next.js frontend | **Vercel** — native, free tier, zero-config previews | AWS Amplify / S3+CloudFront |
| Spring Boot API | **Railway or Render** — push a Dockerfile, done | Elastic Beanstalk, or ECS Fargate |
| PostgreSQL | **Supabase or Neon** — managed, generous free tier | RDS |
| Python jobs | **Railway cron** or **GitHub Actions** schedule | Lambda + EventBridge |

Recommendation: **start fully on Vercel + Railway + Supabase.** You'll be live in an afternoon instead of fighting IAM, VPCs, and security groups. The AWS configuration burden you already noticed is real and it is the wrong battle to fight before you have users or content.

That said — for a portfolio, AWS on the resume has value. The clean way to get it without the pain: containerize the Spring Boot API (you'll have a Dockerfile anyway) and deploy that one service to **Elastic Beanstalk** or **ECS Fargate**. You get a genuine "deployed a Dockerized Java service to AWS" line without putting your whole stack through AWS networking. Do this in Phase 4 as an enhancement, not at the start.

One caution that's also a selling point: keep secrets in environment variables / a secrets manager, never in the repo. Doing this correctly is both basic hygiene and something reviewers check.

---

## Suggested build order, condensed

1. Running empty stack (Phase 0)
2. Tested case API + naming gate (Phase 1) ← the impressive core
3. Live public site rendering one case (Phase 2)
4. One scraper + the disposition monitor (Phase 3)
5. CI, AWS-deployed API container, design-decisions doc (Phase 4)

Ship each phase to a live URL before starting the next. Five small, working milestones make a far stronger portfolio narrative than one big unfinished one — and they match the "prove it on one case, then scale" logic the whole project is built on.

---

## Why this is a strong portfolio piece

It shows full-stack range across three languages chosen deliberately; a non-trivial domain model with a state machine and an enforced business rule (rare for a junior to demonstrate); SEO and structured-data fluency; an AI/data pipeline with a sensible human-in-the-loop design; and real deployment. Most junior portfolios are CRUD clones — this is a system with judgment baked into it, and the naming gate gives you a genuinely interesting thing to talk about in an interview.
