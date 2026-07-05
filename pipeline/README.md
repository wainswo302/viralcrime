# pipeline — ingestion & disposition monitor (Python)

The data pipeline. Its headline job is the **disposition monitor**: the part
that captures "what happened next" automatically, which is the product's real
differentiator.

## Files
- `detect.py` — dependency-free disposition detection (the testable core)
- `extract.py` — LLM-assisted classification with a deterministic fallback
- `client.py` — API client (submits drafts, reads cases)
- `monitor.py` — disposition-monitor orchestration loop
- `intake.py` — story intake: structures a raw video link + note into a `NEW_CASE` draft

## The one rule
The monitor only ever **submits PENDING drafts**. It never approves, never
names anyone, never mutates a case. Every consequential change is gated by a
human via the API's `/api/drafts/{id}/approve`. AI watches at scale; humans
decide.

## Run the demo (no backend, no key needed)
```bash
pip install -r requirements.txt
python monitor.py --demo
```
You'll see a draft queued for the altercation case (docket now shows a guilty
plea) and "no change" for the theft case (docket only shows a continuance).

## Against the live API
```bash
API_BASE_URL=http://localhost:8080 python monitor.py --slugs <slug> ...
```
Then review the queued drafts:
```bash
curl localhost:8080/api/drafts
curl -X POST localhost:8080/api/drafts/<id>/approve -H 'content-type: application/json' -d '{"reviewer":"editor@site"}'
```
Approving a disposition draft advances the case to RESOLVED through the
lifecycle service — the same guarded path everything else uses.

## LLM extraction
Set `ANTHROPIC_API_KEY` and install `anthropic` to enable `extract.py`'s LLM
path; it constrains output to the fixed status schema and still routes through
the draft queue. Without a key it uses the deterministic classifier.

## Story intake — starting a new case from a real video link
```bash
API_BASE_URL=http://localhost:8080 python intake.py \
  --url "https://x.com/example/status/123" \
  --note "fight breaks out at a gas station on 5th ave in reading pa, looks recent"
```
With `ANTHROPIC_API_KEY` set, it structures the note into a headline, event
type, and jurisdiction — printed for your confirmation before anything is
submitted. Without a key (or if the LLM call fails), it just prompts you to
fill the fields in yourself; either way, nothing is created until you confirm,
and the result is a **PENDING** draft, not a case:
```bash
curl localhost:8080/api/drafts
curl -X POST localhost:8080/api/drafts/<id>/approve -H 'content-type: application/json' -d '{"reviewer":"editor@site"}'
```
Approving a `NEW_CASE` draft creates the case in `SURFACED` — same as any
other case, still needs to be verified and walked through the lifecycle
before it publishes. The gate never shortens for AI-sourced input.
