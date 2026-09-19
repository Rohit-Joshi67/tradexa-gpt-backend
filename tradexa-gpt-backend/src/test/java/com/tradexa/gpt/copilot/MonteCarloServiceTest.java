package com.tradexa.gpt.copilot;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MonteCarloServiceTest {

    private static final double DELTA = 1e-6;

    @Test
    void edgeStats_matchesKnownFormulas() {
        // winRate 50%, avgWin 200, avgLoss 100, no fees, 100 trades.
        MonteCarloService.EdgeStats s =
                MonteCarloService.edgeStats(50.0, 200.0, 100.0, 0.0, 100);

        assertEquals(50.0, s.netExpectancy, DELTA);            // 0.5*200 - 0.5*100
        assertEquals(2.0, s.profitFactor, DELTA);              // 100 / 50
        assertEquals(100.0 / 300.0 * 100.0, s.breakEvenWinRatePct, DELTA);
        assertEquals(50.0, s.edgePct, DELTA);                 // 50/100*100
        assertEquals(50.0, s.expectedRPer100, DELTA);
        assertEquals(2.0, s.payoffRatio, DELTA);
        assertEquals(25.0, s.kellyPct, DELTA);                // 0.5 - 0.5/2
        assertEquals(12.5, s.halfKellyPct, DELTA);
        assertEquals(3.125, s.prob5LossesPct, DELTA);          // 0.5^5*100
        assertEquals(0.09765625, s.prob10LossesPct, DELTA);   // 0.5^10*100
        assertEquals(Math.log(100) / Math.log(2), s.expectedLosingStreak, DELTA);
    }

    @Test
    void edgeStats_zeroLossAverage_doesNotDivideByZero() {
        MonteCarloService.EdgeStats s =
                MonteCarloService.edgeStats(100.0, 200.0, 0.0, 0.0, 100);
        assertEquals(99.0, s.profitFactor, DELTA);
        assertEquals(0.0, s.edgePct, DELTA);
        assertEquals(0.0, s.payoffRatio, DELTA);
    }

    @Test
    void simulate_isDeterministicForSameSeed() {
        MonteCarloService.McInput in =
                new MonteCarloService.McInput(45, 500, 250, 2, 100, 5, 10_000, 42L);

        MonteCarloService.EdgeValidateResult a = MonteCarloService.simulate(in);
        MonteCarloService.EdgeValidateResult b = MonteCarloService.simulate(in);

        assertEquals(a.paths, b.paths);
        assertEquals(a.mcStats.medianFinal, b.mcStats.medianFinal, DELTA);
        assertEquals(a.mcStats.probProfitPct, b.mcStats.probProfitPct, DELTA);
    }

    @Test
    void simulate_differentSeedsDiverge() {
        MonteCarloService.McInput a =
                new MonteCarloService.McInput(45, 500, 250, 2, 100, 5, 10_000, 1L);
        MonteCarloService.McInput b =
                new MonteCarloService.McInput(45, 500, 250, 2, 100, 5, 10_000, 2L);
        assertNotEquals(MonteCarloService.simulate(a).paths,
                MonteCarloService.simulate(b).paths);
    }

    @Test
    void simulate_curveShapeAndBounds() {
        MonteCarloService.McInput in =
                new MonteCarloService.McInput(45, 500, 250, 2, 100, 5, 10_000, 7L);
        MonteCarloService.EdgeValidateResult r = MonteCarloService.simulate(in);

        assertEquals(5, r.paths.size());
        for (List<Double> curve : r.paths) {
            assertEquals(101, curve.size());          // trades + 1, starting at capital
            assertEquals(10_000.0, curve.get(0), DELTA);
        }
        assertTrue(r.mcStats.probProfitPct >= 0 && r.mcStats.probProfitPct <= 100);
        assertTrue(r.mcStats.probRuinPct >= 0 && r.mcStats.probRuinPct <= 100);
        assertTrue(r.mcStats.medianMaxDrawdownPct >= 0);
        assertTrue(r.mcStats.p5Final <= r.mcStats.medianFinal);
        assertTrue(r.mcStats.medianFinal <= r.mcStats.p95Final);
    }

    @Test
    void simulate_capsPathsAtMax() {
        MonteCarloService.McInput in =
                new MonteCarloService.McInput(50, 100, 100, 0, 10, 64, 1000, 3L);
        MonteCarloService.EdgeValidateResult r = MonteCarloService.simulate(in);
        assertEquals(MonteCarloService.MAX_PATHS, r.paths.size());
    }

    @Test
    void simulate_rejectsBadInput() {
        assertThrows(IllegalArgumentException.class, () ->
                new MonteCarloService.McInput(101, 100, 100, 0, 100, 5, 1000, 1L));
        assertThrows(IllegalArgumentException.class, () ->
                new MonteCarloService.McInput(50, 100, 100, 0, 0, 5, 1000, 1L));
        assertThrows(IllegalArgumentException.class, () ->
                new MonteCarloService.McInput(50, 100, 100, 0, 100, 5, -1, 1L));
    }
}
