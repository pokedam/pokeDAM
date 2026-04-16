package org.cifpaviles.pokedam.rest_server.models;

public class LobbyLeft {
    public String lobbyId;
    public Lobby lobby;
    public boolean hostReplacement;

    public LobbyLeft(String lobbyId, Lobby lobby) {
        this(lobbyId, lobby, false);
    }

    public LobbyLeft(String lobbyId, Lobby lobby, boolean hostSwapped) {
        this.lobbyId = lobbyId;
        this.lobby = lobby;
        this.hostReplacement = hostSwapped;
    }
}
