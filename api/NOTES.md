# api — Phase 0 + Phase 1 starter

What's here:
- `V1__init_cases.sql` — Flyway migration for the full case schema
- `domain/` — JPA entities + enums (the vocabulary)
- `service/CaseLifecycleService` — the lifecycle state machine
- `service/NamingGateService` — the naming gate (primary liability shield)
- `web/CaseController` — read API that filters names through the gate
- `test/` — JUnit 5 suites for the gate and the state machine

## Run it
```bash
docker compose up -d postgres          # start the database
./mvnw spring-boot:run                 # start the API (generate wrapper: mvn -N wrapper:wrapper)
./mvnw test                            # run the gate + lifecycle tests
```
(If you don't use the Maven wrapper, plain `mvn spring-boot:run` / `mvn test` works.)

## The one thing to understand
`NamingGateService` is the point of the whole starter. A name is serialized
ONLY when: the case isn't retracted, the record isn't expunged, a human set
`gate_passed`, the role is DEFENDANT, the legal status is CHARGED/PLEA/CONVICTED,
and there are >=2 sources including both an official record and mainstream
coverage. The gate is conservative by design — it denies on doubt.

The logic in the two services was validated by an out-of-band harness
(14/14 checks passing) since this environment can't reach Maven Central.


## Seeding demo data
The `CaseSeeder` (profile-guarded, idempotent) loads two demo cases through the
real lifecycle service:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=seed
```
- `2026-06-11-broad-st-altercation` — charged, but the attached individual is
  NOT gate-approved, so `GET /api/cases/{slug}` returns `namedIndividuals: []`.
- `2026-04-02-markley-st-retail-theft` — resolved & convicted with an
  editor-approved defendant, so the API returns `namedIndividuals: ["Jordan Blake"]`.

Together they demonstrate the naming gate filtering a name out AND letting one
through. Verify end to end:
```bash
curl localhost:8080/api/cases/2026-06-11-broad-st-altercation   | grep namedIndividuals   # []
curl localhost:8080/api/cases/2026-04-02-markley-st-retail-theft | grep namedIndividuals   # ["Jordan Blake"]
```
