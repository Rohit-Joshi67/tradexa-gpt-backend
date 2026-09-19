package com.tradexa.gpt.billing;

import com.tradexa.gpt.entity.PromoClaim;
import com.tradexa.gpt.repository.PromoClaimRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PromoClaimRepositoryTest {

    @Autowired
    private PromoClaimRepository promoClaimRepository;

    private void seed(String code, int maxClaims) {
        PromoClaim row = new PromoClaim();
        row.setCode(code);
        row.setClaimed(0);
        row.setMaxClaims(maxClaims);
        promoClaimRepository.save(row);
    }

    @Test
    void claimSlotGrantsUpToMaxThenStops() {
        seed("PRO_LAUNCH", 2);

        assertEquals(1, promoClaimRepository.claimSlot("PRO_LAUNCH"));
        assertEquals(1, promoClaimRepository.claimSlot("PRO_LAUNCH"));
        assertEquals(0, promoClaimRepository.claimSlot("PRO_LAUNCH"));

        PromoClaim row = promoClaimRepository.findById("PRO_LAUNCH").orElseThrow();
        assertEquals(2, row.getClaimed());
    }

    @Test
    void releaseSlotReturnsSlotToPool() {
        seed("PRO_LAUNCH", 1);

        assertEquals(1, promoClaimRepository.claimSlot("PRO_LAUNCH"));
        assertEquals(0, promoClaimRepository.claimSlot("PRO_LAUNCH"));

        assertEquals(1, promoClaimRepository.releaseSlot("PRO_LAUNCH"));
        assertEquals(1, promoClaimRepository.claimSlot("PRO_LAUNCH"));
    }

    @Test
    void releaseSlotNeverGoesNegative() {
        seed("PRO_LAUNCH", 1);

        assertEquals(0, promoClaimRepository.releaseSlot("PRO_LAUNCH"));
        PromoClaim row = promoClaimRepository.findById("PRO_LAUNCH").orElseThrow();
        assertEquals(0, row.getClaimed());
    }
}
