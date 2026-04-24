package org.cifpaviles.pokedam.rest_server.repository;

import org.cifpaviles.pokedam.rest_server.entity.PlayerPokemon;
import org.cifpaviles.pokedam.rest_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PcRepository extends JpaRepository<PlayerPokemon, Long> {
    Optional<User> findByRefreshToken(String refreshToken);
}
