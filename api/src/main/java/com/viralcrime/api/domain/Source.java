package com.viralcrime.api.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "sources")
public class Source {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id")
    private CrimeCase crimeCase;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private SourceType sourceType;

    @Column(nullable = false, length = 1000)
    private String url;

    private String label;

    protected Source() { }

    public Source(SourceType sourceType, String url) {
        this.sourceType = sourceType;
        this.url = url;
    }

    public UUID getId() { return id; }
    public SourceType getSourceType() { return sourceType; }
    public String getUrl() { return url; }
    void setCrimeCase(CrimeCase c) { this.crimeCase = c; }
}
