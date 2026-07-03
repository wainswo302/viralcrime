package com.viralcrime.api.service;

import java.util.List;

/**
 * Result of a naming-gate evaluation. Carries the reasons so failures are
 * explainable in tests, logs, and editor tooling.
 */
public record NamingDecision(boolean allowed, List<String> reasons) {
    public static NamingDecision allow() { return new NamingDecision(true, List.of()); }
    public static NamingDecision deny(List<String> reasons) { return new NamingDecision(false, reasons); }
}
