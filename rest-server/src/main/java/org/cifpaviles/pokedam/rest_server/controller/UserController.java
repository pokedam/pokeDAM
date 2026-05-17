package org.cifpaviles.pokedam.rest_server.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import org.cifpaviles.pokedam.rest_server.entity.Pokemon;
import org.cifpaviles.pokedam.rest_server.exception.ApiException;
import org.cifpaviles.pokedam.rest_server.models.PcPokemonResponse;
import org.cifpaviles.pokedam.rest_server.models.PokemonResponse;
import org.cifpaviles.pokedam.rest_server.models.UserChangeRequest;
import org.cifpaviles.pokedam.rest_server.models.PlayerTeamResponse;
import org.cifpaviles.pokedam.rest_server.models.PokemonChangeRequest;
import org.cifpaviles.pokedam.rest_server.models.UserResponse;
import org.cifpaviles.pokedam.rest_server.repository.PokemonRepository;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    static final String MISSING_USER = "No user with the specified ID";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PokemonRepository pokemonRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable("userId") Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(MISSING_USER, HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(new UserResponse(user));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<Void> setUser(
            @PathVariable("userId") Long userId,
            @RequestBody UserChangeRequest data) {
        try {
            int updated = userRepository.patchUser(
                    userId,
                    data.nickname,
                    data.avatarId,
                    data.email,
                    data.password);

            if (updated == 0)
                throw new ApiException(MISSING_USER, HttpStatus.NOT_FOUND);
        } catch (DataIntegrityViolationException e) {

            throw new ApiException("Email is already in use", HttpStatus.CONFLICT);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/pokemons")
    public ResponseEntity<PcPokemonResponse[]> getPokemons(@PathVariable("userId") Long userId) {
        var pokemons = pokemonRepository.findAllByOwnerId(userId);
        PcPokemonResponse[] response = new PcPokemonResponse[pokemons.size()];

        for (int i = 0; i < pokemons.size(); i++) {
            var pokemon = pokemons.get(i);
            PcPokemonResponse dto = new PcPokemonResponse(pokemon);
            response[i] = dto;
        }

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/pokemons")
    @Transactional
    public ResponseEntity<Void> setPokemons(
            @PathVariable("userId") Long userId,
            @RequestBody(required = false) Long[] selectedPokemons) {
        if (selectedPokemons == null) {
            throw new ApiException("Selection is required", HttpStatus.BAD_REQUEST);
        }

        if (selectedPokemons.length > 6) {
            throw new ApiException("Selection cannot exceed 6 pokemons", HttpStatus.BAD_REQUEST);
        }

        List<Long> ids = Arrays.stream(selectedPokemons)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        pokemonRepository.deactivateAllByOwnerId(userId);

        int updated = pokemonRepository.activateByOwnerIdAndIds(userId, ids);
        if (updated != ids.size()) {
            throw new ApiException("Some pokemons do not belong to the user", HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/team")
    public ResponseEntity<PlayerTeamResponse> getTeam(@PathVariable("userId") Long userId) {
        List<Pokemon> list = pokemonRepository.findAllByOwnerIdAndIsActiveTrue(userId);
        PokemonResponse[] pokemons = new PokemonResponse[list.size()];

        for (int i = 0; i < list.size(); i++) {
            var pokemon = list.get(i);
            PokemonResponse dto = new PokemonResponse(pokemon);
            pokemons[i] = dto;
        }

        PlayerTeamResponse response = new PlayerTeamResponse();
        response.pokemons = pokemons;
        response.nickname = userRepository.getReferenceById(userId).nickname;

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/pokemons/{pokemonId}")
    @Transactional
    public ResponseEntity<Void> renamePokemon(
            @PathVariable("userId") Long userId,
            @PathVariable("pokemonId") Long pokemonId,
            @RequestBody PokemonChangeRequest data) {
        // Si el nombre es null, vacío o solo espacios, no se cambia
        if (data.name == null || data.name.isBlank()) {
            return ResponseEntity.ok().build();
        }

        int updated = pokemonRepository.renamePokemon(userId, pokemonId, data.name.trim());

        if (updated == 0) {
            throw new ApiException("Pokemon not found or does not belong to the user", HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok().build();
    }
}