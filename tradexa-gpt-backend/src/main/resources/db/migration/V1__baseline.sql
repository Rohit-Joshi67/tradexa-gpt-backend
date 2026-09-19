-- V1 baseline: mirrors the schema Hibernate's ddl-auto=update created in production.
-- On the live Supabase DB this migration is BASELINED (not executed) via
-- spring.flyway.baseline-on-migrate=true. It only runs on fresh databases.

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50),
    subscription VARCHAR(255)   -- legacy free-form field, no longer used for gating
);

CREATE TABLE IF NOT EXISTS trades (
    id          SERIAL PRIMARY KEY,
    symbol      VARCHAR(255),
    side        INTEGER,          -- TradeSide enum, JPA ORDINAL mapping (0=BUY, 1=SELL)
    quantity    INTEGER,
    entry_price NUMERIC(19, 2),
    exit_price  NUMERIC(19, 2),
    entry_time  TIMESTAMP,
    exit_time   TIMESTAMP,
    pnl         NUMERIC(19, 2),
    broker      VARCHAR(255),
    strategy    VARCHAR(255),
    timeframe   VARCHAR(255),
    tags        VARCHAR(255),
    commission  NUMERIC(19, 2),
    slippage    NUMERIC(19, 2),
    user_id     BIGINT REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_trade_user_id ON trades (user_id);
CREATE INDEX IF NOT EXISTS idx_trade_entry_time ON trades (entry_time);
CREATE INDEX IF NOT EXISTS idx_trade_exit_time ON trades (exit_time);
