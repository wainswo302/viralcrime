package com.viralcrime.api.domain;
/**
 * What a draft proposes. DISPOSITION_UPDATE is the monitor's bread and butter.
 * NEW_CASE has no existing case to attach to — approval creates one, SURFACED,
 * for a human to verify and promote through the normal lifecycle.
 */
public enum DraftKind { DISPOSITION_UPDATE, STATUS_CHANGE, NOTE, NEW_CASE }
