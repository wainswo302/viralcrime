package com.viralcrime.api.seed;

import com.viralcrime.api.domain.*;
import com.viralcrime.api.service.CaseLifecycleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Seeds demo cases through the REAL lifecycle service (not by setting state
 * directly), so the seed also exercises the state machine and its guards.
 *
 * Guarded by the "seed" profile so it never runs in production:
 *   ./mvnw spring-boot:run -Dspring-boot.run.profiles=seed
 * Idempotent: skips a case whose slug already exists.
 *
 * The two cases demonstrate the naming gate BOTH ways:
 *   1) an event-framed case with an UN-approved individual  -> name filtered out
 *   2) a resolved case with an approved defendant of record -> name rendered
 */
@Component
@Profile("seed")
public class CaseSeeder implements CommandLineRunner {

    private final CrimeCaseRepository repo;
    private final CaseLifecycleService lifecycle;

    public CaseSeeder(CrimeCaseRepository repo, CaseLifecycleService lifecycle) {
        this.repo = repo;
        this.lifecycle = lifecycle;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedEventFramed();
        seedNamedDefendant();
    }

    /** Case 1 — charged, but the individual is NOT gate-approved: name is withheld. */
    private void seedEventFramed() {
        String slug = "2026-06-11-broad-st-altercation";
        if (repo.findBySlug(slug).isPresent()) return;

        CrimeCase c = new CrimeCase(slug, "assault", "Philadelphia", "PA");
        c.setHeadline("Fan altercation during NBA Finals watch event — Philadelphia, PA");
        c.setSummary("Police responded to a reported altercation between attendees at a "
            + "public NBA Finals watch event on the 3600 block of South Broad Street. "
            + "Footage circulating on social media was verified as authentic, though "
            + "widely-shared posts misidentified the venue. Charges have been filed; the "
            + "matter has not yet been adjudicated.");
        c.setLocationBlock("3600 block of S. Broad St");
        c.setIncidentDate(LocalDate.of(2026, 6, 11));
        c.setVideoProvenance(VideoProvenance.AUTHENTIC);
        c.setVideoNotes("Confirmed via source contact, geolocation, and metadata review.");
        c.addEmbedRef("https://x.com/example_user/status/1801234567890123456");
        c.setLegalStatus(LegalStatus.CHARGED);
        c.addSource(new Source(SourceType.OFFICIAL_RECORD, "https://example.gov/docket/2026-0611"));
        c.addSource(new Source(SourceType.MAINSTREAM_COVERAGE, "https://example.com/news/watch-party"));
        c.addClaimReview(new ClaimReview(
            "A viral video shows fans assaulting rival fans inside the arena on June 10, 2026.",
            3, "Mostly true — authentic footage, misattributed location"));

        // walk the lifecycle through the service (exercises the state machine)
        lifecycle.transition(c, CaseState.VERIFYING);
        lifecycle.transition(c, CaseState.PUBLISHED_OPEN);

        // present in the DB, but gate_passed stays false -> the API filters it out
        c.addNamedIndividual(new NamedIndividual("Withheld Pendinggate", IndividualRole.DEFENDANT));

        c.setLastVerifiedAt(Instant.parse("2026-06-13T14:00:00Z"));
        repo.save(c);
    }

    /** Case 2 — resolved & convicted, defendant approved by an editor: name renders. */
    private void seedNamedDefendant() {
        String slug = "2026-04-02-markley-st-retail-theft";
        if (repo.findBySlug(slug).isPresent()) return;

        CrimeCase c = new CrimeCase(slug, "retail_theft", "Norristown", "PA");
        c.setHeadline("Retail theft case on Markley Street resolved in court — Norristown, PA");
        c.setSummary("A retail theft reported on the 400 block of Markley Street was resolved "
            + "in Montgomery County court. The defendant entered a guilty plea.");
        c.setLocationBlock("400 block of Markley St");
        c.setIncidentDate(LocalDate.of(2026, 4, 2));
        c.setVideoProvenance(VideoProvenance.MISCAPTIONED);
        c.setVideoNotes("Original clip authentic; a viral repost attached an unrelated location.");
        c.addEmbedRef("https://www.tiktok.com/@example_user/video/7301234567890123456");
        c.setLegalStatus(LegalStatus.CONVICTED);
        c.setDisposition("Pleaded guilty to retail theft; sentenced to 12 months probation.");
        c.addSource(new Source(SourceType.OFFICIAL_RECORD, "https://example.gov/mont/docket/2026-0402"));
        c.addSource(new Source(SourceType.MAINSTREAM_COVERAGE, "https://example.com/news/markley-theft"));
        c.addClaimReview(new ClaimReview(
            "A viral clip shows the theft happening in Philadelphia.",
            3, "Misleading — real theft, wrong city attached"));

        // disposition is set above, so the RESOLVED guard passes
        lifecycle.transition(c, CaseState.VERIFYING);
        lifecycle.transition(c, CaseState.PUBLISHED_OPEN);
        lifecycle.transition(c, CaseState.MONITORING);
        lifecycle.transition(c, CaseState.RESOLVED);

        NamedIndividual defendant = new NamedIndividual("Jordan Blake", IndividualRole.DEFENDANT);
        defendant.approveNaming("editor@viralcrime.example");   // human gate set
        c.addNamedIndividual(defendant);

        c.setLastVerifiedAt(Instant.parse("2026-05-05T16:30:00Z"));
        repo.save(c);
    }
}
