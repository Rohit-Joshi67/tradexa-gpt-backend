package com.tradexa.gpt.controller;

import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.dto.AnalyticsSummaryResponse;
import com.tradexa.gpt.analytics.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tradexa.gpt.dto.SymbolAnalyticsResponse;
import com.tradexa.gpt.dto.MarketHourAnalyticsResponse;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getSummary() {

        AnalyticsSummaryResponse summary = analyticsService.getSummary();

        ApiResponse<AnalyticsSummaryResponse> response = new ApiResponse<>();

        response.setSuccess(true);
        response.setMessage("Analytics fetched successfully");
        response.setData(summary);
        response.setTimestamp(LocalDateTime.now());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/symbols")
    public ResponseEntity<ApiResponse<List<SymbolAnalyticsResponse>>>getSymbolAnalytics() {

        List<SymbolAnalyticsResponse> analytics =
                analyticsService.getSymbolAnalytics();

        ApiResponse<List<SymbolAnalyticsResponse>> response = new ApiResponse<>();

        response.setSuccess(true);
        response.setMessage("Symbol analytics fetched successfully");
        response.setData(analytics);
        response.setTimestamp(java.time.LocalDateTime.now());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/market-hours")
    public ResponseEntity<ApiResponse<List<MarketHourAnalyticsResponse>>> getMarketHourAnalytics() {

        List<MarketHourAnalyticsResponse> analytics =
                analyticsService.getMarketHourAnalytics();

        ApiResponse<List<MarketHourAnalyticsResponse>> response = new ApiResponse<>();

        response.setSuccess(true);
        response.setMessage("Market hour analytics fetched successfully");
        response.setData(analytics);
        response.setTimestamp(LocalDateTime.now());

        return ResponseEntity.ok(response);
    }
}