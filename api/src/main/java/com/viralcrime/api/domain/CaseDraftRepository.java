package com.viralcrime.api.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CaseDraftRepository extends JpaRepository<CaseDraft, UUID> {
    List<CaseDraft> findByStatusOrderByCreatedAtAsc(DraftStatus status);
}
