package org.cifpaviles.pokedam.rest_server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_games")
public class UserGame {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public Long userId;

    @Column(nullable = false)
    public String gameId;
    
    public UserGame() {}

    public UserGame(Long userId, String gameId) {
        this.userId = userId;
        this.gameId = gameId;
    }
}
