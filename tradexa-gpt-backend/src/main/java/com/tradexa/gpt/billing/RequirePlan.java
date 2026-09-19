package com.tradexa.gpt.billing;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Put on a controller method to require a paid plan. The plan is resolved
 * server-side on every request — the frontend can never bypass this.
 *
 * Example: {@code @RequirePlan("PRO")}
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePlan {
    String[] value() default "PRO";
}
