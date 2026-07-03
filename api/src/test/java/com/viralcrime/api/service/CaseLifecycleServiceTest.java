package com.viralcrime.api.service;

import com.viralcrime.api.domain.CaseState;
import com.viralcrime.api.domain.CrimeCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CaseLifecycleServiceTest {

    private final CaseLifecycleService svc = new CaseLifecycleService();

    private CrimeCase freshCase() {
        return new CrimeCase("case-1", "assault", "Norristown", "PA");
    }

    @Test
    @DisplayName("walks the happy path from surfaced to resolved")
    void happyPath() {
        CrimeCase c = freshCase();
        svc.transition(c, CaseState.VERIFYING);
        svc.transition(c, CaseState.PUBLISHED_OPEN);
        svc.transition(c, CaseState.MONITORING);
        c.setDisposition("convicted; 2 years probation");
        svc.transition(c, CaseState.RESOLVED);
        assertEquals(CaseState.RESOLVED, c.getState());
    }

    @Test
    @DisplayName("rejects a skipped stage")
    void rejectsIllegalSkip() {
        CrimeCase c = freshCase();
        assertThrows(InvalidTransitionException.class,
            () -> svc.transition(c, CaseState.RESOLVED));
    }

    @Test
    @DisplayName("refuses to resolve without a recorded disposition")
    void refusesResolveWithoutDisposition() {
        CrimeCase c = freshCase();
        svc.transition(c, CaseState.VERIFYING);
        svc.transition(c, CaseState.PUBLISHED_OPEN);
        svc.transition(c, CaseState.MONITORING);
        InvalidTransitionException ex = assertThrows(InvalidTransitionException.class,
            () -> svc.transition(c, CaseState.RESOLVED));
        assertTrue(ex.getMessage().toLowerCase().contains("disposition"));
    }

    @Test
    @DisplayName("allows a resolved case to reopen for correction (appeal / expungement)")
    void resolvedCanReopen() {
        CrimeCase c = freshCase();
        svc.transition(c, CaseState.VERIFYING);
        svc.transition(c, CaseState.PUBLISHED_OPEN);
        svc.transition(c, CaseState.MONITORING);
        c.setDisposition("convicted");
        svc.transition(c, CaseState.RESOLVED);
        assertDoesNotThrow(() -> svc.transition(c, CaseState.CORRECTED));
    }

    @Test
    @DisplayName("retraction is terminal and stops monitoring")
    void retractionIsTerminal() {
        CrimeCase c = freshCase();
        svc.transition(c, CaseState.RETRACTED);
        assertFalse(c.isMonitoringActive());
        assertThrows(InvalidTransitionException.class,
            () -> svc.transition(c, CaseState.VERIFYING));
    }
}
