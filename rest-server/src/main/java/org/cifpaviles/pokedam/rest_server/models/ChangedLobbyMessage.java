package org.cifpaviles.pokedam.rest_server.models;

public class ChangedLobbyMessage {
    public String id;
    public int playerCount;

    public ChangedLobbyMessage(String id, int playerCount) {
        this.id = id;
        this.playerCount = playerCount;
    }
}
