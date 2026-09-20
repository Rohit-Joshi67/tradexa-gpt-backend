-- V7: Article categories + view counts.
--
-- Locked categories: TRADING, INVESTING, BUSINESS_CASE_STUDIES, PERSONAL_FINANCE.
-- Stored uppercase; view_count powers the "most read" strip on the blog homepage.

ALTER TABLE articles ADD COLUMN category VARCHAR(40);
ALTER TABLE articles ADD COLUMN view_count BIGINT NOT NULL DEFAULT 0;

CREATE INDEX idx_articles_cat_pub ON articles(status, category, published_at);

-- Backfill the V5 sample drafts (all three are trading topics).
UPDATE articles
SET category = 'TRADING'
WHERE slug IN (
    'sample-why-position-sizing-beats-stock-picking',
    'sample-the-journal-habit-that-fixes-revenge-trading',
    'sample-risk-reward-is-not-a-magic-ratio'
);
