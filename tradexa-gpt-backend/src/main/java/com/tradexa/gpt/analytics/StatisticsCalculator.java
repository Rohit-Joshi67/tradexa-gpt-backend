package com.tradexa.gpt.analytics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class StatisticsCalculator {

    private static final int MONEY_SCALE = 4;
    private static final int STAT_SCALE = 6;

    private StatisticsCalculator() {
    }

    public static BigDecimal mean(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal sum = values.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(
                BigDecimal.valueOf(values.size()),
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }

    public static BigDecimal median(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<BigDecimal> sorted = new ArrayList<>(values);
        Collections.sort(sorted);

        int size = sorted.size();
        int middle = size / 2;

        if (size % 2 == 1) {
            return sorted.get(middle).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        }

        BigDecimal lower = sorted.get(middle - 1);
        BigDecimal upper = sorted.get(middle);

        return lower.add(upper)
                .divide(BigDecimal.valueOf(2), MONEY_SCALE, RoundingMode.HALF_UP);
    }

    public static double variance(List<BigDecimal> values) {
        if (values.size() < 2) {
            return 0.0;
        }

        double meanValue = mean(values).doubleValue();
        double sumSquaredDiff = 0.0;

        for (BigDecimal value : values) {
            double diff = value.doubleValue() - meanValue;
            sumSquaredDiff += diff * diff;
        }

        return roundStat(sumSquaredDiff / (values.size() - 1));
    }

    public static double standardDeviation(List<BigDecimal> values) {
        return roundStat(Math.sqrt(variance(values)));
    }

    public static double skewness(List<BigDecimal> values) {
        int n = values.size();
        if (n < 3) {
            return 0.0;
        }

        double meanValue = mean(values).doubleValue();
        double stdDev = standardDeviation(values);

        if (stdDev == 0.0) {
            return 0.0;
        }

        double sumCubedZ = 0.0;
        for (BigDecimal value : values) {
            double z = (value.doubleValue() - meanValue) / stdDev;
            sumCubedZ += z * z * z;
        }

        double adjustment = (double) n / ((n - 1.0) * (n - 2.0));
        return roundStat(adjustment * sumCubedZ);
    }

    /**
     * Trading expectancy per trade:
     * (winRate × averageWin) + (lossRate × averageLoss)
     * averageLoss is expected to be negative for losing trades.
     */
    public static BigDecimal expectancy(
            double winRatePercent,
            BigDecimal averageProfit,
            BigDecimal averageLoss,
            long winningTrades,
            long losingTrades
    ) {
        long totalOutcomeTrades = winningTrades + losingTrades;
        if (totalOutcomeTrades == 0) {
            return BigDecimal.ZERO;
        }

        double winRate = winningTrades / (double) totalOutcomeTrades;
        double lossRate = losingTrades / (double) totalOutcomeTrades;

        BigDecimal winComponent = averageProfit.multiply(BigDecimal.valueOf(winRate));
        BigDecimal lossComponent = averageLoss.multiply(BigDecimal.valueOf(lossRate));

        return winComponent.add(lossComponent).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    public static BigDecimal safePnl(BigDecimal pnl) {
        return pnl == null ? BigDecimal.ZERO : pnl;
    }

    private static double roundStat(double value) {
        return BigDecimal.valueOf(value)
                .setScale(STAT_SCALE, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
