package com.viralcrime.api.service;

import com.viralcrime.api.domain.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * The naming gate is the primary liability shield, so it is tested hard.
 * Each test states the real-world rule it protects.
 */
class NamingGateServiceTest {

    private final NamingGateService gate = new NamingGateService();

    private CrimeCase caseWithDualSourcing() {
        CrimeCase c = new CrimeCase("marshall-st-burglary", "burglary", "Norristown", "PA");
        c.addSource(new Source(SourceType.OFFICIAL_RECORD, "https://court/docket/1"));
        c.addSource(new Source(SourceType.MAINSTREAM_COVERAGE, "https://news/story/1"));
        return c;
    }

    private NamedIndividual approvedDefendant() {
        NamedIndividual n = new NamedIndividual("Jane Roe", IndividualRole.DEFENDANT);
        n.approveNaming("editor@site");
        return n;
    }

    @Test
    @DisplayName("names a charged, approved defendant with dual sourcing")
    void allowsFullyQualifiedNaming() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.CHARGED);
        c.setState(CaseState.PUBLISHED_OPEN);
        assertTrue(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("refuses when the human gate flag is not set")
    void deniesWithoutHumanApproval() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.CHARGED);
        NamedIndividual notApproved = new NamedIndividual("Jane Roe", IndividualRole.DEFENDANT);
        NamingDecision d = gate.canRenderName(notApproved, c);
        assertFalse(d.allowed());
        assertTrue(d.reasons().stream().anyMatch(r -> r.contains("gate_passed=false")));
    }

    @Test
    @DisplayName("refuses when there is no charge on record")
    void deniesWhenNoChargeReported() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.NONE_REPORTED);
        assertFalse(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("refuses when sourcing is a single record")
    void deniesSingleSource() {
        CrimeCase c = new CrimeCase("x", "assault", "Norristown", "PA");
        c.addSource(new Source(SourceType.OFFICIAL_RECORD, "https://court/1"));
        c.setLegalStatus(LegalStatus.CHARGED);
        assertFalse(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("refuses when both sources are the same type (no mainstream corroboration)")
    void deniesWhenMissingMainstream() {
        CrimeCase c = new CrimeCase("x", "assault", "Norristown", "PA");
        c.addSource(new Source(SourceType.OFFICIAL_RECORD, "https://court/1"));
        c.addSource(new Source(SourceType.OFFICIAL_RECORD, "https://court/2"));
        c.setLegalStatus(LegalStatus.CHARGED);
        assertFalse(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("refuses to name an acquitted person even if everything else passes")
    void deniesAcquitted() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.ACQUITTED);
        c.setState(CaseState.RESOLVED);
        c.setDisposition("acquitted at trial");
        assertFalse(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("never names an expunged record, regardless of prior approval")
    void deniesExpungedEvenIfApproved() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.EXPUNGED);
        assertFalse(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("does not name anyone on a retracted (de-indexed) case")
    void deniesRetractedCase() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.CONVICTED);
        c.setState(CaseState.RETRACTED);
        assertFalse(gate.isNameable(approvedDefendant(), c));
    }

    @Test
    @DisplayName("revoking naming (e.g. after a correction) flips the decision back to deny")
    void revokeReturnsToDeny() {
        CrimeCase c = caseWithDualSourcing();
        c.setLegalStatus(LegalStatus.CONVICTED);
        NamedIndividual n = approvedDefendant();
        assertTrue(gate.isNameable(n, c));
        n.revokeNaming();
        assertFalse(gate.isNameable(n, c));
    }
}
