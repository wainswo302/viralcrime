package com.viralcrime.api.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CrimeCaseRepository extends JpaRepository<CrimeCase, UUID> {
    Optional<CrimeCase> findBySlug(String slug);
    List<CrimeCase> findByStateInOrderByIncidentDateDesc(List<CaseState> states);
}
