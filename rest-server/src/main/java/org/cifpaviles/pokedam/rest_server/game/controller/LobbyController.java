package org.cifpaviles.pokedam.rest_server.game.controller;

import org.cifpaviles.pokedam.rest_server.models.ServerEvent;
import org.cifpaviles.pokedam.rest_server.models.Room;
import org.cifpaviles.pokedam.rest_server.game.service.LobbyService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.Collection;
import java.util.Map;

@Controller
public class LobbyController {

    private final LobbyService lobbyService;
    private final SimpMessagingTemplate messagingTemplate;

    public LobbyController(LobbyService lobbyService, SimpMessagingTemplate messagingTemplate) {
        this.lobbyService = lobbyService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Intercepta la suscripción inicial a /app/lobbies.
     * Le enviará AL CLIENTE directamente la lista de rooms activos
     * OJO: es importante que el cliente se suscriba a /app/lobbies y NO
     * directamente a /topic/lobbies la 1a vez
     * Depende de la configuración de StompJS.
     */
    @SubscribeMapping("/lobbies")
    public Collection<Room> sendInitialLobbies() {
        return lobbyService.getAvailableRooms();
    }

    @MessageMapping("/lobby.create")
    public void createRoom(@Payload Map<String, String> payload) {
        // Ideally from Principal rather than Payload, but done this way for parity with
        // your Rust logic.
        String playerId = payload.get("playerId");
        String name = payload.get("name");
        String password = payload.get("password");

        var roomEntry = lobbyService.createRoom(playerId, name, password);
        // Notificar que hay nueva sala disponible
        messagingTemplate.convertAndSend("/topic/lobbies", new ServerEvent("ADDED", roomEntry.getValue()));
    }

    @MessageMapping("/lobby.join")
    public void joinRoom(@Payload Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String playerId = payload.get("playerId");
        String password = payload.get("password");

        Room room = lobbyService.joinRoom(roomId, playerId, password);

        if (room != null) {
            // Notificamos al resto en esta sala que ha entrado un jugador
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    new ServerEvent("PLAYER_JOINED", Map.of("playerId", playerId, "room", room)));

            // Actualizamos conteos / status general del lobby
            messagingTemplate.convertAndSend("/topic/lobbies", new ServerEvent("COUNT_CHANGE", room));
        }
    }

    @MessageMapping("/lobby.ready")
    public void setReady(@Payload Map<String, Object> payload) {
        String playerId = (String) payload.get("playerId");
        Boolean isReady = (Boolean) payload.get("isReady");

        var roomEntry = lobbyService.setReady(playerId, isReady);

        if (roomEntry != null) {
            var room = roomEntry.getValue();
            // Informar a todos en la room
            messagingTemplate.convertAndSend("/topic/room/" + roomEntry.getKey(),
                    new ServerEvent("PLAYER_READY", Map.of("playerId", playerId, "isReady", isReady, "room", room)));
            // Aunque es solo poner "listo", podríamos querer informar en global por si
            // actualizamos el UI de lobbies
            messagingTemplate.convertAndSend("/topic/lobbies", new ServerEvent("COUNT_CHANGE", room));
        }
    }

    @MessageMapping("/lobby.start")
    public void startGame(@Payload Map<String, String> payload) {
        String playerId = payload.get("playerId");
        var roomEntry = lobbyService.startGame(playerId);

        if (roomEntry != null) {
            var room = roomEntry.getValue();
            // Notificamos a todos dentro que el juego comienza
            messagingTemplate.convertAndSend("/topic/room/" + roomEntry.getKey(),
                    new ServerEvent("GAME_STARTED", room));

            // Al activarse, ya no está en WAITING, lo sacamos de la lista global
            messagingTemplate.convertAndSend("/topic/lobbies", new ServerEvent("REMOVED", room));
        }
    }

    @MessageMapping("/lobby.leave")
    public void leaveRoom(@Payload Map<String, String> payload) {
        String playerId = payload.get("playerId");
        var roomEntry = lobbyService.leaveRoom(playerId);
        if (roomEntry != null) {
            var room = roomEntry.getValue();
            // Notificar a los que siguen en la sala.
            messagingTemplate.convertAndSend("/topic/room/" + roomEntry.getKey(),
                    new ServerEvent("PLAYER_LEFT", Map.of("playerId", playerId, "room", room)));

            // Si el host salió o la sala se vació, LobbyService asume su destrucción.
            if (room.getHostId().equals(playerId) || room.getReadys().isEmpty()) {
                messagingTemplate.convertAndSend("/topic/lobbies", new ServerEvent("REMOVED", room));
            } else {
                messagingTemplate.convertAndSend("/topic/lobbies", new ServerEvent("COUNT_CHANGE", room));
            }
        }
    }
}
