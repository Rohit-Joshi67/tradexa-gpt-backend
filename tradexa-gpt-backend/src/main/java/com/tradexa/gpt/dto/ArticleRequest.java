package com.tradexa.gpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Admin write model. Slug is optional — generated from the title when blank. */
public class ArticleRequest {

    @NotBlank(message = "Title is required.")
    @Size(max = 220, message = "Title must be at most 220 characters.")
    private String title;

    @Size(max = 180, message = "Slug must be at most 180 characters.")
    private String slug;

    @Size(max = 400, message = "Excerpt must be at most 400 characters.")
    private String excerpt;

    @NotBlank(message = "Content is required.")
    private String content;

    @Size(max = 120, message = "Author must be at most 120 characters.")
    private String author;

    /** Comma-separated tags. */
    @Size(max = 300, message = "Tags must be at most 300 characters.")
    private String tags;

    @Size(max = 220, message = "Meta title must be at most 220 characters.")
    private String metaTitle;

    @Size(max = 400, message = "Meta description must be at most 400 characters.")
    private String metaDescription;

    @Size(max = 500, message = "OG image URL must be at most 500 characters.")
    private String ogImage;

    /** DRAFT | PUBLISHED — defaults to DRAFT. */
    private String status;

    /** TRADING | INVESTING | BUSINESS_CASE_STUDIES | PERSONAL_FINANCE (case-insensitive, stored uppercase). */
    @Size(max = 40, message = "Category must be at most 40 characters.")
    private String category;

    public ArticleRequest() {
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getOgImage() { return ogImage; }
    public void setOgImage(String ogImage) { this.ogImage = ogImage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
