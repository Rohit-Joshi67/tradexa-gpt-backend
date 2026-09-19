package com.tradexa.gpt.dto;

/** Response body for {@code POST /api/v1/auth/refresh}: a fresh short-lived access token. */
public class RefreshResponse {

    private String token;

    public RefreshResponse() {
    }

    public RefreshResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
