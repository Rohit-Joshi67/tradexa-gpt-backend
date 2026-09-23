package com.tradexa.gpt.copilot.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradexa.gpt.copilot.LlmNotConfiguredException;
import com.tradexa.gpt.copilot.LlmProperties;
import com.tradexa.gpt.copilot.LlmProviderException;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Minimal Gemini client over the REST API — no SDK dependency.
 * Uses the free-tier Flash-class model; paid models are refused unless
 * {@code llm.allow-paid=true} is explicitly set.
 */
@Component
public class GeminiClient {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final LlmProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiClient(LlmProperties properties) {
        this.properties = properties;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isConfigured() {
        return properties.isConfigured();
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new LlmNotConfiguredException();
        }
        if (!properties.isAllowPaid() && !isFreeTierModel(properties.getModel())) {
            throw new LlmProviderException(
                    "Model '" + properties.getModel() + "' is not a free-tier model. "
                            + "Paid models are disabled (set llm.allow-paid=true to override).");
        }
    }

    /** Free-tier Flash-class models. Anything else counts as paid unless explicitly allowed. */
    static boolean isFreeTierModel(String model) {
        if (model == null) return false;
        String m = model.toLowerCase();
        return m.contains("flash-lite") || m.contains("flash");
    }

    /** Blocking single-shot completion. Returns the text plus token usage. */
    public LlmResult generate(String systemPrompt, String userPrompt) {
        return generate(systemPrompt, userPrompt, null);
    }

    /** Blocking single-shot completion with optional response mime type (e.g., "application/json"). */
    public LlmResult generate(String systemPrompt, String userPrompt, String responseMimeType) {
        requireConfigured();
        String body = requestBody(systemPrompt, List.of(new Turn("user", userPrompt)), responseMimeType);
        HttpRequest request = buildRequest(":generateContent", body);
        try {
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            assertOk(response);
            return parseResult(response.body());
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmProviderException("AI provider request failed: " + e.getMessage(), e);
        }
    }

    /**
     * Streaming completion via {@code streamGenerateContent}. Each text token is
     * passed to {@code onToken}; {@code onComplete} fires once with usage totals.
     */
    public void stream(String systemPrompt, List<Turn> history, Consumer<String> onToken,
                       Consumer<LlmResult> onComplete) {
        requireConfigured();
        String body = requestBody(systemPrompt, history, null);
        HttpRequest request = buildRequest(":streamGenerateContent?alt=sse", body);
        StringBuilder full = new StringBuilder();
        long promptTokens = 0;
        long totalTokens = 0;
        try {
            HttpResponse<InputStream> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() != 200) {
                String err = readAll(response.body());
                throw new LlmProviderException(
                        "AI provider returned HTTP " + response.statusCode() + ": " + truncate(err));
            }
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (!line.startsWith("data:")) {
                        continue;
                    }
                    String json = line.substring(5).trim();
                    if (json.isEmpty() || json.equals("[DONE]")) {
                        continue;
                    }
                    try {
                        JsonNode chunk = objectMapper.readTree(json);
                        String text = extractText(chunk);
                        if (!text.isEmpty()) {
                            full.append(text);
                            onToken.accept(text);
                        }
                        JsonNode usage = chunk.path("usageMetadata");
                        if (!usage.isMissingNode()) {
                            promptTokens = Math.max(promptTokens, usage.path("promptTokenCount").asLong(0));
                            totalTokens = Math.max(totalTokens, usage.path("totalTokenCount").asLong(0));
                        }
                    } catch (IOException ignored) {
                        // Skip malformed SSE chunks rather than killing the stream.
                    }
                }
            }
            onComplete.accept(new LlmResult(full.toString(), promptTokens, totalTokens));
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmProviderException("AI provider stream failed: " + e.getMessage(), e);
        }
    }

    private HttpRequest buildRequest(String suffix, String body) {
        String url = BASE_URL + properties.getModel() + suffix;
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(90))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", properties.getGeminiApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
    }

    private String requestBody(String systemPrompt, List<Turn> history, String responseMimeType) {
        try {
            var root = objectMapper.createObjectNode();
            var sysParts = objectMapper.createArrayNode();
            var sysPart = objectMapper.createObjectNode();
            sysPart.put("text", systemPrompt);
            sysParts.add(sysPart);
            var sysInstruction = objectMapper.createObjectNode();
            sysInstruction.set("parts", sysParts);
            root.set("system_instruction", sysInstruction);

            var contents = objectMapper.createArrayNode();
            for (Turn turn : history) {
                var content = objectMapper.createObjectNode();
                content.put("role", turn.role());
                var parts = objectMapper.createArrayNode();
                var part = objectMapper.createObjectNode();
                part.put("text", turn.text());
                parts.add(part);
                content.set("parts", parts);
                contents.add(content);
            }
            root.set("contents", contents);

            var config = objectMapper.createObjectNode();
            config.put("maxOutputTokens", properties.getMaxTokens());
            config.put("temperature", properties.getTemperature());
            if (responseMimeType != null && !responseMimeType.isEmpty()) {
                config.put("responseMimeType", responseMimeType);
            }
            root.set("generationConfig", config);

            return objectMapper.writeValueAsString(root);
        } catch (IOException e) {
            throw new LlmProviderException("Failed to build AI request: " + e.getMessage(), e);
        }
    }

    private void assertOk(HttpResponse<String> response) {
        if (response.statusCode() == 200) {
            return;
        }
        throw new LlmProviderException(
                "AI provider returned HTTP " + response.statusCode() + ": " + truncate(response.body()));
    }

    private LlmResult parseResult(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            String text = extractText(root);
            JsonNode usage = root.path("usageMetadata");
            long promptTokens = usage.path("promptTokenCount").asLong(0);
            long totalTokens = usage.path("totalTokenCount").asLong(0);
            return new LlmResult(text, promptTokens, totalTokens);
        } catch (IOException e) {
            throw new LlmProviderException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }

    private String extractText(JsonNode root) {
        List<String> parts = new ArrayList<>();
        for (JsonNode candidate : root.path("candidates")) {
            for (JsonNode part : candidate.path("content").path("parts")) {
                String text = part.path("text").asText("");
                if (!text.isEmpty()) {
                    parts.add(text);
                }
            }
        }
        return String.join("", parts);
    }

    private String readAll(InputStream in) {
        try {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "";
        }
    }

    private String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "…" : s;
    }

    /** One conversation turn. Role must be "user" or "model" for Gemini. */
    public record Turn(String role, String text) {}

    /** Completion text plus token accounting for quota/cost tracking. */
    public record LlmResult(String text, long promptTokens, long totalTokens) {}
}
