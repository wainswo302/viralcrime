package com.viralcrime.api.service;

import com.viralcrime.api.domain.CaseState;
import com.viralcrime.api.domain.CrimeCase;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Enforces the legal transitions of the case lifecycle. This is deliberately
 * a small, pure, fully-tested unit: it is the spine the rest of the system
 * hangs off, and it is the code most worth showing an interviewer.
 */
@Service
public class CaseLifecycleService {

    private static final Map<CaseState, Set<CaseState>> ALLOWED = new EnumMap<>(CaseState.class);

    static {
        ALLOWED.put(CaseState.SURFACED,       EnumSet.of(CaseState.VERIFYING, CaseState.RETRACTED));
        ALLOWED.put(CaseState.VERIFYING,      EnumSet.of(CaseState.PUBLISHED_OPEN, CaseState.RETRACTED));
        ALLOWED.put(CaseState.PUBLISHED_OPEN, EnumSet.of(CaseState.MONITORING, CaseState.CORRECTED, CaseState.RETRACTED));
        ALLOWED.put(CaseState.MONITORING,     EnumSet.of(CaseState.RESOLVED, CaseState.CORRECTED, CaseState.RETRACTED));
        // RESOLVED is not terminal: appeals and expungements can reopen it.
        ALLOWED.put(CaseState.RESOLVED,       EnumSet.of(CaseState.CORRECTED, CaseState.RETRACTED));
        ALLOWED.put(CaseState.CORRECTED,      EnumSet.of(CaseState.MONITORING, CaseState.RESOLVED, CaseState.RETRACTED));
        ALLOWED.put(CaseState.RETRACTED,      EnumSet.noneOf(CaseState.class)); // terminal
    }

    public boolean canTransition(CaseState from, CaseState to) {
        return ALLOWED.getOrDefault(from, EnumSet.noneOf(CaseState.class)).contains(to);
    }

    /**
     * Apply a transition, enforcing both the state graph and content guards.
     * Guard: a case may not reach RESOLVED without a recorded disposition.
     */
    public void transition(CrimeCase c, CaseState to) {
        CaseState from = c.getState();
        if (!canTransition(from, to)) {
            throw new InvalidTransitionException(from, to);
        }
        if (to == CaseState.RESOLVED && isBlank(c.getDisposition())) {
            throw new InvalidTransitionException(
                "Cannot move to RESOLVED without a recorded disposition");
        }
        if (to == CaseState.RETRACTED) {
            c.setMonitoringActive(false);
        }
        c.setState(to);
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
