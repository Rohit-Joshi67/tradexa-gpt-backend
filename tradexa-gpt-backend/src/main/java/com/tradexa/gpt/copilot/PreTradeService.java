package com.tradexa.gpt.copilot;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pre-trade discipline check. The math is fully deterministic and runs before
 * any LLM commentary: risk in rupees, R-multiple, and position-size sanity
 * against the account. The verdict is computed, never hallucinated.
 */
public class PreTradeService {

    public enum Side { LONG, SHORT }

    public enum Verdict { PASS, REVIEW, FLAG }

    public record PreTradeInput(
            String symbol,
            Side side,
            BigDecimal entry,
            BigDecimal stop,
            BigDecimal target,
            BigDecimal quantity,
            BigDecimal accountSize,
            BigDecimal maxRiskPct
    ) {}

    public static class ChecklistItem {
        public String label;
        public boolean ok;
        public String detail;

        public ChecklistItem(String label, boolean ok, String detail) {
            this.label = label;
            this.ok = ok;
            this.detail = detail;
        }
    }

    public static class PreTradeResult {
        public BigDecimal riskAmount;
        public BigDecimal rewardAmount;
        public double riskPctOfAccount;
        public double rMultiple;
        public Verdict verdict;
        public List<ChecklistItem> checklist = new ArrayList<>();
        /** Optional LLM commentary; null when the AI is not configured. */
        public String aiCommentary;
    }

    private PreTradeService() {
    }

    public static PreTradeResult evaluate(PreTradeInput in) {
        PreTradeResult result = new PreTradeResult();

        BigDecimal entry = in.entry();
        BigDecimal stop = in.stop();
        BigDecimal target = in.target();
        BigDecimal qty = in.quantity();
        BigDecimal account = in.accountSize();
        BigDecimal maxRiskPct = in.maxRiskPct() != null ? in.maxRiskPct() : BigDecimal.ONE;

        List<String> problems = new ArrayList<>();

        // --- Structural validity: stop must be on the correct side of entry.
        boolean stopSideOk = in.side() == Side.LONG
                ? stop.compareTo(entry) < 0
                : stop.compareTo(entry) > 0;
        result.checklist.add(new ChecklistItem(
                "Stop-loss is on the correct side of entry",
                stopSideOk,
                stopSideOk ? "Structure is valid."
                        : "For a " + in.side() + " the stop must be "
                        + (in.side() == Side.LONG ? "below" : "above") + " entry."));
        if (!stopSideOk) problems.add("invalid stop placement");

        boolean qtyOk = qty.compareTo(BigDecimal.ZERO) > 0;
        result.checklist.add(new ChecklistItem(
                "Position size is positive", qtyOk,
                qtyOk ? qty.stripTrailingZeros().toPlainString() + " units." : "Quantity must be > 0."));
        if (!qtyOk) problems.add("invalid quantity");

        boolean accountOk = account.compareTo(BigDecimal.ZERO) > 0;
        if (!accountOk) problems.add("invalid account size");

        BigDecimal riskPerUnit = entry.subtract(stop).abs();
        BigDecimal rewardPerUnit = target.subtract(entry).abs();
        BigDecimal riskAmount = riskPerUnit.multiply(qty).setScale(2, RoundingMode.HALF_UP);
        BigDecimal rewardAmount = rewardPerUnit.multiply(qty).setScale(2, RoundingMode.HALF_UP);
        result.riskAmount = riskAmount;
        result.rewardAmount = rewardAmount;

        double riskPct = 0;
        if (accountOk) {
            riskPct = riskAmount.divide(account, 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }
        result.riskPctOfAccount = round2(riskPct);

        double rMultiple = riskPerUnit.compareTo(BigDecimal.ZERO) == 0 ? 0
                : rewardPerUnit.divide(riskPerUnit, 6, RoundingMode.HALF_UP).doubleValue();
        result.rMultiple = round2(rMultiple);

        // --- Risk budget check.
        boolean withinBudget = accountOk && riskPct <= maxRiskPct.doubleValue() + 1e-9;
        result.checklist.add(new ChecklistItem(
                "Risk is within budget (≤ " + maxRiskPct.stripTrailingZeros().toPlainString() + "% of account)",
                withinBudget,
                "Risking ₹" + riskAmount.toPlainString() + " = " + round2(riskPct)
                        + "% of a ₹" + account.stripTrailingZeros().toPlainString() + " account."));
        if (!withinBudget) problems.add("risk exceeds budget");

        // --- Asymmetry check.
        boolean asymmetryOk = rMultiple >= 1.0;
        result.checklist.add(new ChecklistItem(
                "Reward justifies the risk (R ≥ 1.0)",
                asymmetryOk,
                "R-multiple: " + round2(rMultiple) + "R."));
        boolean needsReview = asymmetryOk == false;

        // --- Target on the correct side.
        boolean targetSideOk = in.side() == Side.LONG
                ? target.compareTo(entry) > 0
                : target.compareTo(entry) < 0;
        result.checklist.add(new ChecklistItem(
                "Target is on the correct side of entry",
                targetSideOk,
                targetSideOk ? "Structure is valid." : "Target conflicts with the trade direction."));
        if (!targetSideOk) problems.add("invalid target placement");

        // --- Verdict.
        if (!problems.isEmpty()) {
            result.verdict = Verdict.FLAG;
        } else if (needsReview) {
            result.verdict = Verdict.REVIEW;
        } else {
            result.verdict = Verdict.PASS;
        }

        return result;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
