package com.viralcrime.api.service;

import com.viralcrime.api.domain.CaseState;

public class InvalidTransitionException extends RuntimeException {
    public InvalidTransitionException(CaseState from, CaseState to) {
        super("Illegal case transition: " + from + " -> " + to);
    }
    public InvalidTransitionException(String message) { super(message); }
}
