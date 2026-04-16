package org.cifpaviles.pokedam.rest_server.game.controller;

import java.util.Collection;
import java.util.Map;

import org.cifpaviles.pokedam.rest_server.game.service.LobbyService;
import org.cifpaviles.pokedam.rest_server.models.ChangedLobbyMessage;
import org.cifpaviles.pokedam.rest_server.models.Lobby;
import org.cifpaviles.pokedam.rest_server.models.LobbyInfo;
import org.cifpaviles.pokedam.rest_server.models.ServerEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

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
     * Le enviará AL CLIENTE directamente la lista de lobbys activos
     * OJO: es importante que el cliente se suscriba a /app/lobbies y NO
     * directamente a /topic/lobbies la 1a vez
     * Depende de la configuración de StompJS.
     */
    @SubscribeMapping("/lobbies")
    public Collection<LobbyInfo> getAll() {
        return lobbyService.getAll();
    }

    /**
     * Intercepta la suscripción inicial a /app/lobbys/{lobbyId}.
     * Enviará AL CLIENTE directamente la info completa de la sala a la que se ha
     * suscrito.
     */
    @SubscribeMapping("/lobbies/{lobbyId}")
    public Lobby get(
            @org.springframework.messaging.handler.annotation.DestinationVariable String lobbyId) {
        return lobbyService.get(lobbyId);
    }

    @MessageMapping("/lobby.create")
    @SendToUser("/queue/lobby-created")
    public String create(@Payload Map<String, String> payload, Authentication authentication) {
        Long playerId = (Long) authentication.getPrincipal();
        String name = payload.get("name");
        String password = payload.get("password");

        var lobbyEntry = lobbyService.create(playerId, name, password);
        // Notificar que hay nueva sala disponible
        messagingTemplate.convertAndSend("/topic/lobbies",
                new ServerEvent("ADDED", new LobbyInfo(lobbyEntry.getKey(), lobbyEntry.getValue())));

        return lobbyEntry.getKey();
    }

    @MessageMapping("/lobby.join")
    public void join(@Payload Map<String, String> payload, Authentication authentication) {
        String lobbyId = payload.get("lobbyId");
        Long playerId = (Long) authentication.getPrincipal();
        String password = payload.get("password");

        var res = lobbyService.join(lobbyId, playerId, password);

        if (res != null) {
            // Notificamos al resto en esta sala que ha entrado un jugador
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId,
                    new ServerEvent("PLAYER_JOINED", Map.of("id", playerId, "nickname", res.joiner.nickname)));

            messagingTemplate.convertAndSend("/topic/lobbies",
                    new ServerEvent("CHANGED", new ChangedLobbyMessage(lobbyId, res.lobby.size())));
        }
    }

    @MessageMapping("/lobby.ready")
    public void setReady(@Payload Map<String, Object> payload, Authentication authentication) {
        Long playerId = (Long) authentication.getPrincipal();
        Boolean isReady = (Boolean) payload.get("isReady");

        var lobbyEntry = lobbyService.setReady(playerId, isReady);

        if (lobbyEntry != null) {
            var lobbyId = lobbyEntry.getKey();
            // Informar a todos en la lobby
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId,
                    new ServerEvent("PLAYER_READY", Map.of("id", playerId, "isReady", isReady)));
        }
    }

    @MessageMapping("/lobby.start")
    public void start(@Payload Map<String, String> payload, Authentication authentication) {
        Long playerId = (Long) authentication.getPrincipal();
        var lobbyEntry = lobbyService.startGame(playerId);

        if (lobbyEntry != null) {
            var lobby = lobbyEntry.getValue();
            var lobbyId = lobbyEntry.getKey();
            // Notificamos a todos dentro que el juego comienza
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId,
                    new ServerEvent("GAME_STARTED", lobbyId));

            // Al activarse, ya no está en WAITING, lo sacamos de la lista global
            messagingTemplate.convertAndSend("/topic/lobbies",
                    new ServerEvent("CHANGED", new ChangedLobbyMessage(lobbyId, lobby.size())));
        }
    }

    @MessageMapping("/lobby.leave")
    public void leave(@Payload Map<String, String> payload, Authentication authentication) {
        leaveInternal((Long) authentication.getPrincipal());
    }

    @EventListener
    public void handleDisconnection(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        if (headerAccessor.getUser() instanceof Authentication) {
            Authentication auth = (Authentication) headerAccessor.getUser();
            leaveInternal((Long) auth.getPrincipal());
        }
    }

    private void leaveInternal(Long playerId) {
        var res = lobbyService.leave(playerId);
        if (res != null) {
            // Lobby has been removed
            if (res.lobby == null) {
                messagingTemplate.convertAndSend("/topic/lobbies",
                        new ServerEvent("CHANGED", new ChangedLobbyMessage(res.lobbyId, 0)));
            } else {
                messagingTemplate.convertAndSend("/topic/lobby/" + res.lobbyId,
                        new ServerEvent("PLAYER_LEFT",
                                Map.of("id", res.hostReplacement ? res.lobby.hostId : playerId, "hostReplacement",
                                        res.hostReplacement)));
                messagingTemplate.convertAndSend("/topic/lobbies",
                        new ServerEvent("CHANGED", new ChangedLobbyMessage(res.lobbyId, res.lobby.size())));

            }
        }
    }
}
