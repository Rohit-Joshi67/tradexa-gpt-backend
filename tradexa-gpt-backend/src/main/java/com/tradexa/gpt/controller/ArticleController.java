package com.tradexa.gpt.controller;

import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.dto.ArticleDTO;
import com.tradexa.gpt.dto.ArticleSummaryDTO;
import com.tradexa.gpt.dto.PagedResponse;
import com.tradexa.gpt.service.ArticleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * Public article read API. Articles are free, ad-supported content —
 * no login and no Pro gate required to read.
 */
@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<ArticleSummaryDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String tag) {
        PagedResponse<ArticleSummaryDTO> data =
                articleService.listPublished(page, size, tag);
        return new ApiResponse<>(true, "Articles fetched.", data, LocalDateTime.now());
    }

    @GetMapping("/{slug}")
    public ApiResponse<ArticleDTO> getBySlug(@PathVariable String slug) {
        ArticleDTO data = articleService.getPublishedBySlug(slug);
        return new ApiResponse<>(true, "Article fetched.", data, LocalDateTime.now());
    }
}
