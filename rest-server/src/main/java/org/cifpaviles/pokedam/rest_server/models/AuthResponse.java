package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    public Long id;
    public String nickname;
    public int avatarIndex;
    public String refreshToken;

    public AuthResponse(User user) {
        this.id = user.id;
        this.nickname = user.nickname;
        this.avatarIndex = user.avatarIndex;
        this.refreshToken = user.refreshToken;
    }
}
