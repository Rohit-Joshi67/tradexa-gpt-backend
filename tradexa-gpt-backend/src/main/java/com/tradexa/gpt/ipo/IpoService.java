package com.tradexa.gpt.ipo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradexa.gpt.copilot.llm.GeminiClient;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class IpoService {

    private final IpoEvaluationRepository repository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, ReentrantLock> ipoLocks = new ConcurrentHashMap<>();

    private static final String IPO_SYSTEM_PROMPT = """
        You are an expert IPO Research & Evaluation Engine.
        Your task is to analyze the requested IPO based on PRIMARY SOURCES (DRHP, RHP, SEBI filings, company financial statements).
        Do NOT invent data. If data is unavailable, use null.
        Evaluate the IPO across 5 categories (100 point scale):
        1. Business & Moat (20)
        2. Earnings Quality (25)
        3. Valuation & Offer Structure (20)
        4. Corporate Governance (20)
        5. Institutional Validation & Market Structure (15)

        Grey Market Premium (GMP) MUST NOT contribute to the fundamental score. Show it separately.
        
        Output MUST be STRICT JSON matching this exact schema:
        {
          "company": { "name": "", "ipo_name": "", "exchange": "", "status": "", "industry": "" },
          "ipo_details": { "issue_size": null, "fresh_issue": null, "ofs": null, "price_band": "", "lot_size": null, "ipo_dates": {}, "listing_date": null },
          "score": { "total": 0, "business_moat": 0, "earnings_quality": 0, "valuation_offer": 0, "governance": 0, "institutional_structure": 0 },
          "business_moat": { "score": 0, "summary": "", "metrics": [], "strengths": [], "risks": [], "confidence": "" },
          "earnings_quality": { "score": 0, "summary": "", "financials": [], "calculations": [], "strengths": [], "risks": [], "confidence": "" },
          "valuation_offer": { "score": 0, "summary": "", "valuation_metrics": [], "peer_comparison": [], "offer_structure": {}, "use_of_proceeds": [], "strengths": [], "risks": [], "confidence": "" },
          "governance": { "score": 0, "summary": "", "auditor_analysis": {}, "related_party_transactions": [], "litigation": [], "regulatory_issues": [], "strengths": [], "risks": [], "confidence": "" },
          "institutional_structure": { "score": 0, "anchor_investors": [], "qib_data": {}, "lock_in_dates": [], "institutional_quality": "", "strengths": [], "risks": [], "confidence": "" },
          "gmp": { "value": null, "currency": "INR", "included_in_score": false, "source": null },
          "critical_risk_flags": [],
          "overall_assessment": { "fundamental_quality": "", "cash_flow_quality": "", "valuation": "", "governance": "", "market_structure": "", "research_profile": "", "summary": "" },
          "key_strengths": [],
          "key_risks": [],
          "important_dates": [],
          "sources": [],
          "data_quality": { "overall_confidence": "", "missing_data": [], "limitations": [] },
          "metadata": { "analysis_date": "", "data_as_of": "", "model": "", "framework_version": "" }
        }
        """;

    public IpoService(IpoEvaluationRepository repository, GeminiClient geminiClient, ObjectMapper objectMapper) {
        this.repository = repository;
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    public JsonNode evaluateIpo(String rawName, boolean forceRefresh) {
        String normalized = normalize(rawName);

        // Fast path read without lock
        if (!forceRefresh) {
            Optional<IpoEvaluation> existing = repository.findByNormalizedName(normalized);
            if (existing.isPresent()) {
                return parseJson(existing.get().getReportJson());
            }
        }

        ReentrantLock lock = ipoLocks.computeIfAbsent(normalized, k -> new ReentrantLock());
        lock.lock();
        try {
            // Double check after acquiring lock
            if (!forceRefresh) {
                Optional<IpoEvaluation> existing = repository.findByNormalizedName(normalized);
                if (existing.isPresent()) {
                    return parseJson(existing.get().getReportJson());
                }
            }

            // Perform API call
            String userPrompt = "Analyze this IPO: " + rawName + ". Return your evaluation as a strict JSON object.";
            GeminiClient.LlmResult result = geminiClient.generate(IPO_SYSTEM_PROMPT, userPrompt, "application/json");

            String jsonText = result.text();
            
            // Validate JSON
            JsonNode reportJsonNode;
            try {
                reportJsonNode = objectMapper.readTree(jsonText);
            } catch (Exception e) {
                throw new RuntimeException("Gemini returned invalid JSON: " + jsonText, e);
            }

            // Save to DB
            IpoEvaluation eval = repository.findByNormalizedName(normalized).orElse(new IpoEvaluation());
            eval.setCompanyName(rawName); // In real app, extract from JSON if available
            eval.setIpoName(rawName);
            eval.setNormalizedName(normalized);
            eval.setReportJson(jsonText);
            eval.setAnalysisDate(ZonedDateTime.now());
            eval.setFrameworkVersion("1.0");
            
            repository.save(eval);

            return reportJsonNode;

        } finally {
            lock.unlock();
            // Optional: clean up the lock map if no threads are waiting
            // To keep it simple, we can leave it (it won't take much memory)
        }
    }

    private String normalize(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replace("ipo", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse cached JSON", e);
        }
    }
}
