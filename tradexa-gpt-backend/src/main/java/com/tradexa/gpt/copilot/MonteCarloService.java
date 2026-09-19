package com.tradexa.gpt.copilot;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Edge-validator math, moved server-side so the numbers are canonical and
 * Pro-gated. Everything here is pure and deterministic: given the same input
 * (including seed) the output is identical, which makes it unit-testable.
 *
 * Formulas mirror the original client-side validator exactly.
 */
public class MonteCarloService {

    public static final int MAX_PATHS = 8;

    private MonteCarloService() {
    }

    public record McInput(
            double winRatePct,
            double avgWin,
            double avgLoss,
            double fees,
            int trades,
            int paths,
            double capital,
            long seed
    ) {
        public McInput {
            if (winRatePct < 0 || winRatePct > 100) throw new IllegalArgumentException("winRate must be 0-100");
            if (avgWin < 0 || avgLoss < 0) throw new IllegalArgumentException("avgWin/avgLoss must be >= 0");
            if (fees < 0) throw new IllegalArgumentException("fees must be >= 0");
            if (trades < 1 || trades > 10_000) throw new IllegalArgumentException("trades must be 1-10000");
            if (capital <= 0) throw new IllegalArgumentException("capital must be > 0");
        }
    }

    public static class EdgeStats {
        public double netExpectancy;
        public double profitFactor;
        public double breakEvenWinRatePct;
        public double edgePct;
        public double expectedRPer100;
        public double payoffRatio;
        public double kellyPct;
        public double halfKellyPct;
        public double prob5LossesPct;
        public double prob10LossesPct;
        public double expectedLosingStreak;
    }

    public static class McStats {
        public double probProfitPct;
        public double medianFinal;
        public double p5Final;
        public double p95Final;
        public double medianMaxDrawdownPct;
        public double probRuinPct;
    }

    public static class EdgeValidateResult {
        public EdgeStats stats;
        public McStats mcStats;
        /** Equity curves: one list per path, each with trades+1 points starting at capital. */
        public List<List<Double>> paths;
    }

    /** Pure edge statistics — no randomness. */
    public static EdgeStats edgeStats(double winRatePct, double avgWin, double avgLoss,
                                      double fees, int trades) {
        double w = winRatePct / 100.0;
        double l = 1.0 - w;

        EdgeStats s = new EdgeStats();
        double gross = w * avgWin - l * avgLoss;
        s.netExpectancy = gross - fees;
        s.profitFactor = (l * avgLoss) == 0 ? 99.0 : (w * avgWin) / (l * avgLoss);
        s.breakEvenWinRatePct = (avgLoss + fees) == 0 && (avgWin + avgLoss + 2 * fees) == 0
                ? 0 : (avgLoss + fees) / (avgWin + avgLoss + 2 * fees) * 100.0;
        s.edgePct = avgLoss == 0 ? 0 : (s.netExpectancy / avgLoss) * 100.0;
        s.expectedRPer100 = s.edgePct;
        s.payoffRatio = avgLoss == 0 ? 0 : avgWin / avgLoss;
        double kelly = s.payoffRatio == 0 ? 0 : w - (l / s.payoffRatio);
        s.kellyPct = kelly * 100.0;
        s.halfKellyPct = kelly > 0 ? kelly * 100.0 * 0.5 : 0;
        s.prob5LossesPct = Math.pow(l, 5) * 100.0;
        s.prob10LossesPct = Math.pow(l, 10) * 100.0;
        s.expectedLosingStreak = (l == 0 || trades <= 1) ? 0 : Math.log(trades) / Math.log(1.0 / l);
        return s;
    }

    /** Deterministic Monte Carlo: same seed => identical curves, always. */
    public static EdgeValidateResult simulate(McInput in) {
        int paths = Math.min(Math.max(in.paths(), 1), MAX_PATHS);
        Random rng = new Random(in.seed());
        double w = in.winRatePct() / 100.0;

        List<List<Double>> curves = new ArrayList<>();
        double[] finals = new double[paths];
        double[] maxDrawdowns = new double[paths];

        for (int p = 0; p < paths; p++) {
            List<Double> curve = new ArrayList<>(in.trades() + 1);
            double equity = in.capital();
            double peak = equity;
            double maxDd = 0;
            curve.add(round2(equity));
            for (int t = 0; t < in.trades(); t++) {
                boolean win = rng.nextDouble() < w;
                equity += win ? (in.avgWin() - in.fees()) : (-in.avgLoss() - in.fees());
                if (equity > peak) peak = equity;
                double dd = peak == 0 ? 0 : (peak - equity) / peak * 100.0;
                if (dd > maxDd) maxDd = dd;
                curve.add(round2(equity));
            }
            curves.add(curve);
            finals[p] = equity;
            maxDrawdowns[p] = maxDd;
        }

        Arrays.sort(finals);
        Arrays.sort(maxDrawdowns);

        McStats mc = new McStats();
        long profitable = Arrays.stream(finals).filter(f -> f > in.capital()).count();
        mc.probProfitPct = profitable * 100.0 / paths;
        mc.medianFinal = round2(percentile(finals, 50));
        mc.p5Final = round2(percentile(finals, 5));
        mc.p95Final = round2(percentile(finals, 95));
        mc.medianMaxDrawdownPct = round2(percentile(maxDrawdowns, 50));
        double ruinLine = in.capital() * 0.2;
        // A path "ruins" if its final equity is below 20% of starting capital.
        long ruined = Arrays.stream(finals).filter(f -> f < ruinLine).count();
        mc.probRuinPct = ruined * 100.0 / paths;

        EdgeValidateResult result = new EdgeValidateResult();
        result.stats = edgeStats(in.winRatePct(), in.avgWin(), in.avgLoss(), in.fees(), in.trades());
        result.mcStats = mc;
        result.paths = curves;
        return result;
    }

    private static double percentile(double[] sorted, double pct) {
        if (sorted.length == 0) return 0;
        if (sorted.length == 1) return sorted[0];
        double rank = pct / 100.0 * (sorted.length - 1);
        int lo = (int) Math.floor(rank);
        int hi = (int) Math.ceil(rank);
        if (lo == hi) return sorted[lo];
        return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
