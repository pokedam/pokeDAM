package org.cifpaviles.pokedam.rest_server.models;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class LobbyDetails {
    public static final int MAX_PLAYERS = 8;

    public String id;
    public String name;
    public Long hostId;
    public Map<Long, Boolean> players; // Mapea playerId -> isReady
    public int maxPlayers;

    public LobbyDetails(String id, Lobby lobby) {
        this.id = id;
        name = lobby.name;
        hostId = lobby.hostId;
        this.players = new ConcurrentHashMap<>();
        this.maxPlayers = lobby.maxPlayers;
    }
}
