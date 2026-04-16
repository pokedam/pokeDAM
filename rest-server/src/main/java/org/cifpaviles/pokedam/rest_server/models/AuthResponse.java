package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;

public class AuthResponse {
    public String idToken;
    public User user;

    public AuthResponse() {
    }

    public AuthResponse(String idToken, User user) {
        this.idToken = idToken;
        this.user = user;
    }
}
