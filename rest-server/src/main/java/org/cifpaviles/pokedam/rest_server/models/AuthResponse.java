package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;

public class AuthResponse {
    public String refreshToken;
    public UserResponse user;

    public AuthResponse(User user) {
        this.refreshToken = user.refreshToken;
        this.user = new UserResponse(user);
    }
}
