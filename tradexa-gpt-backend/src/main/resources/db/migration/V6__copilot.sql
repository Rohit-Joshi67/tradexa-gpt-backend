-- V6: Tradexa-GPT copilot (Pro-only).
--
-- conversations / messages: persisted chat history per user.
-- copilot_usage: per-user daily quota + token accounting for LLM cost control.

CREATE TABLE IF NOT EXISTS conversations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title           VARCHAR(160) NOT NULL DEFAULT 'New chat',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,  -- USER | ASSISTANT | SYSTEM
    content         TEXT NOT NULL,
    tokens_used     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, id);

CREATE TABLE IF NOT EXISTS copilot_usage (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    usage_date      DATE NOT NULL,
    messages_used   INT NOT NULL DEFAULT 0,
    tokens_used     BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_copilot_usage_user_day UNIQUE (user_id, usage_date)
);
CREATE INDEX IF NOT EXISTS idx_copilot_usage_user_day ON copilot_usage (user_id, usage_date);
