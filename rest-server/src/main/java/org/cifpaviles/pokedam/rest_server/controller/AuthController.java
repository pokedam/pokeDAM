package org.cifpaviles.pokedam.rest_server.controller;

import org.cifpaviles.pokedam.rest_server.models.AuthResponse;
import org.cifpaviles.pokedam.rest_server.models.TokenRefreshRequest;
import org.cifpaviles.pokedam.rest_server.models.UserChangeRequest;
import org.cifpaviles.pokedam.rest_server.models.UserResponse;
import org.cifpaviles.pokedam.rest_server.entity.User;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.cifpaviles.pokedam.rest_server.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/usuarios")
    public ResponseEntity<UserResponse> post(@RequestBody UserChangeRequest request, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }

        Long id = (Long) authentication.getPrincipal();

        return userRepository.findById(id)
                .map(user -> {

                    if (request.getNickname() != null) {
                        user.setNickname(request.getNickname());
                    }

                    if (request.getAvatarIndex() != null) {
                        user.setAvatarIndex(request.getAvatarIndex());
                    }

                    userRepository.save(user);

                    return ResponseEntity.ok(new UserResponse(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/anonymous")
    public ResponseEntity<AuthResponse> loginAnonymous() {
        User user = new User();

        user.setAvatarIndex((int) (Math.random() * 5));

        userRepository.save(user);

        user.setNickname("Trainer" + String.format("%04d", user.getId()));
        user.setRefreshToken(tokenProvider.generateRefreshToken());
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(tokenProvider.generateToken(user.getId()), new UserResponse(user)));
    }

    @GetMapping("/user")
    public ResponseEntity<UserResponse> getUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }

        Long id = (Long) authentication.getPrincipal();

        return getUserById(id);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("userId") Long userId) {
        return userRepository.findById(userId)
                .map(user_ -> ResponseEntity.ok(new UserResponse(user_)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/user")
    public ResponseEntity<UserResponse> updateUser(Authentication authentication,
            @RequestBody UserChangeRequest request) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }

        Long id = (Long) authentication.getPrincipal();

        return userRepository.findById(id)
                .map(user -> {

                    if (request.getNickname() != null) {
                        user.setNickname(request.getNickname());
                    }

                    if (request.getAvatarIndex() != null) {
                        user.setAvatarIndex(request.getAvatarIndex());
                    }

                    userRepository.save(user);

                    return ResponseEntity.ok(new UserResponse(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshUserToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefresh_token();

        Optional<User> userOptional = userRepository.findByRefreshToken(requestRefreshToken);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            String newIdToken = tokenProvider.generateToken(user.getId());
            String newRefreshToken = tokenProvider.generateRefreshToken();

            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);

            return ResponseEntity.ok(new AuthResponse(newIdToken, new UserResponse(user)));
        }

        return ResponseEntity.badRequest().build();
    }
}
