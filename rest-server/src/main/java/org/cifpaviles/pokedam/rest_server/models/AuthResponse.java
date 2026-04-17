package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;

public class AuthResponse {
    public String idToken;
    public UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String idToken, UserResponse user) {
        this.idToken = idToken;
        this.user = user;
    }
}
