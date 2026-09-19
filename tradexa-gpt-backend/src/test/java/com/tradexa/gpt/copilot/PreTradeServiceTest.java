package com.tradexa.gpt.copilot;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PreTradeServiceTest {

    private static PreTradeService.PreTradeInput input(String side, String entry, String stop,
                                                      String target, String qty,
                                                      String account, String maxRiskPct) {
        return new PreTradeService.PreTradeInput(
                "NIFTY",
                PreTradeService.Side.valueOf(side),
                new BigDecimal(entry), new BigDecimal(stop), new BigDecimal(target),
                new BigDecimal(qty), new BigDecimal(account), new BigDecimal(maxRiskPct));
    }

    @Test
    void healthyLong_passes() {
        // Risk ₹50 on a ₹100k account = 0.05%; R = 2.0
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("LONG", "100", "95", "110", "10", "100000", "1"));
        assertEquals(PreTradeService.Verdict.PASS, r.verdict);
        assertEquals(new BigDecimal("50.00"), r.riskAmount);
        assertEquals(new BigDecimal("100.00"), r.rewardAmount);
        assertEquals(0.05, r.riskPctOfAccount, 1e-6);
        assertEquals(2.0, r.rMultiple, 1e-6);
        assertTrue(r.checklist.stream().allMatch(c -> c.ok));
    }

    @Test
    void oversizedPosition_flags() {
        // Risk ₹5000 = 5% of account > 1% budget
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("LONG", "100", "95", "110", "1000", "100000", "1"));
        assertEquals(PreTradeService.Verdict.FLAG, r.verdict);
        assertEquals(5.0, r.riskPctOfAccount, 1e-6);
        assertTrue(r.checklist.stream()
                .filter(c -> c.label.startsWith("Risk is within budget"))
                .allMatch(c -> !c.ok));
    }

    @Test
    void stopOnWrongSide_flags() {
        // LONG with stop ABOVE entry is structurally invalid.
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("LONG", "100", "105", "110", "10", "100000", "1"));
        assertEquals(PreTradeService.Verdict.FLAG, r.verdict);
        assertTrue(r.checklist.stream()
                .filter(c -> c.label.startsWith("Stop-loss"))
                .allMatch(c -> !c.ok));
    }

    @Test
    void poorAsymmetry_needsReview() {
        // R = 0.4 < 1.0 but within risk budget -> REVIEW, not FLAG.
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("LONG", "100", "95", "102", "10", "100000", "1"));
        assertEquals(PreTradeService.Verdict.REVIEW, r.verdict);
        assertEquals(0.4, r.rMultiple, 1e-6);
    }

    @Test
    void healthyShort_passes() {
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("SHORT", "100", "105", "90", "10", "100000", "1"));
        assertEquals(PreTradeService.Verdict.PASS, r.verdict);
        assertEquals(2.0, r.rMultiple, 1e-6);
    }

    @Test
    void shortWithStopBelowEntry_flags() {
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("SHORT", "100", "95", "90", "10", "100000", "1"));
        assertEquals(PreTradeService.Verdict.FLAG, r.verdict);
    }

    @Test
    void riskExactlyAtBudget_passes() {
        // Risk exactly 1% of account is within budget (boundary inclusive).
        PreTradeService.PreTradeResult r =
                PreTradeService.evaluate(input("LONG", "100", "90", "120", "100", "100000", "1"));
        assertEquals(1.0, r.riskPctOfAccount, 1e-6);
        assertEquals(PreTradeService.Verdict.PASS, r.verdict);
    }
}
