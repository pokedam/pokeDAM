package org.cifpaviles.pokedam.rest_server.controller;

import org.cifpaviles.pokedam.rest_server.models.AuthResponse;
import org.cifpaviles.pokedam.rest_server.models.TokenRefreshRequest;
import org.cifpaviles.pokedam.rest_server.entity.User;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.cifpaviles.pokedam.rest_server.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/anonymous")
    public ResponseEntity<AuthResponse> loginAnonymous() {
        // Create new anonymous user
        User user = new User();
        userRepository.save(user);

        String idToken = tokenProvider.generateToken(user.getId());
        String refreshToken = tokenProvider.generateRefreshToken();

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(idToken, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshUserToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefresh_token();

        Optional<User> userOptional = userRepository.findByRefreshToken(requestRefreshToken);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            String newIdToken = tokenProvider.generateToken(user.getId());
            String newRefreshToken = tokenProvider.generateRefreshToken();

            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);

            return ResponseEntity.ok(new AuthResponse(newIdToken, newRefreshToken));
        }

        return ResponseEntity.badRequest().body("Invalid refresh token");
    }
}
