package com.tradexa.gpt.controller;

import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.dto.ArticleDTO;
import com.tradexa.gpt.dto.ArticleRequest;
import com.tradexa.gpt.dto.PagedResponse;
import com.tradexa.gpt.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Article CMS for admins. Server-side role guard — the frontend gate is
 * cosmetic only.
 */
@RestController
@RequestMapping("/api/v1/admin/articles")
@PreAuthorize("hasRole('ADMIN')")
public class AdminArticleController {

    private final ArticleService articleService;

    public AdminArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<ArticleDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<ArticleDTO> data = articleService.listAll(page, size);
        return new ApiResponse<>(true, "Articles fetched.", data, LocalDateTime.now());
    }

    @GetMapping("/{id}")
    public ApiResponse<ArticleDTO> getById(@PathVariable Long id) {
        ArticleDTO data = articleService.getById(id);
        return new ApiResponse<>(true, "Article fetched.", data, LocalDateTime.now());
    }

    @PostMapping
    public ApiResponse<ArticleDTO> create(@Valid @RequestBody ArticleRequest request) {
        ArticleDTO data = articleService.create(request);
        return new ApiResponse<>(true, "Article created.", data, LocalDateTime.now());
    }

    @PutMapping("/{id}")
    public ApiResponse<ArticleDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ArticleRequest request) {
        ArticleDTO data = articleService.update(id, request);
        return new ApiResponse<>(true, "Article updated.", data, LocalDateTime.now());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Long>> delete(@PathVariable Long id) {
        articleService.delete(id);
        return new ApiResponse<>(true, "Article deleted.",
                Map.of("id", id), LocalDateTime.now());
    }

    @PatchMapping("/{id}/publish")
    public ApiResponse<ArticleDTO> publish(@PathVariable Long id) {
        ArticleDTO data = articleService.setPublished(id, true);
        return new ApiResponse<>(true, "Article published.", data, LocalDateTime.now());
    }

    @PatchMapping("/{id}/unpublish")
    public ApiResponse<ArticleDTO> unpublish(@PathVariable Long id) {
        ArticleDTO data = articleService.setPublished(id, false);
        return new ApiResponse<>(true, "Article unpublished.", data, LocalDateTime.now());
    }
}
