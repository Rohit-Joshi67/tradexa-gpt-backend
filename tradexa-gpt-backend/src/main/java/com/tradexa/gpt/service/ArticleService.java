package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.ArticleDTO;
import com.tradexa.gpt.dto.ArticleRequest;
import com.tradexa.gpt.dto.ArticleSummaryDTO;
import com.tradexa.gpt.dto.PagedResponse;
import com.tradexa.gpt.entity.Article;
import com.tradexa.gpt.entity.ArticleStatus;
import com.tradexa.gpt.exception.ArticleNotFoundException;
import com.tradexa.gpt.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    private static final int WORDS_PER_MINUTE = 200;

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // ------------------------------------------------------------------
    // Public (free) read API
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PagedResponse<ArticleSummaryDTO> listPublished(int page, int size, String tag) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size));
        Page<Article> result = (tag == null || tag.isBlank())
                ? articleRepository.findByStatusOrderByPublishedAtDesc(ArticleStatus.PUBLISHED, pageable)
                : articleRepository.findByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(
                        ArticleStatus.PUBLISHED, tag.trim(), pageable);
        return toPaged(result.map(this::toSummary));
    }

    @Transactional(readOnly = true)
    public ArticleDTO getPublishedBySlug(String slug) {
        Article article = articleRepository.findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new ArticleNotFoundException(slug));
        return toFull(article);
    }

    @Transactional(readOnly = true)
    public List<ArticleSummaryDTO> listPublishedForSitemap() {
        return articleRepository.findByStatusOrderByPublishedAtDesc(ArticleStatus.PUBLISHED)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Admin write API
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PagedResponse<ArticleDTO> listAll(int page, int size) {
        Page<Article> result = articleRepository.findAll(PageRequest.of(
                Math.max(page, 0), clampSize(size),
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt")));
        return toPaged(result.map(this::toFull));
    }

    @Transactional(readOnly = true)
    public ArticleDTO getById(Long id) {
        return toFull(articleRepository.findById(id)
                .orElseThrow(() -> new ArticleNotFoundException(id)));
    }

    @Transactional
    public ArticleDTO create(ArticleRequest request) {
        Article article = new Article();
        apply(article, request, null);
        article.setCreatedAt(Instant.now());
        return toFull(articleRepository.save(article));
    }

    @Transactional
    public ArticleDTO update(Long id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ArticleNotFoundException(id));
        apply(article, request, id);
        return toFull(articleRepository.save(article));
    }

    @Transactional
    public void delete(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ArticleNotFoundException(id));
        articleRepository.delete(article);
    }

    @Transactional
    public ArticleDTO setPublished(Long id, boolean published) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ArticleNotFoundException(id));
        if (published) {
            article.setStatus(ArticleStatus.PUBLISHED);
            if (article.getPublishedAt() == null) {
                article.setPublishedAt(Instant.now());
            }
        } else {
            article.setStatus(ArticleStatus.DRAFT);
        }
        article.setUpdatedAt(Instant.now());
        return toFull(articleRepository.save(article));
    }

    // ------------------------------------------------------------------
    // Mapping + helpers
    // ------------------------------------------------------------------

    private void apply(Article article, ArticleRequest request, Long existingId) {
        article.setTitle(request.getTitle().trim());
        article.setExcerpt(blankToNull(request.getExcerpt()));
        article.setContent(request.getContent());
        article.setAuthor(blankToNull(request.getAuthor()));
        article.setTags(normalizeTags(request.getTags()));
        article.setMetaTitle(blankToNull(request.getMetaTitle()));
        article.setMetaDescription(blankToNull(request.getMetaDescription()));
        article.setOgImage(blankToNull(request.getOgImage()));

        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? slugify(request.getTitle())
                : slugify(request.getSlug());
        article.setSlug(ensureUniqueSlug(slug, existingId));

        ArticleStatus status = parseStatus(request.getStatus());
        boolean newlyPublished = status == ArticleStatus.PUBLISHED
                && article.getStatus() != ArticleStatus.PUBLISHED;
        article.setStatus(status);
        if (newlyPublished && article.getPublishedAt() == null) {
            article.setPublishedAt(Instant.now());
        }
        article.setUpdatedAt(Instant.now());
    }

    private ArticleStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return ArticleStatus.DRAFT;
        }
        try {
            return ArticleStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status must be DRAFT or PUBLISHED.");
        }
    }

    private ArticleSummaryDTO toSummary(Article article) {
        ArticleSummaryDTO dto = new ArticleSummaryDTO();
        dto.setId(article.getId());
        dto.setSlug(article.getSlug());
        dto.setTitle(article.getTitle());
        dto.setExcerpt(article.getExcerpt());
        dto.setAuthor(article.getAuthor());
        dto.setTags(parseTags(article.getTags()));
        dto.setPublishedAt(article.getPublishedAt());
        dto.setReadingMinutes(readingMinutes(article.getContent()));
        return dto;
    }

    private ArticleDTO toFull(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setSlug(article.getSlug());
        dto.setTitle(article.getTitle());
        dto.setExcerpt(article.getExcerpt());
        dto.setAuthor(article.getAuthor());
        dto.setTags(parseTags(article.getTags()));
        dto.setPublishedAt(article.getPublishedAt());
        dto.setReadingMinutes(readingMinutes(article.getContent()));
        dto.setContent(article.getContent());
        dto.setMetaTitle(article.getMetaTitle());
        dto.setMetaDescription(article.getMetaDescription());
        dto.setOgImage(article.getOgImage());
        dto.setStatus(article.getStatus().name());
        return dto;
    }

    private <T> PagedResponse<T> toPaged(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    private int clampSize(int size) {
        return Math.min(Math.max(size, 1), 50);
    }

    static List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    static String normalizeTags(String tags) {
        List<String> parsed = parseTags(tags);
        return parsed.isEmpty() ? null : String.join(",", parsed);
    }

    /** URL-safe slug: lowercase, accents stripped, runs of non-alphanumerics → "-". */
    static String slugify(String input) {
        if (input == null) {
            return "article";
        }
        String ascii = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = ascii.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.isEmpty()) {
            slug = "article";
        }
        return slug.length() > 170 ? slug.substring(0, 170) : slug;
    }

    private String ensureUniqueSlug(String base, Long existingId) {
        String candidate = base;
        int attempt = 2;
        while (slugTaken(candidate, existingId)) {
            candidate = base + "-" + attempt;
            attempt++;
        }
        return candidate;
    }

    private boolean slugTaken(String slug, Long existingId) {
        return existingId == null
                ? articleRepository.existsBySlug(slug)
                : articleRepository.existsBySlugAndIdNot(slug, existingId);
    }

    static int readingMinutes(String markdown) {
        if (markdown == null || markdown.isBlank()) {
            return 1;
        }
        long words = Arrays.stream(markdown.trim().split("\\s+"))
                .filter(w -> !w.isEmpty())
                .count();
        return Math.max(1, (int) Math.ceil(words / (double) WORDS_PER_MINUTE));
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
