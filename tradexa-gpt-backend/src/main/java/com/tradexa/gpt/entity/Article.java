package com.tradexa.gpt.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "articles", indexes = {
    @Index(name = "idx_articles_slug", columnList = "slug"),
    @Index(name = "idx_articles_status_published", columnList = "status,published_at")
})
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(nullable = false, length = 220)
    private String title;

    @Column(length = 400)
    private String excerpt;

    /** Markdown source. Rendered to sanitized HTML on the frontend. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 120)
    private String author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ArticleStatus status = ArticleStatus.DRAFT;

    /** Comma-separated tags, e.g. "risk,psychology". */
    @Column(length = 300)
    private String tags;

    @Column(name = "published_at")
    private Instant publishedAt;

    /** Locked category: TRADING | INVESTING | BUSINESS_CASE_STUDIES | PERSONAL_FINANCE. Stored uppercase. */
    @Column(length = 40)
    private String category;

    /** Lifetime pageviews; powers the "most read" strip. */
    @Column(name = "view_count", nullable = false)
    private long viewCount = 0;

    @Column(name = "meta_title", length = 220)
    private String metaTitle;

    @Column(name = "meta_description", length = 400)
    private String metaDescription;

    @Column(name = "og_image", length = 500)
    private String ogImage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Article() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public ArticleStatus getStatus() { return status; }
    public void setStatus(ArticleStatus status) { this.status = status; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public long getViewCount() { return viewCount; }
    public void setViewCount(long viewCount) { this.viewCount = viewCount; }

    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getOgImage() { return ogImage; }
    public void setOgImage(String ogImage) { this.ogImage = ogImage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
