package com.tradexa.gpt.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "promo_claims")
public class PromoClaim {

    @Id
    private String code;          // e.g. 'PRO_LAUNCH'

    @Column(nullable = false)
    private int claimed = 0;

    @Column(name = "max_claims", nullable = false)
    private int maxClaims;

    public PromoClaim() {
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getClaimed() { return claimed; }
    public void setClaimed(int claimed) { this.claimed = claimed; }

    public int getMaxClaims() { return maxClaims; }
    public void setMaxClaims(int maxClaims) { this.maxClaims = maxClaims; }
}
