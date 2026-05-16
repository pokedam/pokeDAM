package org.cifpaviles.pokedam.rest_server.controller;

import org.cifpaviles.pokedam.rest_server.entity.GameDocument;
import org.cifpaviles.pokedam.rest_server.entity.UserGame;
import org.cifpaviles.pokedam.rest_server.models.GameSummary;
import org.cifpaviles.pokedam.rest_server.repository.GameRepository;
import org.cifpaviles.pokedam.rest_server.repository.UserGameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/games")
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private UserGameRepository userGameRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<Void> saveGame(@RequestBody GameSummary request) {
        System.out.println("saveGame called with: " + request);
        request.date = System.currentTimeMillis();
        GameDocument document = new GameDocument(request);
        document = gameRepository.save(document);

        if (request.initialGame != null) {
            for (Map<String, Object> player : request.initialGame) {
                if (player.containsKey("id")) {
                    Number playerId = (Number) player.get("id");
                    UserGame userGame = new UserGame(playerId.longValue(), document.id);
                    userGameRepository.save(userGame);
                }
            }
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GameSummary>> getGamesByUser(@PathVariable("userId") Long userId) {
        System.out.println("getGamesByUser called for user: " + userId);
        List<UserGame> userGames = userGameRepository.findByUserId(userId);
        List<String> gameIds = userGames.stream().map(ug -> ug.gameId).collect(Collectors.toList());

        List<GameDocument> games = (List<GameDocument>) gameRepository.findAllById(gameIds);

        List<GameSummary> summaries = games.stream()
                .map(g -> g.gameSummary)
                .sorted((a, b) -> {
                    long dateA = a.date != null ? a.date : 0L;
                    long dateB = b.date != null ? b.date : 0L;
                    return Long.compare(dateB, dateA);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(summaries);
    }
}
