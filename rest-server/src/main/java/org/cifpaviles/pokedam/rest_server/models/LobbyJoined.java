package org.cifpaviles.pokedam.rest_server.models;

public class LobbyJoined {
    public Lobby lobby;
    public Joiner joiner;

    public LobbyJoined(Lobby lobby, Joiner joiner) {
        this.lobby = lobby;
        this.joiner = joiner;
    }
}
