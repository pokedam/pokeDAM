package org.cifpaviles.pokedam.rest_server.game.service;

import org.cifpaviles.pokedam.rest_server.models.Room;
import org.cifpaviles.pokedam.rest_server.models.RoomState;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LobbyService {
    // Almacena todas las partidas por ID
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    // Rastrea a qué partida pertenece cada jugador
    private final Map<String, String> playerRooms = new ConcurrentHashMap<>();

    public Map.Entry<String, Room> createRoom(String playerId, String name, String password) {
        // Si ya está en una sala antes, lo sacamos
        leaveRoom(playerId);

        Room room = new Room(name, password, playerId);

        rooms.put(playerId, room);
        playerRooms.put(playerId, playerId);
        return Map.entry(playerId, room);
    }

    public Room joinRoom(String roomId, String playerId, String passwordInput) {
        Room room = rooms.get(roomId);
        if (room != null && room.getState() == RoomState.WAITING) {

            // Verificación simple de contraseña. Si hay y no coincide, falla.
            if (room.hasPassword() && !room.getPassword().equals(passwordInput)) {
                return null;
            }

            leaveRoom(playerId);
            room.getReadys().put(playerId, false);
            playerRooms.put(playerId, roomId);
            return room;
        }
        return null;
    }

    public Map.Entry<String, Room> setReady(String playerId, boolean isReady) {
        String roomId = playerRooms.get(playerId);
        if (roomId != null) {
            Room room = rooms.get(roomId);
            if (room != null && room.getState() == RoomState.WAITING) {
                room.getReadys().put(playerId, isReady);
                return Map.entry(roomId, room);
            }
        }
        return null;
    }

    public Map.Entry<String, Room> startGame(String playerId) {
        String roomId = playerRooms.get(playerId);
        if (roomId != null) {
            Room room = rooms.get(roomId);

            // Revisa que sea el host y esté WAITING
            if (room != null && room.getState() == RoomState.WAITING && room.getHostId().equals(playerId)) {
                // Validación para iniciar: ejemplo, al menos 2 en partida, y todos readys =
                // true
                Collection<Boolean> allReadyStates = room.getReadys().values();
                if (allReadyStates.size() > 1 && allReadyStates.stream().allMatch(ready -> ready)) {
                    room.setState(RoomState.PLAYING);
                    return Map.entry(roomId, room);
                }
            }
        }
        return null;
    }

    public Map.Entry<String, Room> leaveRoom(String playerId) {
        String roomId = playerRooms.remove(playerId);
        if (roomId != null) {
            Room room = rooms.get(roomId);
            if (room != null) {
                room.getReadys().remove(playerId);

                // Limpieza: si la sala queda vacía, la eliminamos
                if (room.getReadys().isEmpty()) {
                    rooms.remove(roomId);
                } else if (room.getHostId().equals(playerId)) {
                    // Si el host sale, por ahora destruimos la sala
                    // (alternativa: rotar el host al siguiente jugador)
                    rooms.remove(roomId);
                    // Para simplificar, asumiremos que los demás manejarán el estado
                    // 'Lobby Destroyed' en el Frontend. En la vida real, se debería disolver
                    // formalmente informando a todos.
                }
                return Map.entry(roomId, room); // Retornamos para notificar la sala si sobrevive
            }
        }
        return null;
    }

    public Collection<Room> getAvailableRooms() {
        // Retornar solo las que están en WAITING
        return rooms.values().stream()
                .filter(r -> r.getState() == RoomState.WAITING)
                .collect(Collectors.toList());
    }
}
