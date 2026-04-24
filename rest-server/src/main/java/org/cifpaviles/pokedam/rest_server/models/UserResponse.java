package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;

public class UserResponse {
    public Long id;
    public String nickname;
    public Long avatarIndex;
    public String email;
    public String password;

    public UserResponse(User user) {
        this.id = user.id;
        this.nickname = user.nickname;
        this.avatarIndex = user.avatarIndex;
        this.email = user.email;
        this.password = user.password;
    }
}
