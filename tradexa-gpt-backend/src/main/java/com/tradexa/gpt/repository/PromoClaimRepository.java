package com.tradexa.gpt.repository;

import com.tradexa.gpt.entity.PromoClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Atomic launch-offer slot claims. The UPDATE only succeeds when a slot is
 * still free, so concurrent subscribe requests can never oversell the
 * first-100 offer. Returns 1 when the caller won a slot, 0 otherwise.
 */
public interface PromoClaimRepository extends JpaRepository<PromoClaim, String> {

    @Modifying
    @Query("UPDATE PromoClaim p SET p.claimed = p.claimed + 1 " +
           "WHERE p.code = :code AND p.claimed < p.maxClaims")
    int claimSlot(@Param("code") String code);

    /** Releases a slot (abandoned checkout) — never drops below zero. */
    @Modifying
    @Query("UPDATE PromoClaim p SET p.claimed = p.claimed - 1 " +
           "WHERE p.code = :code AND p.claimed > 0")
    int releaseSlot(@Param("code") String code);
}
