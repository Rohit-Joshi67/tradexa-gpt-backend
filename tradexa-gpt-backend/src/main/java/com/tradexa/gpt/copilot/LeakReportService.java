package com.tradexa.gpt.copilot;

import com.tradexa.gpt.analytics.AnalyticsService;
import com.tradexa.gpt.copilot.llm.GeminiClient;
import com.tradexa.gpt.dto.AnalyticsSummaryResponse;
import com.tradexa.gpt.dto.MarketHourAnalyticsResponse;
import com.tradexa.gpt.dto.SymbolAnalyticsResponse;
import com.tradexa.gpt.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Journal leak report: aggregates the trader's own analytics (never raw trade
 * dumps) and asks the LLM to name the top leaks with one discipline rule each.
 * The stats are computed server-side, so the report can't hallucinate numbers.
 */
@Service
public class LeakReportService {

    private static final String SYSTEM_PROMPT = """
            You are Tradexa-GPT, a quant trading coach. The user has shared AGGREGATE \
            statistics from their own trade journal (never individual trades).
            Write a "leak report": the 3 biggest leaks draining their P&L, ranked by impact.

            Rules:
            - Use ONLY the numbers provided. Never invent trades, symbols, or stats.
            - For each leak: name it, cite the exact stat that proves it, explain the \
              mechanism in one line, and prescribe exactly ONE concrete discipline rule.
            - Keep it under 350 words. Use ₹ for money. Markdown headings and bullets are fine.
            - Never give buy/sell directives for any specific security.
            - End with exactly this line: \
              "_Risk note: this is educational analysis, not financial advice._"
            """;

    private final AnalyticsService analyticsService;
    private final CopilotQuotaService quotaService;
    private final GeminiClient geminiClient;

    public LeakReportService(AnalyticsService analyticsService,
                             CopilotQuotaService quotaService,
                             GeminiClient geminiClient) {
        this.analyticsService = analyticsService;
        this.quotaService = quotaService;
        this.geminiClient = geminiClient;
    }

    public LeakReport generate(User user) {
        if (!geminiClient.isConfigured()) {
            throw new LlmNotConfiguredException();
        }
        quotaService.consumeMessage(user.getId());

        AnalyticsSummaryResponse summary = analyticsService.getSummary();
        List<SymbolAnalyticsResponse> symbols = analyticsService.getSymbolAnalytics();
        List<MarketHourAnalyticsResponse> hours = analyticsService.getMarketHourAnalytics();

        if (summary.getTotalTrades() == 0) {
            return LeakReport.empty();
        }

        String prompt = buildPrompt(summary, symbols, hours);
        GeminiClient.LlmResult result = geminiClient.generate(SYSTEM_PROMPT, prompt);
        quotaService.recordTokens(user.getId(), result.totalTokens());

        return LeakReport.of(result.text(), summary);
    }

    private String buildPrompt(AnalyticsSummaryResponse s,
                               List<SymbolAnalyticsResponse> symbols,
                               List<MarketHourAnalyticsResponse> hours) {
        StringBuilder sb = new StringBuilder();
        sb.append("My journal aggregates (all-time):\n");
        sb.append("- Total trades: ").append(s.getTotalTrades()).append("\n");
        sb.append("- Wins: ").append(s.getWinningTrades())
                .append(", Losses: ").append(s.getLosingTrades()).append("\n");
        sb.append("- Win rate: ").append(fmt(s.getWinRate())).append("%\n");
        sb.append("- Total P&L: ₹").append(s.getTotalPnl()).append("\n");
        sb.append("- Avg winner: ₹").append(s.getAverageProfit())
                .append(", Avg loser: ₹").append(s.getAverageLoss()).append("\n");
        sb.append("- Expectancy per trade: ₹").append(s.getExpectancy()).append("\n");
        sb.append("- P&L std dev: ₹").append(fmt(s.getStandardDeviation())).append("\n");

        String worstSymbols = symbols.stream()
                .filter(r -> r.getTotalTrades() >= 3)
                .sorted((a, b) -> a.getTotalPnl().compareTo(b.getTotalPnl()))
                .limit(3)
                .map(r -> r.getSymbol() + " (" + r.getTotalTrades() + " trades, ₹"
                        + r.getTotalPnl() + ", " + fmt(r.getWinRate()) + "% win)")
                .collect(Collectors.joining("; "));
        if (!worstSymbols.isEmpty()) {
            sb.append("- Worst symbols: ").append(worstSymbols).append("\n");
        }

        String worstHours = hours.stream()
                .filter(h -> h.getTotalTrades() >= 3)
                .sorted((a, b) -> a.getTotalPnl().compareTo(b.getTotalPnl()))
                .limit(3)
                .map(h -> h.getHourLabel() + " (" + h.getTotalTrades() + " trades, ₹"
                        + h.getTotalPnl() + ")")
                .collect(Collectors.joining("; "));
        if (!worstHours.isEmpty()) {
            sb.append("- Worst hours: ").append(worstHours).append("\n");
        }

        sb.append("\nWrite my leak report.");
        return sb.toString();
    }

    private String fmt(double v) {
        return String.format("%.1f", v);
    }

    public static class LeakReport {
        public boolean hasData;
        public String reportMarkdown;
        public long totalTrades;
        public String totalPnl;
        public double winRate;
        public String expectancy;

        static LeakReport empty() {
            LeakReport r = new LeakReport();
            r.hasData = false;
            return r;
        }

        static LeakReport of(String markdown, AnalyticsSummaryResponse s) {
            LeakReport r = new LeakReport();
            r.hasData = true;
            r.reportMarkdown = markdown;
            r.totalTrades = s.getTotalTrades();
            r.totalPnl = s.getTotalPnl().toPlainString();
            r.winRate = s.getWinRate();
            r.expectancy = s.getExpectancy().toPlainString();
            return r;
        }
    }
}
