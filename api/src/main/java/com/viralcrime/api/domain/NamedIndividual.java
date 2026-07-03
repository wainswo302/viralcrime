package com.viralcrime.api.domain;

import jakarta.persistence.*;
import java.util.UUID;

/**
 * A person who may be named on a case page — but ONLY if the naming gate
 * passes. gate_passed defaults to false and is set by a human editor.
 */
@Entity
@Table(name = "named_individuals")
public class NamedIndividual {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id")
    private CrimeCase crimeCase;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IndividualRole role = IndividualRole.DEFENDANT;

    @Column(name = "gate_passed", nullable = false)
    private boolean gatePassed = false;

    @Column(name = "approved_by")
    private String approvedBy;

    protected NamedIndividual() { }

    public NamedIndividual(String fullName, IndividualRole role) {
        this.fullName = fullName;
        this.role = role;
    }

    public UUID getId() { return id; }
    public String getFullName() { return fullName; }
    public IndividualRole getRole() { return role; }
    public boolean isGatePassed() { return gatePassed; }
    public CrimeCase getCrimeCase() { return crimeCase; }

    /** Human editor approves; pipeline code must never call this. */
    public void approveNaming(String editor) {
        this.gatePassed = true;
        this.approvedBy = editor;
    }
    public void revokeNaming() { this.gatePassed = false; }

    void setCrimeCase(CrimeCase c) { this.crimeCase = c; }
}
