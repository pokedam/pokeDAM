package org.cifpaviles.pokedam.rest_server.game.service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.cifpaviles.pokedam.rest_server.models.Lobby;
import org.cifpaviles.pokedam.rest_server.models.LobbyInfo;
import org.cifpaviles.pokedam.rest_server.models.LobbyJoined;
import org.cifpaviles.pokedam.rest_server.models.LobbyLeft;
import org.cifpaviles.pokedam.rest_server.models.Joiner;
import org.cifpaviles.pokedam.rest_server.entity.User;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class LobbyService {
    // Almacena todas las partidas por ID
    private final Map<String, Lobby> lobbies = new ConcurrentHashMap<>();

    // Rastrea a qué partida pertenece cada jugador
    private final Map<Long, String> playerRooms = new ConcurrentHashMap<>();

    private final UserRepository userRepository;

    public LobbyService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String getPlayerNickname(Long playerId) {
        return userRepository.findById(playerId)
                .map(User::getNickname)
                .orElse("????");
    }

    public Map.Entry<String, Lobby> create(Long playerId, String name, String password) {
        // Si ya está en una sala antes, lo sacamos

        leave(playerId);

        String roomId = UUID.randomUUID().toString();

        Lobby lobby = new Lobby(name, password, playerId, getPlayerNickname(playerId));

        lobbies.put(roomId, lobby);
        playerRooms.put(playerId, roomId);
        return Map.entry(roomId, lobby);
    }

    public LobbyJoined join(String lobbyId, Long playerId, String passwordInput) {
        Lobby lobby = lobbies.get(lobbyId);

        if (lobby != null) {

            // Verificación simple de contraseña. Si hay y no coincide, falla.
            if (lobby.password != null && !lobby.password.equals(passwordInput)) {
                return null;
            }
            var player = new Joiner(false, getPlayerNickname(playerId));

            lobby.joiners.put(playerId, player);
            playerRooms.put(playerId, lobbyId);
            return new LobbyJoined(lobby, player);
        }
        return null;
    }

    public Map.Entry<String, Lobby> setReady(Long playerId, boolean isReady) {
        String roomId = playerRooms.get(playerId);
        if (roomId != null) {
            Lobby room = lobbies.get(roomId);
            if (room != null) {
                var player = room.joiners.get(playerId);
                if (player != null) {
                    player.isReady = isReady;
                }
                return Map.entry(roomId, room);
            }
        }
        return null;
    }

    public Map.Entry<String, Lobby> startGame(Long playerId) {
        String roomId = playerRooms.get(playerId);
        if (roomId != null) {
            Lobby room = lobbies.get(roomId);

            // Revisa que sea el host y esté WAITING
            if (room != null && room.hostId.equals(playerId)) {
                // Validación para iniciar: ejemplo, al menos 2 en partida, y todos readys =
                // true
                Collection<Joiner> allReadyStates = room.joiners.values();
                if (allReadyStates.size() > 1 && allReadyStates.stream().allMatch(player -> player.isReady)) {
                    return Map.entry(roomId, room);
                }
            }
        }
        return null;
    }

    public LobbyLeft leave(Long playerId) {
        String roomId = playerRooms.remove(playerId);
        if (roomId == null)
            return null;

        Lobby room = lobbies.get(roomId);
        if (room.hostId == playerId) {
            if (room.joiners.isEmpty()) {
                lobbies.remove(roomId);
                return new LobbyLeft(roomId, null);
            } else {
                Map.Entry<Long, Joiner> newHostEntry = room.joiners.entrySet().iterator().next();
                room.hostId = newHostEntry.getKey();
                room.hostNickname = newHostEntry.getValue().nickname;
                room.joiners.remove(newHostEntry.getKey());
            }
            return new LobbyLeft(roomId, room, true);
        } else {
            if (room.joiners.remove(playerId) == null)
                return null;

            return new LobbyLeft(roomId, room);
        }
    }

    public Collection<LobbyInfo> getAll() {
        return lobbies.entrySet().stream().map(entry -> {
            String roomId = entry.getKey();
            Lobby lobby = entry.getValue();
            return new LobbyInfo(roomId, lobby);
        }).collect(Collectors.toList());
    }

    public Lobby get(String roomId) {
        return lobbies.get(roomId);
    }
}
