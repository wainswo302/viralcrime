package com.viralcrime.api.service;

import com.viralcrime.api.domain.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * The naming gate — the primary liability shield, enforced in code.
 *
 * A NamedIndividual may be rendered ONLY when every condition below holds.
 * The gate is deliberately conservative: when in doubt it denies, because the
 * project's rule is "rather publish a less complete page than a wrong one."
 *
 * Callers MUST route every individual through {@link #canRenderName} before
 * serialization. Serializers should treat a denied individual as if the record
 * does not exist (no name in title, URL, body, or schema).
 */
@Service
public class NamingGateService {

    /**
     * Legal statuses under which a defendant-of-record may be named.
     * ACQUITTED, DISMISSED, EXPUNGED and NONE_REPORTED are excluded on purpose:
     * those are "no charge" or "resolved in the person's favor" cases where the
     * policy leans toward de-naming and de-indexing.
     */
    private static final Set<LegalStatus> NAMEABLE_STATUSES =
        EnumSet.of(LegalStatus.CHARGED, LegalStatus.PLEA, LegalStatus.CONVICTED);

    public NamingDecision canRenderName(NamedIndividual person, CrimeCase c) {
        List<String> reasons = new ArrayList<>();

        if (c.getState() == CaseState.RETRACTED) {
            reasons.add("case is retracted / de-indexed");
        }
        if (c.getLegalStatus() == LegalStatus.EXPUNGED) {
            reasons.add("record is expunged");
        }
        if (!person.isGatePassed()) {
            reasons.add("human editor has not approved naming (gate_passed=false)");
        }
        if (person.getRole() != IndividualRole.DEFENDANT) {
            reasons.add("only defendants of record may be named, never suspects");
        }
        if (!NAMEABLE_STATUSES.contains(c.getLegalStatus())) {
            reasons.add("legal status " + c.getLegalStatus() + " is not nameable");
        }
        if (!hasDualPrimarySourcing(c)) {
            reasons.add("requires >= 2 sources incl. an official record AND mainstream coverage");
        }

        return reasons.isEmpty() ? NamingDecision.allow() : NamingDecision.deny(reasons);
    }

    /** Convenience boolean for serializers. */
    public boolean isNameable(NamedIndividual person, CrimeCase c) {
        return canRenderName(person, c).allowed();
    }

    private boolean hasDualPrimarySourcing(CrimeCase c) {
        boolean official = false, mainstream = false;
        for (Source s : c.getSources()) {
            if (s.getSourceType() == SourceType.OFFICIAL_RECORD) official = true;
            if (s.getSourceType() == SourceType.MAINSTREAM_COVERAGE) mainstream = true;
        }
        return c.getSources().size() >= 2 && official && mainstream;
    }
}
