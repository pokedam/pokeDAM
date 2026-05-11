package org.cifpaviles.pokedam.rest_server.repository;

import java.util.List;

import org.cifpaviles.pokedam.rest_server.entity.Pokemon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PokemonRepository extends JpaRepository<Pokemon, Long> {
	List<Pokemon> findAllByOwnerId(Long ownerId);
}
