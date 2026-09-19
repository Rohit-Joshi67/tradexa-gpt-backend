package com.tradexa.gpt.dto;

/** Full article for the reader view (extends the card fields). */
public class ArticleDTO extends ArticleSummaryDTO {

    private String content;
    private String metaTitle;
    private String metaDescription;
    private String ogImage;
    private String status;

    public ArticleDTO() {
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getOgImage() { return ogImage; }
    public void setOgImage(String ogImage) { this.ogImage = ogImage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
