package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.User;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Long id;
    private String nickname;
    private int avatarIndex;
    private String refreshToken;

    public UserResponse() {}

    public UserResponse(User user) {
        this(user, false);
    }

    public UserResponse(User user, boolean includePrivate) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.avatarIndex = user.getAvatarIndex();
        if (includePrivate) {
            this.refreshToken = user.getRefreshToken();
        }
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

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
