-- V2: billing system — plans, subscriptions, launch promo, journal trial.

CREATE TABLE plans (
    id          BIGSERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,          -- 'FREE' | 'PRO' | 'PRO_YEARLY'
    name        TEXT NOT NULL,
    price_paise INT NOT NULL,                  -- 199900 = Rs 1,999
    currency    TEXT NOT NULL DEFAULT 'INR',
    billing_interval TEXT NOT NULL DEFAULT 'month', -- 'month' | 'year' (named to avoid the reserved word INTERVAL)
    features    TEXT NOT NULL DEFAULT '{}',    -- JSON feature flags
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (code, name, price_paise, currency, billing_interval, features, active) VALUES
    ('FREE',       'Free',               0,       'INR', 'month', '{"ads": true}',  TRUE),
    ('PRO',        'Tradexa Pro',        199900,  'INR', 'month', '{"ads": false}', TRUE),
    ('PRO_YEARLY', 'Tradexa Pro Yearly', 1999900, 'INR', 'year',  '{"ads": false}', TRUE);

CREATE TABLE subscriptions (
    id                       BIGSERIAL PRIMARY KEY,
    user_id                  BIGINT NOT NULL REFERENCES users (id),
    plan_id                  BIGINT NOT NULL REFERENCES plans (id),
    provider                 TEXT NOT NULL DEFAULT 'razorpay',
    provider_subscription_id TEXT UNIQUE,
    status                   TEXT NOT NULL,   -- created|authenticated|active|pending|halted|cancelled|completed|expired
    current_start            TIMESTAMPTZ,
    current_end              TIMESTAMPTZ,
    cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
    launch_price             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_status ON subscriptions (user_id, status);
CREATE INDEX idx_subscriptions_provider_id ON subscriptions (provider_subscription_id);

-- Launch offer: first 100 subscribers pay 50% (Rs 999/mo or Rs 9,999/yr).
-- Claimed atomically in PromoClaimRepository.claimSlot().
CREATE TABLE promo_claims (
    code       TEXT PRIMARY KEY,               -- 'PRO_LAUNCH'
    claimed    INT NOT NULL DEFAULT 0,
    max_claims INT NOT NULL
);

INSERT INTO promo_claims (code, claimed, max_claims) VALUES ('PRO_LAUNCH', 0, 100);

-- 3-day free journal trial for free users (set at registration; see UserService).
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMPTZ;

-- Existing users: trial already expired (they have had free access all along).
UPDATE users SET trial_ends_at = now() - interval '1 day' WHERE trial_ends_at IS NULL;
