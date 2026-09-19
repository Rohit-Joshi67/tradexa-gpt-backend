package com.tradexa.gpt.copilot;

import com.tradexa.gpt.copilot.llm.GeminiClient;
import com.tradexa.gpt.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Tradexa-GPT chat orchestration: quota -> persist user turn -> stream the
 * quant-coach reply -> persist assistant turn -> token accounting.
 */
@Service
public class CopilotService {

    static final String SYSTEM_PROMPT = """
            You are Tradexa-GPT, a quant trading coach inside a trade-journal app.
            Your job: help the trader think in math — position sizing, risk-reward, \
            expectancy, win rate, drawdowns, and journaling discipline.

            Rules:
            - Talk about RISK and PROCESS, never give buy/sell/hold directives for any \
              specific security. Frame everything as risk analysis and education.
            - Cite the trader's own journal stats when relevant; never invent trades or numbers.
            - Be concise and practical. Use ₹ for money.
            - If asked for guaranteed returns, predictions, or "what should I buy", \
              decline and redirect to risk management.
            - End every reply with exactly this line: \
              "_Risk note: this is educational analysis, not financial advice._"
            """;

    private static final int HISTORY_TURNS = 12;

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final CopilotQuotaService quotaService;
    private final GeminiClient geminiClient;

    public CopilotService(ConversationRepository conversationRepository,
                          ChatMessageRepository messageRepository,
                          CopilotQuotaService quotaService,
                          GeminiClient geminiClient) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.quotaService = quotaService;
        this.geminiClient = geminiClient;
    }

    @Transactional
    public Conversation getOrCreateConversation(User user, Long conversationId, String firstMessage) {
        if (conversationId != null) {
            return conversationRepository.findById(conversationId)
                    .filter(c -> c.getUser().getId().equals(user.getId()))
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));
        }
        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setTitle(deriveTitle(firstMessage));
        return conversationRepository.save(conversation);
    }

    @Transactional(readOnly = true)
    public Conversation requireOwnedConversation(User user, Long conversationId) {
        return conversationRepository.findById(conversationId)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));
    }

    @Transactional(readOnly = true)
    public List<Conversation> listConversations(User user) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getMessages(User user, Long conversationId) {
        requireOwnedConversation(user, conversationId);
        return messageRepository.findByConversationIdOrderByIdAsc(conversationId);
    }

    @Transactional
    public void deleteConversation(User user, Long conversationId) {
        Conversation conversation = requireOwnedConversation(user, conversationId);
        conversationRepository.delete(conversation);
    }

    /**
     * Streams the assistant reply. Quota is consumed BEFORE the LLM call so a
     * failed stream still counts (prevents free retries from draining the budget).
     */
    public void streamReply(User user, Conversation conversation, String userMessage,
                            Consumer<String> onToken, Consumer<Long> onDone) {
        if (userMessage == null || userMessage.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (userMessage.length() > 4000) {
            throw new IllegalArgumentException("Message is too long (max 4000 characters).");
        }

        quotaService.consumeMessage(user.getId());

        // Snapshot prior history BEFORE persisting the new turn, so the latest
        // message is appended exactly once and never confused with an older one.
        List<ChatMessage> prior = messageRepository.findByConversationIdOrderByIdAsc(conversation.getId());

        ChatMessage userTurn = new ChatMessage();
        userTurn.setConversation(conversation);
        userTurn.setRole(ChatRole.USER);
        userTurn.setContent(userMessage.strip());
        messageRepository.save(userTurn);

        List<GeminiClient.Turn> history = buildHistory(prior, userMessage);

        StringBuilder full = new StringBuilder();
        geminiClient.stream(SYSTEM_PROMPT, history,
                token -> {
                    full.append(token);
                    onToken.accept(token);
                },
                result -> {
                    ChatMessage assistantTurn = new ChatMessage();
                    assistantTurn.setConversation(conversation);
                    assistantTurn.setRole(ChatRole.ASSISTANT);
                    assistantTurn.setContent(result.text());
                    assistantTurn.setTokensUsed((int) Math.min(result.totalTokens(), Integer.MAX_VALUE));
                    messageRepository.save(assistantTurn);
                    quotaService.recordTokens(user.getId(), result.totalTokens());
                    onDone.accept(result.totalTokens());
                });
    }

    private List<GeminiClient.Turn> buildHistory(List<ChatMessage> prior, String latestUserMessage) {
        int from = Math.max(0, prior.size() - HISTORY_TURNS);
        List<GeminiClient.Turn> turns = new ArrayList<>();
        for (ChatMessage m : prior.subList(from, prior.size())) {
            turns.add(new GeminiClient.Turn(
                    m.getRole() == ChatRole.ASSISTANT ? "model" : "user", m.getContent()));
        }
        turns.add(new GeminiClient.Turn("user", latestUserMessage.strip()));
        return turns;
    }

    private String deriveTitle(String firstMessage) {
        if (firstMessage == null || firstMessage.isBlank()) return "New chat";
        String t = firstMessage.strip().replaceAll("\\s+", " ");
        return t.length() > 48 ? t.substring(0, 48) + "…" : t;
    }
}
