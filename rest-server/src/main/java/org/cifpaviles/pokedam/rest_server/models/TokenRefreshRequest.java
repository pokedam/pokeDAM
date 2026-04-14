package org.cifpaviles.pokedam.rest_server.models;

public class TokenRefreshRequest {
    private String refresh_token;

    public TokenRefreshRequest() {
    }

    public TokenRefreshRequest(String refresh_token) {
        this.refresh_token = refresh_token;
    }

    public String getRefresh_token() {
        return refresh_token;
    }

    public void setRefresh_token(String refresh_token) {
        this.refresh_token = refresh_token;
    }
}
