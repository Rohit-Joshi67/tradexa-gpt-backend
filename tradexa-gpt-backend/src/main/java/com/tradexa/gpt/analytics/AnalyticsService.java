package com.tradexa.gpt.analytics;

import com.tradexa.gpt.dto.AnalyticsSummaryResponse;
import com.tradexa.gpt.dto.MarketHourAnalyticsResponse;
import com.tradexa.gpt.dto.SymbolAnalyticsResponse;
import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.service.TradeService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final TradeService tradeService;

    public AnalyticsService(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    public AnalyticsSummaryResponse getSummary() {
        List<Trade> trades = tradeService.getTradesForCurrentUser();
        List<BigDecimal> pnlValues = extractPnlValues(trades);

        long totalTrades = trades.size();
        long winningTrades = 0;
        long losingTrades = 0;

        BigDecimal totalPnl = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;

        for (BigDecimal pnl : pnlValues) {
            totalPnl = totalPnl.add(pnl);

            if (pnl.compareTo(BigDecimal.ZERO) > 0) {
                winningTrades++;
                totalProfit = totalProfit.add(pnl);
            } else if (pnl.compareTo(BigDecimal.ZERO) < 0) {
                losingTrades++;
                totalLoss = totalLoss.add(pnl);
            }
        }

        double winRate = totalTrades > 0
                ? (winningTrades * 100.0) / totalTrades
                : 0.0;

        BigDecimal averageProfit = winningTrades > 0
                ? totalProfit.divide(BigDecimal.valueOf(winningTrades), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal averageLoss = losingTrades > 0
                ? totalLoss.divide(BigDecimal.valueOf(losingTrades), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        AnalyticsSummaryResponse response = new AnalyticsSummaryResponse();
        response.setTotalTrades(totalTrades);
        response.setWinningTrades(winningTrades);
        response.setLosingTrades(losingTrades);
        response.setTotalPnl(totalPnl);
        response.setWinRate(winRate);
        response.setAverageProfit(averageProfit);
        response.setAverageLoss(averageLoss);

        response.setMeanPnl(StatisticsCalculator.mean(pnlValues));
        response.setMedianPnl(StatisticsCalculator.median(pnlValues));
        response.setVariance(StatisticsCalculator.variance(pnlValues));
        response.setStandardDeviation(StatisticsCalculator.standardDeviation(pnlValues));
        response.setSkewness(StatisticsCalculator.skewness(pnlValues));
        response.setExpectancy(StatisticsCalculator.expectancy(
                winRate,
                averageProfit,
                averageLoss,
                winningTrades,
                losingTrades
        ));

        return response;
    }

    public List<SymbolAnalyticsResponse> getSymbolAnalytics() {
        List<Trade> trades = tradeService.getTradesForCurrentUser();
        Map<String, SymbolAnalyticsResponse> map = new HashMap<>();

        for (Trade trade : trades) {
            String symbol = trade.getSymbol();

            map.computeIfAbsent(symbol, key -> {
                SymbolAnalyticsResponse response = new SymbolAnalyticsResponse();
                response.setSymbol(key);
                response.setTotalTrades(0);
                response.setWinningTrades(0);
                response.setLosingTrades(0);
                response.setTotalPnl(BigDecimal.ZERO);
                response.setWinRate(0);
                return response;
            });

            SymbolAnalyticsResponse response = map.get(symbol);
            BigDecimal pnl = StatisticsCalculator.safePnl(trade.getPnl());

            response.setTotalTrades(response.getTotalTrades() + 1);
            response.setTotalPnl(response.getTotalPnl().add(pnl));

            if (pnl.compareTo(BigDecimal.ZERO) > 0) {
                response.setWinningTrades(response.getWinningTrades() + 1);
            } else if (pnl.compareTo(BigDecimal.ZERO) < 0) {
                response.setLosingTrades(response.getLosingTrades() + 1);
            }
        }

        List<SymbolAnalyticsResponse> result = new ArrayList<>();

        for (SymbolAnalyticsResponse response : map.values()) {
            if (response.getTotalTrades() > 0) {
                double symbolWinRate = (response.getWinningTrades() * 100.0) / response.getTotalTrades();
                response.setWinRate(symbolWinRate);
            }
            result.add(response);
        }

        result.sort(Comparator.comparing(SymbolAnalyticsResponse::getSymbol));
        return result;
    }

    public List<MarketHourAnalyticsResponse> getMarketHourAnalytics() {
        List<Trade> trades = tradeService.getTradesForCurrentUser();
        Map<Integer, MarketHourAnalyticsResponse> hourMap = new HashMap<>();
        Map<Integer, List<BigDecimal>> pnlsByHour = new HashMap<>();

        for (Trade trade : trades) {
            if (trade.getEntryTime() == null) {
                continue;
            }

            int hour = trade.getEntryTime().getHour();
            BigDecimal pnl = StatisticsCalculator.safePnl(trade.getPnl());

            hourMap.computeIfAbsent(hour, this::createEmptyHourBucket);
            pnlsByHour.computeIfAbsent(hour, key -> new ArrayList<>()).add(pnl);

            MarketHourAnalyticsResponse bucket = hourMap.get(hour);
            bucket.setTotalTrades(bucket.getTotalTrades() + 1);
            bucket.setTotalPnl(bucket.getTotalPnl().add(pnl));

            if (pnl.compareTo(BigDecimal.ZERO) > 0) {
                bucket.setWinningTrades(bucket.getWinningTrades() + 1);
            } else if (pnl.compareTo(BigDecimal.ZERO) < 0) {
                bucket.setLosingTrades(bucket.getLosingTrades() + 1);
            }
        }

        List<MarketHourAnalyticsResponse> result = new ArrayList<>();

        for (Map.Entry<Integer, MarketHourAnalyticsResponse> entry : hourMap.entrySet()) {
            int hour = entry.getKey();
            MarketHourAnalyticsResponse bucket = entry.getValue();
            List<BigDecimal> hourPnls = pnlsByHour.get(hour);

            if (bucket.getTotalTrades() > 0) {
                bucket.setWinRate((bucket.getWinningTrades() * 100.0) / bucket.getTotalTrades());
            }

            bucket.setMeanPnl(StatisticsCalculator.mean(hourPnls));
            result.add(bucket);
        }

        result.sort(Comparator.comparingInt(MarketHourAnalyticsResponse::getHour));
        return result;
    }

    private List<BigDecimal> extractPnlValues(List<Trade> trades) {
        return trades.stream()
                .map(trade -> StatisticsCalculator.safePnl(trade.getPnl()))
                .toList();
    }

    private MarketHourAnalyticsResponse createEmptyHourBucket(int hour) {
        MarketHourAnalyticsResponse response = new MarketHourAnalyticsResponse();
        response.setHour(hour);
        response.setHourLabel(String.format("%02d:00–%02d:59", hour, hour));
        response.setMarketSession(resolveMarketSession(hour));
        response.setTotalTrades(0);
        response.setWinningTrades(0);
        response.setLosingTrades(0);
        response.setTotalPnl(BigDecimal.ZERO);
        response.setWinRate(0);
        response.setMeanPnl(BigDecimal.ZERO);
        return response;
    }

    private String resolveMarketSession(int hour) {
        if (hour >= 9 && hour < 11) {
            return "OPEN";
        }
        if (hour >= 11 && hour < 14) {
            return "MIDDAY";
        }
        if (hour >= 14 && hour < 16) {
            return "AFTERNOON";
        }
        if (hour >= 16 && hour < 18) {
            return "CLOSE";
        }
        if (hour >= 7 && hour < 9) {
            return "PRE_MARKET";
        }
        return "AFTER_HOURS";
    }
}
