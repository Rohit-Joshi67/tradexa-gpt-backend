package com.tradexa.gpt.dto;

import java.math.BigDecimal;

public class MarketHourAnalyticsResponse {

    private int hour;
    private String hourLabel;
    private String marketSession;
    private long totalTrades;
    private long winningTrades;
    private long losingTrades;
    private BigDecimal totalPnl;
    private double winRate;
    private BigDecimal meanPnl;

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public String getHourLabel() {
        return hourLabel;
    }

    public void setHourLabel(String hourLabel) {
        this.hourLabel = hourLabel;
    }

    public String getMarketSession() {
        return marketSession;
    }

    public void setMarketSession(String marketSession) {
        this.marketSession = marketSession;
    }

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

    public BigDecimal getMeanPnl() {
        return meanPnl;
    }

    public void setMeanPnl(BigDecimal meanPnl) {
        this.meanPnl = meanPnl;
    }
}
