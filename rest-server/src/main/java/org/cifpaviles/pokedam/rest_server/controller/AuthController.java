package org.cifpaviles.pokedam.rest_server.controller;

import java.util.Optional;
import java.util.UUID;

import org.cifpaviles.pokedam.rest_server.entity.User;
import org.cifpaviles.pokedam.rest_server.models.AuthResponse;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/anonymous")
    public ResponseEntity<AuthResponse> loginAnonymous() {
        User user = new User();
        user.refreshToken = UUID.randomUUID().toString();
        userRepository.save(user);

        return ResponseEntity
                .ok(new AuthResponse(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshUserToken(@RequestBody String token) {
        System.out.println("Called refresh on rest-server with refresh token: " + token);
        Optional<User> res = userRepository.findByRefreshToken(token);

        if (res.isPresent()) {
            User user = res.get();

            String newToken = UUID.randomUUID().toString();
            user.nickname = "Ref";
            user.refreshToken = newToken;
            userRepository.save(user);

            return ResponseEntity.ok(new AuthResponse(user));
        }

        return ResponseEntity.badRequest().build();
    }
}
