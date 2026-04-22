package org.cifpaviles.pokedam.rest_server.models;

public class UserChangeRequest {

    private String nickname;
    private Integer avatarIndex;

    public UserChangeRequest() {}

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Integer getAvatarIndex() {
        return avatarIndex;
    }

    public void setAvatarIndex(Integer avatarIndex) {
        this.avatarIndex = avatarIndex;
    }
}
