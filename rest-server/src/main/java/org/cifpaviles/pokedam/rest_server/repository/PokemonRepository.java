package org.cifpaviles.pokedam.rest_server.repository;

import java.util.Collection;
import java.util.List;

import org.cifpaviles.pokedam.rest_server.entity.Pokemon;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface PokemonRepository extends JpaRepository<Pokemon, Long> {
	List<Pokemon> findAllByOwnerId(Long ownerId);
	List<Pokemon> findAllByOwnerIdAndIsActiveTrue(Long ownerId);

	@Modifying
	@Transactional
	@Query("""
				UPDATE Pokemon p
				SET p.isActive = false
				WHERE p.owner.id = :ownerId
			""")
	int deactivateAllByOwnerId(@Param("ownerId") Long ownerId);

	@Modifying
	@Transactional
	@Query("""
				UPDATE Pokemon p
				SET p.isActive = true
				WHERE p.owner.id = :ownerId
				AND p.id IN :ids
			""")
	int activateByOwnerIdAndIds(
			@Param("ownerId") Long ownerId,
			@Param("ids") Collection<Long> ids);

	@Modifying
	@Transactional
	@Query("""
				UPDATE Pokemon p
				SET p.alias = :alias
				WHERE p.id = :pokemonId
				AND p.owner.id = :ownerId
			""")
	int renamePokemon(
			@Param("ownerId") Long ownerId,
			@Param("pokemonId") Long pokemonId,
			@Param("alias") String alias);
}
