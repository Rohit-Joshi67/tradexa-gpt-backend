package com.tradexa.gpt.analytics;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class StatisticsCalculatorTest {

    @Test
    void meanMedianVarianceAndSkewness() {
        List<BigDecimal> values = List.of(
                BigDecimal.valueOf(-20),
                BigDecimal.valueOf(10),
                BigDecimal.valueOf(30),
                BigDecimal.valueOf(40),
                BigDecimal.valueOf(-10)
        );

        assertEquals(0, BigDecimal.valueOf(10).compareTo(StatisticsCalculator.mean(values)));
        assertEquals(0, BigDecimal.valueOf(10).compareTo(StatisticsCalculator.median(values)));
        assertTrue(StatisticsCalculator.variance(values) > 0);
        assertTrue(StatisticsCalculator.standardDeviation(values) > 0);
    }

    @Test
    void expectancyUsesWinAndLossRates() {
        BigDecimal expectancy = StatisticsCalculator.expectancy(
                60.0,
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(-50),
                3,
                2
        );

        assertEquals(0, BigDecimal.valueOf(40).compareTo(expectancy));
    }

    @Test
    void skewnessReturnsZeroForInsufficientData() {
        assertEquals(0.0, StatisticsCalculator.skewness(List.of(BigDecimal.ONE)));
        assertEquals(0.0, StatisticsCalculator.skewness(List.of(BigDecimal.ONE, BigDecimal.TEN)));
    }
}
