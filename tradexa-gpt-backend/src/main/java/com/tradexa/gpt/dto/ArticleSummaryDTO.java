package com.tradexa.gpt.dto;

import java.time.Instant;
import java.util.List;

/** Lightweight article card for list views. */
public class ArticleSummaryDTO {

    private Long id;
    private String slug;
    private String title;
    private String excerpt;
    private String author;
    private List<String> tags;
    private Instant publishedAt;
    private int readingMinutes;

    public ArticleSummaryDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public int getReadingMinutes() { return readingMinutes; }
    public void setReadingMinutes(int readingMinutes) { this.readingMinutes = readingMinutes; }
}
