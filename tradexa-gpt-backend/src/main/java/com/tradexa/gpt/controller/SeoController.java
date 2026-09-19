package com.tradexa.gpt.controller;

import com.tradexa.gpt.dto.ArticleSummaryDTO;
import com.tradexa.gpt.service.ArticleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Serves a dynamic sitemap.xml covering the static marketing routes plus
 * every published article. Keeps SEO current without a build step.
 */
@RestController
public class SeoController {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ArticleService articleService;

    @Value("${app.frontend-url:https://tradexa-gpt-frontend.vercel.app}")
    private String siteUrl;

    public SeoController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        String base = siteUrl.endsWith("/") ? siteUrl.substring(0, siteUrl.length() - 1) : siteUrl;
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Static routes.
        addUrl(xml, base + "/", "weekly", "1.0", null);
        addUrl(xml, base + "/blogs", "daily", "0.9", null);
        addUrl(xml, base + "/pricing", "monthly", "0.8", null);
        addUrl(xml, base + "/tradexa-gpt", "monthly", "0.8", null);
        addUrl(xml, base + "/vision", "monthly", "0.6", null);
        addUrl(xml, base + "/about", "monthly", "0.5", null);
        addUrl(xml, base + "/tools/edge-validator", "monthly", "0.7", null);

        // Published articles.
        List<ArticleSummaryDTO> articles = articleService.listPublishedForSitemap();
        for (ArticleSummaryDTO article : articles) {
            String lastmod = article.getPublishedAt() == null ? null
                    : article.getPublishedAt().atOffset(ZoneOffset.UTC).format(DATE);
            addUrl(xml, base + "/blogs/" + article.getSlug(), "monthly", "0.8", lastmod);
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    private void addUrl(StringBuilder xml, String loc, String changefreq,
                        String priority, String lastmod) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escape(loc)).append("</loc>\n");
        if (lastmod != null) {
            xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        }
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String escape(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
