package org.cifpaviles.pokedam.rest_server.models;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Room {
    private String name;
    private String password; // Opcional
    private String hostId;
    private RoomState state;
    private Map<String, Boolean> readys; // Mapea playerId -> isReady

    public Room(String name, String password, String hostId) {

        this.name = name;
        this.password = password;
        this.hostId = hostId;
        this.state = RoomState.WAITING;
        this.readys = new ConcurrentHashMap<>();
        // El host entra directamente "no listo" hasta que decida
        this.readys.put(hostId, false);
    }

    public String getName() {
        return name;
    }

    public String getPassword() {
        return password;
    }

    public String getHostId() {
        return hostId;
    }

    public RoomState getState() {
        return state;
    }

    public Map<String, Boolean> getReadys() {
        return readys;
    }

    // Setters
    public void setState(RoomState state) {
        this.state = state;
    }

    public boolean hasPassword() {
        return this.password != null && !this.password.isEmpty();
    }
}
