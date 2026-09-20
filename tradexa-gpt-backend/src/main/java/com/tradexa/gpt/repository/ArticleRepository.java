package com.tradexa.gpt.repository;

import com.tradexa.gpt.entity.Article;
import com.tradexa.gpt.entity.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findBySlug(String slug);

    Optional<Article> findBySlugAndStatus(String slug, ArticleStatus status);

    Page<Article> findByStatusOrderByPublishedAtDesc(ArticleStatus status, Pageable pageable);

    Page<Article> findByStatusAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(
            ArticleStatus status, String tag, Pageable pageable);

    Page<Article> findByStatusAndCategoryOrderByPublishedAtDesc(
            ArticleStatus status, String category, Pageable pageable);

    Page<Article> findByStatusAndCategoryAndTagsContainingIgnoreCaseOrderByPublishedAtDesc(
            ArticleStatus status, String category, String tag, Pageable pageable);

    List<Article> findByStatusOrderByViewCountDesc(ArticleStatus status, Pageable pageable);

    List<Article> findByStatusOrderByPublishedAtDesc(ArticleStatus status);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
