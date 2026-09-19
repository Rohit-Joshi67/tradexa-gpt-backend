package com.tradexa.gpt.copilot.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class EdgeValidateRequest {

    @NotNull(message = "winRate is required.")
    @DecimalMin(value = "0", message = "winRate must be 0-100.")
    @DecimalMax(value = "100", message = "winRate must be 0-100.")
    private Double winRate;

    @NotNull(message = "avgWin is required.")
    @DecimalMin(value = "0", message = "avgWin must be >= 0.")
    private Double avgWin;

    @NotNull(message = "avgLoss is required.")
    @DecimalMin(value = "0", message = "avgLoss must be >= 0.")
    private Double avgLoss;

    @DecimalMin(value = "0", message = "fees must be >= 0.")
    private Double fees = 0.0;

    @Min(value = 1, message = "trades must be >= 1.")
    @Max(value = 10000, message = "trades must be <= 10000.")
    private Integer trades = 100;

    @Min(value = 1, message = "paths must be >= 1.")
    @Max(value = 8, message = "paths must be <= 8.")
    private Integer paths = 5;

    @NotNull(message = "capital is required.")
    @DecimalMin(value = "0.000001", message = "capital must be positive.")
    private Double capital;

    /** Optional client seed; defaults to a fixed seed so results are reproducible. */
    private Long seed = 42L;

    public Double getWinRate() { return winRate; }
    public void setWinRate(Double winRate) { this.winRate = winRate; }

    public Double getAvgWin() { return avgWin; }
    public void setAvgWin(Double avgWin) { this.avgWin = avgWin; }

    public Double getAvgLoss() { return avgLoss; }
    public void setAvgLoss(Double avgLoss) { this.avgLoss = avgLoss; }

    public Double getFees() { return fees; }
    public void setFees(Double fees) { this.fees = fees; }

    public Integer getTrades() { return trades; }
    public void setTrades(Integer trades) { this.trades = trades; }

    public Integer getPaths() { return paths; }
    public void setPaths(Integer paths) { this.paths = paths; }

    public Double getCapital() { return capital; }
    public void setCapital(Double capital) { this.capital = capital; }

    public Long getSeed() { return seed; }
    public void setSeed(Long seed) { this.seed = seed; }
}
