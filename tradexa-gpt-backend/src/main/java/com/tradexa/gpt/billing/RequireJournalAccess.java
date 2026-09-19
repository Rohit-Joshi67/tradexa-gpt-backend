package com.tradexa.gpt.billing;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Put on journal/analytics/upload endpoints. Allows access when the user is
 * PRO or inside their 3-day free trial — otherwise HTTP 402 with an upsell
 * message.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireJournalAccess {
}
