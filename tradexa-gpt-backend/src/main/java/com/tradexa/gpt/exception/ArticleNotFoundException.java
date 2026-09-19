package com.tradexa.gpt.exception;

public class ArticleNotFoundException extends RuntimeException {

    public ArticleNotFoundException(String slug) {
        super("Article '" + slug + "' not found");
    }

    public ArticleNotFoundException(Long id) {
        super("Article with id " + id + " not found");
    }
}
