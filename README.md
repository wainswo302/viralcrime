# ViralCrime — monorepo

A public-record truth engine: crime incidents tracked from the viral moment to
verified resolution — court disposition and video authenticity — as structured,
sourced data. Not a suspect tracker; naming is gated behind adjudication and
dual sourcing, enforced in code.

## Repository layout

```
/api        Spring Boot service (Java) — case API, lifecycle state machine,
            naming gate, human-review draft queue
/web        Next.js app (TypeScript) — SEO-first public site, JSON-LD
/pipeline   Python — scrapers + the disposition monitor
```
Plus planning docs alongside: the implementation guide, disclosure policy,
town-cluster SEO playbook, and resolved-case database spec.

## The one idea to hold onto

**AI watches at scale; humans gate every consequential change.** The Python
monitor detects that a case has resolved and *proposes* a draft; nothing
changes until an editor approves it via the API. And no private individual is
ever named unless the naming gate passes. Both rules live in code.

## Architecture

```
Next.js (web) ──REST──> Spring Boot (api) ──JPA──> PostgreSQL
                             ^  ^
       drafts (propose only) |  | approve (human gate)
                          Python (pipeline: monitor + scrapers)
```

## Run it locally (all three)

```bash
# 1. database + API (with demo data)
cd api
docker compose up -d postgres
./mvnw spring-boot:run -Dspring-boot.run.profiles=seed      # seeds two demo cases

# 2. web (new terminal)
cd web
npm install
API_BASE_URL=http://localhost:8080 npm run dev              # http://localhost:3000

# 3. pipeline demo (new terminal) — offline, no key needed
cd pipeline
pip install -r requirements.txt
python monitor.py --demo
```

### See the whole loop
```bash
# the naming gate, both ways:
curl localhost:8080/api/cases/2026-06-11-broad-st-altercation    | grep namedIndividuals   # []
curl localhost:8080/api/cases/2026-04-02-markley-st-retail-theft | grep namedIndividuals   # ["Jordan Blake"]

# the monitor proposes a resolution -> a human approves it:
API_BASE_URL=http://localhost:8080 python pipeline/monitor.py --slugs 2026-06-11-broad-st-altercation
curl localhost:8080/api/drafts                                   # the pending proposal
curl -X POST localhost:8080/api/drafts/<id>/approve \
     -H 'content-type: application/json' -d '{"reviewer":"editor@site"}'
# the case is now RESOLVED, via the guarded lifecycle path
```

## Deploy (MVP)

| Component | Recommended | Notes |
|---|---|---|
| `web` | **Vercel** | native Next.js; set `API_BASE_URL`, `SITE_URL` |
| `api` | **Railway / Render** | push `api/Dockerfile`; set `DB_*` env |
| Postgres | **Supabase / Neon** | managed; point `DB_URL` at it |
| `pipeline` | **Railway cron / GitHub Actions** | schedule `monitor.py`; set `API_BASE_URL` |

AWS is a Phase-4 flex, not an MVP requirement: containerize `api` (Dockerfile
ready) and run that single service on Elastic Beanstalk or ECS Fargate for the
AWS resume line — without routing the whole stack through AWS networking.

Copy `.env.example` to `.env` and fill in values before running or deploying.

## What's validated

High-risk logic is covered by passing checks: naming gate, lifecycle state
machine, draft approval flow, JSON-LD builders, and disposition detection. Run
`cd api && ./mvnw test` and `pytest pipeline` for the in-repo suites, and
`cd web && npm run build` once locally as the frontend green light.

## Before publishing anything that names a real person

Get a media/defamation attorney review (Pennsylvania specifics matter). The
naming gate is designed to keep you defensible; it is not legal advice. See
`disclosure-and-corrections-policy.md`.
