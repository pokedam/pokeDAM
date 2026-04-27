package org.cifpaviles.pokedam.rest_server.controller;

import org.cifpaviles.pokedam.rest_server.models.UserChangeRequest;
import org.cifpaviles.pokedam.rest_server.models.UserResponse;
import org.cifpaviles.pokedam.rest_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable("userId") Long userId) {
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(new UserResponse(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<Void> setUser(
            @PathVariable("userId") Long userId,
            @RequestBody UserChangeRequest data) {

        int updated = userRepository.patchUser(
                userId,
                data.nickname,
                data.avatarIndex,
                data.email,
                data.password);

        if (updated == 0)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok().build();
    }
}