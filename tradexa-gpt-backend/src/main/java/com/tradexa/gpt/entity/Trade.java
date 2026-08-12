package com.tradexa.gpt.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String symbol;
    private TradeSide side;
    private Integer quantity;
    private BigDecimal entryPrice;
    private BigDecimal exitPrice;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private BigDecimal pnl;
    private String broker;

    private String strategy;

    private String timeframe;

    private String tags;

    private BigDecimal commission;

    private BigDecimal slippage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Trade(){

    }

    public Trade(Integer id,
                 String symbol,
                 TradeSide side,
                 Integer quantity,
                 BigDecimal entryPrice,
                 BigDecimal exitPrice,
                 LocalDateTime entryTime,
                 LocalDateTime exitTime,
                 BigDecimal pnl){
        this.id=id;
        this.symbol=symbol;
        this.side=side;
        this.quantity=quantity;
        this.entryPrice=entryPrice;
        this.exitPrice=exitPrice;
        this.entryTime=entryTime;
        this.exitTime=exitTime;
        this.pnl=pnl;
    }

    public Integer getId(){
        return id;
    }
    public String getSymbol(){
        return symbol;
    }
    public TradeSide getSide(){
        return side;
    }
    public Integer getQuantity(){
        return quantity;
    }
    public BigDecimal getEntryPrice(){
        return entryPrice;
    }
    public BigDecimal getExitPrice(){
        return exitPrice;
    }
    public LocalDateTime getEntryTime(){
        return entryTime;
    }
    public LocalDateTime getExitTime(){
        return exitTime;
    }
    public BigDecimal getPnl(){
        return pnl;
    }

    //setters

    public void setId(Integer id){
        this.id=id;
    }
    public void setSymbol(String symbol){
        this.symbol=symbol;
    }
    public void setSide(TradeSide side) {
        this.side = side;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setEntryPrice(BigDecimal entryPrice) {
        this.entryPrice = entryPrice;
    }

    public void setExitPrice(BigDecimal exitPrice) {
        this.exitPrice = exitPrice;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }

    public void setPnl(BigDecimal pnl) {
        this.pnl = pnl;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}
