package com.viralcrime.api.service;

import com.viralcrime.api.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Applies human-approved drafts to cases. This is the ONLY path by which a
 * monitor finding changes a case's legal status or disposition — the pipeline
 * can propose, but only an approval here mutates the record.
 */
@Service
public class DraftService {

    private final CaseDraftRepository drafts;
    private final CrimeCaseRepository cases;
    private final CaseLifecycleService lifecycle;

    public DraftService(CaseDraftRepository drafts, CrimeCaseRepository cases, CaseLifecycleService lifecycle) {
        this.drafts = drafts;
        this.cases = cases;
        this.lifecycle = lifecycle;
    }

    @Transactional
    public CaseDraft approve(CaseDraft draft, String reviewer) {
        if (draft.getStatus() != DraftStatus.PENDING) {
            throw new IllegalStateException("draft is not pending");
        }

        if (draft.getKind() == DraftKind.NEW_CASE) {
            createCase(draft);
        } else if (draft.getKind() == DraftKind.DISPOSITION_UPDATE) {
            CrimeCase c = draft.getCrimeCase();
            if (draft.getProposedLegalStatus() != null) {
                c.setLegalStatus(draft.getProposedLegalStatus());
            }
            if (draft.getProposedDisposition() != null) {
                c.setDisposition(draft.getProposedDisposition());
            }
            resolve(c);   // walk to RESOLVED via legal transitions
        }
        // STATUS_CHANGE / NOTE kinds: recorded as approved without auto-mutation.

        draft.markApproved(reviewer);
        return drafts.save(draft);
    }

    /** Approving a NEW_CASE draft creates the case SURFACED — verification still happens by hand. */
    private void createCase(CaseDraft draft) {
        if (cases.findBySlug(draft.getProposedSlug()).isPresent()) {
            throw new IllegalStateException("a case with slug '" + draft.getProposedSlug() + "' already exists");
        }
        CrimeCase c = new CrimeCase(
            draft.getProposedSlug(),
            draft.getProposedEventType(),
            draft.getProposedJurisdictionCity(),
            draft.getProposedJurisdictionState()
        );
        c.setHeadline(draft.getProposedHeadline());
        if (draft.getProposedEmbedUrl() != null) {
            c.addEmbedRef(draft.getProposedEmbedUrl());
        }
        cases.save(c);
    }

    @Transactional
    public CaseDraft reject(CaseDraft draft, String reviewer) {
        if (draft.getStatus() != DraftStatus.PENDING) {
            throw new IllegalStateException("draft is not pending");
        }
        draft.markRejected(reviewer);
        return drafts.save(draft);
    }

    /** Advance a case to RESOLVED through the only legal path. Disposition must be set. */
    private void resolve(CrimeCase c) {
        if (c.getState() == CaseState.PUBLISHED_OPEN) {
            lifecycle.transition(c, CaseState.MONITORING);
        }
        if (c.getState() == CaseState.MONITORING) {
            lifecycle.transition(c, CaseState.RESOLVED);  // guard requires disposition
        }
    }
}
