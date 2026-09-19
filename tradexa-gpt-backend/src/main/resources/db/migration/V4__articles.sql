-- V4: articles CMS.
--
-- articles: markdown content rendered to sanitized HTML on the frontend.
-- Public read API serves PUBLISHED rows only; the admin CMS manages the rest.

CREATE TABLE IF NOT EXISTS articles (
    id               BIGSERIAL PRIMARY KEY,
    slug             VARCHAR(180) NOT NULL UNIQUE,
    title            VARCHAR(220) NOT NULL,
    excerpt          VARCHAR(400),
    content          TEXT NOT NULL,
    author           VARCHAR(120),
    status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT | PUBLISHED
    tags             VARCHAR(300),
    published_at     TIMESTAMPTZ,
    meta_title       VARCHAR(220),
    meta_description VARCHAR(400),
    og_image         VARCHAR(500),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles (status, published_at);
