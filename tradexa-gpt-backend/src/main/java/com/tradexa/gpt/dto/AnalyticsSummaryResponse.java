package com.tradexa.gpt.dto;

import java.math.BigDecimal;

public class AnalyticsSummaryResponse {

    private long totalTrades;
    private long winningTrades;
    private long losingTrades;

    private BigDecimal totalPnl;
    private double winRate;

    private BigDecimal averageProfit;
    private BigDecimal averageLoss;

    private BigDecimal meanPnl;
    private BigDecimal medianPnl;
    private double variance;
    private double standardDeviation;
    private double skewness;
    private BigDecimal expectancy;

    public long getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(long totalTrades) {
        this.totalTrades = totalTrades;
    }

    public long getWinningTrades() {
        return winningTrades;
    }

    public void setWinningTrades(long winningTrades) {
        this.winningTrades = winningTrades;
    }

    public long getLosingTrades() {
        return losingTrades;
    }

    public void setLosingTrades(long losingTrades) {
        this.losingTrades = losingTrades;
    }

    public BigDecimal getTotalPnl() {
        return totalPnl;
    }

    public void setTotalPnl(BigDecimal totalPnl) {
        this.totalPnl = totalPnl;
    }

    public double getWinRate() {
        return winRate;
    }

    public void setWinRate(double winRate) {
        this.winRate = winRate;
    }

    public BigDecimal getAverageProfit() {
        return averageProfit;
    }

    public void setAverageProfit(BigDecimal averageProfit) {
        this.averageProfit = averageProfit;
    }

    public BigDecimal getAverageLoss() {
        return averageLoss;
    }

    public void setAverageLoss(BigDecimal averageLoss) {
        this.averageLoss = averageLoss;
    }

    public BigDecimal getMeanPnl() {
        return meanPnl;
    }

    public void setMeanPnl(BigDecimal meanPnl) {
        this.meanPnl = meanPnl;
    }

    public BigDecimal getMedianPnl() {
        return medianPnl;
    }

    public void setMedianPnl(BigDecimal medianPnl) {
        this.medianPnl = medianPnl;
    }

    public double getVariance() {
        return variance;
    }

    public void setVariance(double variance) {
        this.variance = variance;
    }

    public double getStandardDeviation() {
        return standardDeviation;
    }

    public void setStandardDeviation(double standardDeviation) {
        this.standardDeviation = standardDeviation;
    }

    public double getSkewness() {
        return skewness;
    }

    public void setSkewness(double skewness) {
        this.skewness = skewness;
    }

    public BigDecimal getExpectancy() {
        return expectancy;
    }

    public void setExpectancy(BigDecimal expectancy) {
        this.expectancy = expectancy;
    }
}
