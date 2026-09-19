package com.tradexa.gpt.copilot.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public class PreTradeRequest {

    @NotBlank(message = "Symbol is required.")
    private String symbol;

    @NotBlank(message = "Side is required.")
    @Pattern(regexp = "(?i)LONG|SHORT", message = "Side must be LONG or SHORT.")
    private String side;

    @NotNull(message = "Entry price is required.")
    @DecimalMin(value = "0.000001", message = "Entry must be positive.")
    private BigDecimal entry;

    @NotNull(message = "Stop-loss is required.")
    @DecimalMin(value = "0.000001", message = "Stop must be positive.")
    private BigDecimal stop;

    @NotNull(message = "Target is required.")
    @DecimalMin(value = "0.000001", message = "Target must be positive.")
    private BigDecimal target;

    @NotNull(message = "Quantity is required.")
    @DecimalMin(value = "0.000001", message = "Quantity must be positive.")
    private BigDecimal quantity;

    @NotNull(message = "Account size is required.")
    @DecimalMin(value = "0.000001", message = "Account size must be positive.")
    private BigDecimal accountSize;

    /** Max risk per trade as % of account. Defaults to 1%. */
    @DecimalMin(value = "0.01", message = "Max risk % must be positive.")
    private BigDecimal maxRiskPct = BigDecimal.ONE;

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public BigDecimal getEntry() { return entry; }
    public void setEntry(BigDecimal entry) { this.entry = entry; }

    public BigDecimal getStop() { return stop; }
    public void setStop(BigDecimal stop) { this.stop = stop; }

    public BigDecimal getTarget() { return target; }
    public void setTarget(BigDecimal target) { this.target = target; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getAccountSize() { return accountSize; }
    public void setAccountSize(BigDecimal accountSize) { this.accountSize = accountSize; }

    public BigDecimal getMaxRiskPct() { return maxRiskPct; }
    public void setMaxRiskPct(BigDecimal maxRiskPct) { this.maxRiskPct = maxRiskPct; }
}
