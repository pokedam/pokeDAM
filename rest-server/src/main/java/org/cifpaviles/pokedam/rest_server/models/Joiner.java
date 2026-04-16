package org.cifpaviles.pokedam.rest_server.models;

public class Joiner {
    public boolean isReady;
    public String nickname;

    public Joiner(boolean isReady, String nickname) {
        this.isReady = isReady;
        this.nickname = nickname;
    }
}
