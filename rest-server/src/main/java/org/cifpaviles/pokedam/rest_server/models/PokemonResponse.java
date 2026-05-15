package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.Pokemon;

public class PokemonResponse {
    public PokemonResponse(Pokemon pokemon) {
        id = pokemon.id;
        name = null;
        pokedexIdx = pokemon.pokedexIdx;
        isActive = pokemon.isActive;
    }

    public Long id;
    public String name;
    public int pokedexIdx;
    public boolean isActive;
}
