package org.cifpaviles.pokedam.rest_server.controller;

import org.cifpaviles.pokedam.rest_server.exception.ApiException;
import org.cifpaviles.pokedam.rest_server.models.PokemonResponse;
import org.cifpaviles.pokedam.rest_server.models.UserChangeRequest;
import org.cifpaviles.pokedam.rest_server.models.UserResponse;
import org.cifpaviles.pokedam.rest_server.repository.PokemonRepository;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/{userId}/pokemons")
    public ResponseEntity<PokemonResponse[]> getPokemons(@PathVariable("userId") Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(MISSING_USER, HttpStatus.NOT_FOUND));
                
        var pokemons = pokemonRepository.findAllByOwnerId(userId);
        PokemonResponse[] response = new PokemonResponse[pokemons.size()];

        for (int i = 0; i < pokemons.size(); i++) {
            var pokemon = pokemons.get(i);
            PokemonResponse dto = new PokemonResponse();
            dto.id = pokemon.id;
            dto.pokemon = pokemon.pokemon;
            dto.isActive = pokemon.isActive;
            response[i] = dto;
        }

        return ResponseEntity.ok(response);
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
}