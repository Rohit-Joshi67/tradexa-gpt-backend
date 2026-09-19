package com.tradexa.gpt.exception;

/** Thrown when a request needs Tradexa Pro but the user is on Free (HTTP 402). */
public class PlanRequiredException extends RuntimeException {
    public PlanRequiredException(String message) {
        super(message);
    }
}
