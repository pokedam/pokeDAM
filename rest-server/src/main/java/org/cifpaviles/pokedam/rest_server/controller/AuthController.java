package org.cifpaviles.pokedam.rest_server.controller;

import java.util.Optional;

import org.cifpaviles.pokedam.rest_server.entity.User;
import org.cifpaviles.pokedam.rest_server.models.AuthChangeRequest;
import org.cifpaviles.pokedam.rest_server.models.AuthResponse;
import org.cifpaviles.pokedam.rest_server.models.TokenRefreshRequest;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.cifpaviles.pokedam.rest_server.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/usuarios")
    public ResponseEntity<AuthResponse> post(Authentication authentication, @RequestBody AuthChangeRequest request) {

        Long id = (Long) authentication.getPrincipal();

        return userRepository.findById(id)
                .map(user -> {

                    if (request.nickname != null) {
                        user.nickname = request.nickname;
                    }

                    if (request.avatarIndex != null) {
                        user.avatarIndex = request.avatarIndex;
                    }

                    userRepository.save(user);

                    return ResponseEntity.ok(new AuthResponse(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/anonymous")
    public ResponseEntity<AuthResponse> loginAnonymous() {
        User user = new User();

        userRepository.save(user);

        user.refreshToken = tokenProvider.generateRefreshToken();
        userRepository.save(user);

        return ResponseEntity
                .ok(new AuthResponse(user));
    }

    @GetMapping("/user")
    public ResponseEntity<AuthResponse> getUser(Authentication authentication) {

        Long id = (Long) authentication.getPrincipal();

        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(new AuthResponse(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<AuthResponse> getUserById(@PathVariable("userId") Long userId) {
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(new AuthResponse(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/user")
    public ResponseEntity<AuthResponse> updateUser(Authentication authentication,
            @RequestBody AuthChangeRequest request) {

        Long id = (Long) authentication.getPrincipal();

        return userRepository.findById(id)
                .map(user -> {

                    if (request.nickname != null) {
                        user.nickname = request.nickname;
                    }

                    if (request.avatarIndex != null) {
                        user.avatarIndex = request.avatarIndex;
                    }

                    userRepository.save(user);

                    return ResponseEntity.ok(new AuthResponse(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshUserToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefresh_token();

        Optional<User> userOptional = userRepository.findByRefreshToken(requestRefreshToken);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            String newIdToken = tokenProvider.generateToken(user.id);
            String newRefreshToken = tokenProvider.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            userRepository.save(user);

            return ResponseEntity.ok(new AuthResponse(user));
        }

        return ResponseEntity.badRequest().build();
    }
}
