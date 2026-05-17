package org.cifpaviles.pokedam.rest_server.models;

import org.cifpaviles.pokedam.rest_server.entity.Pokemon;

public class PcPokemonResponse extends PokemonResponse {
    public PcPokemonResponse(Pokemon pokemon) {
        super(pokemon);
        isActive = pokemon.isActive;
    }

    public boolean isActive;
}
