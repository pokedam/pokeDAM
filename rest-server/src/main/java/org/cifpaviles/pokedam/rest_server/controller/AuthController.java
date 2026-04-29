package org.cifpaviles.pokedam.rest_server.controller;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.cifpaviles.pokedam.rest_server.entity.User;
import org.cifpaviles.pokedam.rest_server.exception.ApiException;
import org.cifpaviles.pokedam.rest_server.models.AuthResponse;
import org.cifpaviles.pokedam.rest_server.models.LoginRequest;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    // @PostMapping("/refresh")
    // public ResponseEntity<Result<AuthResponse>> refreshUserToken(@RequestBody
    // String token) {
    // Optional<User> res = userRepository.findByRefreshToken(token);

    // if (res.isPresent()) {
    // User user = res.get();

    // String newToken = UUID.randomUUID().toString();
    // user.refreshToken = newToken;
    // userRepository.save(user);

    // return Result.ok(new AuthResponse(user));
    // }

    // return Result.err(HttpStatus.FORBIDDEN, "Invalid refresh token");
    // }
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshUserToken(@RequestBody String token) {

        User user = userRepository.findByRefreshToken(token)
                .orElseThrow(() -> new ApiException(
                        "Invalid refresh token",
                        HttpStatus.FORBIDDEN));

        String newToken = UUID.randomUUID().toString();
        user.setRefreshToken(newToken);
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        System.out.println("Login attempt: " + req.email);
        Optional<User> res = userRepository.findByEmail(req.email);

        if (res.isPresent()) {

            User user = res.get();
            if (Objects.equals(user.password, req.password)) {
                return ResponseEntity.ok(new AuthResponse(user));
            }

            throw new ApiException(
                    "Invalid password",
                    HttpStatus.UNAUTHORIZED);
        }

        throw new ApiException(
                "No user with the specified email",
                HttpStatus.FORBIDDEN);
    }
}
