package org.cifpaviles.pokedam.rest_server.repository;

import org.cifpaviles.pokedam.rest_server.entity.PlayerPokemon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PcRepository extends JpaRepository<PlayerPokemon, Long> {
}
