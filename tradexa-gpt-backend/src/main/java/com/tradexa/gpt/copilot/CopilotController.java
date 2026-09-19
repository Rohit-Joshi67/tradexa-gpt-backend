package com.tradexa.gpt.copilot;

import com.tradexa.gpt.analytics.AnalyticsService;
import com.tradexa.gpt.billing.RequirePlan;
import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.copilot.dto.ChatMessageDTO;
import com.tradexa.gpt.copilot.dto.ChatRequest;
import com.tradexa.gpt.copilot.dto.ConversationDTO;
import com.tradexa.gpt.copilot.dto.EdgeValidateRequest;
import com.tradexa.gpt.copilot.dto.PreTradeRequest;
import com.tradexa.gpt.copilot.llm.GeminiClient;
import com.tradexa.gpt.dto.AnalyticsSummaryResponse;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Tradexa-GPT copilot APIs. Every endpoint is Pro-only — the free trial never
 * includes the copilot. Enforcement is server-side via {@code @RequirePlan}.
 */
@RestController
@RequestMapping("/api/v1/copilot")
public class CopilotController {

    private final CurrentUserService currentUserService;
    private final CopilotService copilotService;
    private final CopilotQuotaService quotaService;
    private final LeakReportService leakReportService;
    private final GeminiClient geminiClient;
    private final AnalyticsService analyticsService;
    private final LlmProperties llmProperties;

    public CopilotController(CurrentUserService currentUserService,
                             CopilotService copilotService,
                             CopilotQuotaService quotaService,
                             LeakReportService leakReportService,
                             GeminiClient geminiClient,
                             AnalyticsService analyticsService,
                             LlmProperties llmProperties) {
        this.currentUserService = currentUserService;
        this.copilotService = copilotService;
        this.quotaService = quotaService;
        this.leakReportService = leakReportService;
        this.geminiClient = geminiClient;
        this.analyticsService = analyticsService;
        this.llmProperties = llmProperties;
    }

    // ---------- Conversations ----------

    @RequirePlan("PRO")
    @GetMapping("/conversations")
    public ApiResponse<List<ConversationDTO>> listConversations() {
        User user = currentUserService.getCurrentUser();
        List<ConversationDTO> dtos = copilotService.listConversations(user).stream()
                .map(ConversationDTO::from)
                .toList();
        return ok("Conversations fetched.", dtos);
    }

    @RequirePlan("PRO")
    @PostMapping("/conversations")
    public ApiResponse<ConversationDTO> createConversation() {
        User user = currentUserService.getCurrentUser();
        Conversation conversation = copilotService.getOrCreateConversation(user, null, null);
        return ok("Conversation created.", ConversationDTO.from(conversation));
    }

    @RequirePlan("PRO")
    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<ChatMessageDTO>> getMessages(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        List<ChatMessageDTO> dtos = copilotService.getMessages(user, id).stream()
                .map(ChatMessageDTO::from)
                .toList();
        return ok("Messages fetched.", dtos);
    }

    @RequirePlan("PRO")
    @DeleteMapping("/conversations/{id}")
    public ApiResponse<Void> deleteConversation(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        copilotService.deleteConversation(user, id);
        return ok("Conversation deleted.", null);
    }

    // ---------- Streaming chat (SSE) ----------

    @RequirePlan("PRO")
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@Valid @RequestBody ChatRequest request) {
        User user = currentUserService.getCurrentUser();
        // Fail fast as JSON (not mid-stream) when the AI is not connected.
        if (!geminiClient.isConfigured()) {
            throw new LlmNotConfiguredException();
        }
        Conversation conversation =
                copilotService.getOrCreateConversation(user, request.getConversationId(), request.getMessage());

        // Tell the client which conversation this stream belongs to.
        SseEmitter emitter = new SseEmitter(120_000L);
        try {
            emitter.send(SseEmitter.event().name("conversation").data(conversation.getId().toString()));
        } catch (IOException e) {
            emitter.complete();
            return emitter;
        }

        Thread.ofVirtual().start(() -> {
            try {
                copilotService.streamReply(user, conversation, request.getMessage(),
                        token -> sendQuietly(emitter, "token", token),
                        tokensUsed -> {
                            sendQuietly(emitter, "done", String.valueOf(tokensUsed));
                            emitter.complete();
                        });
            } catch (QuotaExceededException | LlmNotConfiguredException | LlmProviderException e) {
                sendQuietly(emitter, "error", e.getMessage());
                emitter.complete();
            } catch (Exception e) {
                sendQuietly(emitter, "error", "The copilot hit a snag. Please try again.");
                emitter.complete();
            }
        });
        return emitter;
    }

    // ---------- Journal leak report ----------

    @RequirePlan("PRO")
    @PostMapping("/leak-report")
    public ApiResponse<LeakReportService.LeakReport> leakReport() {
        User user = currentUserService.getCurrentUser();
        LeakReportService.LeakReport report = leakReportService.generate(user);
        return ok(report.hasData ? "Leak report generated." : "No trades yet.", report);
    }

    // ---------- Pre-trade discipline check ----------

    @RequirePlan("PRO")
    @PostMapping("/pre-trade")
    public ApiResponse<PreTradeService.PreTradeResult> preTrade(
            @Valid @RequestBody PreTradeRequest request) {
        User user = currentUserService.getCurrentUser();

        PreTradeService.PreTradeInput input = new PreTradeService.PreTradeInput(
                request.getSymbol(),
                PreTradeService.Side.valueOf(request.getSide().toUpperCase()),
                request.getEntry(), request.getStop(), request.getTarget(),
                request.getQuantity(), request.getAccountSize(), request.getMaxRiskPct());
        PreTradeService.PreTradeResult result = PreTradeService.evaluate(input);

        // One quota unit covers the whole check (math + optional AI commentary).
        if (geminiClient.isConfigured()) {
            quotaService.consumeMessage(user.getId());
            result.aiCommentary = coachCommentary(user, input, result);
        }

        return ok("Pre-trade check complete: " + result.verdict, result);
    }

    // ---------- Edge validator (server-side Monte Carlo) ----------

    @RequirePlan("PRO")
    @PostMapping("/edge-validate")
    public ApiResponse<MonteCarloService.EdgeValidateResult> edgeValidate(
            @Valid @RequestBody EdgeValidateRequest request) {
        MonteCarloService.McInput input = new MonteCarloService.McInput(
                request.getWinRate(), request.getAvgWin(), request.getAvgLoss(),
                request.getFees() != null ? request.getFees() : 0.0,
                request.getTrades() != null ? request.getTrades() : 100,
                request.getPaths() != null ? request.getPaths() : 5,
                request.getCapital(),
                request.getSeed() != null ? request.getSeed() : 42L);
        return ok("Edge validation complete.", MonteCarloService.simulate(input));
    }

    // ---------- Quota ----------

    @RequirePlan("PRO")
    @GetMapping("/quota")
    public ApiResponse<CopilotQuotaService.QuotaSnapshot> quota() {
        User user = currentUserService.getCurrentUser();
        return ok("Quota fetched.", quotaService.getQuota(user.getId()));
    }

    // ---------- Helpers ----------

    private String coachCommentary(User user, PreTradeService.PreTradeInput input,
                                   PreTradeService.PreTradeResult result) {
        try {
            AnalyticsSummaryResponse s = analyticsService.getSummary();
            String journal = s.getTotalTrades() == 0
                    ? "The trader has no journal history yet."
                    : "Trader journal: " + s.getTotalTrades() + " trades, "
                    + String.format("%.1f", s.getWinRate()) + "% win rate, expectancy ₹"
                    + s.getExpectancy() + "/trade.";
            String prompt = "Pre-trade plan for " + input.symbol() + " " + input.side()
                    + ": entry " + input.entry() + ", stop " + input.stop()
                    + ", target " + input.target() + ", qty " + input.quantity()
                    + ". Deterministic check says: risk ₹" + result.riskAmount
                    + " (" + result.riskPctOfAccount + "% of account), R-multiple "
                    + result.rMultiple + ", verdict " + result.verdict + ". "
                    + journal
                    + " In max 3 short lines, coach this trader on whether this fits their "
                    + "proven patterns. Never give a buy/sell directive.";
            GeminiClient.LlmResult llm = geminiClient.generate(CopilotService.SYSTEM_PROMPT, prompt);
            quotaService.recordTokens(user.getId(), llm.totalTokens());
            return llm.text();
        } catch (Exception e) {
            // Commentary is a bonus — the deterministic verdict stands on its own.
            return null;
        }
    }

    private void sendQuietly(SseEmitter emitter, String name, String data) {
        try {
            emitter.send(SseEmitter.event().name(name).data(data == null ? "" : data));
        } catch (IOException | IllegalStateException ignored) {
            // Client disconnected; the virtual thread will finish harmlessly.
        }
    }

    private <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
}
