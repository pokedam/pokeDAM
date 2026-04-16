package org.cifpaviles.pokedam.rest_server.models;

public class LobbyInfo {
    public static final int MAX_PLAYERS = 8;

    public String id;
    public String name;
    public boolean hasPassword;
    public int playerCount;
    public int maxPlayers;

    public LobbyInfo(String id, Lobby lobby) {
        this.id = id;
        this.name = lobby.name;
        this.hasPassword = lobby.password != null;
        this.playerCount = lobby.size();
        this.maxPlayers = MAX_PLAYERS;
    }
}
