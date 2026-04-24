package org.cifpaviles.pokedam.rest_server.controller;

import org.cifpaviles.pokedam.rest_server.models.AuthResponse;
import org.cifpaviles.pokedam.rest_server.repository.PcRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pc")
public class PcController {

    @Autowired
    private PcRepository pcRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<AuthResponse> getAllPokemons(
            @PathVariable("userId") Long userId
        ) {
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{userId}")
    public ResponseEntity getAllPokemons(
            @PathVariable("userId") Long userId,
            @RequestBody Long[] selectedPokemons
        ) {
        return ResponseEntity.badRequest().build();
    }
}
