package org.cifpaviles.pokedam.rest_server.models;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Lobby {
    public static final int MAX_PLAYERS = 8;

    public final String name;
    public final String password;
    public final RoomState state;
    public final Map<Long, Joiner> joiners;
    public final int maxPlayers;

    public Long hostId;
    public String hostNickname;

    public Lobby(String name, String password, Long hostId, String hostNickname, int maxPlayers) {

        this.name = name;
        this.password = password;
        this.hostId = hostId;
        this.hostNickname = hostNickname;
        this.state = RoomState.WAITING;
        this.joiners = new ConcurrentHashMap<>();
        this.maxPlayers = maxPlayers;
    }

    public Lobby(String name, String password, Long hostId, String hostNickname) {
        this(name, password, hostId, hostNickname, MAX_PLAYERS);
    }

    public Lobby(String name, Long hostId, String hostNickname, int maxPlayers) {
        this(name, null, hostId, hostNickname, maxPlayers);
    }

    public Lobby(String name, Long hostId, String hostNickname) {
        this(name, null, hostId, hostNickname, MAX_PLAYERS);
    }

    public int size() {
        return joiners.size() + 1; // joiners + host
    }
}
