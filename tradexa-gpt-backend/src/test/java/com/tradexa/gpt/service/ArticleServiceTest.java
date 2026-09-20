package com.tradexa.gpt.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArticleServiceTest {

    @Test
    void slugify_basicTitle() {
        assertEquals("why-position-sizing-beats-stock-picking",
                ArticleService.slugify("Why Position Sizing Beats Stock Picking"));
    }

    @Test
    void slugify_collapsesPunctuationAndTrims() {
        assertEquals("risk-reward-is-not-a-magic-ratio",
                ArticleService.slugify("  Risk-Reward: Is NOT a \"Magic\" Ratio!! "));
    }

    @Test
    void slugify_stripsAccents() {
        assertEquals("cafe-strategie",
                ArticleService.slugify("Café Stratégie"));
    }

    @Test
    void slugify_fallsBackForEmptyInput() {
        assertEquals("article", ArticleService.slugify("!!!"));
        assertEquals("article", ArticleService.slugify(null));
    }

    @Test
    void slugify_truncatesLongTitles() {
        String slug = ArticleService.slugify("a ".repeat(200));
        assertTrue(slug.length() <= 170);
    }

    @Test
    void readingMinutes_minimumOne() {
        assertEquals(1, ArticleService.readingMinutes(null));
        assertEquals(1, ArticleService.readingMinutes("   "));
        assertEquals(1, ArticleService.readingMinutes("short post"));
    }

    @Test
    void readingMinutes_scalesWithWordCount() {
        String fourHundredWords = "word ".repeat(400);
        assertEquals(2, ArticleService.readingMinutes(fourHundredWords));
        String twoThousandWords = "word ".repeat(2000);
        assertEquals(10, ArticleService.readingMinutes(twoThousandWords));
    }

    @Test
    void parseTags_splitsAndTrims() {
        assertEquals(List.of("risk", "psychology"),
                ArticleService.parseTags("risk, psychology , ,discipline"));
        // Single-element check on the trimmed list:
        List<String> tags = ArticleService.parseTags("risk, psychology , ,discipline");
        assertEquals(3, tags.size());
        assertEquals("discipline", tags.get(2));
    }

    @Test
    void parseTags_emptyForBlank() {
        assertTrue(ArticleService.parseTags(null).isEmpty());
        assertTrue(ArticleService.parseTags("  ").isEmpty());
    }

    @Test
    void normalizeTags_joinsCleanly() {
        assertEquals("risk,psychology",
                ArticleService.normalizeTags(" risk , psychology "));
    }

    @Test
    void parseCategory_acceptsValidCaseInsensitive() {
        assertEquals("TRADING", ArticleService.parseCategory("trading"));
        assertEquals("PERSONAL_FINANCE", ArticleService.parseCategory("Personal_Finance"));
    }

    @Test
    void parseCategory_nullForBlank() {
        assertTrue(ArticleService.parseCategory(null) == null);
        assertTrue(ArticleService.parseCategory("  ") == null);
    }

    @Test
    void parseCategory_rejectsUnknown() {
        try {
            ArticleService.parseCategory("crypto-memes");
            assertTrue(false, "expected IllegalArgumentException");
        } catch (IllegalArgumentException e) {
            assertTrue(e.getMessage().contains("Category must be one of"));
        }
    }

    @Test
    void normalizeCategoryFilter_ignoresBlankAllAndUnknown() {
        assertTrue(ArticleService.normalizeCategoryFilter(null) == null);
        assertTrue(ArticleService.normalizeCategoryFilter("all") == null);
        assertTrue(ArticleService.normalizeCategoryFilter("nope") == null);
        assertEquals("INVESTING", ArticleService.normalizeCategoryFilter("investing"));
    }
}
