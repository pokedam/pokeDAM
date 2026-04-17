package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;

public class UserResponse {
    private Long id;
    private String nickname;
    private int avatarIndex;

    public UserResponse() {}

    public UserResponse(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.avatarIndex = user.getAvatarIndex();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public int getAvatarIndex() {
        return avatarIndex;
    }

    public void setAvatarIndex(int avatarIndex) {
        this.avatarIndex = avatarIndex;
    }
}
